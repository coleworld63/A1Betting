"""
Advanced Betting Opportunity Service for backend prediction and analysis
Integrates with feature engineering, ensemble models, and risk assessment
"""

from typing import Dict, List, Any, Optional, Tuple
from pydantic import BaseModel, Field
from datetime import datetime, timedelta
import numpy as np
import pandas as pd
from dataclasses import dataclass
import asyncio
import logging
from enum import Enum
import json

from feature_engineering import FeatureEngineering
from feature_flags import FeatureFlags

# Configure logging
logger = logging.getLogger(__name__)

class OpportunityType(str, Enum):
    """Types of betting opportunities"""
    ARBITRAGE = "arbitrage"
    VALUE_BET = "value_bet"
    LINE_MOVEMENT = "line_movement"
    MARKET_INEFFICIENCY = "market_inefficiency"
    ENSEMBLE_CONSENSUS = "ensemble_consensus"
    ADVANCED_MODEL = "advanced_model"

class RiskLevel(str, Enum):
    """Risk levels for betting opportunities"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    EXTREME = "extreme"

@dataclass
class MarketData:
    """Market data for opportunity analysis"""
    sportsbook: str
    odds: float
    line: Optional[float]
    volume: Optional[float]
    timestamp: datetime
    movement_direction: Optional[str]
    liquidity_score: Optional[float]

@dataclass
class BettingOpportunity:
    """Comprehensive betting opportunity data"""
    opportunity_id: str
    opportunity_type: OpportunityType
    event_id: str
    market_type: str
    selection: str
    
    # Core metrics
    expected_value: float
    confidence: float
    kelly_fraction: float
    risk_level: RiskLevel
    
    # Market data
    best_odds: float
    worst_odds: float
    line_value: Optional[float]
    market_data: List[MarketData]
    
    # Advanced analytics
    ensemble_prediction: Optional[float]
    feature_importance: Dict[str, float]
    shap_values: Dict[str, float]
    model_consensus: float
    
    # Risk metrics
    volatility: float
    liquidity_risk: float
    model_uncertainty: float
    
    # Timing
    created_at: datetime
    expires_at: Optional[datetime]
    time_sensitivity: float
    
    # Additional metadata
    metadata: Dict[str, Any] = None

class BettingOpportunityService:
    """Advanced betting opportunity detection and analysis service"""
    
    def __init__(self, config: Dict[str, Any] = None):
        self.config = config or {}
        self.feature_engineering = FeatureEngineering()
        self.feature_flags = FeatureFlags.get_instance()
        
        # Opportunity tracking
        self.active_opportunities: Dict[str, BettingOpportunity] = {}
        self.opportunity_history: List[BettingOpportunity] = []
        
        # Configuration thresholds
        self.min_expected_value = self.config.get('min_expected_value', 0.05)
        self.min_confidence = self.config.get('min_confidence', 0.65)
        self.max_kelly_fraction = self.config.get('max_kelly_fraction', 0.25)
        self.opportunity_timeout = self.config.get('opportunity_timeout', 3600)  # 1 hour
        
        # Advanced analytics cache
        self.market_efficiency_cache = {}
        self.volatility_cache = {}
        
        logger.info("BettingOpportunityService initialized")

    async def analyze_betting_opportunities(
        self, 
        market_data: List[Dict[str, Any]], 
        predictions: Dict[str, Any] = None
    ) -> List[BettingOpportunity]:
        """
        Analyze market data and predictions to identify betting opportunities
        """
        opportunities = []
        
        try:
            # Check feature flags
            if not self.feature_flags.is_feature_enabled('betting_opportunities'):
                logger.info("Betting opportunities feature is disabled")
                return []
            
            # Process market data
            processed_markets = await self._process_market_data(market_data)
            
            # Generate features for opportunity analysis
            features = await self._generate_opportunity_features(processed_markets, predictions)
            
            # Detect different types of opportunities
            arbitrage_ops = await self._detect_arbitrage_opportunities(processed_markets)
            value_bet_ops = await self._detect_value_betting_opportunities(processed_markets, predictions)
            line_movement_ops = await self._detect_line_movement_opportunities(processed_markets)
            inefficiency_ops = await self._detect_market_inefficiencies(processed_markets, features)
            
            # Combine all opportunities
            all_opportunities = arbitrage_ops + value_bet_ops + line_movement_ops + inefficiency_ops
            
            # Score and filter opportunities
            scored_opportunities = await self._score_opportunities(all_opportunities, features)
            filtered_opportunities = self._filter_opportunities(scored_opportunities)
            
            # Update tracking
            for opp in filtered_opportunities:
                self.active_opportunities[opp.opportunity_id] = opp
                self.opportunity_history.append(opp)
            
            # Clean up expired opportunities
            await self._cleanup_expired_opportunities()
            
            logger.info(f"Identified {len(filtered_opportunities)} betting opportunities")
            return filtered_opportunities
            
        except Exception as e:
            logger.error(f"Error analyzing betting opportunities: {str(e)}")
            return []

    async def _process_market_data(self, raw_market_data: List[Dict[str, Any]]) -> List[MarketData]:
        """Process and normalize market data"""
        processed_data = []
        
        for market in raw_market_data:
            try:
                market_data = MarketData(
                    sportsbook=market.get('sportsbook', 'unknown'),
                    odds=float(market.get('odds', 0)),
                    line=market.get('line'),
                    volume=market.get('volume'),
                    timestamp=datetime.fromisoformat(market.get('timestamp', datetime.now().isoformat())),
                    movement_direction=market.get('movement_direction'),
                    liquidity_score=market.get('liquidity_score')
                )
                processed_data.append(market_data)
            except Exception as e:
                logger.warning(f"Error processing market data: {str(e)}")
                continue
        
        return processed_data

    async def _generate_opportunity_features(
        self, 
        market_data: List[MarketData], 
        predictions: Dict[str, Any] = None
    ) -> Dict[str, float]:
        """Generate features for opportunity analysis"""
        features = {}
        
        if not market_data:
            return features
        
        try:
            # Market spread features
            odds_values = [m.odds for m in market_data if m.odds > 0]
            if odds_values:
                features['odds_spread'] = max(odds_values) - min(odds_values)
                features['odds_mean'] = np.mean(odds_values)
                features['odds_std'] = np.std(odds_values)
                features['odds_cv'] = features['odds_std'] / features['odds_mean'] if features['odds_mean'] > 0 else 0
            
            # Volume features
            volumes = [m.volume for m in market_data if m.volume is not None]
            if volumes:
                features['total_volume'] = sum(volumes)
                features['avg_volume'] = np.mean(volumes)
                features['volume_concentration'] = max(volumes) / sum(volumes) if sum(volumes) > 0 else 0
            
            # Liquidity features
            liquidity_scores = [m.liquidity_score for m in market_data if m.liquidity_score is not None]
            if liquidity_scores:
                features['avg_liquidity'] = np.mean(liquidity_scores)
                features['min_liquidity'] = min(liquidity_scores)
            
            # Time-based features
            timestamps = [m.timestamp for m in market_data]
            if len(timestamps) > 1:
                time_diffs = [(timestamps[i+1] - timestamps[i]).total_seconds() 
                             for i in range(len(timestamps)-1)]
                features['avg_update_frequency'] = np.mean(time_diffs) if time_diffs else 0
            
            # Prediction-based features
            if predictions:
                features['prediction_confidence'] = predictions.get('confidence', 0)
                features['ensemble_score'] = predictions.get('ensemble_score', 0)
                features['model_agreement'] = predictions.get('model_agreement', 0)
            
            # Market efficiency indicators
            features['market_efficiency'] = await self._calculate_market_efficiency(market_data)
            features['price_discovery'] = await self._calculate_price_discovery(market_data)
            
        except Exception as e:
            logger.error(f"Error generating opportunity features: {str(e)}")
        
        return features

    async def _detect_arbitrage_opportunities(self, market_data: List[MarketData]) -> List[BettingOpportunity]:
        """Detect arbitrage opportunities across different sportsbooks"""
        opportunities = []
        
        if len(market_data) < 2:
            return opportunities
        
        try:
            # Group by market type and find price discrepancies
            sportsbook_odds = {}
            for market in market_data:
                if market.sportsbook not in sportsbook_odds:
                    sportsbook_odds[market.sportsbook] = []
                sportsbook_odds[market.sportsbook].append(market)
            
            # Look for arbitrage across different sportsbooks
            sportsbooks = list(sportsbook_odds.keys())
            for i in range(len(sportsbooks)):
                for j in range(i+1, len(sportsbooks)):
                    book1_odds = sportsbook_odds[sportsbooks[i]]
                    book2_odds = sportsbook_odds[sportsbooks[j]]
                    
                    for odds1 in book1_odds:
                        for odds2 in book2_odds:
                            arbitrage_return = self._calculate_arbitrage_return(odds1.odds, odds2.odds)
                            
                            if arbitrage_return > 0.01:  # At least 1% return
                                opportunity = BettingOpportunity(
                                    opportunity_id=f"arb_{datetime.now().timestamp()}",
                                    opportunity_type=OpportunityType.ARBITRAGE,
                                    event_id=f"event_{odds1.sportsbook}_{odds2.sportsbook}",
                                    market_type="arbitrage",
                                    selection="both_sides",
                                    expected_value=arbitrage_return,
                                    confidence=0.95,  # Arbitrage has high confidence
                                    kelly_fraction=min(arbitrage_return, self.max_kelly_fraction),
                                    risk_level=RiskLevel.LOW,
                                    best_odds=max(odds1.odds, odds2.odds),
                                    worst_odds=min(odds1.odds, odds2.odds),
                                    line_value=None,
                                    market_data=[odds1, odds2],
                                    ensemble_prediction=None,
                                    feature_importance={},
                                    shap_values={},
                                    model_consensus=1.0,
                                    volatility=0.0,  # Arbitrage has no volatility
                                    liquidity_risk=self._calculate_liquidity_risk([odds1, odds2]),
                                    model_uncertainty=0.0,
                                    created_at=datetime.now(),
                                    expires_at=datetime.now() + timedelta(minutes=30),
                                    time_sensitivity=0.9,  # Arbitrage is time-sensitive
                                    metadata={'arbitrage_return': arbitrage_return}
                                )
                                opportunities.append(opportunity)
            
        except Exception as e:
            logger.error(f"Error detecting arbitrage opportunities: {str(e)}")
        
        return opportunities

    async def _detect_value_betting_opportunities(
        self, 
        market_data: List[MarketData], 
        predictions: Dict[str, Any] = None
    ) -> List[BettingOpportunity]:
        """Detect value betting opportunities based on model predictions"""
        opportunities = []
        
        if not predictions:
            return opportunities
        
        try:
            predicted_probability = predictions.get('probability', 0)
            confidence = predictions.get('confidence', 0)
            
            if predicted_probability <= 0 or confidence < self.min_confidence:
                return opportunities
            
            for market in market_data:
                if market.odds <= 1:
                    continue
                
                implied_probability = 1 / market.odds
                value = (predicted_probability * market.odds) - 1
                
                if value > self.min_expected_value:
                    kelly_fraction = self._calculate_kelly_fraction(
                        predicted_probability, market.odds
                    )
                    
                    opportunity = BettingOpportunity(
                        opportunity_id=f"value_{datetime.now().timestamp()}",
                        opportunity_type=OpportunityType.VALUE_BET,
                        event_id=predictions.get('event_id', 'unknown'),
                        market_type=predictions.get('market_type', 'unknown'),
                        selection=predictions.get('selection', 'unknown'),
                        expected_value=value,
                        confidence=confidence,
                        kelly_fraction=kelly_fraction,
                        risk_level=self._calculate_risk_level(value, confidence, kelly_fraction),
                        best_odds=market.odds,
                        worst_odds=market.odds,
                        line_value=market.line,
                        market_data=[market],
                        ensemble_prediction=predicted_probability,
                        feature_importance=predictions.get('feature_importance', {}),
                        shap_values=predictions.get('shap_values', {}),
                        model_consensus=predictions.get('model_consensus', 0),
                        volatility=predictions.get('volatility', 0),
                        liquidity_risk=self._calculate_liquidity_risk([market]),
                        model_uncertainty=1 - confidence,
                        created_at=datetime.now(),
                        expires_at=datetime.now() + timedelta(hours=2),
                        time_sensitivity=0.6,
                        metadata={
                            'implied_probability': implied_probability,
                            'predicted_probability': predicted_probability
                        }
                    )
                    opportunities.append(opportunity)
            
        except Exception as e:
            logger.error(f"Error detecting value betting opportunities: {str(e)}")
        
        return opportunities

    async def _detect_line_movement_opportunities(self, market_data: List[MarketData]) -> List[BettingOpportunity]:
        """Detect opportunities based on line movement patterns"""
        opportunities = []
        
        try:
            # Group by sportsbook and analyze movement
            for sportsbook in set(m.sportsbook for m in market_data):
                book_data = [m for m in market_data if m.sportsbook == sportsbook]
                book_data.sort(key=lambda x: x.timestamp)
                
                if len(book_data) < 2:
                    continue
                
                # Calculate movement metrics
                odds_changes = []
                for i in range(1, len(book_data)):
                    change = (book_data[i].odds - book_data[i-1].odds) / book_data[i-1].odds
                    odds_changes.append(change)
                
                if odds_changes:
                    avg_movement = np.mean(odds_changes)
                    movement_volatility = np.std(odds_changes)
                    
                    # Look for significant movement
                    if abs(avg_movement) > 0.05:  # 5% movement threshold
                        opportunity = BettingOpportunity(
                            opportunity_id=f"movement_{datetime.now().timestamp()}",
                            opportunity_type=OpportunityType.LINE_MOVEMENT,
                            event_id=f"event_{sportsbook}",
                            market_type="line_movement",
                            selection="momentum_play",
                            expected_value=abs(avg_movement),
                            confidence=min(0.8, 1 - movement_volatility),
                            kelly_fraction=min(abs(avg_movement), self.max_kelly_fraction),
                            risk_level=self._calculate_risk_level(abs(avg_movement), 0.7, abs(avg_movement)),
                            best_odds=book_data[-1].odds,
                            worst_odds=book_data[0].odds,
                            line_value=book_data[-1].line,
                            market_data=book_data,
                            ensemble_prediction=None,
                            feature_importance={},
                            shap_values={},
                            model_consensus=0.7,
                            volatility=movement_volatility,
                            liquidity_risk=self._calculate_liquidity_risk(book_data),
                            model_uncertainty=movement_volatility,
                            created_at=datetime.now(),
                            expires_at=datetime.now() + timedelta(hours=1),
                            time_sensitivity=0.8,
                            metadata={
                                'avg_movement': avg_movement,
                                'movement_volatility': movement_volatility
                            }
                        )
                        opportunities.append(opportunity)
            
        except Exception as e:
            logger.error(f"Error detecting line movement opportunities: {str(e)}")
        
        return opportunities

    async def _detect_market_inefficiencies(
        self, 
        market_data: List[MarketData], 
        features: Dict[str, float]
    ) -> List[BettingOpportunity]:
        """Detect market inefficiencies using advanced analytics"""
        opportunities = []
        
        try:
            market_efficiency = features.get('market_efficiency', 0.5)
            
            # Look for inefficient markets (low efficiency score)
            if market_efficiency < 0.6:
                # Calculate inefficiency score
                inefficiency_score = 1 - market_efficiency
                
                # Find the market with best potential
                best_market = max(market_data, key=lambda x: x.odds if x.odds > 1 else 0)
                
                opportunity = BettingOpportunity(
                    opportunity_id=f"inefficiency_{datetime.now().timestamp()}",
                    opportunity_type=OpportunityType.MARKET_INEFFICIENCY,
                    event_id="market_inefficiency",
                    market_type="inefficiency_play",
                    selection="best_value",
                    expected_value=inefficiency_score * 0.1,  # Conservative estimate
                    confidence=0.6,
                    kelly_fraction=min(inefficiency_score * 0.05, self.max_kelly_fraction),
                    risk_level=RiskLevel.MEDIUM,
                    best_odds=best_market.odds,
                    worst_odds=min(m.odds for m in market_data if m.odds > 1),
                    line_value=best_market.line,
                    market_data=market_data,
                    ensemble_prediction=None,
                    feature_importance=features,
                    shap_values={},
                    model_consensus=0.6,
                    volatility=features.get('odds_cv', 0),
                    liquidity_risk=self._calculate_liquidity_risk(market_data),
                    model_uncertainty=0.4,
                    created_at=datetime.now(),
                    expires_at=datetime.now() + timedelta(hours=3),
                    time_sensitivity=0.4,
                    metadata={
                        'market_efficiency': market_efficiency,
                        'inefficiency_score': inefficiency_score
                    }
                )
                opportunities.append(opportunity)
            
        except Exception as e:
            logger.error(f"Error detecting market inefficiencies: {str(e)}")
        
        return opportunities

    async def _score_opportunities(
        self, 
        opportunities: List[BettingOpportunity], 
        features: Dict[str, float]
    ) -> List[BettingOpportunity]:
        """Score and rank opportunities"""
        for opportunity in opportunities:
            # Calculate composite score
            ev_score = min(opportunity.expected_value * 10, 1.0)  # Normalize EV
            confidence_score = opportunity.confidence
            kelly_score = min(opportunity.kelly_fraction * 4, 1.0)  # Normalize Kelly
            time_score = opportunity.time_sensitivity
            
            # Risk adjustment
            risk_penalty = {
                RiskLevel.LOW: 0.0,
                RiskLevel.MEDIUM: 0.1,
                RiskLevel.HIGH: 0.2,
                RiskLevel.EXTREME: 0.4
            }.get(opportunity.risk_level, 0.2)
            
            composite_score = (
                ev_score * 0.3 + 
                confidence_score * 0.25 + 
                kelly_score * 0.2 + 
                time_score * 0.15 +
                (1 - opportunity.model_uncertainty) * 0.1
            ) - risk_penalty
            
            opportunity.metadata = opportunity.metadata or {}
            opportunity.metadata['composite_score'] = composite_score
        
        return sorted(opportunities, key=lambda x: x.metadata.get('composite_score', 0), reverse=True)

    def _filter_opportunities(self, opportunities: List[BettingOpportunity]) -> List[BettingOpportunity]:
        """Filter opportunities based on configured thresholds"""
        filtered = []
        
        for opp in opportunities:
            if (opp.expected_value >= self.min_expected_value and 
                opp.confidence >= self.min_confidence and
                opp.kelly_fraction <= self.max_kelly_fraction):
                filtered.append(opp)
        
        return filtered

    async def _cleanup_expired_opportunities(self):
        """Remove expired opportunities from tracking"""
        current_time = datetime.now()
        expired_ids = []
        
        for opp_id, opp in self.active_opportunities.items():
            if opp.expires_at and opp.expires_at < current_time:
                expired_ids.append(opp_id)
            elif (current_time - opp.created_at).total_seconds() > self.opportunity_timeout:
                expired_ids.append(opp_id)
        
        for opp_id in expired_ids:
            del self.active_opportunities[opp_id]
        
        if expired_ids:
            logger.info(f"Cleaned up {len(expired_ids)} expired opportunities")

    def _calculate_arbitrage_return(self, odds1: float, odds2: float) -> float:
        """Calculate arbitrage return"""
        if odds1 <= 1 or odds2 <= 1:
            return 0
        
        total_stake = 1
        stake1 = total_stake / (1 + odds2 / odds1)
        stake2 = total_stake - stake1
        
        return_scenario1 = stake1 * odds1 - total_stake
        return_scenario2 = stake2 * odds2 - total_stake
        
        if return_scenario1 > 0 and return_scenario2 > 0:
            return min(return_scenario1, return_scenario2)
        
        return 0

    def _calculate_kelly_fraction(self, win_probability: float, odds: float) -> float:
        """Calculate Kelly criterion fraction"""
        if odds <= 1 or win_probability <= 0:
            return 0
        
        b = odds - 1  # Net odds
        p = win_probability
        q = 1 - p
        
        kelly = (b * p - q) / b
        return max(0, min(kelly, self.max_kelly_fraction))

    def _calculate_risk_level(self, expected_value: float, confidence: float, kelly_fraction: float) -> RiskLevel:
        """Calculate risk level based on multiple factors"""
        risk_score = (
            (1 - confidence) * 0.4 +
            min(kelly_fraction, 0.5) * 0.3 +
            max(0, 0.1 - expected_value) * 5 * 0.3
        )
        
        if risk_score < 0.2:
            return RiskLevel.LOW
        elif risk_score < 0.4:
            return RiskLevel.MEDIUM
        elif risk_score < 0.7:
            return RiskLevel.HIGH
        else:
            return RiskLevel.EXTREME

    def _calculate_liquidity_risk(self, market_data: List[MarketData]) -> float:
        """Calculate liquidity risk based on market data"""
        volumes = [m.volume for m in market_data if m.volume is not None]
        liquidity_scores = [m.liquidity_score for m in market_data if m.liquidity_score is not None]
        
        if not volumes and not liquidity_scores:
            return 0.5  # Medium risk if no data
        
        risk_factors = []
        
        if volumes:
            total_volume = sum(volumes)
            if total_volume < 10000:  # Threshold for low volume
                risk_factors.append(0.7)
            else:
                risk_factors.append(0.2)
        
        if liquidity_scores:
            avg_liquidity = np.mean(liquidity_scores)
            risk_factors.append(1 - avg_liquidity)
        
        return np.mean(risk_factors) if risk_factors else 0.5

    async def _calculate_market_efficiency(self, market_data: List[MarketData]) -> float:
        """Calculate market efficiency score"""
        if len(market_data) < 2:
            return 0.5
        
        try:
            # Calculate price dispersion
            odds_values = [m.odds for m in market_data if m.odds > 1]
            if not odds_values:
                return 0.5
            
            mean_odds = np.mean(odds_values)
            std_odds = np.std(odds_values)
            cv = std_odds / mean_odds if mean_odds > 0 else 1
            
            # Lower CV indicates higher efficiency
            efficiency = max(0, 1 - cv * 2)
            return min(1, efficiency)
            
        except Exception as e:
            logger.error(f"Error calculating market efficiency: {str(e)}")
            return 0.5

    async def _calculate_price_discovery(self, market_data: List[MarketData]) -> float:
        """Calculate price discovery score"""
        try:
            # Sort by timestamp
            sorted_data = sorted(market_data, key=lambda x: x.timestamp)
            
            if len(sorted_data) < 3:
                return 0.5
            
            # Calculate price convergence over time
            recent_odds = [m.odds for m in sorted_data[-3:] if m.odds > 1]
            if len(recent_odds) < 2:
                return 0.5
            
            convergence = 1 - (np.std(recent_odds) / np.mean(recent_odds))
            return max(0, min(1, convergence))
            
        except Exception as e:
            logger.error(f"Error calculating price discovery: {str(e)}")
            return 0.5

    async def get_active_opportunities(self) -> List[BettingOpportunity]:
        """Get all active betting opportunities"""
        await self._cleanup_expired_opportunities()
        return list(self.active_opportunities.values())

    async def get_opportunity_by_id(self, opportunity_id: str) -> Optional[BettingOpportunity]:
        """Get specific opportunity by ID"""
        return self.active_opportunities.get(opportunity_id)

    async def get_opportunity_statistics(self) -> Dict[str, Any]:
        """Get statistics about opportunities"""
        active_ops = await self.get_active_opportunities()
        
        if not active_ops:
            return {
                'total_active': 0,
                'avg_expected_value': 0,
                'avg_confidence': 0,
                'risk_distribution': {}
            }
        
        risk_counts = {}
        for opp in active_ops:
            risk_level = opp.risk_level.value
            risk_counts[risk_level] = risk_counts.get(risk_level, 0) + 1
        
        return {
            'total_active': len(active_ops),
            'avg_expected_value': np.mean([opp.expected_value for opp in active_ops]),
            'avg_confidence': np.mean([opp.confidence for opp in active_ops]),
            'avg_kelly_fraction': np.mean([opp.kelly_fraction for opp in active_ops]),
            'risk_distribution': risk_counts,
            'opportunity_types': {
                opp_type.value: len([o for o in active_ops if o.opportunity_type == opp_type])
                for opp_type in OpportunityType
            }
        }

# Global instance
betting_opportunity_service = BettingOpportunityService()
