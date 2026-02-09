// ===================================================
// FHA Executive Dashboard Widget - Server Script
// ===================================================

(function() {
  
  // Initialize data object
  data.metrics = {};
  data.distribution = {};
  data.trending = [];
  data.topTables = [];
  data.categories = {};
  data.success = false;
  data.error = null;
  
  // Internationalization (i18n)
  data.i18n = {
    title: gs.getMessage('Executive Dashboard'),
    loading: gs.getMessage('Loading dashboard...'),
    refresh: gs.getMessage('Refresh'),
    lastUpdate: gs.getMessage('Last updated'),
    totalAnalyses: gs.getMessage('Total Analyses'),
    avgHealthScore: gs.getMessage('Avg Health Score'),
    totalIssues: gs.getMessage('Total Issues'),
    tablesAnalyzed: gs.getMessage('Tables Analyzed'),
    successRate: gs.getMessage('Success Rate'),
    last30Days: gs.getMessage('last 30 days'),
    activeConfigs: gs.getMessage('active configs'),
    healthScoreDistribution: gs.getMessage('Health Score Distribution'),
    healthScoreTrend: gs.getMessage('Health Score Trend'),
    topProblematicTables: gs.getMessage('Top 10 Most Problematic Tables'),
    viewAll: gs.getMessage('View All'),
    viewDetails: gs.getMessage('View Details'),
    noProblematicTables: gs.getMessage('No problematic tables found!'),
    errorLoadingData: gs.getMessage('Error loading dashboard data'),
    excellent: gs.getMessage('Excellent'),
    good: gs.getMessage('Good'),
    fair: gs.getMessage('Fair'),
    poor: gs.getMessage('Poor'),
    critical: gs.getMessage('Critical'),
    healthScore: gs.getMessage('Health Score'),
    issues: gs.getMessage('Issues')
  };
  
  /**
   * Load dashboard data on initialization
   */
  function loadDashboardData() {
    try {
      var metricsEngine = new x_1310794_founda_0.FHMetricsEngine();
      
      // Get trending days from input (default: 30)
      var trendingDays = input && input.trendingDays ? parseInt(input.trendingDays) : 30;
      
      // Get global metrics
      data.metrics = metricsEngine.getGlobalMetrics();
      
      // Get health score distribution
      data.distribution = metricsEngine.getHealthScoreDistribution();
      
      // Get trending data
      data.trending = metricsEngine.getTrendingData(trendingDays);
      
      // Get top 10 problematic tables
      data.topTables = metricsEngine.getTop10ProblematicTables();
      
      // Get category metrics
      data.categories = metricsEngine.getCategoryMetrics();
      
      data.success = true;
      
    } catch (error) {
      gs.error('[FHA Executive Dashboard Widget] Error loading data: ' + error.message);
      data.error = error.message;
      data.success = false;
    }
  }
  
  // Load data on server init
  loadDashboardData();
  
})();
