import React from 'react';

import ShapExplanation from '../components/analytics/ShapExplanation.tsx';
import PredictionConfidenceGraph from '../components/analytics/PredictionConfidenceGraph.tsx';
import RiskAssessmentMatrix from '../components/analytics/RiskAssessmentMatrix.tsx';
import ModelComparisonChart from '../components/analytics/ModelComparisonChart.tsx';
import TrendAnalysisChart from '../components/analytics/TrendAnalysisChart.tsx';
import { GlobalErrorBoundary } from '../components/common/ErrorBoundary.tsx';
import { LoadingSpinner } from '../components/shared/ui/LoadingSpinner.tsx';
import ToastContainer from '../components/shared/feedback/Toast.tsx';
// Alpha1 Advanced Widgets
import ConfidenceBands from '../components/ui/ConfidenceBands.tsx';
import RiskHeatMap from '../components/ui/RiskHeatMap.tsx';
import SourceHealthBar from '../components/ui/SourceHealthBar.tsx';
import WhatIfSimulator from '../components/advanced/WhatIfSimulator.tsx';
// Personalization overlay
import { userPersonalizationService } from '../services/analytics/userPersonalizationService.ts';
// TODO: Add tests for new widgets

const AnalyticsPage: React.FC = () => {
  return (
    <ToastContainer>
      <GlobalErrorBoundary>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-blue-900/80 to-blue-700/80 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors">
          <React.Suspense fallback={<LoadingSpinner />}>
            <section className="glass-card rounded-2xl shadow-xl p-6 mb-8 animate-fade-in animate-scale-in">
              <h2 className="text-2xl font-bold text-blue-100 mb-4">Analytics Dashboard</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="space-y-6">
                  <PredictionConfidenceGraph />
                  <RiskAssessmentMatrix />
                  <ModelComparisonChart />
                  <TrendAnalysisChart />
                  <ShapExplanation eventId={''} />
                  {/* Alpha1 Advanced Widgets */}
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <div className="mt-4">
                      <ConfidenceBands lower={42} upper={68} mean={55} />
                      <span className="tooltip">Model confidence interval (hover for details)</span>
                    </div>
                    <div className="mt-4">
                      <RiskHeatMap riskScores={[0.2, 0.6, 0.7]} />
                      <span className="tooltip">Risk heat map (hover for details)</span>
                    </div>
                    <div className="mt-4">
                      <SourceHealthBar sources={[
                        { name: 'Sportradar', healthy: true },
                        { name: 'Weather', healthy: true },
                        { name: 'Injury', healthy: false },
                      ]} />
                      <span className="tooltip">Source health status (hover for details)</span>
                    </div>
                    <div className="mt-4">
                      <WhatIfSimulator />
                      <span className="tooltip">What-if scenario simulator (hover for details)</span>
                    </div>
                  </React.Suspense>
                  {/* Personalization overlay example */}
                  <div className="mt-4">
                    {/* TODO: Personalization overlays from userPersonalizationService */}
                    {/* {userPersonalizationService.getOverlay()} */}
                  </div>
                </div>
              </div>
            </section>
          </React.Suspense>
        </div>
      </GlobalErrorBoundary>
    </ToastContainer>
  );
};

export default AnalyticsPage;
