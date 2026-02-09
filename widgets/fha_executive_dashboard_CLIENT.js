// ===================================================
// FHA Executive Dashboard Widget - Client Script
// ===================================================

function FHAExecutiveDashboardController($scope, $timeout, spUtil) {
  var c = this;
  
  // Initialize
  c.data.loading = true;
  c.data.refreshing = false;
  c.data.trendingDays = 30;
  c.data.lastUpdate = new Date();
  
  // Chart instances
  var healthDistributionChart = null;
  var trendingChart = null;
  
  /**
   * Initialize dashboard on load
   */
  c.$onInit = function() {
    c.loadDashboardData();
  };
  
  /**
   * Load dashboard data from server
   */
  c.loadDashboardData = function() {
    c.data.loading = true;
    c.data.error = null;
    
    c.server.get({
      trendingDays: c.data.trendingDays
    }).then(function(response) {
      if (response.data.success) {
        // Update data
        c.data.metrics = response.data.metrics;
        c.data.distribution = response.data.distribution;
        c.data.trending = response.data.trending;
        c.data.topTables = response.data.topTables;
        c.data.categories = response.data.categories;
        c.data.lastUpdate = new Date();
        
        // Render charts after DOM update
        $timeout(function() {
          c.renderCharts();
        }, 100);
      } else {
        c.data.error = response.data.error || c.data.i18n.errorLoadingData;
      }
    }).catch(function(error) {
      c.data.error = c.data.i18n.errorLoadingData + ': ' + (error.message || 'Unknown error');
    }).finally(function() {
      c.data.loading = false;
      c.data.refreshing = false;
    });
  };
  
  /**
   * Refresh dashboard
   */
  c.refreshDashboard = function() {
    c.data.refreshing = true;
    c.loadDashboardData();
  };
  
  /**
   * Change trending period
   */
  c.changeTrendingPeriod = function(days) {
    if (c.data.trendingDays === days) return;
    c.data.trendingDays = days;
    c.refreshDashboard();
  };
  
  /**
   * Get health score CSS class
   */
  c.getHealthScoreClass = function(score) {
    if (score >= 90) return 'kpi-excellent';
    if (score >= 70) return 'kpi-good';
    if (score >= 50) return 'kpi-fair';
    if (score >= 30) return 'kpi-poor';
    return 'kpi-danger';
  };
  
  /**
   * Get health score progress bar class
   */
  c.getHealthScoreProgressClass = function(score) {
    if (score >= 90) return 'progress-bar-excellent';
    if (score >= 70) return 'progress-bar-good';
    if (score >= 50) return 'progress-bar-fair';
    if (score >= 30) return 'progress-bar-poor';
    return 'progress-bar-critical';
  };
  
  /**
   * Render all charts
   */
  c.renderCharts = function() {
    c.renderHealthDistributionChart();
    c.renderTrendingChart();
  };
  
  /**
   * Render Health Score Distribution Donut Chart
   */
  c.renderHealthDistributionChart = function() {
    var canvasId = 'health-distribution-chart-' + c.widget.options.id;
    var canvas = document.getElementById(canvasId);
    
    if (!canvas) {
      console.error('Canvas not found: ' + canvasId);
      return;
    }
    
    var ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (healthDistributionChart) {
      healthDistributionChart.destroy();
    }
    
    var distribution = c.data.distribution || {
      excellent: 0,
      good: 0,
      fair: 0,
      poor: 0,
      critical: 0
    };
    
    healthDistributionChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: [
          c.data.i18n.excellent + ' (90-100%)',
          c.data.i18n.good + ' (70-89%)',
          c.data.i18n.fair + ' (50-69%)',
          c.data.i18n.poor + ' (30-49%)',
          c.data.i18n.critical + ' (0-29%)'
        ],
        datasets: [{
          data: [
            distribution.excellent,
            distribution.good,
            distribution.fair,
            distribution.poor,
            distribution.critical
          ],
          backgroundColor: [
            '#16a34a',  // Excellent - Green
            '#4ade80',  // Good - Light Green
            '#fbbf24',  // Fair - Yellow
            '#f97316',  // Poor - Orange
            '#dc2626'   // Critical - Red
          ],
          borderWidth: 2,
          borderColor: '#fff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                var label = context.label || '';
                var value = context.parsed || 0;
                var total = context.dataset.data.reduce(function(a, b) { return a + b; }, 0);
                var percentage = total > 0 ? Math.round((value / total) * 100) : 0;
                return label + ': ' + value + ' (' + percentage + '%)';
              }
            }
          }
        },
        cutout: '60%'
      }
    });
  };
  
  /**
   * Render Trending Line Chart
   */
  c.renderTrendingChart = function() {
    var canvasId = 'trending-chart-' + c.widget.options.id;
    var canvas = document.getElementById(canvasId);
    
    if (!canvas) {
      console.error('Canvas not found: ' + canvasId);
      return;
    }
    
    var ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (trendingChart) {
      trendingChart.destroy();
    }
    
    var trending = c.data.trending || [];
    
    var labels = trending.map(function(item) {
      return item.date;
    });
    
    var healthScores = trending.map(function(item) {
      return item.avg_health_score;
    });
    
    var issuesCounts = trending.map(function(item) {
      return item.total_issues;
    });
    
    trendingChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [
          {
            label: c.data.i18n.avgHealthScore,
            data: healthScores,
            borderColor: '#0c63d4',
            backgroundColor: 'rgba(12, 99, 212, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            yAxisID: 'y-health'
          },
          {
            label: c.data.i18n.totalIssues,
            data: issuesCounts,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220, 38, 38, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
            yAxisID: 'y-issues'
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: {
          mode: 'index',
          intersect: false
        },
        plugins: {
          legend: {
            position: 'top',
            labels: {
              padding: 15,
              font: {
                size: 12
              },
              usePointStyle: true,
              pointStyle: 'circle'
            }
          },
          tooltip: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            padding: 12,
            titleFont: {
              size: 13
            },
            bodyFont: {
              size: 12
            }
          }
        },
        scales: {
          x: {
            grid: {
              display: false
            },
            ticks: {
              maxRotation: 45,
              minRotation: 45,
              font: {
                size: 10
              }
            }
          },
          'y-health': {
            type: 'linear',
            position: 'left',
            min: 0,
            max: 100,
            grid: {
              color: 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              callback: function(value) {
                return value + '%';
              },
              font: {
                size: 11
              }
            },
            title: {
              display: true,
              text: c.data.i18n.healthScore,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          },
          'y-issues': {
            type: 'linear',
            position: 'right',
            min: 0,
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 11
              }
            },
            title: {
              display: true,
              text: c.data.i18n.issues,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        }
      }
    });
  };
  
  /**
   * Cleanup on destroy
   */
  c.$onDestroy = function() {
    if (healthDistributionChart) {
      healthDistributionChart.destroy();
    }
    if (trendingChart) {
      trendingChart.destroy();
    }
  };
}
