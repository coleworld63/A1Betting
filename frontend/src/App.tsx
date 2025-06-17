import React, {
  Suspense,
  lazy,
  useMemo,
  useCallback,
  ErrorInfo,
  Component,
  useState,
  useEffect,
} from "react";
import Dashboard from "./components/Dashboard.tsx";
import PremiumDashboard from "./components/dashboard/PremiumDashboard.tsx";
import PrizePicksPageEnhanced from "./pages/PrizePicksPageEnhanced.tsx";
import { MLPredictions } from "./components/MLPredictions.tsx";
import PerformanceMonitor from "./components/PerformanceMonitor.tsx";
import WebSocketSecurityDashboard from "./components/WebSocketSecurityDashboard.tsx";

// Core Money-Making Components
import UltimateMoneyMaker from "./components/betting/UltimateMoneyMaker.tsx";
import MoneyMakerAdvanced from "./components/MoneyMaker/MoneyMakerAdvanced.tsx";
import UltimateMoneyMakerEnhanced from "./components/UltimateMoneyMakerEnhanced.tsx";

// Enhanced Design System
import {
  Button,
  Card,
  Badge,
  Spinner,
} from "./components/ui/design-system.tsx";
import { cn } from "./lib/utils.ts";

// TypeScript interfaces
interface NavigationItem {
  href: string;
  label: string;
  color: string;
}

interface NavigationGroup {
  group: string;
  items: NavigationItem[];
}

interface LoadingFallbackProps {
  message?: string;
}

interface RouteErrorBoundaryProps {
  children: React.ReactNode;
  routeName: string;
}

interface RouteErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface SuspenseWrapperProps {
  children: React.ReactNode;
  loadingMessage?: string;
}

interface RouteWrapperProps {
  children: React.ReactNode;
  routeName: string;
}

// Enhanced Loading Component with Design System
const LoadingFallback: React.FC<LoadingFallbackProps> = ({
  message = "Loading...",
}) => (
  <div
    className="flex-center flex-col h-64 space-y-6"
    role="status"
    aria-live="polite"
  >
    <Spinner variant="brand" size="xl" />
    <div className="text-gray-600 dark:text-gray-300 font-medium text-lg">
      {message}
    </div>
    <div className="flex space-x-1">
      <div
        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
        style={{ animationDelay: "0ms" }}
      />
      <div
        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
        style={{ animationDelay: "150ms" }}
      />
      <div
        className="w-2 h-2 bg-brand-500 rounded-full animate-bounce"
        style={{ animationDelay: "300ms" }}
      />
    </div>
  </div>
);

// Enhanced Error Boundary
class RouteErrorBoundary extends Component<
  RouteErrorBoundaryProps,
  RouteErrorBoundaryState
> {
  constructor(props: RouteErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error(`Error in route ${this.props.routeName}:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Card
          variant="premium"
          className="flex-center flex-col h-64 space-y-6 text-center max-w-md mx-auto"
        >
          <div className="text-6xl animate-bounce">⚠️</div>
          <div className="space-y-3">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Component Error
            </h2>
            <p className="text-gray-600 dark:text-gray-300">
              There was an error loading the {this.props.routeName} component.
            </p>
          </div>
          <Button
            variant="premium"
            onClick={() => window.location.reload()}
            aria-label="Reload page to fix error"
            className="min-w-32"
          >
            Reload Page
          </Button>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Lazy-loaded Advanced Components with optimized loading
const AdvancedMLDashboard = lazy(() =>
  import("./components/MoneyMaker/AdvancedMLDashboard.tsx").then((m) => ({
    default: m.AdvancedMLDashboard,
  })),
);
const HyperMLInsights = lazy(
  () => import("./components/analytics/HyperMLInsights.tsx"),
);
const EvolutionaryInsights = lazy(
  () => import("./components/analytics/EvolutionaryInsights.tsx"),
);
const RealTimeDataStream = lazy(
  () => import("./components/realtime/RealTimeDataStream.tsx"),
);
const UnifiedDashboard = lazy(() =>
  import("./components/dashboard/UnifiedDashboard.tsx").then((m) => ({
    default: m.UnifiedDashboard,
  })),
);
const UnifiedBettingInterface = lazy(
  () => import("./components/betting/UnifiedBettingInterface.tsx"),
);
const WhatIfSimulator = lazy(
  () => import("./components/advanced/WhatIfSimulator.tsx"),
);
const SmartLineupBuilder = lazy(() =>
  import("./components/lineup/SmartLineupBuilder.tsx").then((m) => ({
    default: m.SmartLineupBuilder,
  })),
);
const MarketAnalysisDashboard = lazy(() =>
  import("./components/MarketAnalysisDashboard.tsx").then((m) => ({
    default: m.MarketAnalysisDashboard,
  })),
);
const MLModelCenter = lazy(() =>
  import("./components/ml/MLModelCenter.tsx").then((m) => ({
    default: m.MLModelCenter,
  })),
);
const UnifiedPredictionInterface = lazy(() =>
  import("./components/prediction/UnifiedPredictionInterface.tsx").then(
    (m) => ({ default: m.UnifiedPredictionInterface }),
  ),
);
const UnifiedSettingsInterface = lazy(() =>
  import("./components/settings/UnifiedSettingsInterface.tsx").then((m) => ({
    default: m.UnifiedSettingsInterface,
  })),
);
const UnifiedProfile = lazy(() =>
  import("./components/profile/UnifiedProfile.tsx").then((m) => ({
    default: m.UnifiedProfile,
  })),
);
const ArbitrageOpportunities = lazy(
  () => import("./components/ArbitrageOpportunities.tsx"),
);
const AdvancedAnalytics = lazy(() =>
  import("./components/analytics/AdvancedAnalytics.tsx").then((m) => ({
    default: m.AdvancedAnalytics,
  })),
);
const PerformanceAnalyticsDashboard = lazy(
  () => import("./components/analytics/PerformanceAnalyticsDashboard.tsx"),
);
const AdvancedAnalyticsHub = lazy(
  () => import("./components/analytics/AdvancedAnalyticsHub.tsx"),
);
const MobileOptimizedInterface = lazy(
  () => import("./components/mobile/MobileOptimizedInterface.tsx"),
);

// Navigation configuration for better maintainability
const navigationConfig: NavigationGroup[] = [
  {
    group: "Core",
    items: [
      {
        href: "#/",
        label: "🏠 Premium Dashboard",
        color: "text-gray-900 dark:text-gray-100",
      },
      {
        href: "#/prizepicks-enhanced",
        label: "🎯 PrizePicks Pro",
        color: "text-indigo-600",
      },
    ],
  },
  {
    group: "Money Making Suite",
    items: [
      {
        href: "#/money-maker",
        label: "💰 Money Maker",
        color: "text-blue-600",
      },
      {
        href: "#/money-maker-advanced",
        label: "🚀 Advanced",
        color: "text-green-600",
      },
      {
        href: "#/money-maker-enhanced",
        label: "⚡ Enhanced",
        color: "text-purple-600",
      },
    ],
  },
  {
    group: "Advanced ML Suite",
    items: [
      {
        href: "#/advanced-ml",
        label: "🧠 Advanced ML",
        color: "text-indigo-600",
      },
      { href: "#/hyper-ml", label: "🔥 Hyper ML", color: "text-pink-600" },
      {
        href: "#/evolutionary",
        label: "🧬 Evolutionary",
        color: "text-orange-600",
      },
      { href: "#/ml-center", label: "🎯 ML Center", color: "text-cyan-600" },
    ],
  },
  {
    group: "Ultra-Accuracy Suite",
    items: [
      {
        href: "#/ultra-ml-dashboard",
        label: "🎯 Ultra ML Dashboard",
        color: "text-purple-600",
      },
      {
        href: "#/confidence-visualizer",
        label: "📊 Confidence Analysis",
        color: "text-blue-600",
      },
      {
        href: "#/accuracy-monitor",
        label: "🔍 Real-time Monitor",
        color: "text-green-600",
      },
      {
        href: "#/quantum-predictions",
        label: "⚛️ Quantum Predictions",
        color: "text-violet-600",
      },
    ],
  },
  {
    group: "Analytics & Real-time",
    items: [
      { href: "#/analytics", label: "📊 Analytics", color: "text-emerald-600" },
      {
        href: "#/analytics-hub",
        label: "🚀 Analytics Hub",
        color: "text-purple-600",
      },
      {
        href: "#/performance",
        label: "📈 Performance",
        color: "text-blue-600",
      },
      { href: "#/real-time", label: "⚡ Real-time", color: "text-red-600" },
      {
        href: "#/market-analysis",
        label: "📈 Market Analysis",
        color: "text-teal-600",
      },
    ],
  },
  {
    group: "Mobile & PWA",
    items: [
      {
        href: "#/mobile",
        label: "📱 Mobile Experience",
        color: "text-pink-600",
      },
    ],
  },
  {
    group: "Unified Interfaces",
    items: [
      {
        href: "#/unified-dashboard",
        label: "🌟 Unified Dashboard",
        color: "text-violet-600",
      },
      {
        href: "#/unified-betting",
        label: "🎲 Unified Betting",
        color: "text-amber-600",
      },
      {
        href: "#/unified-predictions",
        label: "🔮 Unified Predictions",
        color: "text-lime-600",
      },
    ],
  },
  {
    group: "Advanced Tools",
    items: [
      {
        href: "#/what-if",
        label: "🔬 What-If Simulator",
        color: "text-slate-600",
      },
      {
        href: "#/lineup-builder",
        label: "🏗️ Lineup Builder",
        color: "text-stone-600",
      },
      { href: "#/arbitrage", label: "⚖️ Arbitrage", color: "text-rose-600" },
    ],
  },
  {
    group: "User & Core Features",
    items: [
      { href: "#/profile", label: "👤 Profile", color: "text-blue-500" },
      { href: "#/settings", label: "⚙️ Settings", color: "text-gray-600" },
      {
        href: "#/ml-predictions",
        label: "🧠 ML Predictions",
        color: "text-indigo-600",
      },
      { href: "#/security", label: "🔒 Security", color: "text-red-600" },
    ],
  },
];

// Route wrapper with error boundary and loading
const RouteWrapper: React.FC<RouteWrapperProps> = ({ children, routeName }) => (
  <RouteErrorBoundary routeName={routeName}>{children}</RouteErrorBoundary>
);

// Suspense wrapper with custom loading
const SuspenseWrapper: React.FC<SuspenseWrapperProps> = ({
  children,
  loadingMessage,
}) => (
  <Suspense fallback={<LoadingFallback message={loadingMessage} />}>
    {children}
  </Suspense>
);

const App: React.FC = () => {
  // State-based routing for better performance and reactivity
  const [currentPath, setCurrentPath] = useState(
    () => window.location.hash.slice(1) || "/",
  );
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Listen for hash changes to update current path
  useEffect(() => {
    const handleHashChange = () => {
      setIsTransitioning(true);
      const startTime = performance.now();

      // Small delay for smooth transitions
      setTimeout(() => {
        setCurrentPath(window.location.hash.slice(1) || "/");
        setIsTransitioning(false);

        // Performance monitoring in development
        if (process.env.NODE_ENV === "development") {
          const loadTime = performance.now() - startTime;
          console.debug(
            `Route transition completed in ${loadTime.toFixed(2)}ms`,
          );
        }
      }, 150);
    };

    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  // Callback for navigation to avoid re-renders
  const handleNavigation = useCallback((href: string) => {
    window.location.hash = href;
  }, []);

  // Keyboard navigation support
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent, href: string) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleNavigation(href);
      }
    },
    [handleNavigation],
  );

  // Route prefetching for performance optimization
  const prefetchRoute = useCallback(async (route: string) => {
    // Only prefetch in production or when explicitly enabled
    if (process.env.NODE_ENV !== "development") {
      try {
        switch (route) {
          case "/advanced-ml":
            await import("./components/MoneyMaker/AdvancedMLDashboard.tsx");
            break;
          case "/hyper-ml":
            await import("./components/analytics/HyperMLInsights.tsx");
            break;
          case "/evolutionary":
            await import("./components/analytics/EvolutionaryInsights.tsx");
            break;
          case "/real-time":
            await import("./components/realtime/RealTimeDataStream.tsx");
            break;
          case "/unified-dashboard":
            await import("./components/dashboard/UnifiedDashboard.tsx");
            break;
          case "/unified-betting":
            await import("./components/betting/UnifiedBettingInterface.tsx");
            break;
          case "/what-if":
            await import("./components/advanced/WhatIfSimulator.tsx");
            break;
          case "/lineup-builder":
            await import("./components/lineup/SmartLineupBuilder.tsx");
            break;
          case "/market-analysis":
            await import("./components/MarketAnalysisDashboard.tsx");
            break;
          case "/ml-center":
            await import("./components/ml/MLModelCenter.tsx");
            break;
          case "/unified-predictions":
            await import(
              "./components/prediction/UnifiedPredictionInterface.tsx"
            );
            break;
          case "/settings":
            await import("./components/settings/UnifiedSettingsInterface.tsx");
            break;
          case "/profile":
            await import("./components/profile/UnifiedProfile.tsx");
            break;
          case "/arbitrage":
            await import("./components/ArbitrageOpportunities.tsx");
            break;
          case "/analytics":
            await import("./components/analytics/AdvancedAnalytics.tsx");
            break;
          case "/performance":
            await import(
              "./components/analytics/PerformanceAnalyticsDashboard.tsx"
            );
            break;
          case "/analytics-hub":
            await import("./components/analytics/AdvancedAnalyticsHub.tsx");
            break;
          case "/mobile":
            await import("./components/mobile/MobileOptimizedInterface.tsx");
            break;
          default:
            // No prefetching for unknown routes
            break;
        }
      } catch (error) {
        // Silently fail prefetching - component will load normally when navigated to
        console.debug("Prefetch failed for route:", route, error);
      }
    }
  }, []);

  const renderComponent = useCallback(() => {
    switch (currentPath) {
      // Core Money Makers
      case "/money-maker":
        return (
          <RouteWrapper routeName="Money Maker">
            <UltimateMoneyMaker />
          </RouteWrapper>
        );
      case "/money-maker-advanced":
        return (
          <RouteWrapper routeName="Advanced Money Maker">
            <MoneyMakerAdvanced />
          </RouteWrapper>
        );
      case "/money-maker-enhanced":
        return (
          <RouteWrapper routeName="Enhanced Money Maker">
            <UltimateMoneyMakerEnhanced />
          </RouteWrapper>
        );

      // Advanced ML & Analytics
      case "/advanced-ml":
        return (
          <RouteWrapper routeName="Advanced ML Dashboard">
            <SuspenseWrapper loadingMessage="Loading Advanced ML Dashboard...">
              <AdvancedMLDashboard models={[]} />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/hyper-ml":
        return (
          <RouteWrapper routeName="Hyper ML Insights">
            <SuspenseWrapper loadingMessage="Loading Hyper ML Insights...">
              <HyperMLInsights />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/evolutionary":
        return (
          <RouteWrapper routeName="Evolutionary Insights">
            <SuspenseWrapper loadingMessage="Loading Evolutionary Analytics...">
              <EvolutionaryInsights />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/analytics":
        return (
          <RouteWrapper routeName="Advanced Analytics">
            <SuspenseWrapper loadingMessage="Loading Analytics Dashboard...">
              <AdvancedAnalytics />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/performance":
        return (
          <RouteWrapper routeName="Performance Analytics">
            <SuspenseWrapper loadingMessage="Loading Performance Analytics...">
              <PerformanceAnalyticsDashboard />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/analytics-hub":
        return (
          <RouteWrapper routeName="Analytics Hub">
            <SuspenseWrapper loadingMessage="Loading Analytics Hub...">
              <AdvancedAnalyticsHub />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/mobile":
        return (
          <RouteWrapper routeName="Mobile Interface">
            <SuspenseWrapper loadingMessage="Loading Mobile Experience...">
              <MobileOptimizedInterface />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // Real-time & Live Data
      case "/real-time":
        return (
          <RouteWrapper routeName="Real-time Data">
            <SuspenseWrapper loadingMessage="Connecting to Real-time Data Stream...">
              <RealTimeDataStream />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // Unified Interfaces
      case "/unified-dashboard":
        return (
          <RouteWrapper routeName="Unified Dashboard">
            <SuspenseWrapper loadingMessage="Loading Unified Dashboard...">
              <UnifiedDashboard />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/unified-betting":
        return (
          <RouteWrapper routeName="Unified Betting">
            <SuspenseWrapper loadingMessage="Loading Betting Interface...">
              <UnifiedBettingInterface />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/unified-predictions":
        return (
          <RouteWrapper routeName="Unified Predictions">
            <SuspenseWrapper loadingMessage="Loading Prediction Interface...">
              <UnifiedPredictionInterface />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // Advanced Tools & Simulators
      case "/what-if":
        return (
          <RouteWrapper routeName="What-If Simulator">
            <SuspenseWrapper loadingMessage="Loading What-If Simulator...">
              <WhatIfSimulator />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/lineup-builder":
        return (
          <RouteWrapper routeName="Lineup Builder">
            <SuspenseWrapper loadingMessage="Loading Lineup Builder...">
              <SmartLineupBuilder onLineupSubmit={() => {}} />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/market-analysis":
        return (
          <RouteWrapper routeName="Market Analysis">
            <SuspenseWrapper loadingMessage="Loading Market Analysis...">
              <MarketAnalysisDashboard eventId="sample-event" />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/arbitrage":
        return (
          <RouteWrapper routeName="Arbitrage Opportunities">
            <SuspenseWrapper loadingMessage="Loading Arbitrage Opportunities...">
              <ArbitrageOpportunities />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // Model Management
      case "/ml-center":
        return (
          <RouteWrapper routeName="ML Model Center">
            <SuspenseWrapper loadingMessage="Loading ML Model Center...">
              <MLModelCenter />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // User Management
      case "/profile":
        return (
          <RouteWrapper routeName="User Profile">
            <SuspenseWrapper loadingMessage="Loading Profile...">
              <UnifiedProfile />
            </SuspenseWrapper>
          </RouteWrapper>
        );
      case "/settings":
        return (
          <RouteWrapper routeName="Settings">
            <SuspenseWrapper loadingMessage="Loading Settings...">
              <UnifiedSettingsInterface />
            </SuspenseWrapper>
          </RouteWrapper>
        );

      // Enhanced Pages
      case "/prizepicks-enhanced":
        return (
          <RouteWrapper routeName="PrizePicks Enhanced">
            <PrizePicksPageEnhanced />
          </RouteWrapper>
        );
      case "/premium-dashboard":
        return (
          <RouteWrapper routeName="Premium Dashboard">
            <PremiumDashboard />
          </RouteWrapper>
        );

      // Core Features
      case "/ml-predictions":
        return (
          <RouteWrapper routeName="ML Predictions">
            <MLPredictions />
          </RouteWrapper>
        );
      case "/security":
        return (
          <RouteWrapper routeName="Security Dashboard">
            <WebSocketSecurityDashboard />
          </RouteWrapper>
        );
      default:
        return (
          <RouteWrapper routeName="Premium Dashboard">
            <PremiumDashboard />
          </RouteWrapper>
        );
    }
  }, [currentPath]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 transition-all duration-500">
      {/* Enhanced Navigation with Premium Design System */}
      <nav
        className="sticky top-0 z-60 bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl border-b border-gray-200/50 dark:border-gray-800/50 shadow-lg"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex-between h-16">
            {/* Responsive Navigation Container */}
            <div className="flex-1 flex items-center">
              <div className="flex space-x-1 overflow-x-auto scrollbar-thin">
                {navigationConfig.map((group, groupIndex) => (
                  <div
                    key={group.group}
                    className="flex items-center space-x-1"
                  >
                    {groupIndex > 0 && (
                      <div
                        className="h-6 w-px bg-gradient-to-b from-transparent via-gray-300 to-transparent dark:via-gray-600 mx-2"
                        aria-hidden="true"
                      />
                    )}
                    {group.items.map((item) => (
                      <button
                        key={item.href}
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(item.href);
                        }}
                        onMouseEnter={() => prefetchRoute(item.href.slice(1))}
                        onKeyDown={(e) => handleKeyDown(e, item.href)}
                        className={cn(
                          "inline-flex items-center px-3 py-2 text-sm font-medium rounded-xl",
                          "transition-all duration-300 ease-out whitespace-nowrap",
                          "hover:scale-105 active:scale-95 focus:outline-none",
                          "focus:ring-2 focus:ring-brand-500 focus:ring-offset-2",
                          currentPath === item.href.slice(1)
                            ? "bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-brandShadow transform scale-105"
                            : `${item.color} hover:bg-white/10 hover:backdrop-blur-lg hover:text-white hover:shadow-soft`,
                        )}
                        tabIndex={0}
                        aria-current={
                          currentPath === item.href.slice(1)
                            ? "page"
                            : undefined
                        }
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.location.reload()}
                aria-label="Refresh application"
                title="Refresh"
                className="hover:bg-brand-50 hover:text-brand-600 dark:hover:bg-brand-900/20"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content with Enhanced Design System */}
      <main
        className="max-w-8xl mx-auto py-8 px-4 sm:px-6 lg:px-8"
        role="main"
        aria-label="Main content"
      >
        <div
          className={cn(
            "transition-all duration-500 ease-out",
            isTransitioning
              ? "opacity-50 scale-95 blur-sm"
              : "opacity-100 scale-100 blur-none",
          )}
        >
          <div className="min-h-[calc(100vh-8rem)]">{renderComponent()}</div>
        </div>
      </main>

      {/* Development Performance Monitor */}
      {typeof window !== "undefined" &&
        process.env.NODE_ENV === "development" && (
          <div className="fixed bottom-20 left-4 z-40">
            <PerformanceMonitor />
          </div>
        )}

      {/* Enhanced Real-time Status Bar */}
      <Card
        variant="glass"
        className="fixed bottom-4 right-4 z-30 p-3 text-xs border-success-200/50"
        role="status"
        aria-live="polite"
        aria-label="Application status"
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse shadow-successShadow"></div>
            <div className="absolute inset-0 w-2 h-2 bg-success-400 rounded-full animate-ping opacity-75"></div>
          </div>
          <Badge variant="success" size="sm" className="font-medium">
            All Systems Active
          </Badge>
          <span className="text-gray-600 dark:text-gray-400 font-mono">
            {navigationConfig.reduce(
              (total, group) => total + group.items.length,
              0,
            )}{" "}
            Features
          </span>
        </div>
      </Card>

      {/* Hidden navigation helper for screen readers */}
      <div className="sr-only">
        <h2>Available Features:</h2>
        <ul>
          {navigationConfig.map((group) =>
            group.items.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            )),
          )}
        </ul>
      </div>
    </div>
  );
};

export default App;
