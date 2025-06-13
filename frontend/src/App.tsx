import React from 'react';
import Dashboard from './components/Dashboard.tsx';
import { MLPredictions } from './components/MLPredictions.tsx';
import PerformanceMonitor from './components/PerformanceMonitor.tsx';
import WebSocketSecurityDashboard from './components/WebSocketSecurityDashboard.tsx';

// Import key money-making components
import { UltimateMoneyMaker } from './components/betting/UltimateMoneyMaker.tsx';
import MoneyMakerAdvanced from './components/MoneyMaker/MoneyMakerAdvanced.tsx';
import UltimateMoneyMakerEnhanced from './components/UltimateMoneyMakerEnhanced.tsx';

const App: React.FC = () => {
  // Simple routing based on URL hash for now
  const currentPath = window.location.hash.slice(1) || '/';

  const renderComponent = () => {
    switch (currentPath) {
      case '/money-maker':
        return <UltimateMoneyMaker />;
      case '/money-maker-advanced':
        return <MoneyMakerAdvanced />;
      case '/money-maker-enhanced':
        return <UltimateMoneyMakerEnhanced />;
      case '/ml-predictions':
        return <MLPredictions />;
      case '/security':
        return <WebSocketSecurityDashboard />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      {/* Navigation */}
      <nav className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex space-x-8">
              <a href="#/" className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-900 dark:text-gray-100">
                Dashboard
              </a>
              <a href="#/money-maker" className="inline-flex items-center px-3 py-2 text-sm font-medium text-blue-600 hover:text-blue-800">
                💰 Money Maker
              </a>
              <a href="#/money-maker-advanced" className="inline-flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800">
                🚀 Advanced
              </a>
              <a href="#/money-maker-enhanced" className="inline-flex items-center px-3 py-2 text-sm font-medium text-purple-600 hover:text-purple-800">
                ⚡ ENHANCED (Kelly + Arbitrage)
              </a>
              <a href="#/ml-predictions" className="inline-flex items-center px-3 py-2 text-sm font-medium text-indigo-600 hover:text-indigo-800">
                🧠 ML Predictions
              </a>
              <a href="#/security" className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 hover:text-red-800">
                🔒 Security
              </a>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {renderComponent()}
      </main>

      {/* Development Performance Monitor */}
      {typeof window !== 'undefined' && process.env.NODE_ENV === 'development' && (
        <PerformanceMonitor />
      )}
    </div>
  );
};

export default App;
