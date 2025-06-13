import React, { useState, useEffect } from 'react';
// import { WebSocketSecurityAlerts, SecurityAlert } from '../services/WebSocketSecurityAlerts';
// import { WebSocketSecurityLogger } from '../services/WebSocketSecurityLogger';
// NOTE: This component is currently disabled due to missing WebSocketSecurityAlerts and WebSocketSecurityLogger dependencies.
import { EventBus } from '../unified/EventBus';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = {
  critical: '#dc3545',
  high: '#fd7e14',
  medium: '#ffc107',
  low: '#20c997',
};

const WebSocketSecurityDashboard: React.FC = () => {
  // const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  // const [alertStats, setAlertStats] =
  //   useState<ReturnType<typeof WebSocketSecurityAlerts.prototype.getAlertStats>>();
  // const [logStats, setLogStats] =
  //   useState<ReturnType<typeof WebSocketSecurityLogger.prototype.getLogStats>>();
  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '24h' | '7d'>('24h');

  // const alertsService = WebSocketSecurityAlerts.getInstance();
  // const logger = WebSocketSecurityLogger.getInstance();
  const eventBus = EventBus.getInstance();

  useEffect(() => {
    const updateData = () => {
      const now = Date.now();
      const timeRanges = {
        '1h': now - 3600000,
        '24h': now - 86400000,
        '7d': now - 604800000,
      };

      setAlerts(
        alertsService.getAlerts({
          startTime: timeRanges[selectedTimeRange],
        })
      );
      setAlertStats(alertsService.getAlertStats());
      setLogStats(logger.getLogStats());
    };

    updateData();
    const interval = setInterval(updateData, 5000);

    const handleAlert = () => updateData();
    eventBus.on('websocket:security:alert', handleAlert);

    return () => {
      clearInterval(interval);
      eventBus.off('websocket:security:alert', handleAlert);
    };
  }, [selectedTimeRange]);

  const handleAcknowledge = (alertId: string) => {
    alertsService.acknowledgeAlert(alertId, 'current-user');
    setAlerts(alertsService.getAlerts());
    setAlertStats(alertsService.getAlertStats());
  };

  const renderAlertList = () => (
    <div className="alert-list">
      <h3>Recent Alerts</h3>
      {alerts.map(alert => (
        <div
          key={alert.id}
          className={`alert-item ${alert.severity} ${alert.acknowledged ? 'acknowledged' : ''}`}
        >
          <div className="alert-header">
            <span className="alert-type">{alert.type}</span>
            <span className="alert-severity">{alert.severity}</span>
            <span className="alert-time">{new Date(alert.timestamp).toLocaleString()}</span>
          </div>
          <div className="alert-message">{alert.message}</div>
          {alert.details && (
            <div className="alert-details">
              <pre>{JSON.stringify(alert.details, null, 2)}</pre>
            </div>
          )}
          {!alert.acknowledged && (
            <button className="acknowledge-button" onClick={() => handleAcknowledge(alert.id)}>
              Acknowledge
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderAlertStats = () => {
    if (!alertStats) return null;

    const severityData = Object.entries(alertStats.bySeverity).map(([severity, count]) => ({
      name: severity,
      value: count,
    }));

    const typeData = Object.entries(alertStats.byType).map(([type, count]) => ({
      name: type,
      value: count,
    }));

    return (
      <div className="stats-container">
        <div className="stats-card">
          <h4>Alert Statistics</h4>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-label">Total Alerts</span>
              <span className="stat-value">{alertStats.total}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Acknowledged</span>
              <span className="stat-value">{alertStats.acknowledged}</span>
            </div>
            <div className="stat-item">
              <span className="stat-label">Unacknowledged</span>
              <span className="stat-value">{alertStats.unacknowledged}</span>
            </div>
          </div>
        </div>

        <div className="charts-container">
          <div className="chart-card">
            <h4>Alerts by Severity</h4>
            <ResponsiveContainer height={200} width="100%">
              <PieChart>
                <Pie
                  label
                  cx="50%"
                  cy="50%"
                  data={severityData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="chart-card">
            <h4>Alerts by Type</h4>
            <ResponsiveContainer height={200} width="100%">
              <PieChart>
                <Pie
                  label
                  cx="50%"
                  cy="50%"
                  data={typeData}
                  dataKey="value"
                  nameKey="name"
                  outerRadius={80}
                >
                  {typeData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={`hsl(${(index * 360) / typeData.length}, 70%, 50%)`}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    );
  };

  const renderLogStats = () => {
    if (!logStats) return null;

    return (
      <div className="log-stats">
        <h3>Log Statistics</h3>
        <div className="stats-grid">
          <div className="stat-item">
            <span className="stat-label">Total Logs</span>
            <span className="stat-value">{logStats.totalLogs}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Errors</span>
            <span className="stat-value">{logStats.errorCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Warnings</span>
            <span className="stat-value">{logStats.warningCount}</span>
          </div>
          <div className="stat-item">
            <span className="stat-label">Info</span>
            <span className="stat-value">{logStats.infoCount}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="security-dashboard">
      <div className="dashboard-header">
        <h2>WebSocket Security Dashboard</h2>
        <div className="time-range-selector">
          <button
            className={selectedTimeRange === '1h' ? 'active' : ''}
            onClick={() => setSelectedTimeRange('1h')}
          >
            1 Hour
          </button>
          <button
            className={selectedTimeRange === '24h' ? 'active' : ''}
            onClick={() => setSelectedTimeRange('24h')}
          >
            24 Hours
          </button>
          <button
            className={selectedTimeRange === '7d' ? 'active' : ''}
            onClick={() => setSelectedTimeRange('7d')}
          >
            7 Days
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <div className="dashboard-main">
          {renderAlertList()}
          {renderAlertStats()}
        </div>
        <div className="dashboard-sidebar">{renderLogStats()}</div>
      </div>

      <style jsx>{`
        .security-dashboard {
          padding: 20px;
          background: #f8f9fa;
          min-height: 100vh;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 20px;
        }

        .time-range-selector {
          display: flex;
          gap: 10px;
        }

        .time-range-selector button {
          padding: 8px 16px;
          border: 1px solid #dee2e6;
          background: white;
          border-radius: 4px;
          cursor: pointer;
        }

        .time-range-selector button.active {
          background: #007bff;
          color: white;
          border-color: #007bff;
        }

        .dashboard-content {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }

        .alert-list {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .alert-item {
          border: 1px solid #dee2e6;
          border-radius: 4px;
          padding: 15px;
          margin-bottom: 10px;
        }

        .alert-item.critical {
          border-left: 4px solid ${COLORS.critical};
        }

        .alert-item.high {
          border-left: 4px solid ${COLORS.high};
        }

        .alert-item.medium {
          border-left: 4px solid ${COLORS.medium};
        }

        .alert-item.low {
          border-left: 4px solid ${COLORS.low};
        }

        .alert-item.acknowledged {
          opacity: 0.7;
        }

        .alert-header {
          display: flex;
          gap: 10px;
          margin-bottom: 10px;
        }

        .alert-type {
          font-weight: bold;
          text-transform: uppercase;
        }

        .alert-severity {
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 0.8em;
        }

        .alert-time {
          color: #6c757d;
          font-size: 0.9em;
        }

        .alert-details {
          margin-top: 10px;
          background: #f8f9fa;
          padding: 10px;
          border-radius: 4px;
        }

        .alert-details pre {
          margin: 0;
          white-space: pre-wrap;
        }

        .acknowledge-button {
          margin-top: 10px;
          padding: 5px 10px;
          background: #28a745;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .stats-container {
          margin-top: 20px;
        }

        .stats-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 15px;
          margin-top: 15px;
        }

        .stat-item {
          text-align: center;
        }

        .stat-label {
          display: block;
          color: #6c757d;
          font-size: 0.9em;
        }

        .stat-value {
          display: block;
          font-size: 1.5em;
          font-weight: bold;
          margin-top: 5px;
        }

        .charts-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
          margin-top: 20px;
        }

        .chart-card {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .dashboard-sidebar {
          background: white;
          border-radius: 8px;
          padding: 20px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .log-stats {
          margin-top: 20px;
        }
      `}</style>
    </div>
  );
};

export default React.memo(WebSocketSecurityDashboard);
