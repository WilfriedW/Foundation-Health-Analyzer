/**
 * Script de création : Verification Items + Issue Rules pour Business Rules
 *
 * À exécuter dans Background Scripts de ServiceNow
 * Ce script crée :
 * - 6 Issue Rules pour détecter les anti-patterns dans les Business Rules
 * - 1 Verification Item qui regroupe toutes ces règles
 *
 * Catégories de détection :
 * - current.update() dans les before BR
 * - BR asynchrone avec accès à current
 * - GlideRecord imbriqués (N+1)
 * - Absence de condition
 * - Trop de requêtes
 * - Scripts volumineux
 */

(function createBusinessRulesVI() {

    // ============================================================
    // 1. DÉFINITION DES ISSUE RULES
    // ============================================================

    var rules = [
        {
            name: 'current.update() in before Business Rule',
            code: 'BR_BEFORE_CURRENT_UPDATE',
            description: 'Détecte current.update() dans les Business Rules "before". Cela cause des boucles infinies et des locks de base de données.',
            severity: 'critical',
            type: 'anti_pattern',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: current.update() in before Business Rule
 * Détecte l'anti-pattern critique current.update() dans before BR
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';
    var when = item.values.when || '';

    if (when === 'before' && script.match(/current\.update\s*\(/i)) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'CRITICAL: current.update() called in before Business Rule "' + recordName + '". This causes infinite loops and database locks.',
            severity: 'critical',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: when,
                table: item.values.collection,
                operation: item.values.when,
                recommendation: 'Remove current.update(). In before rules, changes to current are automatically saved. Use setAbortAction() if you need to prevent the update.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Async Business Rule accessing current',
            code: 'BR_ASYNC_WITH_CURRENT',
            description: 'Détecte les BR asynchrones qui accèdent à "current". L\'objet current n\'existe pas dans le contexte asynchrone.',
            severity: 'high',
            type: 'anti_pattern',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: Async Business Rule accessing current
 * Détecte l'accès à current dans les BR async
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';
    var when = item.values.when || '';

    // Vérifier si c'est une BR async
    var isAsync = item.values.when === 'async';

    if (isAsync && script.match(/\bcurrent\./i)) {
        var recordName = item.values.name || 'Unknown';

        // Compter les occurrences de current.
        var matches = script.match(/\bcurrent\./gi);

        issues.push({
            code: rule.code,
            message: 'Async Business Rule "' + recordName + '" accesses "current" (' + matches.length + ' occurrence(s)). The current object is not available in async context.',
            severity: 'high',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: 'async',
                table: item.values.collection,
                current_references: matches.length,
                recommendation: 'Use current.sys_id to re-query the record in the async context, or pass specific values as parameters.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Nested GlideRecord queries',
            code: 'BR_NESTED_GLIDERECORD',
            description: 'Détecte les GlideRecord imbriqués qui créent des problèmes de performance N+1.',
            severity: 'medium',
            type: 'performance',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: Nested GlideRecord queries
 * Détecte les requêtes GlideRecord imbriquées (N+1 problem)
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Recherche de GlideRecord dans des while loops
    // Pattern: while(...next()) { ... new GlideRecord ...}
    var pattern = /while\s*\([^)]*\.next\s*\(\)\s*\)\s*{[^}]*new\s+GlideRecord/gi;

    var matches = script.match(pattern);

    if (matches && matches.length > 0) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Nested GlideRecord queries detected in "' + recordName + '" (' + matches.length + ' occurrence(s)). This creates N+1 query problems and performance issues.',
            severity: 'medium',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: item.values.when,
                table: item.values.collection,
                nested_queries: matches.length,
                recommendation: 'Refactor to use JOINs, aggregate queries, or cache results to avoid querying within loops.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Business Rule without condition',
            code: 'BR_NO_CONDITION',
            description: 'Détecte les Business Rules sans condition qui s\'exécutent pour tous les enregistrements.',
            severity: 'low',
            type: 'best_practice',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: Business Rule without condition
 * Détecte l'absence de condition
 */
(function executeRule(item, context, issues) {
    var condition = item.values.condition || '';
    var filter = item.values.filter_condition || '';

    // Vérifier si ni condition ni filter_condition ne sont définis
    if ((!condition || condition.trim() === '') &&
        (!filter || filter.trim() === '')) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Business Rule "' + recordName + '" has no condition. It will execute for all records on this table.',
            severity: 'low',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: item.values.when,
                table: item.values.collection,
                recommendation: 'Add a condition to limit when the Business Rule executes, improving performance and reducing unnecessary processing.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Too many GlideRecord queries',
            code: 'BR_TOO_MANY_QUERIES',
            description: 'Détecte les Business Rules avec un nombre excessif de requêtes GlideRecord.',
            severity: 'medium',
            type: 'performance',
            active: true,
            params: JSON.stringify({
                max_queries: 5
            }),
            script: function() {
/**
 * RULE: Too many GlideRecord queries
 * Détecte un nombre excessif de requêtes
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    var params = rule.params ? JSON.parse(rule.params) : {};
    var maxQueries = params.max_queries || 5;

    // Compter les new GlideRecord
    var pattern = /new\s+GlideRecord\s*\(/gi;
    var matches = script.match(pattern);

    if (matches && matches.length > maxQueries) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Business Rule "' + recordName + '" has ' + matches.length + ' GlideRecord queries (threshold: ' + maxQueries + '). Consider optimizing or refactoring.',
            severity: 'medium',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: item.values.when,
                table: item.values.collection,
                query_count: matches.length,
                threshold: maxQueries,
                recommendation: 'Reduce the number of queries by combining conditions, using aggregate queries, or moving logic to Script Includes.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Large Business Rule script',
            code: 'BR_LARGE_SCRIPT',
            description: 'Détecte les Business Rules avec un code trop volumineux qui devrait être refactorisé.',
            severity: 'low',
            type: 'best_practice',
            active: true,
            params: JSON.stringify({
                max_lines: 150,
                max_chars: 4000
            }),
            script: function() {
/**
 * RULE: Large Business Rule script
 * Détecte les scripts trop volumineux
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    var params = rule.params ? JSON.parse(rule.params) : {};
    var maxLines = params.max_lines || 150;
    var maxChars = params.max_chars || 4000;

    var lineCount = script.split('\n').length;
    var charCount = script.length;

    if (lineCount > maxLines || charCount > maxChars) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Large Business Rule detected: "' + recordName + '" (' + lineCount + ' lines, ' + charCount + ' characters). Consider refactoring into Script Includes.',
            severity: 'low',
            record: item.sys_id,
            record_table: 'sys_script',
            record_sys_id: item.sys_id,
            details: {
                rule_name: recordName,
                when: item.values.when,
                table: item.values.collection,
                line_count: lineCount,
                char_count: charCount,
                threshold_lines: maxLines,
                threshold_chars: maxChars,
                recommendation: 'Move complex logic to Script Includes to improve maintainability and reusability.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        }
    ];

    // ============================================================
    // 2. CRÉATION DES ISSUE RULES
    // ============================================================

    gs.info('===== CRÉATION DES ISSUE RULES =====');

    var ruleSysIds = [];
    var rulesByCodes = {};

    rules.forEach(function(ruleData) {
        var gr = new GlideRecord('x_1310794_founda_0_issue_rules');

        // Vérifier si la règle existe déjà
        gr.addQuery('code', ruleData.code);
        gr.query();

        var exists = gr.next();

        if (!exists) {
            gr.initialize();
        }

        // Extraire le corps de la fonction
        var scriptBody = ruleData.script;
        if (typeof scriptBody === 'string') {
            scriptBody = scriptBody.replace(/^function\s*\(\s*\)\s*{/, '').replace(/}$/, '').trim();
        }

        // Mettre à jour les champs
        gr.setValue('name', ruleData.name);
        gr.setValue('code', ruleData.code);
        gr.setValue('description', ruleData.description);
        gr.setValue('severity', ruleData.severity);
        gr.setValue('type', ruleData.type);
        gr.setValue('active', ruleData.active);
        gr.setValue('script', scriptBody);
        gr.setValue('params', ruleData.params);

        var sysId = exists ? gr.update() : gr.insert();
        ruleSysIds.push(sysId);
        rulesByCodes[ruleData.code] = sysId;

        gs.info((exists ? 'Updated' : 'Created') + ' rule: ' + ruleData.code + ' (' + sysId + ')');
    });

    // ============================================================
    // 3. CRÉATION DU VERIFICATION ITEM
    // ============================================================

    gs.info('\n===== CRÉATION DU VERIFICATION ITEM =====');

    var vi = new GlideRecord('x_1310794_founda_0_verification_items');

    // Vérifier si le VI existe déjà
    vi.addQuery('name', 'Business Rules - Anti-Patterns & Performance');
    vi.query();

    var viExists = vi.next();

    if (!viExists) {
        vi.initialize();
    }

    vi.setValue('name', 'Business Rules - Anti-Patterns & Performance');
    vi.setValue('category', 'automation');
    vi.setValue('active', true);

    // Référence à la table sys_script
    var tableGr = new GlideRecord('sys_db_object');
    tableGr.addQuery('name', 'sys_script');
    tableGr.query();
    if (tableGr.next()) {
        vi.setValue('table', tableGr.getUniqueValue());
    }

    // Query pour filtrer les Business Rules actives
    vi.setValue('query_value', 'active=true');

    // Associer les rules
    vi.setValue('issue_rules', ruleSysIds.join(','));

    var viSysId = viExists ? vi.update() : vi.insert();

    gs.info((viExists ? 'Updated' : 'Created') + ' VI: ' + viSysId);

    // ============================================================
    // 4. MISE À JOUR DES RULES POUR RÉFÉRENCER LE VI
    // ============================================================

    gs.info('\n===== MISE À JOUR DES RÉFÉRENCES =====');

    ruleSysIds.forEach(function(ruleSysId) {
        var ruleGr = new GlideRecord('x_1310794_founda_0_issue_rules');
        if (ruleGr.get(ruleSysId)) {
            var existingVIs = ruleGr.getValue('verification_items') || '';
            var viList = existingVIs ? existingVIs.split(',') : [];

            if (viList.indexOf(viSysId) === -1) {
                viList.push(viSysId);
                ruleGr.setValue('verification_items', viList.join(','));
                ruleGr.update();
                gs.info('Updated rule ' + ruleGr.getValue('code') + ' with VI reference');
            }
        }
    });

    // ============================================================
    // 5. RÉSUMÉ
    // ============================================================

    gs.info('\n===== CRÉATION TERMINÉE =====');
    gs.info('Verification Item sys_id: ' + viSysId);
    gs.info('Issue Rules créées:');

    for (var code in rulesByCodes) {
        gs.info('  - ' + code + ' (' + rulesByCodes[code] + ')');
    }

    gs.info('\n⚠️  CRITICAL RULES:');
    gs.info('  - BR_BEFORE_CURRENT_UPDATE: Détecte current.update() dans before BR (cause des boucles infinies)');

    gs.info('\nVous pouvez maintenant :');
    gs.info('1. Créer une Configuration pour analyser la table sys_script');
    gs.info('2. Associer le VI "Business Rules - Anti-Patterns & Performance"');
    gs.info('3. Lancer l\'analyse pour détecter les problèmes critiques');

    return {
        success: true,
        vi_sys_id: viSysId,
        rules: rulesByCodes
    };

})();
