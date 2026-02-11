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
 * - Hardcoded sys_id (utilise la règle générique)
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
            description: 'Detects GlideRecord usage in Client Scripts. Client Scripts run in the browser and should not directly access the database.',
            severity: 'high',
            type: 'anti_pattern',
            active: true,
            params: JSON.stringify({
                patterns: ['new GlideRecord', 'gr.query()', '.addQuery(']
            }),
            script: `
/**
 * RULE: GlideRecord in Client Script
 * Detects GlideRecord usage in Client Scripts
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Patterns to detect
    var patterns = [
        { regex: /new\\s+GlideRecord\\s*\\(/gi, name: 'new GlideRecord()' },
        { regex: /\\.query\\s*\\(/gi, name: '.query()' },
        { regex: /\\.addQuery\\s*\\(/gi, name: '.addQuery()' }
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
            record_table: item.table,
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
`
        },

        {
            name: 'Synchronous AJAX in Client Script',
            code: 'CS_SYNCHRONOUS_AJAX',
            description: 'Detects synchronous AJAX calls (getXMLWait) that block the browser and degrade user experience.',
            severity: 'high',
            type: 'performance',
            active: true,
            params: '',
            script: `
/**
 * RULE: Synchronous AJAX in Client Script
 * Detects synchronous AJAX calls that block the browser
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    // Search for getXMLWait
    var pattern = /getXMLWait\\s*\\(/gi;
    var matches = script.match(pattern);

    if (matches && matches.length > 0) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Synchronous AJAX call (getXMLWait) detected in "' + recordName + '" (' + matches.length + ' occurrence(s)). This blocks the browser and degrades user experience.',
            severity: rule.severity || 'high',
            record: item.sys_id,
            record_table: item.table,
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
`
        },

        {
            name: 'Large Client Script',
            code: 'CS_LARGE_SCRIPT',
            description: 'Detects Client Scripts that are too large and slow down form loading.',
            severity: 'medium',
            type: 'performance',
            active: true,
            params: JSON.stringify({
                max_lines: 200,
                max_chars: 5000
            }),
            script: `
/**
 * RULE: Large Client Script
 * Detects scripts that are too large
 */
(function executeRule(item, context, issues) {
    var script = item.values.script || '';

    var params = rule.params ? JSON.parse(rule.params) : {};
    var maxLines = params.max_lines || 200;
    var maxChars = params.max_chars || 5000;

    var lineCount = script.split('\\n').length;
    var charCount = script.length;

    if (lineCount > maxLines || charCount > maxChars) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'Large Client Script detected: "' + recordName + '" (' + lineCount + ' lines, ' + charCount + ' characters). Consider refactoring into smaller, modular scripts.',
            severity: rule.severity || 'medium',
            record: item.sys_id,
            record_table: item.table,
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
`
        },

        {
            name: 'Client Script Without Condition',
            code: 'CS_NO_CONDITION',
            description: 'Detects onChange Client Scripts without conditions that execute for all field changes.',
            severity: 'low',
            type: 'best_practice',
            active: true,
            params: '',
            script: `
/**
 * RULE: Client Script Without Condition
 * Detects onChange scripts without specific conditions
 */
(function executeRule(item, context, issues) {
    var type = item.values.type || '';
    var condition = item.values.condition || '';

    // Check only onChange scripts
    if (type === 'onChange' && (!condition || condition.trim() === '')) {
        var recordName = item.values.name || 'Unknown';

        issues.push({
            code: rule.code,
            message: 'onChange Client Script "' + recordName + '" has no condition. This may cause unnecessary executions.',
            severity: rule.severity || 'low',
            record: item.sys_id,
            record_table: item.table,
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
`
        }
    ];

    // ============================================================
    // 2. CRÉATION DES ISSUE RULES
    // ============================================================

    gs.info('===== CREATING ISSUE RULES =====');

    var ruleSysIds = [];
    var rulesByCodes = {};

    rules.forEach(function(ruleData) {
        var gr = new GlideRecord('x_1310794_founda_0_issue_rules');

        // Check if rule already exists
        gr.addQuery('code', ruleData.code);
        gr.query();

        var exists = gr.next();

        if (!exists) {
            gr.initialize();
        }

        // Update fields
        gr.setValue('name', ruleData.name);
        gr.setValue('code', ruleData.code);
        gr.setValue('description', ruleData.description);
        gr.setValue('severity', ruleData.severity);
        gr.setValue('type', ruleData.type);
        gr.setValue('active', ruleData.active);
        gr.setValue('script', ruleData.script.trim());
        gr.setValue('params', ruleData.params);

        var sysId = exists ? gr.update() : gr.insert();
        ruleSysIds.push(sysId);
        rulesByCodes[ruleData.code] = sysId;

        gs.info((exists ? 'Updated' : 'Created') + ' rule: ' + ruleData.code + ' (' + sysId + ')');
    });

    // ============================================================
    // 3. RÉCUPÉRATION DE LA RÈGLE HARDCODED_SYSID (déjà existante)
    // ============================================================

    gs.info('\n===== USING EXISTING HARDCODED_SYSID RULE =====');

    // La règle hardcoded_sysid est générique et déjà créée
    // On la récupère pour l'associer au VI
    var hardcodedRule = new GlideRecord('x_1310794_founda_0_issue_rules');
    hardcodedRule.addQuery('code', 'HARDCODED_SYSID');
    hardcodedRule.query();

    if (hardcodedRule.next()) {
        ruleSysIds.push(hardcodedRule.getUniqueValue());
        rulesByCodes['HARDCODED_SYSID'] = hardcodedRule.getUniqueValue();
        gs.info('Found existing rule: HARDCODED_SYSID (' + hardcodedRule.getUniqueValue() + ')');
    } else {
        gs.warn('HARDCODED_SYSID rule not found. You may need to create it first.');
    }

    // ============================================================
    // 4. CRÉATION DU VERIFICATION ITEM
    // ============================================================

    gs.info('\n===== CREATING VERIFICATION ITEM =====');

    var vi = new GlideRecord('x_1310794_founda_0_verification_items');

    // Check if VI already exists
    vi.addQuery('name', 'Client Scripts - Anti-Patterns & Performance');
    vi.query();

    var viExists = vi.next();

    if (!viExists) {
        vi.initialize();
    }

    vi.setValue('name', 'Client Scripts - Anti-Patterns & Performance');
    vi.setValue('category', 'automation');
    vi.setValue('active', true);

    // Reference to sys_script_client table
    var tableGr = new GlideRecord('sys_db_object');
    tableGr.addQuery('name', 'sys_script_client');
    tableGr.query();
    if (tableGr.next()) {
        vi.setValue('table', tableGr.getUniqueValue());
    }

    // Query to filter active Client Scripts
    vi.setValue('query_value', 'active=true');

    // Associate rules (glide_list)
    vi.setValue('issue_rules', ruleSysIds.join(','));

    var viSysId = viExists ? vi.update() : vi.insert();

    gs.info((viExists ? 'Updated' : 'Created') + ' VI: ' + viSysId);

    // ============================================================
    // 5. UPDATE RULES TO REFERENCE THE VI
    // ============================================================

    gs.info('\n===== UPDATING REFERENCES =====');

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
    // 6. SUMMARY
    // ============================================================

    gs.info('\n===== CREATION COMPLETED =====');
    gs.info('Verification Item sys_id: ' + viSysId);
    gs.info('Issue Rules created/associated:');

    for (var code in rulesByCodes) {
        gs.info('  - ' + code + ' (' + rulesByCodes[code] + ')');
    }

    gs.info('\nNext steps:');
    gs.info('1. Create a Configuration to analyze table sys_script_client');
    gs.info('2. Associate the VI "Client Scripts - Anti-Patterns & Performance"');
    gs.info('3. Run the analysis to detect issues');

    return {
        success: true,
        vi_sys_id: viSysId,
        rules: rulesByCodes
    };

})();
