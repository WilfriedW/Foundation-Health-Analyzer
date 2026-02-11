/**
 * Script de création : Verification Items + Issue Rules pour Client Scripts
 *
 * À exécuter dans Background Scripts de ServiceNow
 * Ce script crée :
 * - 5 Issue Rules pour détecter les anti-patterns dans les Client Scripts
 * - 1 Verification Item qui regroupe toutes ces règles
 *
 * Catégories de détection :
 * - GlideRecord dans Client Scripts
 * - AJAX synchrone (getXMLWait)
 * - Hardcoded sys_id
 * - Scripts trop volumineux
 * - Absence de condition
 */

(function createClientScriptsVI() {

    // ============================================================
    // 1. DÉFINITION DES ISSUE RULES
    // ============================================================

    var rules = [
        {
            name: 'GlideRecord in Client Script',
            code: 'CS_GLIDERECORD',
            description: 'Détecte l\'utilisation de GlideRecord dans les Client Scripts. Les Client Scripts s\'exécutent côté navigateur et ne doivent pas accéder directement à la base de données.',
            severity: 'high',
            type: 'anti_pattern',
            active: true,
            params: JSON.stringify({
                patterns: ['new GlideRecord', 'gr.query()', '.addQuery(']
            }),
            script: function() {
/**
 * RULE: GlideRecord in Client Script
 * Détecte l'utilisation de GlideRecord dans les Client Scripts
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Patterns à détecter
    var patterns = [
        { regex: /new\s+GlideRecord\s*\(/gi, name: 'new GlideRecord()' },
        { regex: /\.query\s*\(/gi, name: '.query()' },
        { regex: /\.addQuery\s*\(/gi, name: '.addQuery()' }
    ];

    var findings = [];
    var totalMatches = 0;

    patterns.forEach(function(pattern) {
        var matches = script.match(pattern.regex);
        if (matches && matches.length > 0) {
            findings.push({
                pattern: pattern.name,
                occurrences: matches.length
            });
            totalMatches += matches.length;
        }
    });

    if (findings.length > 0) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'GlideRecord detected in Client Script "' + recordName + '" (' + totalMatches + ' occurrence(s)). Client Scripts should use GlideAjax for server calls.',
            severity: rule.severity || 'high',
            record: item.sys_id,
            record_table: 'sys_script_client',
            record_sys_id: item.sys_id,
            details: {
                script_name: recordName,
                script_type: item.values.type,
                table: item.values.table,
                findings: findings,
                total_matches: totalMatches,
                recommendation: 'Replace GlideRecord calls with GlideAjax (asynchronous server calls) to avoid browser-side database access and improve performance.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Synchronous AJAX in Client Script',
            code: 'CS_SYNCHRONOUS_AJAX',
            description: 'Détecte les appels AJAX synchrones (getXMLWait) qui bloquent le navigateur et dégradent l\'expérience utilisateur.',
            severity: 'high',
            type: 'performance',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: Synchronous AJAX in Client Script
 * Détecte les appels AJAX synchrones qui bloquent le navigateur
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Recherche de getXMLWait
    var pattern = /getXMLWait\s*\(/gi;
    var matches = script.match(pattern);

    if (matches && matches.length > 0) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Synchronous AJAX call (getXMLWait) detected in "' + recordName + '" (' + matches.length + ' occurrence(s)). This blocks the browser and degrades user experience.',
            severity: rule.severity || 'high',
            record: item.sys_id,
            record_table: 'sys_script_client',
            record_sys_id: item.sys_id,
            details: {
                script_name: recordName,
                script_type: item.values.type,
                method: 'getXMLWait',
                occurrences: matches.length,
                recommendation: 'Replace getXMLWait with getXML (asynchronous) and use callback functions to handle the response.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Hardcoded sys_id in Client Script',
            code: 'CS_HARDCODED_SYSID',
            description: 'Détecte les sys_id hardcodés dans les scripts. Les sys_id varient entre instances et rendent le code non portable.',
            severity: 'high',
            type: 'anti_pattern',
            active: true,
            params: JSON.stringify({
                fields: 'script'
            }),
            script: function() {
/**
 * RULE: Hardcoded sys_id in Client Script
 * Détecte les sys_id hardcodés (32 caractères hexadécimaux)
 */
(function executeRule(item, context, issues) {
    var sysIdRegex = /[0-9a-f]{32}/ig;

    var script = item.values.script || '';
    var matches = script.match(sysIdRegex);

    if (matches && matches.length > 0) {
        var recordName = item.values.name || 'Unknown';

        // Exclure les sys_id qui pourraient être des variables (ex: current.sys_id)
        var likelyHardcoded = matches.filter(function(match) {
            var context = script.substring(
                Math.max(0, script.indexOf(match) - 20),
                Math.min(script.length, script.indexOf(match) + match.length + 20)
            );
            // Si entouré de quotes, c'est probablement hardcodé
            return context.match(/['"][0-9a-f]{32}['"]/i);
        });

        if (likelyHardcoded.length > 0) {
            issues.push({
                code: rule.code,
                message: 'Hardcoded sys_id(s) detected in "' + recordName + '" (' + likelyHardcoded.length + ' occurrence(s)). Replace with dynamic queries using names or other unique identifiers.',
                severity: rule.severity || 'high',
                record: item.sys_id,
                record_table: 'sys_script_client',
                record_sys_id: item.sys_id,
                details: {
                    script_name: recordName,
                    script_type: item.values.type,
                    total_sysids: likelyHardcoded.length,
                    sample_sysids: likelyHardcoded.slice(0, 5),
                    recommendation: 'Replace hardcoded sys_ids with queries using names, codes, or other unique fields that are consistent across instances.'
                }
            });
        }
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Large Client Script',
            code: 'CS_LARGE_SCRIPT',
            description: 'Détecte les Client Scripts trop volumineux qui ralentissent le chargement des formulaires.',
            severity: 'medium',
            type: 'performance',
            active: true,
            params: JSON.stringify({
                max_lines: 200,
                max_chars: 5000
            }),
            script: function() {
/**
 * RULE: Large Client Script
 * Détecte les scripts trop volumineux
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    var params = rule.params ? JSON.parse(rule.params) : {};
    var maxLines = params.max_lines || 200;
    var maxChars = params.max_chars || 5000;

    var lineCount = script.split('\n').length;
    var charCount = script.length;

    if (lineCount > maxLines || charCount > maxChars) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Large Client Script detected: "' + recordName + '" (' + lineCount + ' lines, ' + charCount + ' characters). Consider refactoring into smaller, modular scripts.',
            severity: rule.severity || 'medium',
            record: item.sys_id,
            record_table: 'sys_script_client',
            record_sys_id: item.sys_id,
            details: {
                script_name: recordName,
                script_type: item.values.type,
                line_count: lineCount,
                char_count: charCount,
                threshold_lines: maxLines,
                threshold_chars: maxChars,
                recommendation: 'Break down large scripts into smaller, focused functions. Consider using Script Includes or UI Scripts for shared logic.'
            }
        });
    }
})(item, context, issues);
            }.toString()
        },

        {
            name: 'Client Script Without Condition',
            code: 'CS_NO_CONDITION',
            description: 'Détecte les Client Scripts onChange sans condition qui s\'exécutent pour tous les changements de champ.',
            severity: 'low',
            type: 'best_practice',
            active: true,
            params: '',
            script: function() {
/**
 * RULE: Client Script Without Condition
 * Détecte les onChange sans condition spécifique
 */
(function executeRule(item, context, issues) {
    var type = item.values.type || '';
    var condition = item.values.condition || '';

    // Vérifier seulement les onChange
    if (type === 'onChange' && (!condition || condition.trim() === '')) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'onChange Client Script "' + recordName + '" has no condition. This may cause unnecessary executions.',
            severity: rule.severity || 'low',
            record: item.sys_id,
            record_table: 'sys_script_client',
            record_sys_id: item.sys_id,
            details: {
                script_name: recordName,
                script_type: type,
                table: item.values.table,
                recommendation: 'Add a condition to limit when the script executes, improving performance and reducing unnecessary processing.'
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

        // Extraire le corps de la fonction (enlever "function() {" et "}")
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
    vi.addQuery('name', 'Client Scripts - Anti-Patterns & Performance');
    vi.query();

    var viExists = vi.next();

    if (!viExists) {
        vi.initialize();
    }

    vi.setValue('name', 'Client Scripts - Anti-Patterns & Performance');
    vi.setValue('category', 'automation');
    vi.setValue('active', true);

    // Référence à la table sys_script_client
    var tableGr = new GlideRecord('sys_db_object');
    tableGr.addQuery('name', 'sys_script_client');
    tableGr.query();
    if (tableGr.next()) {
        vi.setValue('table', tableGr.getUniqueValue());
    }

    // Query pour filtrer les Client Scripts actifs
    vi.setValue('query_value', 'active=true');

    // Associer les rules (glide_list)
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

    gs.info('\nVous pouvez maintenant :');
    gs.info('1. Créer une Configuration pour analyser la table sys_script_client');
    gs.info('2. Associer le VI "Client Scripts - Anti-Patterns & Performance"');
    gs.info('3. Lancer l\'analyse pour détecter les problèmes');

    return {
        success: true,
        vi_sys_id: viSysId,
        rules: rulesByCodes
    };

})();
