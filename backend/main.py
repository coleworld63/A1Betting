"""
Ultra-Enhanced Main FastAPI application for A1Betting backend.

This module provides the ultimate sports betting prediction platform with:
- Ultra-advanced ensemble ML models with intelligent selection
- Real-time stream processing and prediction triggers
- Multi-source data integration with quality scoring
- Comprehensive health checks and monitoring
- Advanced WebSocket support for real-time updates
- Production-grade performance and reliability
"""

import asyncio
import logging
import os
import sys
import time
from datetime import datetime
from typing import Any, Dict, List, Optional

from fastapi import FastAPI, HTTPException, Request, Depends, BackgroundTasks, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse
from fastapi.openapi.docs import get_swagger_ui_html
from pydantic import BaseModel, Field
import uvicorn

# Add current directory to path for local imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Import ultra-enhanced systems
from config import config_manager, config, HealthStatus
from database import db_manager, get_db_session
from data_sources import ultra_data_manager, DataType, DataSourceReliability
from ensemble_engine import ultra_ensemble_engine, PredictionContext, ModelType
from realtime_engine import real_time_stream_manager, StreamType, UpdatePriority, StreamMessage
from model_service import model_service, PredictionRequest
from betting_opportunity_service import betting_opportunity_service
from monitoring_service import monitoring_service, PerformanceData

# Import enhanced legacy services for compatibility
from data_pipeline import data_pipeline, DataRequest, DataSourceType as LegacyDataSourceType
from feature_engineering import FeatureEngineering
from feature_flags import FeatureFlags, UserContext
from prediction_engine import router as prediction_router
from ws import router as websocket_router

# Configure logging
logging.basicConfig(
    level=getattr(logging, config.log_level.upper()),
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s' if config.log_format != 'json'
           else '{"timestamp": "%(asctime)s", "logger": "%(name)s", "level": "%(levelname)s", "message": "%(message)s"}',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler(config.log_file) if config.log_file else logging.NullHandler()
    ]
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app with enhanced configuration
app = FastAPI(
    title="A1Betting Ultra-Enhanced Backend",
    description="Ultimate AI-powered sports betting analytics platform with intelligent ensemble models, real-time processing, and multi-source data integration",
    version="3.0.0",
    docs_url="/docs" if config.debug else None,
    redoc_url="/redoc" if config.debug else None,
    openapi_url="/openapi.json" if config.debug else None
)

# Add middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=config.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(GZipMiddleware, minimum_size=1000)

# Request tracking middleware
@app.middleware("http")
async def track_requests(request: Request, call_next):
    start_time = time.time()

    try:
        response = await call_next(request)
        process_time = time.time() - start_time

        # Log request metrics
        logger.info({
            "event": "request_processed",
            "method": request.method,
            "url": str(request.url),
            "status_code": response.status_code,
            "process_time": process_time
        })

        # Record performance metrics
        if config.metrics_enabled:
            performance_data = PerformanceData(
                timestamp=datetime.utcnow(),
                metrics={
                    "request_duration": {
                        "value": process_time,
                        "unit": "seconds"
                    },
                    "status_code": {
                        "value": response.status_code,
                        "unit": "code"
                    }
                }
            )
            await monitoring_service.record_performance(performance_data)

        response.headers["X-Process-Time"] = str(process_time)
        return response

    except Exception as e:
        process_time = time.time() - start_time
        logger.error({
            "event": "request_error",
            "method": request.method,
            "url": str(request.url),
            "error": str(e),
            "process_time": process_time
        })
        raise

# Enhanced Pydantic models
class HealthCheckResponse(BaseModel):
    """Health check response model"""
    status: str = Field(..., description="Overall system status")
    timestamp: datetime = Field(..., description="Health check timestamp")
    version: str = Field(..., description="Application version")
    services: Dict[str, HealthStatus] = Field(..., description="Individual service statuses")
    uptime: float = Field(..., description="System uptime in seconds")

class PredictionRequestModel(BaseModel):
    """Enhanced prediction request model"""
    event_id: str = Field(..., description="Unique event identifier")
    sport: str = Field(default="basketball", description="Sport type")
    features: Dict[str, float] = Field(..., description="Input features for prediction")
    models: Optional[List[str]] = Field(None, description="Specific models to use")
    require_explanations: bool = Field(False, description="Include SHAP explanations")
    metadata: Dict[str, Any] = Field(default_factory=dict, description="Additional metadata")

class DataPipelineRequest(BaseModel):
    """Data pipeline request model"""
    source: DataSourceType = Field(..., description="Data source type")
    endpoint: str = Field(..., description="API endpoint")
    params: Dict[str, Any] = Field(default_factory=dict, description="Query parameters")
    cache_ttl: int = Field(300, description="Cache TTL in seconds")

# Application startup and shutdown events
app_start_time = time.time()

@app.on_event("startup")
async def startup_event():
    """Initialize ultra-enhanced services on startup"""
    logger.info("Starting A1Betting Ultra-Enhanced Backend v3.0...")

    try:
        # Initialize database
        await db_manager.initialize()
        logger.info("✅ Database initialized")

        # Initialize ultra data source manager
        await ultra_data_manager.initialize()
        logger.info("✅ Ultra data source manager initialized")

        # Initialize ultra ensemble engine
        await ultra_ensemble_engine.initialize()
        logger.info("✅ Ultra ensemble engine initialized")

        # Initialize real-time stream manager
        await real_time_stream_manager.initialize()
        logger.info("✅ Real-time stream manager initialized")

        # Initialize legacy data pipeline (for backward compatibility)
        await data_pipeline.initialize()
        logger.info("✅ Legacy data pipeline initialized")

        # Initialize model service
        await model_service.initialize()
        logger.info("✅ Model service initialized")

        # Initialize feature flags with enhanced features
        feature_flags = FeatureFlags.get_instance()
        feature_flags.initialize({
            'features': [
                {"id": "betting_opportunities", "enabled": True},
                {"id": "real_time_predictions", "enabled": True},
                {"id": "advanced_analytics", "enabled": True},
                {"id": "ultra_ensemble", "enabled": True},
                {"id": "multi_source_data", "enabled": True},
                {"id": "intelligent_model_selection", "enabled": True},
                {"id": "dynamic_weighting", "enabled": True},
                {"id": "real_time_streams", "enabled": True},
                {"id": "prediction_triggers", "enabled": True},
                {"id": "advanced_reconciliation", "enabled": True}
            ],
            'experiments': [
                {"id": "meta_learning", "enabled": True, "traffic_allocation": 0.1},
                {"id": "bayesian_model_selection", "enabled": True, "traffic_allocation": 0.2}
            ]
        })
        logger.info("✅ Enhanced feature flags initialized")

        logger.info("🚀 All ultra-enhanced services initialized successfully!")
        logger.info("💡 A1Betting is now running at maximum performance")

    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {str(e)}")
        raise

@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down A1Betting backend services...")

    try:
        await data_pipeline.shutdown()
        await db_manager.async_engine.dispose() if db_manager.async_engine else None
        logger.info("Services shut down successfully")
    except Exception as e:
        logger.error(f"Error during shutdown: {str(e)}")

# Health check endpoints
@app.get("/health", response_model=HealthCheckResponse)
async def health_check():
    """Comprehensive health check endpoint"""
    try:
        services = {}
        overall_status = "healthy"

        # Check database
        db_health = await db_manager.health_check()
        services["database"] = HealthStatus(
            service="database",
            status=db_health["status"],
            response_time=db_health.get("response_time", 0.0),
            error=db_health.get("error"),
            details=db_health.get("connection_pool", {})
        )

        # Check data pipeline
        pipeline_health = await data_pipeline.get_pipeline_health()
        services["data_pipeline"] = HealthStatus(
            service="data_pipeline",
            status=pipeline_health["status"],
            response_time=0.0,
            details=pipeline_health["stats"]
        )

        # Check model service
        model_health = await model_service.get_model_health()
        services["model_service"] = HealthStatus(
            service="model_service",
            status=model_health["status"],
            response_time=0.0,
            details={
                "loaded_models": model_health["loaded_models"],
                "inference_stats": model_health["inference_stats"]
            }
        )

        # Determine overall status
        service_statuses = [s.status for s in services.values()]
        if "unhealthy" in service_statuses:
            overall_status = "unhealthy"
        elif "degraded" in service_statuses:
            overall_status = "degraded"

        return HealthCheckResponse(
            status=overall_status,
            timestamp=datetime.utcnow(),
            version="2.0.0",
            services=services,
            uptime=time.time() - app_start_time
        )

    except Exception as e:
        logger.error(f"Health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail="Health check failed")

@app.get("/health/ready")
async def readiness_check():
    """Kubernetes readiness probe"""
    try:
        # Quick check for essential services
        db_health = await db_manager.health_check()
        if db_health["status"] != "healthy":
            raise HTTPException(status_code=503, detail="Database not ready")

        return {"status": "ready", "timestamp": datetime.utcnow()}
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Not ready: {str(e)}")

@app.get("/health/live")
async def liveness_check():
    """Kubernetes liveness probe"""
    return {
        "status": "alive",
        "timestamp": datetime.utcnow(),
        "uptime": time.time() - app_start_time
    }

# Ultra-Enhanced Prediction Endpoints
@app.post("/api/v3/predict/ultra")
async def predict_ultra_enhanced(
    request: PredictionRequestModel,
    background_tasks: BackgroundTasks,
    context: str = "pre_game",
    enable_meta_learning: bool = True,
    db: Any = Depends(get_db_session)
):
    """Ultra-enhanced prediction with intelligent ensemble and real-time integration"""
    try:
        # Convert context
        prediction_context = PredictionContext(context)

        # Generate ultra prediction using ensemble engine
        prediction = await ultra_ensemble_engine.predict(
            features=request.features,
            context=prediction_context
        )

        # Create real-time prediction update message
        prediction_message = StreamMessage(
            id=f"pred_{prediction.timestamp.timestamp()}",
            stream_type=StreamType.PREDICTIONS,
            priority=UpdatePriority.HIGH,
            data={
                "event_id": request.event_id,
                "prediction": prediction.predicted_value,
                "confidence": prediction.prediction_probability,
                "confidence_interval": prediction.confidence_interval,
                "model_agreement": prediction.model_agreement,
                "context": context,
                "feature_importance": prediction.feature_importance,
                "uncertainty_metrics": prediction.uncertainty_metrics
            },
            timestamp=prediction.timestamp,
            source="ultra_ensemble_engine",
            event_id=request.event_id,
            metadata={
                "models_used": prediction.metadata.get("selected_models", []),
                "model_weights": prediction.metadata.get("model_weights", {}),
                "processing_time": prediction.processing_time
            }
        )

        # Broadcast prediction update
        background_tasks.add_task(
            real_time_stream_manager.publish_message,
            prediction_message
        )

        # Schedule performance tracking
        background_tasks.add_task(
            track_prediction_performance,
            prediction,
            request.event_id
        )

        return {
            "event_id": request.event_id,
            "prediction": {
                "value": prediction.predicted_value,
                "confidence": prediction.prediction_probability,
                "confidence_interval": {
                    "lower": prediction.confidence_interval[0],
                    "upper": prediction.confidence_interval[1]
                },
                "model_agreement": prediction.model_agreement,
                "processing_time": prediction.processing_time
            },
            "ensemble": {
                "selected_models": prediction.metadata.get("selected_models", []),
                "model_weights": prediction.metadata.get("model_weights", {}),
                "selection_strategy": prediction.metadata.get("ensemble_config", {}).get("weighting_strategy", "dynamic")
            },
            "explanations": {
                "feature_importance": prediction.feature_importance,
                "shap_values": prediction.shap_values if request.require_explanations else {},
                "uncertainty_breakdown": prediction.uncertainty_metrics
            },
            "context": {
                "prediction_context": context,
                "meta_learning_applied": enable_meta_learning,
                "feature_engineering_stats": prediction.metadata.get("feature_engineering_stats", {})
            },
            "timestamp": prediction.timestamp.isoformat(),
            "version": "3.0.0"
        }

    except Exception as e:
        logger.error(f"Ultra prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Ultra prediction failed: {str(e)}")

@app.post("/api/v2/predict")
async def predict_enhanced(
    request: PredictionRequestModel,
    background_tasks: BackgroundTasks,
    db: Any = Depends(get_db_session)
):
    """Enhanced prediction endpoint with full pipeline integration (Legacy v2)"""
    try:
        # Convert to internal request format
        prediction_request = PredictionRequest(
            event_id=request.event_id,
            features=request.features,
            model_names=request.models,
            require_explanations=request.require_explanations,
            metadata={
                **request.metadata,
                "sport": request.sport,
                "timestamp": datetime.utcnow().isoformat()
            }
        )

        # Make prediction
        prediction = await model_service.predict(prediction_request)

        # Schedule background tasks
        background_tasks.add_task(
            update_model_performance_metrics,
            prediction.model_predictions
        )

        return {
            "event_id": prediction.event_id,
            "prediction": {
                "value": prediction.final_prediction,
                "confidence": prediction.ensemble_confidence,
                "processing_time": prediction.processing_time
            },
            "models": [
                {
                    "name": mp.model_name,
                    "version": mp.model_version,
                    "prediction": mp.predicted_value,
                    "confidence": mp.confidence,
                    "feature_importance": mp.feature_importance if request.require_explanations else {},
                    "shap_values": mp.shap_values if request.require_explanations else {}
                }
                for mp in prediction.model_predictions
            ],
            "feature_engineering": prediction.feature_engineering_stats,
            "timestamp": prediction.timestamp.isoformat()
        }

    except Exception as e:
        logger.error(f"Prediction failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")

# Multi-source data integration endpoints
@app.post("/api/v3/data/multi-source")
async def fetch_multi_source_data(
    data_type: str,
    entity_id: str,
    max_age_seconds: int = 300,
    quality_threshold: float = 0.7
):
    """Fetch and reconcile data from multiple sources with quality scoring"""
    try:
        # Convert data type
        data_type_enum = DataType(data_type)

        # Fetch from multiple sources
        reconciled_data = await ultra_data_manager.fetch_multi_source_data(
            data_type=data_type_enum,
            entity_id=entity_id,
            max_age_seconds=max_age_seconds
        )

        if not reconciled_data:
            raise HTTPException(status_code=404, detail="No quality data found")

        if reconciled_data.quality_metrics.confidence < quality_threshold:
            logger.warning(f"Data quality below threshold: {reconciled_data.quality_metrics.confidence}")

        return {
            "entity_id": entity_id,
            "data_type": data_type,
            "data": reconciled_data.normalized_data,
            "quality": {
                "completeness": reconciled_data.quality_metrics.completeness,
                "accuracy": reconciled_data.quality_metrics.accuracy,
                "timeliness": reconciled_data.quality_metrics.timeliness,
                "consistency": reconciled_data.quality_metrics.consistency,
                "reliability": reconciled_data.quality_metrics.reliability,
                "confidence": reconciled_data.quality_metrics.confidence,
                "anomaly_score": reconciled_data.quality_metrics.anomaly_score
            },
            "sources": {
                "primary_source": reconciled_data.source_id,
                "reliability_tier": reconciled_data.reliability_tier.value,
                "reconciliation_sources": reconciled_data.metadata.get("reconciliation_sources", [])
            },
            "timestamp": reconciled_data.timestamp.isoformat(),
            "processing_pipeline": reconciled_data.processing_pipeline
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid data type: {data_type}")
    except Exception as e:
        logger.error(f"Multi-source data fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Data pipeline endpoints
@app.post("/api/v2/data/fetch")
async def fetch_data_endpoint(request: DataPipelineRequest):
    """Fetch data from external sources"""
    try:
        data_request = DataRequest(
            source=request.source,
            endpoint=request.endpoint,
            params=request.params,
            cache_ttl=request.cache_ttl
        )

        response = await data_pipeline.fetch_data(data_request)

        return {
            "source": response.source,
            "status": response.status,
            "timestamp": response.timestamp.isoformat(),
            "latency": response.latency,
            "cache_hit": response.cache_hit,
            "data": response.data,
            "error": response.error,
            "metadata": response.metadata
        }

    except Exception as e:
        logger.error(f"Data fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Data fetch failed: {str(e)}")

@app.get("/api/v2/data/live-games")
async def get_live_games(sport: str = "basketball"):
    """Get live games from multiple data sources"""
    try:
        responses = await data_pipeline.get_live_games(sport)

        return {
            "sport": sport,
            "sources": len(responses),
            "data": [
                {
                    "source": r.source,
                    "status": r.status,
                    "data": r.data,
                    "latency": r.latency,
                    "cache_hit": r.cache_hit
                }
                for r in responses
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Live games fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Betting opportunities endpoints
@app.get("/api/v2/opportunities")
async def get_betting_opportunities():
    """Get current betting opportunities"""
    try:
        opportunities = await betting_opportunity_service.get_active_opportunities()

        return {
            "count": len(opportunities),
            "opportunities": [
                {
                    "id": opp.opportunity_id,
                    "type": opp.opportunity_type,
                    "event_id": opp.event_id,
                    "expected_value": opp.expected_value,
                    "confidence": opp.confidence,
                    "kelly_fraction": opp.kelly_fraction,
                    "risk_level": opp.risk_level,
                    "best_odds": opp.best_odds,
                    "expires_at": opp.expires_at.isoformat() if opp.expires_at else None,
                    "metadata": opp.metadata
                }
                for opp in opportunities
            ],
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Opportunities fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/opportunities/stats")
async def get_opportunity_statistics():
    """Get betting opportunity statistics"""
    try:
        stats = await betting_opportunity_service.get_opportunity_statistics()
        return {
            "statistics": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Opportunity stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Model management endpoints
@app.get("/api/v2/models")
async def get_model_status():
    """Get current model status and performance"""
    try:
        health = await model_service.get_model_health()
        return {
            "status": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Model status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v2/models/{model_name}/reload")
async def reload_model(model_name: str):
    """Reload a specific model"""
    try:
        success = await model_service.reload_model(model_name)
        if success:
            return {"status": "success", "model": model_name, "timestamp": datetime.utcnow().isoformat()}
        else:
            raise HTTPException(status_code=400, detail=f"Failed to reload model: {model_name}")
    except Exception as e:
        logger.error(f"Model reload failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Monitoring endpoints
@app.get("/api/v2/metrics")
async def get_metrics():
    """Get system performance metrics"""
    try:
        # Get various metrics
        db_health = await db_manager.health_check()
        pipeline_health = await data_pipeline.get_pipeline_health()
        model_health = await model_service.get_model_health()

        return {
            "database": db_health,
            "data_pipeline": pipeline_health,
            "model_service": model_health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Metrics fetch failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Background tasks
async def update_model_performance_metrics(model_predictions):
    """Background task to update model performance metrics"""
    try:
        # This would typically compare predictions with actual outcomes
        # For now, just log the predictions
        logger.info(f"Recording performance for {len(model_predictions)} model predictions")
    except Exception as e:
        logger.error(f"Error updating model performance: {str(e)}")

# Include legacy routers for backward compatibility
app.include_router(prediction_router, prefix="/api/v1", tags=["Legacy Predictions"])
app.include_router(websocket_router, prefix="/ws", tags=["WebSocket"])

# Custom exception handlers
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Global exception handler"""
    logger.error({
        "event": "unhandled_exception",
        "path": request.url.path,
        "method": request.method,
        "error": str(exc)
    })

    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat(),
            "path": request.url.path
        }
    )

# Main entry point
if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=config.api_host,
        port=config.api_port,
        workers=config.api_workers if not config.debug else 1,
        reload=config.debug,
        log_level=config.log_level.lower()
    )
