// BetSimulationTool.tsx
// Interactive tool for simulating user bets

import React, { useState } from 'react';
import { useSimulationStore } from '../../store/slices/simulationSlice';
import { confidenceService } from '../../services/analytics/confidenceService';
import { MLSimulationService } from '../../services/MLSimulationService';

export const BetSimulationTool: React.FC = () => {
  const [stake, setStake] = useState(100);
  const [odds, setOdds] = useState(2.0);
  const [eventId, setEventId] = useState('LAL-BOS-2024-03-15');
  const [player, setPlayer] = useState('LBJ');
  const [market, setMarket] = useState('pointsPerGame');

  const setInput = useSimulationStore((s) => s.setInput);
  const result = useSimulationStore((s) => s.result);
  const setResult = useSimulationStore((s) => s.setResult);
  const clear = useSimulationStore((s) => s.clear);

  const handleSimulate = () => {
    const prediction = confidenceService.getPredictionWithConfidence(eventId, player, market);
    const simInput = {
      stake,
      odds,
      confidenceBand: prediction.confidenceBand,
      winProbability: prediction.winProbability,
    };
    setInput(simInput);
    const simResult = MLSimulationService.prototype.simulateBet(simInput);
    setResult(simResult);
  };

  return (
    <section className="w-full p-4 bg-white shadow rounded mb-4">
      <h3 className="text-md font-bold mb-2">Bet Simulation Tool</h3>
      <div className="flex flex-wrap gap-4 items-end">
        <div>
          <label className="block text-xs mb-1">Stake ($)</label>
          <input type="number" className="border rounded px-2 py-1 w-20" value={stake} onChange={e => setStake(Number(e.target.value))} />
        </div>
        <div>
          <label className="block text-xs mb-1">Odds</label>
          <input type="number" className="border rounded px-2 py-1 w-20" value={odds} onChange={e => setOdds(Number(e.target.value))} step="0.01" />
        </div>
        <div>
          <label className="block text-xs mb-1">Event ID</label>
          <input type="text" className="border rounded px-2 py-1 w-32" value={eventId} onChange={e => setEventId(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs mb-1">Player</label>
          <input type="text" className="border rounded px-2 py-1 w-24" value={player} onChange={e => setPlayer(e.target.value)} />
        </div>
        <div>
          <label className="block text-xs mb-1">Market</label>
          <input type="text" className="border rounded px-2 py-1 w-24" value={market} onChange={e => setMarket(e.target.value)} />
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded ml-2" onClick={handleSimulate}>Simulate</button>
        <button className="bg-gray-400 text-white px-3 py-2 rounded ml-2" onClick={clear}>Clear</button>
      </div>
      {result && (
        <div className="mt-4 text-sm">
          <div>Expected Return: <b>${result.expectedReturn.toFixed(2)}</b></div>
          <div>Variance: <b>{result.variance.toFixed(2)}</b></div>
          <div>Payout: <b>${result.payout.toFixed(2)}</b></div>
          <div>Break-even Stake: <b>${result.breakEvenStake.toFixed(2)}</b></div>
          <div>Win Probability: <b>{(result.winProbability * 100).toFixed(2)}%</b></div>
          <div>Loss Probability: <b>{(result.lossProbability * 100).toFixed(2)}%</b></div>
        </div>
      )}
    </section>
  );
};
