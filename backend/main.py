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
from risk_management import ultra_risk_engine, RiskLevel, BettingStrategy
from arbitrage_engine import ultra_arbitrage_engine, ArbitrageType, MarketInefficiencyType
from task_processor import ultra_task_processor, TaskDefinition, TaskType, TaskPriority
from cache_optimizer import ultra_cache_optimizer
from system_monitor import ultra_system_monitor, MetricType, AlertSeverity
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

        # Initialize ultra task processor
        await ultra_task_processor.initialize()
        await ultra_task_processor.start_workers(num_workers=4)
        logger.info("✅ Ultra task processor initialized with 4 workers")

        # Initialize ultra cache optimizer
        await ultra_cache_optimizer.initialize()
        logger.info("✅ Ultra cache optimizer initialized")

        # Initialize ultra system monitor
        asyncio.create_task(ultra_system_monitor.start_monitoring())
        logger.info("✅ Ultra system monitor started")

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
    """Cleanup ultra-enhanced services on shutdown"""
    logger.info("Shutting down A1Betting Ultra-Enhanced Backend...")

    try:
        # Shutdown real-time stream manager
        await real_time_stream_manager.shutdown()
        logger.info("✅ Real-time stream manager shut down")

        # Shutdown data pipeline
        await data_pipeline.shutdown()
        logger.info("✅ Data pipeline shut down")

        # Dispose database connections
        if db_manager.async_engine:
            await db_manager.async_engine.dispose()
        logger.info("✅ Database connections closed")

        logger.info("🔴 All ultra-enhanced services shut down successfully")

    except Exception as e:
        logger.error(f"❌ Error during shutdown: {str(e)}")

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

        # Check ultra ensemble engine
        ensemble_health = await ultra_ensemble_engine.get_ensemble_health()
        services["ultra_ensemble"] = HealthStatus(
            service="ultra_ensemble",
            status=ensemble_health["status"],
            response_time=0.0,
            details={
                "total_models": ensemble_health["total_models"],
                "loaded_models": ensemble_health["loaded_models"],
                "recent_predictions": ensemble_health["recent_predictions"]
            }
        )

        # Check ultra data manager
        data_manager_health = await ultra_data_manager.get_system_health()
        services["ultra_data_manager"] = HealthStatus(
            service="ultra_data_manager",
            status=data_manager_health["overall_status"],
            response_time=0.0,
            details=data_manager_health["data_sources"]
        )

        # Check real-time stream manager
        stream_health = await real_time_stream_manager.get_stream_health()
        services["realtime_streams"] = HealthStatus(
            service="realtime_streams",
            status=stream_health["status"],
            response_time=0.0,
            details={
                "active_subscribers": stream_health["active_subscribers"],
                "message_queue_size": stream_health["message_queue_size"],
                "websocket_connections": stream_health["websocket_connections"]
            }
        )

        # Check ultra risk management engine
        risk_health = await ultra_risk_engine.get_risk_management_health()
        services["ultra_risk_management"] = HealthStatus(
            service="ultra_risk_management",
            status=risk_health["status"],
            response_time=0.0,
            details={
                "kelly_engine": risk_health["kelly_engine_status"],
                "risk_assessor": risk_health["risk_assessor_status"],
                "portfolio_optimizer": risk_health["portfolio_optimizer_status"],
                "position_history_size": risk_health["position_history_size"]
            }
        )

        # Check ultra arbitrage engine
        arbitrage_health = await ultra_arbitrage_engine.get_engine_health()
        services["ultra_arbitrage"] = HealthStatus(
            service="ultra_arbitrage",
            status=arbitrage_health["status"],
            response_time=0.0,
            details={
                "opportunities_detected": arbitrage_health["performance_metrics"]["opportunities_detected"],
                "opportunity_history_size": arbitrage_health["opportunity_history_size"],
                "arbitrage_calculator": arbitrage_health["arbitrage_calculator_status"],
                "inefficiency_detector": arbitrage_health["inefficiency_detector_status"]
            }
        )

        # Check model service (legacy)
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

# Ultra Risk Management Endpoints
@app.post("/api/v3/risk/position-size")
async def calculate_optimal_position_size(
    opportunity: Dict[str, Any],
    bankroll: float,
    existing_positions: List[Dict[str, Any]] = [],
    risk_tolerance: str = "moderate"
):
    """Calculate optimal position size with comprehensive risk management"""
    try:
        risk_level = RiskLevel(risk_tolerance)

        position_size = await ultra_risk_engine.calculate_optimal_position_size(
            opportunity=opportunity,
            bankroll=bankroll,
            existing_positions=existing_positions,
            risk_tolerance=risk_level
        )

        return {
            "position_sizing": {
                "recommended_stake": position_size.recommended_stake,
                "max_stake": position_size.max_stake,
                "min_stake": position_size.min_stake,
                "kelly_stake": position_size.kelly_stake,
                "risk_adjusted_stake": position_size.risk_adjusted_stake,
                "confidence": position_size.confidence
            },
            "risk_analysis": {
                "expected_value": position_size.expected_value,
                "expected_return": position_size.expected_return,
                "risk_metrics": {
                    "value_at_risk_95": position_size.risk_metrics.value_at_risk_95,
                    "max_drawdown": position_size.risk_metrics.max_drawdown,
                    "sharpe_ratio": position_size.risk_metrics.sharpe_ratio,
                    "bankruptcy_probability": position_size.risk_metrics.bankruptcy_probability,
                    "risk_score": position_size.risk_metrics.risk_score
                }
            },
            "constraints_applied": position_size.constraints,
            "reasoning": position_size.reasoning,
            "timestamp": datetime.utcnow().isoformat()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid risk tolerance: {risk_tolerance}")
    except Exception as e:
        logger.error(f"Position sizing failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/risk/portfolio-analysis")
async def analyze_portfolio_risk(
    positions: List[Dict[str, Any]],
    bankroll: float,
    historical_returns: List[float] = []
):
    """Comprehensive portfolio risk analysis"""
    try:
        risk_metrics = await ultra_risk_engine.risk_assessor.assess_portfolio_risk(
            positions=positions,
            bankroll=bankroll,
            historical_returns=historical_returns
        )

        return {
            "portfolio_risk": {
                "overall_risk_score": risk_metrics.risk_score,
                "value_at_risk": {
                    "var_95": risk_metrics.value_at_risk_95,
                    "var_99": risk_metrics.value_at_risk_99,
                    "expected_shortfall_95": risk_metrics.expected_shortfall_95
                },
                "performance_metrics": {
                    "sharpe_ratio": risk_metrics.sharpe_ratio,
                    "sortino_ratio": risk_metrics.sortino_ratio,
                    "calmar_ratio": risk_metrics.calmar_ratio,
                    "max_drawdown": risk_metrics.max_drawdown
                },
                "risk_factors": {
                    "correlation_risk": risk_metrics.correlation_risk,
                    "liquidity_risk": risk_metrics.liquidity_risk,
                    "model_risk": risk_metrics.model_risk
                },
                "bankruptcy_analysis": {
                    "bankruptcy_probability": risk_metrics.bankruptcy_probability,
                    "time_to_ruin": risk_metrics.time_to_ruin
                },
                "kelly_analysis": {
                    "kelly_fraction": risk_metrics.kelly_fraction
                },
                "confidence_interval": {
                    "lower": risk_metrics.confidence_interval[0],
                    "upper": risk_metrics.confidence_interval[1]
                }
            },
            "recommendations": {
                "risk_level": "high" if risk_metrics.risk_score > 70 else "moderate" if risk_metrics.risk_score > 40 else "low",
                "action_required": risk_metrics.risk_score > 80,
                "diversification_needed": risk_metrics.correlation_risk > 0.6
            },
            "timestamp": risk_metrics.last_updated.isoformat()
        }

    except Exception as e:
        logger.error(f"Portfolio risk analysis failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/portfolio/optimize")
async def optimize_portfolio(
    opportunities: List[Dict[str, Any]],
    bankroll: float,
    risk_tolerance: str = "moderate",
    optimization_method: str = "mean_variance"
):
    """Advanced portfolio optimization across betting opportunities"""
    try:
        risk_level = RiskLevel(risk_tolerance)

        optimization = await ultra_risk_engine.portfolio_optimizer.optimize_portfolio(
            opportunities=opportunities,
            bankroll=bankroll,
            risk_tolerance=risk_level,
            method=optimization_method
        )

        return {
            "optimization_results": {
                "optimal_weights": optimization.optimal_weights,
                "expected_return": optimization.expected_return,
                "portfolio_variance": optimization.portfolio_variance,
                "sharpe_ratio": optimization.sharpe_ratio,
                "diversification_ratio": optimization.diversification_ratio
            },
            "risk_analysis": {
                "risk_contributions": optimization.risk_contribution,
                "marginal_risk": optimization.marginal_risk
            },
            "execution_details": {
                "optimization_method": optimization.optimization_method,
                "constraints_satisfied": optimization.constraints_satisfied,
                "objective_value": optimization.objective_value
            },
            "metadata": optimization.metadata,
            "timestamp": datetime.utcnow().isoformat()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid parameters: {str(e)}")
    except Exception as e:
        logger.error(f"Portfolio optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Ultra Arbitrage Detection Endpoints
@app.post("/api/v3/arbitrage/scan")
async def scan_arbitrage_opportunities(
    market_data: List[Dict[str, Any]],
    historical_data: Optional[List[Dict[str, Any]]] = None,
    min_profit_percentage: float = 1.0
):
    """Comprehensive arbitrage and market inefficiency scanning"""
    try:
        opportunities = await ultra_arbitrage_engine.scan_for_opportunities(
            market_data=market_data,
            historical_data=historical_data
        )

        # Filter by minimum profit
        filtered_arbitrage = [
            arb for arb in opportunities["arbitrage_opportunities"]
            if arb.profit_percentage >= min_profit_percentage
        ]

        filtered_inefficiencies = [
            ineff for ineff in opportunities["market_inefficiencies"]
            if ineff.value_bet_edge >= min_profit_percentage
        ]

        return {
            "arbitrage_opportunities": [
                {
                    "id": arb.id,
                    "type": arb.arbitrage_type.value,
                    "sportsbooks": arb.sportsbooks,
                    "event_id": arb.event_id,
                    "market_type": arb.market_type,
                    "profit_analysis": {
                        "guaranteed_profit": arb.guaranteed_profit,
                        "profit_percentage": arb.profit_percentage,
                        "roi": arb.roi,
                        "total_stake_required": arb.total_stake_required
                    },
                    "execution": {
                        "stake_distribution": arb.stake_distribution,
                        "optimal_stakes": arb.optimal_stakes,
                        "execution_window": arb.execution_window.total_seconds(),
                        "confidence_score": arb.confidence_score
                    },
                    "risk_assessment": {
                        "execution_risk": arb.execution_risk,
                        "liquidity_risk": arb.liquidity_risk,
                        "timing_risk": arb.timing_risk,
                        "credit_risk": arb.credit_risk
                    },
                    "market_data": arb.odds_data,
                    "detection_time": arb.detection_time.isoformat(),
                    "expiry_time": arb.expiry_time.isoformat() if arb.expiry_time else None
                }
                for arb in filtered_arbitrage
            ],
            "market_inefficiencies": [
                {
                    "id": ineff.id,
                    "type": ineff.inefficiency_type.value,
                    "event_id": ineff.event_id,
                    "market_type": ineff.market_type,
                    "sportsbook": ineff.sportsbook,
                    "pricing_analysis": {
                        "market_price": ineff.market_price,
                        "fair_value": ineff.fair_value,
                        "mispricing_magnitude": ineff.mispricing_magnitude,
                        "value_bet_edge": ineff.value_bet_edge
                    },
                    "statistical_analysis": {
                        "z_score": ineff.z_score,
                        "confidence_interval": {
                            "lower": ineff.confidence_interval[0],
                            "upper": ineff.confidence_interval[1]
                        },
                        "statistical_significance": ineff.statistical_significance,
                        "sample_size": ineff.sample_size
                    },
                    "market_context": {
                        "market_volume": ineff.market_volume,
                        "liquidity_score": ineff.liquidity_score,
                        "public_betting_percentage": ineff.public_betting_percentage,
                        "sharp_money_percentage": ineff.sharp_money_percentage,
                        "line_movement_direction": ineff.line_movement_direction
                    },
                    "betting_recommendation": {
                        "expected_value": ineff.expected_value,
                        "kelly_fraction": ineff.kelly_fraction,
                        "recommended_stake": ineff.recommended_stake,
                        "max_stake": ineff.max_stake
                    },
                    "risk_assessment": {
                        "model_uncertainty": ineff.model_uncertainty,
                        "information_risk": ineff.information_risk,
                        "execution_risk": ineff.execution_risk
                    },
                    "timing": {
                        "detection_time": ineff.detection_time.isoformat(),
                        "window_expiry": ineff.window_expiry.isoformat() if ineff.window_expiry else None,
                        "urgency_score": ineff.urgency_score
                    },
                    "metadata": ineff.metadata
                }
                for ineff in filtered_inefficiencies
            ],
            "summary": {
                "total_arbitrage_opportunities": len(filtered_arbitrage),
                "total_market_inefficiencies": len(filtered_inefficiencies),
                "best_arbitrage_profit": max([arb.profit_percentage for arb in filtered_arbitrage], default=0),
                "best_inefficiency_edge": max([ineff.value_bet_edge for ineff in filtered_inefficiencies], default=0),
                "total_opportunities": len(filtered_arbitrage) + len(filtered_inefficiencies)
            },
            "scan_metadata": {
                "scan_timestamp": opportunities["scan_timestamp"],
                "markets_analyzed": len(market_data),
                "historical_data_points": len(historical_data) if historical_data else 0,
                "min_profit_filter": min_profit_percentage
            }
        }

    except Exception as e:
        logger.error(f"Arbitrage scan failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/arbitrage/health")
async def get_arbitrage_engine_health():
    """Get arbitrage engine health and performance metrics"""
    try:
        health = await ultra_arbitrage_engine.get_engine_health()
        return {
            "arbitrage_engine_health": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Arbitrage engine health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/risk/health")
async def get_risk_management_health():
    """Get risk management engine health"""
    try:
        health = await ultra_risk_engine.get_risk_management_health()
        return {
            "risk_management_health": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Risk management health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Ultra Task Processing Endpoints
@app.post("/api/v3/tasks/submit")
async def submit_background_task(
    task_type: str,
    function_name: str,
    priority: str = "medium",
    args: List[Any] = [],
    kwargs: Dict[str, Any] = {},
    timeout_seconds: int = 300,
    max_retries: int = 3
):
    """Submit background task for processing"""
    try:
        # Convert string values to enums
        task_type_enum = TaskType(task_type)
        priority_enum = TaskPriority[priority.upper()]

        # Create task definition
        task = TaskDefinition(
            id=f"api_task_{int(time.time())}_{hash(function_name)}",
            task_type=task_type_enum,
            priority=priority_enum,
            function_name=function_name,
            args=args,
            kwargs=kwargs,
            timeout_seconds=timeout_seconds,
            max_retries=max_retries,
            created_by="api"
        )

        # Submit task
        task_id = await ultra_task_processor.submit_task(task)

        return {
            "task_id": task_id,
            "status": "submitted",
            "estimated_completion": (datetime.utcnow() + timedelta(seconds=timeout_seconds)).isoformat(),
            "timestamp": datetime.utcnow().isoformat()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid task parameters: {str(e)}")
    except Exception as e:
        logger.error(f"Task submission failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/tasks/{task_id}/result")
async def get_task_result(task_id: str):
    """Get background task result"""
    try:
        result = await ultra_task_processor.get_task_result(task_id)

        if result is None:
            raise HTTPException(status_code=404, detail="Task not found or still processing")

        return {
            "task_id": task_id,
            "status": result.status.value,
            "result": result.result,
            "error": result.error,
            "execution_time": result.execution_time,
            "started_at": result.started_at.isoformat() if result.started_at else None,
            "completed_at": result.completed_at.isoformat() if result.completed_at else None,
            "worker_info": {
                "worker_id": result.worker_id,
                "worker_node": result.worker_node
            },
            "retry_info": {
                "attempt_number": result.attempt_number,
                "retry_count": result.retry_count
            },
            "resource_usage": {
                "cpu_usage": result.cpu_usage,
                "memory_usage": result.memory_usage
            }
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Task result retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/tasks/stats")
async def get_task_system_stats():
    """Get comprehensive task system statistics"""
    try:
        stats = await ultra_task_processor.get_system_stats()
        return {
            "task_system_stats": stats,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Task system stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Ultra Cache System Endpoints
@app.get("/api/v3/cache/stats")
async def get_cache_system_stats():
    """Get comprehensive cache system statistics"""
    try:
        health = await ultra_cache_optimizer.get_system_health()
        return {
            "cache_system_health": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Cache system stats failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/cache/warm")
async def warm_cache_patterns(patterns: Optional[List[str]] = None):
    """Trigger cache warming for specified patterns"""
    try:
        await ultra_cache_optimizer.cache_warmer.warm_cache(patterns)
        return {
            "status": "cache_warming_triggered",
            "patterns": patterns or "all_registered_patterns",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Cache warming failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/cache/optimize")
async def optimize_cache_performance():
    """Trigger cache performance optimization"""
    try:
        await ultra_cache_optimizer.optimize_cache_performance()
        return {
            "status": "cache_optimization_completed",
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Cache optimization failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/v3/cache/clear")
async def clear_cache(pattern: str = "*"):
    """Clear cache entries matching pattern"""
    try:
        await ultra_cache_optimizer.cache.clear(pattern)
        return {
            "status": "cache_cleared",
            "pattern": pattern,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Cache clear failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Ultra System Monitoring Endpoints
@app.get("/api/v3/monitoring/status")
async def get_comprehensive_system_status():
    """Get comprehensive system monitoring status"""
    try:
        status = await ultra_system_monitor.get_comprehensive_status()
        return {
            "system_status": status,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"System status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/monitoring/alerts")
async def get_active_alerts():
    """Get active system alerts"""
    try:
        alerts = []
        for alert in ultra_system_monitor.alert_manager.active_alerts.values():
            alerts.append({
                "id": alert.id,
                "severity": alert.severity.name,
                "title": alert.title,
                "description": alert.description,
                "metric_type": alert.metric_type.value,
                "threshold_value": alert.threshold_value,
                "actual_value": alert.actual_value,
                "created_at": alert.created_at.isoformat(),
                "acknowledged": alert.acknowledged_at is not None,
                "acknowledged_by": alert.acknowledged_by,
                "escalated": alert.escalated,
                "metadata": alert.metadata
            })

        return {
            "active_alerts": alerts,
            "total_alerts": len(alerts),
            "alert_statistics": ultra_system_monitor.alert_manager.get_alert_statistics(),
            "timestamp": datetime.utcnow().isoformat()
        }

    except Exception as e:
        logger.error(f"Active alerts retrieval failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/v3/monitoring/alerts/{alert_id}/acknowledge")
async def acknowledge_alert(alert_id: str, acknowledged_by: str = "api_user"):
    """Acknowledge a system alert"""
    try:
        success = await ultra_system_monitor.alert_manager.acknowledge_alert(alert_id, acknowledged_by)

        if not success:
            raise HTTPException(status_code=404, detail="Alert not found")

        return {
            "status": "alert_acknowledged",
            "alert_id": alert_id,
            "acknowledged_by": acknowledged_by,
            "timestamp": datetime.utcnow().isoformat()
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Alert acknowledgment failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/monitoring/metrics/{metric_type}")
async def get_metric_statistics(metric_type: str, duration_minutes: int = 60):
    """Get statistics for specific metric type"""
    try:
        metric_type_enum = MetricType(metric_type)
        stats = ultra_system_monitor.metrics_collector.get_metric_statistics(
            metric_type_enum, duration_minutes
        )

        return {
            "metric_type": metric_type,
            "duration_minutes": duration_minutes,
            "statistics": stats,
            "timestamp": datetime.utcnow().isoformat()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid metric type: {metric_type}")
    except Exception as e:
        logger.error(f"Metric statistics failed: {str(e)}")
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

# Real-time Stream Endpoints
@app.websocket("/ws/v3/stream")
async def websocket_stream_endpoint(websocket: WebSocket):
    """Ultra-enhanced WebSocket endpoint for real-time streams"""
    await websocket.accept()

    subscriber_id = f"ws_{int(time.time())}_{id(websocket)}"

    try:
        # Initial handshake
        await websocket.send_json({
            "type": "connection_established",
            "subscriber_id": subscriber_id,
            "available_streams": [stream.value for stream in StreamType],
            "timestamp": datetime.utcnow().isoformat()
        })

        # Wait for subscription request
        subscription_data = await websocket.receive_json()

        if subscription_data.get("type") != "subscribe":
            await websocket.send_json({"error": "Expected subscription message"})
            return

        # Parse subscription
        stream_types = [StreamType(st) for st in subscription_data.get("streams", [])]
        filters = subscription_data.get("filters", {})

        # Subscribe to streams
        success = await real_time_stream_manager.subscribe(
            subscriber_id=subscriber_id,
            stream_types=stream_types,
            filters=filters,
            websocket=websocket
        )

        if not success:
            await websocket.send_json({"error": "Subscription failed"})
            return

        await websocket.send_json({
            "type": "subscription_confirmed",
            "streams": [st.value for st in stream_types],
            "filters": filters,
            "timestamp": datetime.utcnow().isoformat()
        })

        # Keep connection alive
        while True:
            try:
                # Send heartbeat every 30 seconds
                await asyncio.sleep(30)
                await websocket.send_json({
                    "type": "heartbeat",
                    "timestamp": datetime.utcnow().isoformat()
                })
            except Exception:
                break

    except Exception as e:
        logger.error(f"WebSocket stream error: {str(e)}")
    finally:
        # Cleanup subscription
        await real_time_stream_manager.unsubscribe(subscriber_id)

@app.post("/api/v3/stream/publish")
async def publish_stream_message(
    stream_type: str,
    data: Dict[str, Any],
    priority: str = "medium",
    event_id: Optional[str] = None
):
    """Publish message to real-time stream"""
    try:
        message = StreamMessage(
            id=f"api_{int(time.time())}_{hash(str(data))}",
            stream_type=StreamType(stream_type),
            priority=UpdatePriority(priority),
            data=data,
            timestamp=datetime.utcnow(),
            source="api",
            event_id=event_id
        )

        await real_time_stream_manager.publish_message(message)

        return {
            "message_id": message.id,
            "published": True,
            "timestamp": message.timestamp.isoformat()
        }

    except ValueError as e:
        raise HTTPException(status_code=400, detail=f"Invalid stream type or priority: {str(e)}")
    except Exception as e:
        logger.error(f"Stream publish failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v3/stream/health")
async def get_stream_health():
    """Get real-time stream system health"""
    try:
        health = await real_time_stream_manager.get_stream_health()
        return {
            "stream_health": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Stream health check failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

# Model management endpoints
@app.get("/api/v3/models/ensemble")
async def get_ensemble_status():
    """Get ultra ensemble engine status and performance"""
    try:
        health = await ultra_ensemble_engine.get_ensemble_health()
        return {
            "ensemble_status": health,
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        logger.error(f"Ensemble status failed: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v2/models")
async def get_model_status():
    """Get current model status and performance (Legacy v2)"""
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

# Ultra Background Tasks
async def track_prediction_performance(prediction, event_id: str):
    """Track prediction performance for ensemble learning"""
    try:
        # Store prediction for later performance analysis
        async with db_manager.get_session() as session:
            # This would store prediction details for outcome comparison
            logger.info(f"Tracking prediction performance for event {event_id}")
    except Exception as e:
        logger.error(f"Error tracking prediction performance: {str(e)}")

async def update_model_performance_metrics(model_predictions):
    """Background task to update model performance metrics (Legacy)"""
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
