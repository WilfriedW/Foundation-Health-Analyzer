// ===================================================
// FHA Category Metrics Widget - Server Script
// ===================================================

(function() {
  
  // Initialize data
  data.categories = {};
  data.success = false;
  data.error = null;
  
  // Internationalization (i18n)
  data.i18n = {
    title: gs.getMessage('Issues by Category'),
    loading: gs.getMessage('Loading...'),
    noData: gs.getMessage('No category data available'),
    totalIssues: gs.getMessage('Total Issues'),
    critical: gs.getMessage('Critical'),
    high: gs.getMessage('High'),
    medium: gs.getMessage('Medium'),
    low: gs.getMessage('Low'),
    affectedTables: gs.getMessage('Affected Tables'),
    ofTotal: gs.getMessage('of total'),
    issuesByCategory: gs.getMessage('Issues by Category'),
    // Category names
    automation: gs.getMessage('Automation'),
    security: gs.getMessage('Security'),
    integration: gs.getMessage('Integration'),
    performance: gs.getMessage('Performance'),
    dataQuality: gs.getMessage('Data Quality'),
    configuration: gs.getMessage('Configuration'),
    compliance: gs.getMessage('Compliance'),
    general: gs.getMessage('General')
  };
  
  /**
   * Load category metrics
   */
  function loadCategoryMetrics() {
    try {
      var metricsEngine = new x_1310794_founda_0.FHMetricsEngine();
      
      // Get category metrics
      data.categories = metricsEngine.getCategoryMetrics();
      
      data.success = true;
      
    } catch (error) {
      gs.error('[FHA Category Metrics Widget] Error loading data: ' + error.message);
      data.error = error.message;
      data.success = false;
    }
  }
  
  // Load data on server init
  loadCategoryMetrics();
  
})();
