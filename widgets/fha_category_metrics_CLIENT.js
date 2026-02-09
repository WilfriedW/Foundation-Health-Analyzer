// ===================================================
// FHA Category Metrics Widget - Client Script
// ===================================================

function FHACategoryMetricsController($scope, $timeout) {
  var c = this;
  
  // Initialize
  c.data.loading = true;
  c.data.refreshing = false;
  c.data.chartType = 'bar'; // 'bar' or 'pie'
  c.data.selectedCategory = null;
  
  // Chart instance
  var categoryChart = null;
  
  /**
   * Initialize widget
   */
  c.$onInit = function() {
    // Convert categories object to array
    c.data.categoriesArray = c.convertCategoriesToArray(c.data.categories);
    
    // Calculate total issues for percentage
    c.data.totalIssues = c.data.categoriesArray.reduce(function(sum, cat) {
      return sum + cat.total_issues;
    }, 0);
    
    // Sort by total issues (descending)
    c.data.categoriesArray.sort(function(a, b) {
      return b.total_issues - a.total_issues;
    });
    
    // Render chart
    $timeout(function() {
      c.renderChart();
    }, 100);
    
    c.data.loading = false;
  };
  
  /**
   * Convert categories object to array
   */
  c.convertCategoriesToArray = function(categoriesObj) {
    var array = [];
    for (var key in categoriesObj) {
      if (categoriesObj.hasOwnProperty(key)) {
        array.push(categoriesObj[key]);
      }
    }
    return array;
  };
  
  /**
   * Refresh data
   */
  c.refreshData = function() {
    c.data.refreshing = true;
    c.server.get().then(function(response) {
      if (response.data.success) {
        c.data.categories = response.data.categories;
        c.data.categoriesArray = c.convertCategoriesToArray(c.data.categories);
        
        // Recalculate total
        c.data.totalIssues = c.data.categoriesArray.reduce(function(sum, cat) {
          return sum + cat.total_issues;
        }, 0);
        
        // Sort
        c.data.categoriesArray.sort(function(a, b) {
          return b.total_issues - a.total_issues;
        });
        
        // Re-render chart
        $timeout(function() {
          c.renderChart();
        }, 100);
      } else {
        c.data.error = response.data.error || 'Error refreshing data';
      }
    }).catch(function(error) {
      c.data.error = 'Error refreshing data: ' + (error.message || 'Unknown error');
    }).finally(function() {
      c.data.refreshing = false;
    });
  };
  
  /**
   * Select a category
   */
  c.selectCategory = function(category) {
    if (c.data.selectedCategory === category.name) {
      c.data.selectedCategory = null;
    } else {
      c.data.selectedCategory = category.name;
    }
  };
  
  /**
   * Calculate percentage of total issues
   */
  c.calculatePercentage = function(issues) {
    if (c.data.totalIssues === 0) return 0;
    return Math.round((issues / c.data.totalIssues) * 100);
  };
  
  /**
   * Get category color
   */
  c.getCategoryColor = function(categoryName) {
    var colors = {
      automation: '#0c63d4',
      security: '#dc2626',
      integration: '#7c3aed',
      performance: '#f59e0b',
      data_quality: '#10b981',
      configuration: '#6366f1',
      compliance: '#ec4899',
      general: '#6b7280'
    };
    return colors[categoryName] || '#6b7280';
  };
  
  /**
   * Get category icon
   */
  c.getCategoryIcon = function(categoryName) {
    var icons = {
      automation: 'fa-cogs',
      security: 'fa-shield',
      integration: 'fa-plug',
      performance: 'fa-tachometer',
      data_quality: 'fa-database',
      configuration: 'fa-sliders',
      compliance: 'fa-gavel',
      general: 'fa-cubes'
    };
    return icons[categoryName] || 'fa-cubes';
  };
  
  /**
   * Get category label
   */
  c.getCategoryLabel = function(categoryName) {
    var labels = {
      automation: c.data.i18n.automation || 'Automation',
      security: c.data.i18n.security || 'Security',
      integration: c.data.i18n.integration || 'Integration',
      performance: c.data.i18n.performance || 'Performance',
      data_quality: c.data.i18n.dataQuality || 'Data Quality',
      configuration: c.data.i18n.configuration || 'Configuration',
      compliance: c.data.i18n.compliance || 'Compliance',
      general: c.data.i18n.general || 'General'
    };
    return labels[categoryName] || categoryName;
  };
  
  /**
   * Change chart type
   */
  c.changeChartType = function(type) {
    if (c.data.chartType === type) return;
    c.data.chartType = type;
    $timeout(function() {
      c.renderChart();
    }, 50);
  };
  
  /**
   * Render chart
   */
  c.renderChart = function() {
    var canvasId = 'category-chart-' + c.widget.options.id;
    var canvas = document.getElementById(canvasId);
    
    if (!canvas) {
      console.error('Canvas not found: ' + canvasId);
      return;
    }
    
    var ctx = canvas.getContext('2d');
    
    // Destroy existing chart
    if (categoryChart) {
      categoryChart.destroy();
    }
    
    var labels = c.data.categoriesArray.map(function(cat) {
      return c.getCategoryLabel(cat.name);
    });
    
    var dataValues = c.data.categoriesArray.map(function(cat) {
      return cat.total_issues;
    });
    
    var backgroundColors = c.data.categoriesArray.map(function(cat) {
      return c.getCategoryColor(cat.name);
    });
    
    if (c.data.chartType === 'bar') {
      categoryChart = new Chart(ctx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: c.data.i18n.totalIssues,
            data: dataValues,
            backgroundColor: backgroundColors,
            borderWidth: 0
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
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
                font: {
                  size: 11
                }
              }
            },
            y: {
              beginAtZero: true,
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              },
              ticks: {
                font: {
                  size: 11
                }
              }
            }
          }
        }
      });
    } else { // pie chart
      categoryChart = new Chart(ctx, {
        type: 'pie',
        data: {
          labels: labels,
          datasets: [{
            data: dataValues,
            backgroundColor: backgroundColors,
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: {
                size: 13
              },
              bodyFont: {
                size: 12
              },
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
          }
        }
      });
    }
  };
  
  /**
   * Cleanup on destroy
   */
  c.$onDestroy = function() {
    if (categoryChart) {
      categoryChart.destroy();
    }
  };
}
