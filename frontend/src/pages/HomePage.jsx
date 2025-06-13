import React from 'react';

const HomePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Sports Betting Intelligence Platform</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="modern-card p-6">
          <h2 className="text-xl font-semibold mb-4">Live Predictions</h2>
          <p className="text-gray-600 dark:text-gray-300">View real-time betting predictions and analysis.</p>
        </div>
        <div className="modern-card p-6">
          <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
          <p className="text-gray-600 dark:text-gray-300">Track prediction accuracy and model performance.</p>
        </div>
        <div className="modern-card p-6">
          <h2 className="text-xl font-semibold mb-4">Risk Analysis</h2>
          <p className="text-gray-600 dark:text-gray-300">Analyze risk profiles and betting strategies.</p>
        </div>
      </div>
    </div>
  );
};

export default HomePage; 