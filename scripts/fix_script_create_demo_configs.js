// =====================================================================
// FIX SCRIPT: Create Demo Configurations for Foundation Health Analyzer
// =====================================================================
// Run this script in ServiceNow Script Background
// This will create complete configurations with verification items

(function createDemoConfigurations() {
    
    var configTable = 'x_1310794_founda_0_configurations';
    var verificationTable = 'x_1310794_founda_0_verification_items';
    var issueRulesTable = 'x_1310794_founda_0_issue_rules';
    
    var createdConfigs = 0;
    var createdVerificationItems = 0;
    var errors = 0;
    
    gs.info('====================================');
    gs.info('Creating Demo Configurations');
    gs.info('====================================');
    
    // ============= HELPER FUNCTIONS =============
    
    /**
     * Get or create an issue rule
     */
    function getOrCreateIssueRule(ruleData) {
        var gr = new GlideRecord(issueRulesTable);
        gr.addQuery('code', ruleData.code);
        gr.query();
        
        if (gr.next()) {
            return gr.getUniqueValue();
        }
        
        // Create if doesn't exist
        gr.initialize();
        gr.setValue('name', ruleData.name);
        gr.setValue('code', ruleData.code);
        gr.setValue('type', ruleData.type);
        gr.setValue('severity', ruleData.severity);
        gr.setValue('description', ruleData.description);
        gr.setValue('params', ruleData.params);
        gr.setValue('script', ruleData.script || '');
        gr.setValue('active', true);
        
        return gr.insert();
    }
    
    /**
     * Get table sys_id by name
     */
    function getTableSysId(tableName) {
        var gr = new GlideRecord('sys_db_object');
        gr.addQuery('name', tableName);
        gr.query();
        
        if (gr.next()) {
            return gr.getUniqueValue();
        }
        
        gs.warn('[WARN] Table not found: ' + tableName);
        return null;
    }
    
    /**
     * Create a verification item
     */
    function createVerificationItem(data) {
        var gr = new GlideRecord(verificationTable);
        
        // Check if already exists
        gr.addQuery('name', data.name);
        gr.query();
        if (gr.next()) {
            gs.info('[EXISTS] Verification Item: ' + data.name);
            return gr.getUniqueValue();
        }
        
        // Create new
        gr.initialize();
        gr.setValue('name', data.name);
        gr.setValue('category', data.category);
        gr.setValue('table', data.table_sys_id);
        gr.setValue('query_type', data.query_type || 'encoded');
        gr.setValue('query_value', data.query_value || '');
        gr.setValue('query_script', data.query_script || '');
        gr.setValue('fields', data.fields || 'name,active,sys_created_by,sys_updated_by,sys_id');
        gr.setValue('issue_rules', data.issue_rules || '');
        gr.setValue('metadata', data.metadata || '{}');
        gr.setValue('active', true);
        
        var sysId = gr.insert();
        createdVerificationItems++;
        gs.info('[CREATED] Verification Item: ' + data.name);
        return sysId;
    }
    
    /**
     * Create a configuration
     */
    function createConfiguration(data) {
        var gr = new GlideRecord(configTable);
        
        // Check if already exists
        gr.addQuery('name', data.name);
        gr.query();
        if (gr.next()) {
            gs.warn('[EXISTS] Configuration already exists: ' + data.name);
            return null;
        }
        
        // Create new
        gr.initialize();
        gr.setValue('name', data.name);
        gr.setValue('table', data.table_sys_id);
        gr.setValue('description', data.description);
        gr.setValue('active', data.active !== false);
        gr.setValue('verification_items', data.verification_items.join(','));
        gr.setValue('deep_scan', data.deep_scan || false);
        gr.setValue('include_children_tables', data.include_children_tables || false);
        gr.setValue('include_ldap', data.include_ldap || false);
        gr.setValue('ignore_servicenow_records', data.ignore_servicenow_records || false);
        
        var sysId = gr.insert();
        createdConfigs++;
        gs.info('[CREATED] Configuration: ' + data.name);
        return sysId;
    }
    
    // ============= DEFINE ISSUE RULES =============
    
    gs.info('');
    gs.info('Step 1: Ensuring required issue rules exist...');
    
    var ruleInactive = getOrCreateIssueRule({
        name: 'Inactive Record Detector',
        code: 'INACTIVE',
        type: 'inactive',
        severity: 'low',
        description: 'Detects inactive records that could be cleaned up',
        params: '{}'
    });
    
    var ruleBRDensity = getOrCreateIssueRule({
        name: 'Too Many Business Rules',
        code: 'BR_TOO_MANY',
        type: 'br_density',
        severity: 'medium',
        description: 'Detects tables with too many business rules',
        params: '{"threshold": 30}'
    });
    
    var ruleCountThreshold = getOrCreateIssueRule({
        name: 'Too Many Records',
        code: 'TOO_MANY_RECORDS',
        type: 'count_threshold',
        severity: 'medium',
        description: 'Detects too many records',
        params: '{"threshold": 100}'
    });
    
    var ruleSystemCreated = getOrCreateIssueRule({
        name: 'System Created Records',
        code: 'SYSTEM_CREATED',
        type: 'system_created',
        severity: 'low',
        description: 'Records created by system user',
        params: '{}'
    });
    
    var ruleHardcodedSysId = getOrCreateIssueRule({
        name: 'Hardcoded Sys IDs',
        code: 'HARDCODED_SYSID',
        type: 'hardcoded_sys_id',
        severity: 'medium',
        description: 'Detects hardcoded sys_ids in scripts',
        params: '{"fields": "script"}'
    });
    
    var ruleSizeThreshold = getOrCreateIssueRule({
        name: 'Script Too Large',
        code: 'SCRIPT_TOO_LARGE',
        type: 'size_threshold',
        severity: 'medium',
        description: 'Detects scripts that are too large',
        params: '{"field": "script", "max_len": 5000}'
    });
    
    var ruleMissingDescription = getOrCreateIssueRule({
        name: 'Missing Description',
        code: 'MISSING_DESCRIPTION',
        type: 'missing_field',
        severity: 'low',
        description: 'Detects records without description',
        params: '{"fields": "description"}'
    });
    
    gs.info('Issue rules ready.');
    
    // ============= CONFIGURATION 1: INCIDENT TABLE =============
    
    gs.info('');
    gs.info('Step 2: Creating Configuration - Incident Table Analysis...');
    
    var incidentTableSysId = getTableSysId('incident');
    if (incidentTableSysId) {
        
        // Business Rules on Incident
        var incBRItem = createVerificationItem({
            name: 'Incident - Business Rules',
            category: 'automation',
            table_sys_id: getTableSysId('sys_script'),
            query_type: 'encoded',
            query_value: 'collection=incident^active=true',
            fields: 'name,active,collection,script,when,order,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleBRDensity, ruleHardcodedSysId, ruleSizeThreshold].join(','),
            metadata: JSON.stringify({
                displayName: 'Business Rules',
                icon: 'fa-cog',
                color: '#0c63d4'
            })
        });
        
        // Client Scripts on Incident
        var incCSItem = createVerificationItem({
            name: 'Incident - Client Scripts',
            category: 'automation',
            table_sys_id: getTableSysId('sys_script_client'),
            query_type: 'encoded',
            query_value: 'table=incident^active=true',
            fields: 'name,active,table,script,type,ui_type,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleCountThreshold, ruleHardcodedSysId].join(','),
            metadata: JSON.stringify({
                displayName: 'Client Scripts',
                icon: 'fa-code',
                color: '#6f42c1'
            })
        });
        
        // UI Policies on Incident
        var incUIPolicyItem = createVerificationItem({
            name: 'Incident - UI Policies',
            category: 'UI',
            table_sys_id: getTableSysId('sys_ui_policy'),
            query_type: 'encoded',
            query_value: 'table=incident',
            fields: 'name,active,table,description,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleMissingDescription].join(','),
            metadata: JSON.stringify({
                displayName: 'UI Policies',
                icon: 'fa-magic',
                color: '#d97706'
            })
        });
        
        // Workflows on Incident
        var incWorkflowItem = createVerificationItem({
            name: 'Incident - Workflows',
            category: 'automation',
            table_sys_id: getTableSysId('wf_workflow'),
            query_type: 'encoded',
            query_value: 'table=incident',
            fields: 'name,active,table,description,published,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleMissingDescription].join(','),
            metadata: JSON.stringify({
                displayName: 'Workflows',
                icon: 'fa-bolt',
                color: '#0f766e'
            })
        });
        
        // Create Configuration
        createConfiguration({
            name: 'Incident Table - Complete Analysis',
            table_sys_id: incidentTableSysId,
            description: 'Comprehensive health check for Incident table including business rules, client scripts, UI policies, and workflows',
            active: true,
            verification_items: [incBRItem, incCSItem, incUIPolicyItem, incWorkflowItem],
            deep_scan: false,
            include_children_tables: false,
            include_ldap: false,
            ignore_servicenow_records: true
        });
    }
    
    // ============= CONFIGURATION 2: CHANGE REQUEST TABLE =============
    
    gs.info('');
    gs.info('Step 3: Creating Configuration - Change Request Table...');
    
    var changeTableSysId = getTableSysId('change_request');
    if (changeTableSysId) {
        
        // Business Rules on Change Request
        var chgBRItem = createVerificationItem({
            name: 'Change Request - Business Rules',
            category: 'automation',
            table_sys_id: getTableSysId('sys_script'),
            query_type: 'encoded',
            query_value: 'collection=change_request^active=true',
            fields: 'name,active,collection,script,when,order,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleBRDensity, ruleHardcodedSysId, ruleSizeThreshold].join(','),
            metadata: JSON.stringify({
                displayName: 'Business Rules',
                icon: 'fa-cog',
                color: '#0c63d4'
            })
        });
        
        // Flows on Change Request
        var chgFlowItem = createVerificationItem({
            name: 'Change Request - Flows',
            category: 'automation',
            table_sys_id: getTableSysId('sys_hub_flow'),
            query_type: 'encoded',
            query_value: 'active=true',
            fields: 'name,active,description,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleMissingDescription].join(','),
            metadata: JSON.stringify({
                displayName: 'Flows',
                icon: 'fa-bolt',
                color: '#be185d'
            })
        });
        
        // ACLs on Change Request
        var chgACLItem = createVerificationItem({
            name: 'Change Request - ACLs',
            category: 'security',
            table_sys_id: getTableSysId('sys_security_acl'),
            query_type: 'encoded',
            query_value: 'name=change_request^ORname=change_request.*',
            fields: 'name,active,operation,description,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleSystemCreated].join(','),
            metadata: JSON.stringify({
                displayName: 'ACLs',
                icon: 'fa-shield',
                color: '#4338ca'
            })
        });
        
        createConfiguration({
            name: 'Change Request - Security & Automation',
            table_sys_id: changeTableSysId,
            description: 'Focus on security (ACLs) and automation (Business Rules, Flows) for Change Request table',
            active: true,
            verification_items: [chgBRItem, chgFlowItem, chgACLItem],
            deep_scan: true,
            include_children_tables: false,
            include_ldap: false,
            ignore_servicenow_records: true
        });
    }
    
    // ============= CONFIGURATION 3: USER TABLE =============
    
    gs.info('');
    gs.info('Step 4: Creating Configuration - User Table...');
    
    var userTableSysId = getTableSysId('sys_user');
    if (userTableSysId) {
        
        // Business Rules on User
        var userBRItem = createVerificationItem({
            name: 'User - Business Rules',
            category: 'automation',
            table_sys_id: getTableSysId('sys_script'),
            query_type: 'encoded',
            query_value: 'collection=sys_user^active=true',
            fields: 'name,active,collection,script,when,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleBRDensity, ruleHardcodedSysId].join(','),
            metadata: JSON.stringify({
                displayName: 'Business Rules',
                icon: 'fa-cog',
                color: '#0c63d4'
            })
        });
        
        // Data Sources importing to User
        var userDSItem = createVerificationItem({
            name: 'User - Data Sources',
            category: 'integration',
            table_sys_id: getTableSysId('sys_data_source'),
            query_type: 'encoded',
            query_value: 'active=true',
            fields: 'name,active,type,description,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleMissingDescription].join(','),
            metadata: JSON.stringify({
                displayName: 'Data Sources',
                icon: 'fa-database',
                color: '#2563eb'
            })
        });
        
        // ACLs on User table
        var userACLItem = createVerificationItem({
            name: 'User - ACLs',
            category: 'security',
            table_sys_id: getTableSysId('sys_security_acl'),
            query_type: 'encoded',
            query_value: 'name=sys_user^ORname=sys_user.*',
            fields: 'name,active,operation,description,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleSystemCreated].join(','),
            metadata: JSON.stringify({
                displayName: 'ACLs',
                icon: 'fa-shield',
                color: '#4338ca'
            })
        });
        
        createConfiguration({
            name: 'User Table - Integration & Security',
            table_sys_id: userTableSysId,
            description: 'Analysis focused on user integrations (LDAP, SSO) and security controls',
            active: true,
            verification_items: [userBRItem, userDSItem, userACLItem],
            deep_scan: false,
            include_children_tables: false,
            include_ldap: true,
            ignore_servicenow_records: true
        });
    }
    
    // ============= CONFIGURATION 4: CUSTOM TABLE TEMPLATE =============
    
    gs.info('');
    gs.info('Step 5: Creating Configuration - Generic Custom Table...');
    
    var taskTableSysId = getTableSysId('task');
    if (taskTableSysId) {
        
        // Business Rules on Task (parent table)
        var taskBRItem = createVerificationItem({
            name: 'Task - Business Rules (All)',
            category: 'automation',
            table_sys_id: getTableSysId('sys_script'),
            query_type: 'script',
            query_script: 'var taskTables = ["task", "incident", "problem", "change_request", "sc_request", "sc_task"];\nvar gr = new GlideRecord("sys_script");\ngr.addQuery("active", true);\ngr.addQuery("collection", "IN", taskTables.join(","));\ngr.query();\nscriptResults = [];\nwhile (gr.next()) {\n    scriptResults.push(gr.getUniqueValue());\n}\nreturn scriptResults;',
            fields: 'name,active,collection,script,when,order,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleBRDensity, ruleHardcodedSysId, ruleSizeThreshold].join(','),
            metadata: JSON.stringify({
                displayName: 'Business Rules (Task Family)',
                icon: 'fa-cog',
                color: '#0c63d4'
            })
        });
        
        // UI Actions on Task
        var taskUIActionItem = createVerificationItem({
            name: 'Task - UI Actions',
            category: 'UI',
            table_sys_id: getTableSysId('sys_ui_action'),
            query_type: 'encoded',
            query_value: 'table=task^active=true',
            fields: 'name,active,table,script,action_name,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleCountThreshold, ruleHardcodedSysId].join(','),
            metadata: JSON.stringify({
                displayName: 'UI Actions',
                icon: 'fa-magic',
                color: '#d97706'
            })
        });
        
        createConfiguration({
            name: 'Task Table Family - Deep Scan',
            table_sys_id: taskTableSysId,
            description: 'Deep analysis of Task table and all child tables (Incident, Problem, Change, etc.) with script quality checks',
            active: true,
            verification_items: [taskBRItem, taskUIActionItem],
            deep_scan: true,
            include_children_tables: true,
            include_ldap: false,
            ignore_servicenow_records: true
        });
    }
    
    // ============= CONFIGURATION 5: SCHEDULED JOBS ANALYSIS =============
    
    gs.info('');
    gs.info('Step 6: Creating Configuration - Scheduled Jobs Analysis...');
    
    var sysschedTableSysId = getTableSysId('sysauto_script');
    if (sysschedTableSysId) {
        
        // All Scheduled Jobs
        var schedJobsItem = createVerificationItem({
            name: 'All Scheduled Jobs',
            category: 'automation',
            table_sys_id: sysschedTableSysId,
            query_type: 'encoded',
            query_value: 'active=true',
            fields: 'name,active,script,run_as,run_dayofweek,run_period,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleCountThreshold, ruleHardcodedSysId, ruleSizeThreshold].join(','),
            metadata: JSON.stringify({
                displayName: 'Scheduled Jobs',
                icon: 'fa-clock',
                color: '#16a34a'
            })
        });
        
        createConfiguration({
            name: 'Scheduled Jobs - Health Check',
            table_sys_id: sysschedTableSysId,
            description: 'Analysis of all scheduled jobs for inactive jobs, script quality, and potential issues',
            active: true,
            verification_items: [schedJobsItem],
            deep_scan: true,
            include_children_tables: false,
            include_ldap: false,
            ignore_servicenow_records: false
        });
    }
    
    // ============= CONFIGURATION 6: REST API ANALYSIS =============
    
    gs.info('');
    gs.info('Step 7: Creating Configuration - REST API Analysis...');
    
    var restAPITableSysId = getTableSysId('sys_ws_operation');
    if (restAPITableSysId) {
        
        // REST API Operations
        var restOpsItem = createVerificationItem({
            name: 'REST API Operations',
            category: 'integration',
            table_sys_id: restAPITableSysId,
            query_type: 'encoded',
            query_value: 'active=true',
            fields: 'name,active,operation_script,http_method,web_service_definition,sys_created_by,sys_updated_by,sys_id',
            issue_rules: [ruleInactive, ruleHardcodedSysId, ruleSizeThreshold].join(','),
            metadata: JSON.stringify({
                displayName: 'REST Operations',
                icon: 'fa-plug',
                color: '#dc2626'
            })
        });
        
        createConfiguration({
            name: 'REST APIs - Security & Quality',
            table_sys_id: restAPITableSysId,
            description: 'Analysis of REST API operations for security issues, script quality, and best practices',
            active: true,
            verification_items: [restOpsItem],
            deep_scan: true,
            include_children_tables: false,
            include_ldap: false,
            ignore_servicenow_records: false
        });
    }
    
    // ============= FINAL SUMMARY =============
    
    gs.info('');
    gs.info('====================================');
    gs.info('Demo Configuration Creation Complete!');
    gs.info('====================================');
    gs.info('Configurations created: ' + createdConfigs);
    gs.info('Verification items created: ' + createdVerificationItems);
    gs.info('Errors: ' + errors);
    gs.info('====================================');
    gs.info('');
    gs.info('Next steps:');
    gs.info('1. Go to x_1310794_founda_0_configurations.list');
    gs.info('2. Select a configuration');
    gs.info('3. Run an analysis from the portal (/fha)');
    gs.info('====================================');
    
})();
