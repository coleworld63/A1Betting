import React from 'react';
import { UnifiedBettingInterface } from '../components/betting/UnifiedBettingInterface';
import { LiveOddsTicker } from '../components/betting/LiveOddsTicker';
import { RiskProfileSelector } from '../components/betting/RiskProfileSelector';
import { StakeSizingControl } from '../components/betting/StakeSizingControl';
import { ErrorBoundary } from '../components/common/ErrorBoundary';
import { LoadingSkeleton } from '../components/common/LoadingSkeleton';
import { ToastProvider } from '../components/common/ToastProvider';
import BetsTable from '../components/betting/BetsTable.tsx';
import BetSlip from '../components/betting/BetSlip.tsx';
import BetHistoryChart from '../components/betting/BetHistoryChart.tsx';
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

const BetsPage: React.FC = () => {
  // Example state hooks for risk profile, stake, and event selection
  const [riskProfile, setRiskProfile] = React.useState<'conservative' | 'moderate' | 'aggressive'>('moderate');
  const [stake, setStake] = React.useState(100);
  const [selectedEvent, setSelectedEvent] = React.useState<any>(null);
  const [events, setEvents] = React.useState<any[]>([]); // Replace with real events from API/service
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Placeholder: fetch events (replace with real fetch/service logic)
  React.useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setEvents([]); // Replace with real event list
      setLoading(false);
    }, 500);
  }, []);

  return (
    <ToastProvider>
      <ErrorBoundary>
        <div className="p-4 md:p-6 lg:p-8 bg-gradient-to-br from-green-900/80 to-green-700/80 min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800 transition-colors">
          <React.Suspense fallback={<LoadingSkeleton />}>
            <section className="glass-card rounded-2xl shadow-xl p-6 mb-8 animate-fade-in animate-scale-in">
              <h2 className="text-2xl font-bold text-green-100 mb-4">Betting Interface</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <RiskProfileSelector currentProfile={riskProfile} onProfileChange={setRiskProfile} />
                  <StakeSizingControl onStakeChange={setStake} defaultStake={stake} />
                  <LiveOddsTicker events={events} onEventSelect={setSelectedEvent} loading={loading} error={error ? { message: error } : null} />
                </div>
                <div className="space-y-4">
                  <UnifiedBettingInterface initialBankroll={1000} onBetPlaced={() => {}} darkMode={true} />
                  <BetsTable />
                  <BetSlip />
                  <BetHistoryChart />
                  {/* Alpha1 Advanced Widgets */}
                  <React.Suspense fallback={<LoadingSpinner />}>
                    <div className="mt-4">
                      <ConfidenceBands lower={40} upper={72} mean={56} />
                      <span className="tooltip">Model confidence interval (hover for details)</span>
                    </div>
                    <div className="mt-4">
                      <RiskHeatMap riskScores={[0.3, 0.7, 0.9]} />
                      <span className="tooltip">Risk heat map (hover for details)</span>
                    </div>
                    <div className="mt-4">
                      <SourceHealthBar sources={[
                        { name: 'Sportradar', healthy: true },
                        { name: 'Weather', healthy: true },
                        { name: 'Injury', healthy: true },
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
      </ErrorBoundary>
    </ToastProvider>
  );
};

export default BetsPage;
