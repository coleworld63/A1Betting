import React from 'react';
import GlassCard from './GlassCard';
import GlowButton from './GlowButton';

export interface EnhancedPropCardProps {
  playerName: string;
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  sentiment?: string;
  aiBoost?: number;
  patternStrength?: number;
  bonusPercent?: number;
  enhancementPercent?: number;
  onSelect?: (pick: 'over' | 'under') => void;
  onViewDetails?: () => void;
  selected?: boolean;
  className?: string;
}

const badge = (label: string, value: string | number, color: string) => (
  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${color} bg-opacity-10`}>
    {label}: {value}
  </span>
);

export const EnhancedPropCard: React.FC<EnhancedPropCardProps> = ({
  playerName,
  statType,
  line,
  overOdds,
  underOdds,
  sentiment,
  aiBoost,
  patternStrength,
  bonusPercent,
  enhancementPercent,
  onSelect,
  onViewDetails,
  selected = false,
  className = '',
}) => (
  <GlassCard className={`relative p-6 flex flex-col space-y-3 transition-all ${selected ? 'ring-4 ring-primary-500' : ''} ${className}`}>
    <div className="flex items-center justify-between">
      <div className="font-bold text-lg text-primary-600">{playerName}</div>
      {sentiment && badge('Sentiment', sentiment, 'text-pink-400')}
    </div>
    <div className="flex items-center justify-between">
      <span className="text-gray-400 text-xs">{statType}</span>
      <span className="text-xl font-bold">{line}</span>
    </div>
    <div className="flex items-center justify-between space-x-2">
      <GlowButton onClick={() => onSelect?.('over')} className="flex-1">Over <span className="ml-1 text-green-400">{overOdds > 0 ? `+${overOdds}` : overOdds}</span></GlowButton>
      <GlowButton onClick={() => onSelect?.('under')} className="flex-1">Under <span className="ml-1 text-blue-400">{underOdds > 0 ? `+${underOdds}` : underOdds}</span></GlowButton>
    </div>
    <div className="flex flex-wrap gap-2 mt-2">
      {aiBoost !== undefined && badge('AI Boost', `${aiBoost}%`, 'text-yellow-400')}
      {patternStrength !== undefined && badge('Pattern', `${patternStrength}%`, 'text-purple-400')}
      {bonusPercent !== undefined && badge('Bonus', `${bonusPercent}%`, 'text-green-400')}
      {enhancementPercent !== undefined && badge('Enhance', `${enhancementPercent}%`, 'text-blue-400')}
    </div>
    <button
      onClick={onViewDetails}
      className="absolute top-2 right-2 text-xs text-gray-400 hover:text-primary-500 underline focus:outline-none"
      aria-label="Show prediction explanation"
    >
      Why this prediction?
    </button>
  </GlassCard>
);

export default EnhancedPropCard;
