/*
 * Background Script - Cleanup Verification (Foundation Health Analyzer)
 *
 * Verifie que les 9 Script Includes inactifs n'existent plus,
 * liste les Script Includes actifs restants, et produit un rapport JSON.
 */
(function() {
    var TARGET_NAMES = [
        'FHCheckTable',
        'FHCheckAutomation',
        'FHCheckIntegration',
        'FHCheckSecurity',
        'FHCheckRegistry',
        'FHAnalysisContext',
        'FHOptionsHandler',
        'FHScanUtils',
        'FHAUtils'
    ];

    // Scope / package de l'app Foundation Health Analyzer
    var APP_SYS_ID = 'd852994c8312321083e1b4a6feaad3e6';

    function findByName(name) {
        var gr = new GlideRecord('sys_script_include');
        gr.addQuery('name', name);
        gr.query();
        var rows = [];
        while (gr.next()) {
            rows.push({
                name: gr.getValue('name'),
                sys_id: gr.getUniqueValue(),
                active: gr.getValue('active') === 'true',
                api_name: gr.getValue('api_name')
            });
        }
        return rows;
    }

    function listActiveInApp() {
        var gr = new GlideRecord('sys_script_include');
        gr.addQuery('active', true);
        gr.addQuery('sys_package', APP_SYS_ID);
        gr.query();
        var rows = [];
        while (gr.next()) {
            rows.push({
                name: gr.getValue('name'),
                sys_id: gr.getUniqueValue(),
                api_name: gr.getValue('api_name')
            });
        }
        return rows;
    }

    var existing = [];
    var missing = [];

    for (var i = 0; i < TARGET_NAMES.length; i++) {
        var name = TARGET_NAMES[i];
        var matches = findByName(name);
        if (matches.length === 0) {
            missing.push(name);
        } else {
            existing.push({
                name: name,
                records: matches
            });
        }
    }

    var report = {
        timestamp: new Date().toISOString(),
        checked: TARGET_NAMES,
        missing: missing,
        existing: existing,
        activeRemaining: listActiveInApp()
    };

    gs.info(JSON.stringify(report, null, 2));
})();
