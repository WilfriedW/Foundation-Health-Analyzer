// Example: Analyze Business Rules for specific table using template
// Background Script - Run in ServiceNow Scripts - Background

(function() {
    
    // ===== CONFIGURE HERE =====
    var TARGET_TABLE = 'sys_user';  // Change to any table name
    var TEMPLATE_NAME = 'Business Rules Check';  // Or any other template
    var CONFIG_NAME = 'Users Table - BR Analysis';
    // ==========================
    
    try {
        var mgr = new x_1310794_founda_0.FHTemplateManager();
        
        // 1. Get template
        var template = new GlideRecord('x_1310794_founda_0_analysis_templates');
        if (!template.get('name', TEMPLATE_NAME)) {
            gs.error('Template not found: ' + TEMPLATE_NAME);
            return;
        }
        gs.info('✅ Template found: ' + template.name);
        
        // 2. Get target table
        var targetTable = new GlideRecord('sys_db_object');
        if (!targetTable.get('name', TARGET_TABLE)) {
            gs.error('Table not found: ' + TARGET_TABLE);
            return;
        }
        gs.info('✅ Target table found: ' + targetTable.getDisplayValue());
        
        // 3. Create configuration with target table
        var configId = mgr.createFromTemplate(
            template.sys_id.toString(),
            CONFIG_NAME,
            targetTable.sys_id.toString(),  // Target table override
            {
                ignore_servicenow_records: true,
                deep_scan: false
            }
        );
        
        gs.info('✅ Configuration created: ' + configId);
        
        // 4. Verify verification item query
        var config = new GlideRecord('x_1310794_founda_0_configurations');
        if (config.get(configId)) {
            gs.info('Config table: ' + config.table.getDisplayValue());
            
            var vi = new GlideRecord('x_1310794_founda_0_verification_items');
            vi.addQuery('sys_id', 'IN', config.verification_items);
            vi.query();
            
            while (vi.next()) {
                gs.info('✅ Verification Item: ' + vi.name);
                gs.info('   - Table: ' + vi.table);
                gs.info('   - Query: ' + vi.query_value);
                gs.info('   - Rules count: ' + vi.issue_rules.split(',').length);
            }
        }
        
        // 5. Run analysis
        gs.info('🚀 Starting analysis...');
        var analyzer = new x_1310794_founda_0.FHAnalyzer();
        var result = analyzer.runAnalysis(configId);
        
        // 6. Display results
        gs.info('');
        gs.info('=== ANALYSIS RESULTS ===');
        gs.info('Health Score: ' + result.health_score + '%');
        gs.info('Status: ' + result.status);
        gs.info('Total Issues: ' + result.details.issues.length);
        gs.info('');
        
        if (result.details.issues.length > 0) {
            gs.info('Issues breakdown:');
            var issuesByType = {};
            result.details.issues.forEach(function(issue) {
                issuesByType[issue.rule_type] = (issuesByType[issue.rule_type] || 0) + 1;
            });
            
            for (var type in issuesByType) {
                gs.info('  - ' + type + ': ' + issuesByType[type]);
            }
        }
        
        gs.info('');
        gs.info('✅ Analysis complete!');
        gs.info('View full results in Results table');
        gs.info('Configuration: ' + config.getLink(true));
        
    } catch (e) {
        gs.error('❌ Error: ' + e);
    }
    
})();

/*
USAGE EXAMPLES:

Example 1: Analyze Business Rules on sys_user table
-------------------------------------------------------
TARGET_TABLE = 'sys_user'
TEMPLATE_NAME = 'Business Rules Check'

Result: Analyzes only BR with collection=sys_user


Example 2: Analyze Client Scripts on incident table
-------------------------------------------------------
TARGET_TABLE = 'incident'
TEMPLATE_NAME = 'Client Scripts Check'

Result: Analyzes only CS with table=incident


Example 3: Analyze UI Actions on change_request table
-------------------------------------------------------
TARGET_TABLE = 'change_request'
TEMPLATE_NAME = 'UI Actions Check'

Result: Analyzes only UI Actions on change_request table


Example 4: Analyze ACLs on sys_user table
-------------------------------------------------------
TARGET_TABLE = 'sys_user'
TEMPLATE_NAME = 'Security ACLs Check'

Result: Analyzes ACLs with name matching sys_user


Example 5: Direct table records check
-------------------------------------------------------
TARGET_TABLE = 'incident'
TEMPLATE_NAME = 'Table Records Direct Check'

Result: Analyzes incident records directly (not BR/CS/ACL)

*/
