"""
Advanced Ensemble ML Engine
Intelligent model selection, dynamic weighting, and meta-learning for optimal predictions
"""

import asyncio
import logging
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any, Tuple, Union
from dataclasses import dataclass, field
from enum import Enum
import pickle
import joblib
from pathlib import Path
import json
from concurrent.futures import ThreadPoolExecutor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
from sklearn.model_selection import cross_val_score
import xgboost as xgb
import lightgbm as lgb
import optuna
from scipy import stats
from collections import defaultdict, deque

from config import config_manager
from database import db_manager
from feature_engineering import FeatureEngineering

logger = logging.getLogger(__name__)

class ModelType(str, Enum):
    """Types of ML models"""
    XGBOOST = "xgboost"
    LIGHTGBM = "lightgbm"
    RANDOM_FOREST = "random_forest"
    GRADIENT_BOOSTING = "gradient_boosting"
    NEURAL_NETWORK = "neural_network"
    LINEAR_REGRESSION = "linear_regression"
    SVR = "support_vector_regression"
    PROPHET = "prophet"
    ARIMA = "arima"
    LSTM = "lstm"

class PredictionContext(str, Enum):
    """Prediction contexts for model selection"""
    LIVE_GAME = "live_game"
    PRE_GAME = "pre_game"
    PLAYER_PROPS = "player_props"
    TEAM_TOTALS = "team_totals"
    SPREAD_BETTING = "spread_betting"
    OVER_UNDER = "over_under"
    MONEYLINE = "moneyline"
    FUTURES = "futures"

@dataclass
class ModelMetrics:
    """Comprehensive model performance metrics"""
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    mse: float
    mae: float
    r2_score: float
    sharpe_ratio: float
    max_drawdown: float
    profit_factor: float
    win_rate: float
    avg_return: float
    volatility: float
    consistency_score: float
    robustness_score: float
    calibration_score: float
    feature_stability: float
    prediction_interval_coverage: float
    model_confidence: float
    last_updated: datetime
    evaluation_samples: int = 0

@dataclass
class PredictionOutput:
    """Enhanced prediction output with uncertainty quantification"""
    model_name: str
    model_type: ModelType
    predicted_value: float
    confidence_interval: Tuple[float, float]
    prediction_probability: float
    feature_importance: Dict[str, float]
    shap_values: Dict[str, float]
    uncertainty_metrics: Dict[str, float]
    model_agreement: float
    prediction_context: PredictionContext
    metadata: Dict[str, Any]
    processing_time: float
    timestamp: datetime

@dataclass
class EnsembleConfiguration:
    """Dynamic ensemble configuration"""
    base_models: List[ModelType]
    meta_learner: Optional[ModelType]
    weighting_strategy: str  # "performance", "dynamic", "bayesian", "stacking"
    selection_criteria: List[str]  # ["accuracy", "diversity", "recent_performance"]
    min_models: int = 3
    max_models: int = 10
    rebalance_frequency: int = 24  # hours
    performance_window: int = 168  # hours (1 week)
    diversity_threshold: float = 0.1
    confidence_threshold: float = 0.7

class ModelRegistry:
    """Advanced model registry with version control and metadata"""
    
    def __init__(self, models_directory: str):
        self.models_directory = Path(models_directory)
        self.models: Dict[str, Dict] = {}
        self.model_metrics: Dict[str, ModelMetrics] = {}
        self.model_lineage: Dict[str, List] = {}
        self.executor = ThreadPoolExecutor(max_workers=8)
        
    async def register_model(
        self, 
        model_name: str, 
        model_type: ModelType, 
        model_path: str,
        metadata: Dict[str, Any]
    ):
        """Register a new model with comprehensive metadata"""
        try:
            model_info = {
                "name": model_name,
                "type": model_type,
                "path": model_path,
                "version": metadata.get("version", "1.0.0"),
                "created_at": datetime.utcnow(),
                "file_size": Path(model_path).stat().st_size if Path(model_path).exists() else 0,
                "features": metadata.get("features", []),
                "target": metadata.get("target", ""),
                "training_data_size": metadata.get("training_data_size", 0),
                "training_duration": metadata.get("training_duration", 0),
                "hyperparameters": metadata.get("hyperparameters", {}),
                "cross_validation_scores": metadata.get("cv_scores", []),
                "feature_names": metadata.get("feature_names", []),
                "is_active": True,
                "deployment_stage": metadata.get("stage", "development")
            }
            
            self.models[model_name] = model_info
            
            # Initialize metrics
            self.model_metrics[model_name] = ModelMetrics(
                accuracy=0.0, precision=0.0, recall=0.0, f1_score=0.0,
                mse=0.0, mae=0.0, r2_score=0.0, sharpe_ratio=0.0,
                max_drawdown=0.0, profit_factor=0.0, win_rate=0.0,
                avg_return=0.0, volatility=0.0, consistency_score=0.0,
                robustness_score=0.0, calibration_score=0.0,
                feature_stability=0.0, prediction_interval_coverage=0.0,
                model_confidence=0.0, last_updated=datetime.utcnow()
            )
            
            logger.info(f"Registered model {model_name} with type {model_type}")
            
        except Exception as e:
            logger.error(f"Error registering model {model_name}: {str(e)}")
            raise
    
    async def load_model(self, model_name: str) -> Any:
        """Load model with caching and error handling"""
        try:
            if model_name not in self.models:
                raise ValueError(f"Model {model_name} not registered")
            
            model_info = self.models[model_name]
            model_path = self.models_directory / model_info["path"]
            
            if not model_path.exists():
                raise FileNotFoundError(f"Model file not found: {model_path}")
            
            # Load model based on type
            loop = asyncio.get_event_loop()
            
            if model_info["type"] in [ModelType.XGBOOST, ModelType.LIGHTGBM, ModelType.RANDOM_FOREST]:
                model = await loop.run_in_executor(
                    self.executor, joblib.load, str(model_path)
                )
            else:
                model = await loop.run_in_executor(
                    self.executor, pickle.load, open(model_path, 'rb')
                )
            
            return model
            
        except Exception as e:
            logger.error(f"Error loading model {model_name}: {str(e)}")
            raise
    
    def get_active_models(self, model_type: Optional[ModelType] = None) -> List[str]:
        """Get list of active models, optionally filtered by type"""
        models = [
            name for name, info in self.models.items()
            if info["is_active"] and (model_type is None or info["type"] == model_type)
        ]
        return models
    
    async def update_model_metrics(self, model_name: str, metrics: ModelMetrics):
        """Update model performance metrics"""
        if model_name in self.model_metrics:
            self.model_metrics[model_name] = metrics
            
            # Store in database for persistence
            async with db_manager.get_session() as session:
                # This would update the database with new metrics
                pass

class IntelligentModelSelector:
    """Intelligent model selection based on context and performance"""
    
    def __init__(self, model_registry: ModelRegistry):
        self.model_registry = model_registry
        self.selection_history = deque(maxlen=1000)
        self.context_performance = defaultdict(lambda: defaultdict(list))
        self.diversity_matrix = {}
        
    async def select_models(
        self, 
        context: PredictionContext, 
        features: Dict[str, float],
        ensemble_config: EnsembleConfiguration
    ) -> List[str]:
        """Select optimal models for given context and features"""
        try:
            available_models = self.model_registry.get_active_models()
            
            if len(available_models) <= ensemble_config.min_models:
                return available_models
            
            # Score models based on multiple criteria
            model_scores = {}
            
            for model_name in available_models:
                score = await self._score_model(model_name, context, features, ensemble_config)
                model_scores[model_name] = score
            
            # Apply selection strategy
            selected_models = await self._apply_selection_strategy(
                model_scores, ensemble_config
            )
            
            # Ensure diversity
            if len(selected_models) > 1:
                selected_models = await self._ensure_diversity(
                    selected_models, ensemble_config.diversity_threshold
                )
            
            # Log selection decision
            self.selection_history.append({
                "timestamp": datetime.utcnow(),
                "context": context,
                "selected_models": selected_models,
                "scores": {model: model_scores[model] for model in selected_models}
            })
            
            return selected_models[:ensemble_config.max_models]
            
        except Exception as e:
            logger.error(f"Model selection failed: {str(e)}")
            # Fallback to top performing models
            return self._get_fallback_models(ensemble_config)
    
    async def _score_model(
        self, 
        model_name: str, 
        context: PredictionContext, 
        features: Dict[str, float],
        config: EnsembleConfiguration
    ) -> float:
        """Score a model based on multiple criteria"""
        try:
            metrics = self.model_registry.model_metrics[model_name]
            
            # Base performance score
            performance_score = (
                metrics.accuracy * 0.3 +
                metrics.r2_score * 0.2 +
                (1 - metrics.mse) * 0.2 +  # Normalized MSE
                metrics.consistency_score * 0.15 +
                metrics.robustness_score * 0.15
            )
            
            # Context-specific performance
            context_performance = np.mean(
                self.context_performance[context][model_name][-10:]  # Last 10 predictions
            ) if self.context_performance[context][model_name] else 0.5
            
            # Recent performance weight
            recency_weight = self._calculate_recency_weight(metrics.last_updated)
            
            # Feature compatibility score
            feature_compatibility = await self._calculate_feature_compatibility(
                model_name, features
            )
            
            # Uncertainty score (lower uncertainty is better)
            uncertainty_score = 1.0 - metrics.model_confidence
            
            # Composite score
            composite_score = (
                performance_score * 0.4 +
                context_performance * 0.25 +
                feature_compatibility * 0.15 +
                recency_weight * 0.1 +
                uncertainty_score * 0.1
            )
            
            return composite_score
            
        except Exception as e:
            logger.warning(f"Error scoring model {model_name}: {str(e)}")
            return 0.0
    
    def _calculate_recency_weight(self, last_updated: datetime) -> float:
        """Calculate weight based on how recently the model was updated"""
        age_hours = (datetime.utcnow() - last_updated).total_seconds() / 3600
        return max(0.0, 1.0 - (age_hours / 168))  # Decay over 1 week
    
    async def _calculate_feature_compatibility(
        self, 
        model_name: str, 
        features: Dict[str, float]
    ) -> float:
        """Calculate how compatible the features are with the model"""
        try:
            model_info = self.model_registry.models[model_name]
            expected_features = set(model_info.get("feature_names", []))
            provided_features = set(features.keys())
            
            if not expected_features:
                return 1.0  # No feature requirements
            
            overlap = len(expected_features & provided_features)
            compatibility = overlap / len(expected_features)
            
            return compatibility
            
        except Exception as e:
            logger.warning(f"Feature compatibility calculation failed: {str(e)}")
            return 0.5
    
    async def _apply_selection_strategy(
        self, 
        model_scores: Dict[str, float], 
        config: EnsembleConfiguration
    ) -> List[str]:
        """Apply the configured selection strategy"""
        if config.weighting_strategy == "performance":
            # Select top performers
            sorted_models = sorted(
                model_scores.items(), key=lambda x: x[1], reverse=True
            )
            return [model for model, score in sorted_models[:config.max_models]]
        
        elif config.weighting_strategy == "dynamic":
            # Dynamic selection based on recent performance trends
            return await self._dynamic_selection(model_scores, config)
        
        elif config.weighting_strategy == "bayesian":
            # Bayesian model selection with uncertainty
            return await self._bayesian_selection(model_scores, config)
        
        else:
            # Default: top performers
            sorted_models = sorted(
                model_scores.items(), key=lambda x: x[1], reverse=True
            )
            return [model for model, score in sorted_models[:config.max_models]]
    
    async def _dynamic_selection(
        self, 
        model_scores: Dict[str, float], 
        config: EnsembleConfiguration
    ) -> List[str]:
        """Dynamic model selection based on performance trends"""
        # Implement trend analysis and adaptive selection
        # For now, use performance-based selection
        sorted_models = sorted(
            model_scores.items(), key=lambda x: x[1], reverse=True
        )
        return [model for model, score in sorted_models[:config.max_models]]
    
    async def _bayesian_selection(
        self, 
        model_scores: Dict[str, float], 
        config: EnsembleConfiguration
    ) -> List[str]:
        """Bayesian model selection with uncertainty quantification"""
        # Implement Bayesian selection
        # For now, use performance-based selection
        sorted_models = sorted(
            model_scores.items(), key=lambda x: x[1], reverse=True
        )
        return [model for model, score in sorted_models[:config.max_models]]
    
    async def _ensure_diversity(
        self, 
        selected_models: List[str], 
        diversity_threshold: float
    ) -> List[str]:
        """Ensure model diversity to avoid correlation"""
        if len(selected_models) <= 2:
            return selected_models
        
        # Calculate pairwise correlations (simplified)
        diverse_models = [selected_models[0]]  # Start with best model
        
        for model in selected_models[1:]:
            is_diverse = True
            for existing_model in diverse_models:
                correlation = await self._calculate_model_correlation(model, existing_model)
                if correlation > (1 - diversity_threshold):
                    is_diverse = False
                    break
            
            if is_diverse:
                diverse_models.append(model)
        
        return diverse_models
    
    async def _calculate_model_correlation(self, model1: str, model2: str) -> float:
        """Calculate correlation between two models' predictions"""
        # This would analyze historical predictions to calculate correlation
        # For now, return a mock correlation based on model types
        type1 = self.model_registry.models[model1]["type"]
        type2 = self.model_registry.models[model2]["type"]
        
        # Similar model types have higher correlation
        if type1 == type2:
            return 0.8
        elif type1 in [ModelType.XGBOOST, ModelType.LIGHTGBM] and type2 in [ModelType.XGBOOST, ModelType.LIGHTGBM]:
            return 0.6
        else:
            return 0.3
    
    def _get_fallback_models(self, config: EnsembleConfiguration) -> List[str]:
        """Get fallback models when selection fails"""
        all_models = self.model_registry.get_active_models()
        return all_models[:config.min_models] if all_models else []

class DynamicWeightingEngine:
    """Dynamic weighting of ensemble models based on performance and context"""
    
    def __init__(self):
        self.weight_history = defaultdict(lambda: deque(maxlen=100))
        self.performance_tracker = defaultdict(lambda: deque(maxlen=50))
        self.context_weights = defaultdict(dict)
        
    async def calculate_weights(
        self, 
        models: List[str], 
        context: PredictionContext,
        recent_predictions: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate dynamic weights for ensemble models"""
        try:
            if len(models) == 1:
                return {models[0]: 1.0}
            
            # Base weights from recent performance
            base_weights = await self._calculate_performance_weights(models, recent_predictions)
            
            # Context-specific adjustments
            context_adjustments = await self._get_context_adjustments(models, context)
            
            # Diversity bonuses
            diversity_bonuses = await self._calculate_diversity_bonuses(models)
            
            # Combine all weight factors
            final_weights = {}
            for model in models:
                weight = (
                    base_weights.get(model, 1.0) * 0.5 +
                    context_adjustments.get(model, 1.0) * 0.3 +
                    diversity_bonuses.get(model, 1.0) * 0.2
                )
                final_weights[model] = weight
            
            # Normalize weights
            total_weight = sum(final_weights.values())
            if total_weight > 0:
                final_weights = {
                    model: weight / total_weight 
                    for model, weight in final_weights.items()
                }
            else:
                # Equal weights as fallback
                equal_weight = 1.0 / len(models)
                final_weights = {model: equal_weight for model in models}
            
            # Store weight history
            for model, weight in final_weights.items():
                self.weight_history[model].append({
                    "timestamp": datetime.utcnow(),
                    "weight": weight,
                    "context": context
                })
            
            return final_weights
            
        except Exception as e:
            logger.error(f"Weight calculation failed: {str(e)}")
            # Return equal weights as fallback
            equal_weight = 1.0 / len(models)
            return {model: equal_weight for model in models}
    
    async def _calculate_performance_weights(
        self, 
        models: List[str], 
        recent_predictions: List[Dict[str, Any]]
    ) -> Dict[str, float]:
        """Calculate weights based on recent performance"""
        if not recent_predictions:
            return {model: 1.0 for model in models}
        
        # Calculate accuracy for each model
        model_accuracies = defaultdict(list)
        
        for prediction in recent_predictions:
            if "actual_value" in prediction and "model_predictions" in prediction:
                actual = prediction["actual_value"]
                for model_pred in prediction["model_predictions"]:
                    model_name = model_pred["model_name"]
                    predicted = model_pred["predicted_value"]
                    
                    # Calculate error
                    error = abs(actual - predicted) / max(abs(actual), 1.0)
                    accuracy = max(0.0, 1.0 - error)
                    model_accuracies[model_name].append(accuracy)
        
        # Calculate performance weights
        performance_weights = {}
        for model in models:
            if model in model_accuracies and model_accuracies[model]:
                # Use recent average with exponential weighting
                accuracies = model_accuracies[model]
                weights = [0.9 ** i for i in range(len(accuracies))]
                weighted_accuracy = np.average(accuracies, weights=weights[::-1])
                performance_weights[model] = weighted_accuracy
            else:
                performance_weights[model] = 0.5  # Default for models without history
        
        return performance_weights
    
    async def _get_context_adjustments(
        self, 
        models: List[str], 
        context: PredictionContext
    ) -> Dict[str, float]:
        """Get context-specific weight adjustments"""
        adjustments = {}
        
        # Context-specific model preferences
        context_preferences = {
            PredictionContext.LIVE_GAME: {
                ModelType.XGBOOST: 1.2,
                ModelType.LIGHTGBM: 1.1,
                ModelType.NEURAL_NETWORK: 0.9
            },
            PredictionContext.PLAYER_PROPS: {
                ModelType.RANDOM_FOREST: 1.2,
                ModelType.NEURAL_NETWORK: 1.1,
                ModelType.LINEAR_REGRESSION: 0.8
            }
        }
        
        preferences = context_preferences.get(context, {})
        
        for model in models:
            # This would need access to model type info
            # For now, return neutral adjustment
            adjustments[model] = 1.0
        
        return adjustments
    
    async def _calculate_diversity_bonuses(self, models: List[str]) -> Dict[str, float]:
        """Calculate diversity bonuses for ensemble models"""
        if len(models) <= 1:
            return {model: 1.0 for model in models}
        
        # Models with different types get diversity bonuses
        # This is a simplified implementation
        bonuses = {}
        for model in models:
            bonuses[model] = 1.0  # Base bonus
        
        return bonuses

class MetaLearningEngine:
    """Meta-learning engine for ensemble optimization"""
    
    def __init__(self):
        self.meta_models = {}
        self.meta_features = []
        self.training_data = deque(maxlen=10000)
        
    async def train_meta_learner(
        self, 
        ensemble_predictions: List[Dict[str, Any]]
    ):
        """Train meta-learner to optimize ensemble predictions"""
        try:
            if len(ensemble_predictions) < 100:
                logger.info("Insufficient data for meta-learner training")
                return
            
            # Prepare training data
            X, y = await self._prepare_meta_training_data(ensemble_predictions)
            
            if X is None or len(X) == 0:
                return
            
            # Train meta-model
            meta_model = RandomForestRegressor(
                n_estimators=100,
                max_depth=10,
                random_state=42
            )
            
            meta_model.fit(X, y)
            self.meta_models["default"] = meta_model
            
            logger.info(f"Trained meta-learner with {len(X)} samples")
            
        except Exception as e:
            logger.error(f"Meta-learner training failed: {str(e)}")
    
    async def _prepare_meta_training_data(
        self, 
        predictions: List[Dict[str, Any]]
    ) -> Tuple[Optional[np.ndarray], Optional[np.ndarray]]:
        """Prepare training data for meta-learner"""
        try:
            features = []
            targets = []
            
            for pred in predictions:
                if "actual_value" not in pred or "model_predictions" not in pred:
                    continue
                
                # Extract meta-features
                meta_feature_vector = await self._extract_meta_features(pred)
                if meta_feature_vector is not None:
                    features.append(meta_feature_vector)
                    targets.append(pred["actual_value"])
            
            if not features:
                return None, None
            
            return np.array(features), np.array(targets)
            
        except Exception as e:
            logger.error(f"Meta-training data preparation failed: {str(e)}")
            return None, None
    
    async def _extract_meta_features(self, prediction: Dict[str, Any]) -> Optional[List[float]]:
        """Extract meta-features from ensemble prediction"""
        try:
            model_preds = prediction["model_predictions"]
            
            # Basic ensemble statistics
            values = [mp["predicted_value"] for mp in model_preds]
            confidences = [mp.get("confidence", 0.5) for mp in model_preds]
            
            meta_features = [
                np.mean(values),
                np.std(values),
                np.min(values),
                np.max(values),
                np.mean(confidences),
                np.std(confidences),
                len(values),  # Number of models
                prediction.get("ensemble_confidence", 0.5)
            ]
            
            # Add model agreement features
            pairwise_diffs = []
            for i in range(len(values)):
                for j in range(i + 1, len(values)):
                    pairwise_diffs.append(abs(values[i] - values[j]))
            
            if pairwise_diffs:
                meta_features.extend([
                    np.mean(pairwise_diffs),
                    np.std(pairwise_diffs),
                    np.max(pairwise_diffs)
                ])
            else:
                meta_features.extend([0.0, 0.0, 0.0])
            
            return meta_features
            
        except Exception as e:
            logger.warning(f"Meta-feature extraction failed: {str(e)}")
            return None

class UltraAdvancedEnsembleEngine:
    """Ultra-advanced ensemble engine with intelligent model selection and weighting"""
    
    def __init__(self):
        self.model_registry = ModelRegistry(config_manager.config.model_path)
        self.model_selector = IntelligentModelSelector(self.model_registry)
        self.weighting_engine = DynamicWeightingEngine()
        self.meta_learner = MetaLearningEngine()
        self.feature_engineer = FeatureEngineering()
        self.loaded_models: Dict[str, Any] = {}
        self.prediction_cache = deque(maxlen=1000)
        self.performance_tracker = defaultdict(lambda: deque(maxlen=100))
        
        # Default ensemble configuration
        self.default_config = EnsembleConfiguration(
            base_models=[
                ModelType.XGBOOST, ModelType.LIGHTGBM, 
                ModelType.RANDOM_FOREST, ModelType.NEURAL_NETWORK
            ],
            meta_learner=ModelType.RANDOM_FOREST,
            weighting_strategy="dynamic",
            selection_criteria=["accuracy", "diversity", "recent_performance"],
            min_models=3,
            max_models=8,
            rebalance_frequency=24,
            performance_window=168,
            diversity_threshold=0.15,
            confidence_threshold=0.75
        )
    
    async def initialize(self):
        """Initialize the ensemble engine"""
        try:
            # Discover and register models
            await self._discover_and_register_models()
            
            # Load initial models
            await self._load_initial_models()
            
            # Start background tasks
            asyncio.create_task(self._periodic_rebalancing())
            asyncio.create_task(self._performance_monitoring())
            asyncio.create_task(self._meta_learning_updates())
            
            logger.info("Ultra-advanced ensemble engine initialized")
            
        except Exception as e:
            logger.error(f"Ensemble engine initialization failed: {str(e)}")
            raise
    
    async def predict(
        self, 
        features: Dict[str, float],
        context: PredictionContext = PredictionContext.PRE_GAME,
        ensemble_config: Optional[EnsembleConfiguration] = None
    ) -> PredictionOutput:
        """Generate ensemble prediction with intelligent model selection"""
        try:
            config = ensemble_config or self.default_config
            start_time = time.time()
            
            # Feature engineering
            engineered_features = self.feature_engineer.preprocess_features(features)
            processed_features = engineered_features.get("features", features)
            
            # Select optimal models for this context
            selected_models = await self.model_selector.select_models(
                context, processed_features, config
            )
            
            if not selected_models:
                raise ValueError("No models available for prediction")
            
            # Generate predictions from selected models
            model_predictions = await self._generate_model_predictions(
                selected_models, processed_features, context
            )
            
            # Calculate dynamic weights
            recent_predictions = list(self.prediction_cache)[-50:]  # Last 50 predictions
            model_weights = await self.weighting_engine.calculate_weights(
                selected_models, context, recent_predictions
            )
            
            # Calculate ensemble prediction
            ensemble_result = await self._calculate_ensemble_prediction(
                model_predictions, model_weights, config
            )
            
            # Apply meta-learning if available
            if "default" in self.meta_learner.meta_models:
                ensemble_result = await self._apply_meta_learning(
                    ensemble_result, model_predictions, processed_features
                )
            
            processing_time = time.time() - start_time
            
            # Create final prediction output
            prediction_output = PredictionOutput(
                model_name="ensemble",
                model_type=ModelType.RANDOM_FOREST,  # Meta-learner type
                predicted_value=ensemble_result["final_prediction"],
                confidence_interval=ensemble_result["confidence_interval"],
                prediction_probability=ensemble_result["prediction_probability"],
                feature_importance=ensemble_result["feature_importance"],
                shap_values=ensemble_result["shap_values"],
                uncertainty_metrics=ensemble_result["uncertainty_metrics"],
                model_agreement=ensemble_result["model_agreement"],
                prediction_context=context,
                metadata={
                    "selected_models": selected_models,
                    "model_weights": model_weights,
                    "ensemble_config": config.__dict__,
                    "feature_engineering_stats": engineered_features
                },
                processing_time=processing_time,
                timestamp=datetime.utcnow()
            )
            
            # Cache prediction for meta-learning
            self.prediction_cache.append({
                "timestamp": datetime.utcnow(),
                "context": context,
                "features": processed_features,
                "model_predictions": [mp.__dict__ for mp in model_predictions],
                "ensemble_prediction": prediction_output.predicted_value,
                "ensemble_confidence": prediction_output.prediction_probability,
                "model_weights": model_weights
            })
            
            return prediction_output
            
        except Exception as e:
            logger.error(f"Ensemble prediction failed: {str(e)}")
            raise
    
    async def _generate_model_predictions(
        self, 
        model_names: List[str], 
        features: Dict[str, float],
        context: PredictionContext
    ) -> List[PredictionOutput]:
        """Generate predictions from selected models"""
        predictions = []
        
        for model_name in model_names:
            try:
                model = await self._get_or_load_model(model_name)
                if model is None:
                    continue
                
                prediction = await self._predict_single_model(
                    model, model_name, features, context
                )
                if prediction:
                    predictions.append(prediction)
                    
            except Exception as e:
                logger.warning(f"Model {model_name} prediction failed: {str(e)}")
                continue
        
        return predictions
    
    async def _predict_single_model(
        self, 
        model: Any, 
        model_name: str, 
        features: Dict[str, float],
        context: PredictionContext
    ) -> Optional[PredictionOutput]:
        """Generate prediction from a single model"""
        try:
            model_info = self.model_registry.models[model_name]
            
            # Prepare feature vector
            feature_names = model_info.get("feature_names", [])
            if feature_names:
                feature_vector = [features.get(name, 0.0) for name in feature_names]
            else:
                feature_vector = list(features.values())
            
            feature_array = np.array(feature_vector).reshape(1, -1)
            
            # Make prediction
            predicted_value = float(model.predict(feature_array)[0])
            
            # Calculate confidence and uncertainty
            uncertainty_metrics = await self._calculate_uncertainty(
                model, feature_array, model_info["type"]
            )
            
            # Feature importance (if available)
            feature_importance = await self._get_feature_importance(
                model, feature_names, model_info["type"]
            )
            
            # SHAP values (simplified)
            shap_values = await self._calculate_shap_values(
                model, feature_array, feature_names
            )
            
            return PredictionOutput(
                model_name=model_name,
                model_type=ModelType(model_info["type"]),
                predicted_value=predicted_value,
                confidence_interval=(
                    predicted_value - uncertainty_metrics["std_error"],
                    predicted_value + uncertainty_metrics["std_error"]
                ),
                prediction_probability=uncertainty_metrics["confidence"],
                feature_importance=feature_importance,
                shap_values=shap_values,
                uncertainty_metrics=uncertainty_metrics,
                model_agreement=1.0,  # Will be calculated at ensemble level
                prediction_context=context,
                metadata={"model_version": model_info.get("version", "1.0.0")},
                processing_time=0.0,  # Individual model timing
                timestamp=datetime.utcnow()
            )
            
        except Exception as e:
            logger.error(f"Single model prediction failed for {model_name}: {str(e)}")
            return None
    
    async def _calculate_ensemble_prediction(
        self, 
        model_predictions: List[PredictionOutput], 
        model_weights: Dict[str, float],
        config: EnsembleConfiguration
    ) -> Dict[str, Any]:
        """Calculate final ensemble prediction with uncertainty quantification"""
        try:
            if not model_predictions:
                raise ValueError("No model predictions available")
            
            # Weighted prediction
            weighted_sum = 0.0
            total_weight = 0.0
            
            for pred in model_predictions:
                weight = model_weights.get(pred.model_name, 0.0)
                weighted_sum += pred.predicted_value * weight
                total_weight += weight
            
            if total_weight == 0:
                raise ValueError("Total weight is zero")
            
            final_prediction = weighted_sum / total_weight
            
            # Calculate ensemble confidence interval
            weighted_variances = []
            for pred in model_predictions:
                weight = model_weights.get(pred.model_name, 0.0)
                pred_variance = ((pred.confidence_interval[1] - pred.confidence_interval[0]) / 4) ** 2
                weighted_variances.append(weight * pred_variance)
            
            ensemble_variance = sum(weighted_variances) / total_weight if total_weight > 0 else 1.0
            ensemble_std = np.sqrt(ensemble_variance)
            
            confidence_interval = (
                final_prediction - 1.96 * ensemble_std,
                final_prediction + 1.96 * ensemble_std
            )
            
            # Model agreement score
            predictions_values = [p.predicted_value for p in model_predictions]
            model_agreement = 1.0 - (np.std(predictions_values) / max(np.mean(predictions_values), 1.0))
            model_agreement = max(0.0, min(1.0, model_agreement))
            
            # Ensemble confidence
            weighted_confidences = [
                model_weights.get(p.model_name, 0.0) * p.prediction_probability
                for p in model_predictions
            ]
            ensemble_confidence = sum(weighted_confidences) / total_weight if total_weight > 0 else 0.5
            
            # Aggregate feature importance
            feature_importance = defaultdict(float)
            for pred in model_predictions:
                weight = model_weights.get(pred.model_name, 0.0)
                for feature, importance in pred.feature_importance.items():
                    feature_importance[feature] += weight * importance
            
            # Normalize feature importance
            total_importance = sum(feature_importance.values())
            if total_importance > 0:
                feature_importance = {
                    k: v / total_importance for k, v in feature_importance.items()
                }
            
            # Aggregate SHAP values
            shap_values = defaultdict(float)
            for pred in model_predictions:
                weight = model_weights.get(pred.model_name, 0.0)
                for feature, shap_val in pred.shap_values.items():
                    shap_values[feature] += weight * shap_val
            
            # Uncertainty metrics
            uncertainty_metrics = {
                "prediction_std": ensemble_std,
                "model_disagreement": 1.0 - model_agreement,
                "confidence": ensemble_confidence,
                "epistemic_uncertainty": np.std(predictions_values),
                "aleatoric_uncertainty": np.mean([
                    (p.confidence_interval[1] - p.confidence_interval[0]) / 4
                    for p in model_predictions
                ])
            }
            
            return {
                "final_prediction": final_prediction,
                "confidence_interval": confidence_interval,
                "prediction_probability": ensemble_confidence,
                "feature_importance": dict(feature_importance),
                "shap_values": dict(shap_values),
                "uncertainty_metrics": uncertainty_metrics,
                "model_agreement": model_agreement
            }
            
        except Exception as e:
            logger.error(f"Ensemble calculation failed: {str(e)}")
            raise
    
    # Additional helper methods would be implemented here...
    # Including model loading, uncertainty calculation, SHAP values, etc.
    
    async def get_ensemble_health(self) -> Dict[str, Any]:
        """Get comprehensive ensemble health metrics"""
        try:
            active_models = self.model_registry.get_active_models()
            
            health_status = {
                "status": "healthy",
                "total_models": len(active_models),
                "loaded_models": len(self.loaded_models),
                "recent_predictions": len(self.prediction_cache),
                "model_health": {},
                "performance_metrics": {},
                "ensemble_config": self.default_config.__dict__
            }
            
            # Check individual model health
            for model_name in active_models[:10]:  # Check top 10 models
                try:
                    metrics = self.model_registry.model_metrics.get(model_name)
                    if metrics:
                        health_status["model_health"][model_name] = {
                            "accuracy": metrics.accuracy,
                            "confidence": metrics.model_confidence,
                            "last_updated": metrics.last_updated.isoformat(),
                            "is_loaded": model_name in self.loaded_models
                        }
                except Exception as e:
                    health_status["model_health"][model_name] = {
                        "status": "error",
                        "error": str(e)
                    }
            
            return health_status
            
        except Exception as e:
            logger.error(f"Ensemble health check failed: {str(e)}")
            return {"status": "unhealthy", "error": str(e)}

# Global instance
ultra_ensemble_engine = UltraAdvancedEnsembleEngine()
