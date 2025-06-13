"""
Main FastAPI application for UltimateSportsBettingApp backend.

This module provides the main FastAPI application with prediction engine,
feature engineering, and analytics capabilities.
"""
import logging
import os
import sys
from typing import Any, Dict

from fastapi import FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, ConfigDict

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import local services
from feature_engineering import FeatureEngineering
from feature_flags import FeatureFlags, UserContext
from feature_registry import FeatureRegistry
from prediction_engine import router as prediction_router
from unified_feature_service import UnifiedFeatureService

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="Alpha1 AI Sports Betting Backend",
    description="Advanced AI-powered sports betting analytics platform",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Initialize services
logger.info("Initializing backend services...")
registry = FeatureRegistry()
feature_engineer = FeatureEngineering()
unified_service = UnifiedFeatureService()

# Initialize feature flags
feature_flags = FeatureFlags.get_instance()
feature_flags.initialize({
    'features': [],  # Populate with real features in production
    'experiments': []  # Populate with real experiments in production
})

# Placeholder for ML model (will be replaced with actual models in Phase 2)
model = None


def features_to_array(features: Dict[str, float]) -> list:
    """Convert feature dictionary to array for model input."""
    import numpy as np
    return np.array([list(features.values())])


# Pydantic schemas with improved configuration
class InputData(BaseModel):
    """Input data model for feature extraction and prediction."""
    
    model_config = ConfigDict(
        protected_namespaces=(),
        json_schema_extra={
            "example": {
                "game_id": 12345,
                "team_stats": {"score": 100.0, "field_goal_pct": 0.45},
                "player_stats": {"points": 25.0, "assists": 8.0}
            }
        }
    )
    
    game_id: int
    team_stats: Dict[str, float]
    player_stats: Dict[str, float]


class FeaturesResponse(BaseModel):
    """Response model for feature extraction."""
    
    model_config = ConfigDict(protected_namespaces=())
    
    features: Dict[str, float]


class PredictionResponse(BaseModel):
    """Response model for predictions."""
    
    model_config = ConfigDict(protected_namespaces=())
    
    prediction: float

@app.post("/features", response_model=FeaturesResponse)
async def get_features(input_data: InputData):
    try:
        raw_dict = input_data.dict()
        # For demo, just flatten team_stats and player_stats
        features = {**raw_dict.get('team_stats', {}), **raw_dict.get('player_stats', {})}
        # Optionally, use unified_service.process_features(raw_dict)
        return FeaturesResponse(features=features)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/predict", response_model=PredictionResponse)
async def predict(input_data: InputData):
    try:
        raw_dict = input_data.dict()
        features = {**raw_dict.get('team_stats', {}), **raw_dict.get('player_stats', {})}
        if model is None:
            raise RuntimeError("Model not loaded")
        feature_array = features_to_array(features)
        prediction_value = model.predict(feature_array).item()
        return PredictionResponse(prediction=prediction_value)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feature-flag-enabled")
async def feature_flag_enabled(request: Request):
    data = await request.json()
    feature_id = data.get("feature_id")
    user_id = data.get("user_id")
    user_groups = data.get("user_groups", [])
    attributes = data.get("attributes", {})
    context = UserContext(user_id, user_groups, attributes)
    enabled = feature_flags.is_feature_enabled(feature_id, context)
    return JSONResponse({"enabled": enabled})

# Example endpoint for experiment variant assignment
@app.post("/experiment-variant")
async def experiment_variant(request: Request):
    data = await request.json()
    experiment_id = data.get("experiment_id")
    user_id = data.get("user_id")
    user_groups = data.get("user_groups", [])
    attributes = data.get("attributes", {})
    context = UserContext(user_id, user_groups, attributes)
    variant = feature_flags.get_experiment_variant(experiment_id, context)
    return JSONResponse({"variant": variant})

app.include_router(prediction_router)

# Placeholder for SHAP/explanation endpoint (to be added next)
