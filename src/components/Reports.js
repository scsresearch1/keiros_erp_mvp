import React, { useState, useEffect } from 'react';
import './Reports.css';

const Reports = ({ currentUser }) => {
  const [activeReport, setActiveReport] = useState('performance');
  const [dateRange, setDateRange] = useState('week');
  const [reportData, setReportData] = useState({});

  // Initialize mock report data
  useEffect(() => {
    const mockData = {
      performance: {
        totalDeliveries: 1247,
        onTimeRate: 94.2,
        fuelEfficiency: 8.5,
        avgDeliveryTime: '2.3 hours',
        customerSatisfaction: 4.8,
        totalRevenue: '$45,230',
        costPerDelivery: '$18.50',
        profitMargin: 23.5
      },
      drivers: {
        totalDrivers: 12,
        activeDrivers: 10,
        avgComplianceScore: 91.5,
        topDriver: 'Mike Driver',
        topDriverScore: 98.2,
        safetyIncidents: 2,
        trainingCompleted: 85,
        avgExperience: '3.2 years'
      },
      packages: {
        totalPackages: 892,
        delivered: 847,
        inTransit: 32,
        returned: 13,
        returnRate: 1.5,
        avgPackageValue: '$156',
        fragilePackages: 89,
        expressDeliveries: 234
      },
      compliance: {
        totalInspections: 156,
        compliant: 142,
        warnings: 11,
        violations: 3,
        complianceRate: 91.0,
        geofenceViolations: 8,
        speedViolations: 15,
        routeDeviations: 12
      }
    };

    setReportData(mockData);
  }, []);

  const generateReport = (reportType) => {
    // Mock report generation
    console.log(`Generating ${reportType} report for date range: ${dateRange}`);
    // In a real app, this would call an API to generate the report
  };

  const downloadReport = (reportType) => {
    // Mock download functionality
    console.log(`Downloading ${reportType} report`);
    // In a real app, this would generate and download a PDF/Excel file
  };

  const renderPerformanceReport = () => (
    <div className="report-content">
      <div className="report-header">
        <h3>📊 Fleet Performance Report</h3>
        <p>Comprehensive overview of fleet operations and efficiency metrics</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.performance?.totalDeliveries?.toLocaleString()}</div>
            <div className="metric-label">Total Deliveries</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">⏰</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.performance?.onTimeRate}%</div>
            <div className="metric-label">On-Time Rate</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">⛽</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.performance?.fuelEfficiency} mpg</div>
            <div className="metric-label">Fuel Efficiency</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">💰</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.performance?.totalRevenue}</div>
            <div className="metric-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="detail-section">
          <h4>📈 Key Performance Indicators</h4>
          <div className="kpi-grid">
            <div className="kpi-item">
              <span className="kpi-label">Average Delivery Time:</span>
              <span className="kpi-value">{reportData.performance?.avgDeliveryTime}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Customer Satisfaction:</span>
              <span className="kpi-value">{reportData.performance?.customerSatisfaction}/5</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Cost per Delivery:</span>
              <span className="kpi-value">{reportData.performance?.costPerDelivery}</span>
            </div>
            <div className="kpi-item">
              <span className="kpi-label">Profit Margin:</span>
              <span className="kpi-value">{reportData.performance?.profitMargin}%</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button 
          className="action-btn primary"
          onClick={() => generateReport('performance')}
        >
          🔄 Refresh Data
        </button>
        <button 
          className="action-btn success"
          onClick={() => downloadReport('performance')}
        >
          📥 Download Report
        </button>
      </div>
    </div>
  );

  const renderDriverReport = () => (
    <div className="report-content">
      <div className="report-header">
        <h3>👥 Driver Performance Report</h3>
        <p>Driver statistics, compliance scores, and safety metrics</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">👤</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.drivers?.totalDrivers}</div>
            <div className="metric-label">Total Drivers</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.drivers?.avgComplianceScore}%</div>
            <div className="metric-label">Avg Compliance</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">🏆</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.drivers?.topDriverScore}%</div>
            <div className="metric-label">Top Driver Score</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">🚨</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.drivers?.safetyIncidents}</div>
            <div className="metric-label">Safety Incidents</div>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="detail-section">
          <h4>🚗 Driver Highlights</h4>
          <div className="highlight-grid">
            <div className="highlight-item">
              <span className="highlight-label">Top Performer:</span>
              <span className="highlight-value">{reportData.drivers?.topDriver}</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-label">Training Completed:</span>
              <span className="highlight-value">{reportData.drivers?.trainingCompleted}%</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-label">Average Experience:</span>
              <span className="highlight-value">{reportData.drivers?.avgExperience}</span>
            </div>
            <div className="highlight-item">
              <span className="highlight-label">Active Drivers:</span>
              <span className="highlight-value">{reportData.drivers?.activeDrivers}/{reportData.drivers?.totalDrivers}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button 
          className="action-btn primary"
          onClick={() => generateReport('drivers')}
        >
          🔄 Refresh Data
        </button>
        <button 
          className="action-btn success"
          onClick={() => downloadReport('drivers')}
        >
          📥 Download Report
        </button>
      </div>
    </div>
  );

  const renderPackageReport = () => (
    <div className="report-content">
      <div className="report-header">
        <h3>📦 Package Analytics Report</h3>
        <p>Package delivery statistics, return rates, and value analysis</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">📦</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.packages?.totalPackages?.toLocaleString()}</div>
            <div className="metric-label">Total Packages</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.packages?.delivered?.toLocaleString()}</div>
            <div className="metric-label">Delivered</div>
          </div>
        </div>
        
        <div className="metric-card info">
          <div className="metric-icon">🚚</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.packages?.inTransit}</div>
            <div className="metric-label">In Transit</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">📤</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.packages?.returnRate}%</div>
            <div className="metric-label">Return Rate</div>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="detail-section">
          <h4>📊 Package Insights</h4>
          <div className="insights-grid">
            <div className="insight-item">
              <span className="insight-label">Average Package Value:</span>
              <span className="insight-value">{reportData.packages?.avgPackageValue}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Fragile Packages:</span>
              <span className="insight-value">{reportData.packages?.fragilePackages}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Express Deliveries:</span>
              <span className="insight-value">{reportData.packages?.expressDeliveries}</span>
            </div>
            <div className="insight-item">
              <span className="insight-label">Returns:</span>
              <span className="insight-value">{reportData.packages?.returned}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button 
          className="action-btn primary"
          onClick={() => generateReport('packages')}
        >
          🔄 Refresh Data
        </button>
        <button 
          className="action-btn success"
          onClick={() => downloadReport('packages')}
        >
          📥 Download Report
        </button>
      </div>
    </div>
  );

  const renderComplianceReport = () => (
    <div className="report-content">
      <div className="report-header">
        <h3>🔒 Compliance & Safety Report</h3>
        <p>Regulatory compliance, safety metrics, and violation tracking</p>
      </div>
      
      <div className="metrics-grid">
        <div className="metric-card primary">
          <div className="metric-icon">🔍</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.compliance?.totalInspections}</div>
            <div className="metric-label">Total Inspections</div>
          </div>
        </div>
        
        <div className="metric-card success">
          <div className="metric-icon">✅</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.compliance?.complianceRate}%</div>
            <div className="metric-label">Compliance Rate</div>
          </div>
        </div>
        
        <div className="metric-card warning">
          <div className="metric-icon">⚠️</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.compliance?.warnings}</div>
            <div className="metric-label">Warnings</div>
          </div>
        </div>
        
        <div className="metric-card danger">
          <div className="metric-icon">❌</div>
          <div className="metric-content">
            <div className="metric-value">{reportData.compliance?.violations}</div>
            <div className="metric-label">Violations</div>
          </div>
        </div>
      </div>

      <div className="report-details">
        <div className="detail-section">
          <h4>🚨 Violation Breakdown</h4>
          <div className="violation-grid">
            <div className="violation-item">
              <span className="violation-label">Geofence Violations:</span>
              <span className="violation-value">{reportData.compliance?.geofenceViolations}</span>
            </div>
            <div className="violation-item">
              <span className="violation-label">Speed Violations:</span>
              <span className="violation-value">{reportData.compliance?.speedViolations}</span>
            </div>
            <div className="violation-item">
              <span className="violation-label">Route Deviations:</span>
              <span className="violation-value">{reportData.compliance?.routeDeviations}</span>
            </div>
            <div className="violation-item">
              <span className="violation-label">Compliant Inspections:</span>
              <span className="violation-value compliant">{reportData.compliance?.compliant}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="report-actions">
        <button 
          className="action-btn primary"
          onClick={() => generateReport('compliance')}
        >
          🔄 Refresh Data
        </button>
        <button 
          className="action-btn success"
          onClick={() => downloadReport('compliance')}
        >
          📥 Download Report
        </button>
      </div>
    </div>
  );

  const renderReportContent = () => {
    switch (activeReport) {
      case 'performance':
        return renderPerformanceReport();
      case 'drivers':
        return renderDriverReport();
      case 'packages':
        return renderPackageReport();
      case 'compliance':
        return renderComplianceReport();
      default:
        return renderPerformanceReport();
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h1>📊 Fleet Reports & Analytics</h1>
        <p>Comprehensive reporting and analytics for fleet management</p>
      </div>

      <div className="reports-controls">
        <div className="report-tabs">
          <button 
            className={`report-tab ${activeReport === 'performance' ? 'active' : ''}`}
            onClick={() => setActiveReport('performance')}
          >
            📊 Performance
          </button>
          <button 
            className={`report-tab ${activeReport === 'drivers' ? 'active' : ''}`}
            onClick={() => setActiveReport('drivers')}
          >
            👥 Drivers
          </button>
          <button 
            className={`report-tab ${activeReport === 'packages' ? 'active' : ''}`}
            onClick={() => setActiveReport('packages')}
          >
            📦 Packages
          </button>
          <button 
            className={`report-tab ${activeReport === 'compliance' ? 'active' : ''}`}
            onClick={() => setActiveReport('compliance')}
          >
            🔒 Compliance
          </button>
        </div>

        <div className="date-controls">
          <select 
            className="date-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="week">Last Week</option>
            <option value="month">Last Month</option>
            <option value="quarter">Last Quarter</option>
            <option value="year">Last Year</option>
          </select>
        </div>
      </div>

      <div className="reports-content">
        {renderReportContent()}
      </div>
    </div>
  );
};

export default Reports;
