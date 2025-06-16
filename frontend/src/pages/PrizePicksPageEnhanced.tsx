import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";

// TypeScript interfaces for better type safety
interface PlayerProp {
  id: string;
  playerName: string;
  team: string;
  opponent: string;
  statType: string;
  line: number;
  overOdds: number;
  underOdds: number;
  confidence: number;
  sentiment: "bullish" | "bearish" | "neutral";
  volume: number;
  movement: string;
  injury: string | null;
  lastGames: number[];
  seasonAvg: number;
  vsOpponentAvg: number;
  homeAwayDiff: number;
  projection: number;
  league: string;
  gameTime: string;
  weather: string | null;
  isPopular: boolean;
  tags: string[];
}

interface FilterState {
  searchTerm: string;
  selectedLeague: string;
  selectedStatType: string;
  sortBy: string;
}

type SortCriteria = "confidence" | "volume" | "gameTime";
import {
  Search,
  Filter,
  TrendingUp,
  TrendingDown,
  Star,
  Target,
  Zap,
  BarChart3,
  Trophy,
  DollarSign,
  Clock,
  Users,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Check,
  X,
  Info,
  Settings,
  Bookmark,
  Share2,
  Download,
  PlayCircle,
  Pause,
  RotateCcw,
} from "lucide-react";

// Mock data for demonstration with proper typing
const mockProps: PlayerProp[] = [
  {
    id: "1",
    playerName: "Luka Dončić",
    team: "DAL",
    opponent: "vs LAL",
    statType: "Points",
    line: 28.5,
    overOdds: -110,
    underOdds: -110,
    confidence: 87,
    sentiment: "bullish",
    volume: 12450,
    movement: "+0.5",
    injury: null,
    lastGames: [32, 24, 29, 35, 27],
    seasonAvg: 29.2,
    vsOpponentAvg: 31.4,
    homeAwayDiff: 2.3,
    projection: 30.8,
    league: "NBA",
    gameTime: "2024-01-15T20:00:00Z",
    weather: null,
    isPopular: true,
    tags: ["trending", "value"],
  },
  {
    id: "2",
    playerName: "Jayson Tatum",
    team: "BOS",
    opponent: "@ MIA",
    statType: "Rebounds",
    line: 7.5,
    overOdds: -105,
    underOdds: -115,
    confidence: 73,
    sentiment: "bearish",
    volume: 8920,
    movement: "-0.5",
    injury: "Questionable",
    lastGames: [6, 9, 7, 5, 8],
    seasonAvg: 7.2,
    vsOpponentAvg: 6.8,
    homeAwayDiff: -1.1,
    projection: 6.9,
    league: "NBA",
    gameTime: "2024-01-15T19:30:00Z",
    weather: null,
    isPopular: false,
    tags: ["value"],
  },
  {
    id: "3",
    playerName: "Josh Allen",
    team: "BUF",
    opponent: "vs KC",
    statType: "Passing Yards",
    line: 267.5,
    overOdds: -108,
    underOdds: -112,
    confidence: 92,
    sentiment: "bullish",
    volume: 15680,
    movement: "+2.5",
    injury: null,
    lastGames: [304, 289, 356, 274, 298],
    seasonAvg: 284.3,
    vsOpponentAvg: 312.7,
    homeAwayDiff: 18.5,
    projection: 295.2,
    league: "NFL",
    gameTime: "2024-01-15T16:00:00Z",
    weather: "Clear, 42°F",
    isPopular: true,
    tags: ["trending", "high-confidence", "weather-factor"],
  },
];

const PrizePicksPageEnhanced: React.FC = () => {
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLeague, setSelectedLeague] = useState("all");
  const [selectedStatType, setSelectedStatType] = useState("all");
  const [sortBy, setSortBy] = useState("confidence");
  const [showFilters, setShowFilters] = useState(false);
  const [stake, setStake] = useState(100);
  const [isLive, setIsLive] = useState(true);

  // Optimized filtering and sorting with better performance
  const filteredProps = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();

    let filtered = mockProps.filter((prop) => {
      // Early return for performance
      if (selectedLeague !== "all" && prop.league !== selectedLeague)
        return false;
      if (selectedStatType !== "all" && prop.statType !== selectedStatType)
        return false;

      // Search optimization
      if (
        searchTerm &&
        !prop.playerName.toLowerCase().includes(searchLower) &&
        !prop.team.toLowerCase().includes(searchLower)
      ) {
        return false;
      }

      return true;
    });

    // Optimized sorting with type safety
    const sortFunctions: Record<
      SortCriteria,
      (a: PlayerProp, b: PlayerProp) => number
    > = {
      confidence: (a, b) => b.confidence - a.confidence,
      volume: (a, b) => b.volume - a.volume,
      gameTime: (a, b) =>
        new Date(a.gameTime).getTime() - new Date(b.gameTime).getTime(),
    };

    const sortFunction = sortFunctions[sortBy as SortCriteria];
    if (sortFunction) {
      filtered.sort(sortFunction);
    }

    return filtered;
  }, [searchTerm, selectedLeague, selectedStatType, sortBy]);

  // Optimized payout calculation with memoization
  const calculatePayout = useCallback(() => {
    if (selectedProps.length < 2) return 0;

    // Payout multipliers based on number of selections
    const payoutMultipliers: Record<number, number> = {
      2: 3,
      3: 5,
      4: 10,
      5: 20,
      6: 25,
    };

    const multiplier = payoutMultipliers[selectedProps.length] || 25;
    return stake * multiplier;
  }, [selectedProps.length, stake]);

  const togglePropSelection = useCallback((propId: string, isOver: boolean) => {
    const selectionId = `${propId}_${isOver ? "over" : "under"}`;

    setSelectedProps((prev) => {
      // Remove any existing selection for this prop
      const filtered = prev.filter((id) => !id.startsWith(propId));

      // Add new selection if it wasn't already selected
      if (!prev.includes(selectionId)) {
        return [...filtered, selectionId];
      }

      return filtered;
    });
  }, []);

  const getConfidenceColor = useCallback((confidence: number): string => {
    if (confidence >= 80) return "text-success-600 bg-success-100";
    if (confidence >= 60) return "text-warning-600 bg-warning-100";
    return "text-error-600 bg-error-100";
  }, []);

  const getSentimentIcon = useCallback((sentiment: PlayerProp["sentiment"]) => {
    const iconProps = { className: "w-4 h-4" };

    switch (sentiment) {
      case "bullish":
        return (
          <TrendingUp {...iconProps} className="w-4 h-4 text-success-500" />
        );
      case "bearish":
        return (
          <TrendingDown {...iconProps} className="w-4 h-4 text-error-500" />
        );
      default:
        return <BarChart3 {...iconProps} className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      {/* Header */}
      <div className="nav-premium sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Target className="w-8 h-8 text-brand-500" />
                <h1 className="text-2xl font-bold text-gradient">
                  PrizePicks Pro
                </h1>
              </div>
              <div className="hidden md:flex items-center space-x-2">
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    isLive
                      ? "bg-success-100 text-success-700"
                      : "bg-gray-100 text-gray-700"
                  }`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-1 ${isLive ? "bg-success-500 animate-pulse" : "bg-gray-400"}`}
                  />
                  {isLive ? "LIVE" : "PAUSED"}
                </span>
                <span className="text-sm text-gray-600">
                  {filteredProps.length} props available
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => setIsLive(!isLive)}
                className="btn-outline px-3 py-2"
              >
                {isLive ? (
                  <Pause className="w-4 h-4" />
                ) : (
                  <PlayCircle className="w-4 h-4" />
                )}
              </button>

              <button className="btn-glass px-3 py-2">
                <Bookmark className="w-4 h-4" />
              </button>

              <button className="btn-glass px-3 py-2">
                <Share2 className="w-4 h-4" />
              </button>

              <button className="btn-glass px-3 py-2">
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {/* Search & Filters */}
            <div className="premium-card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <div className="flex-1 max-w-md">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search players, teams..."
                      className="input-premium pl-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <select
                    className="input-premium"
                    value={selectedLeague}
                    onChange={(e) => setSelectedLeague(e.target.value)}
                  >
                    <option value="all">All Leagues</option>
                    <option value="NBA">NBA</option>
                    <option value="NFL">NFL</option>
                    <option value="MLB">MLB</option>
                    <option value="NHL">NHL</option>
                  </select>

                  <select
                    className="input-premium"
                    value={selectedStatType}
                    onChange={(e) => setSelectedStatType(e.target.value)}
                  >
                    <option value="all">All Stats</option>
                    <option value="Points">Points</option>
                    <option value="Rebounds">Rebounds</option>
                    <option value="Assists">Assists</option>
                    <option value="Passing Yards">Passing Yards</option>
                  </select>

                  <select
                    className="input-premium"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="confidence">Confidence</option>
                    <option value="volume">Volume</option>
                    <option value="gameTime">Game Time</option>
                  </select>

                  <button
                    onClick={() => setShowFilters(!showFilters)}
                    className={`btn-outline px-3 py-2 ${showFilters ? "bg-brand-500 text-white" : ""}`}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <AnimatePresence>
                {showFilters && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 pt-6 border-t border-gray-200"
                  >
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Min Confidence
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          className="w-full"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Show Only Popular
                        </label>
                        <input type="checkbox" className="w-4 h-4" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Props Grid */}
            <div className="grid gap-6">
              <AnimatePresence>
                {filteredProps.map((prop, index) => (
                  <motion.div
                    key={prop.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="prop-card group"
                  >
                    <div className="flex items-start justify-between">
                      {/* Player Info */}
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-3">
                          <div className="flex items-center space-x-2">
                            <h3 className="text-xl font-bold text-gray-900">
                              {prop.playerName}
                            </h3>
                            {prop.isPopular && (
                              <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            )}
                          </div>
                          <span className="badge-glass">
                            {prop.team} {prop.opponent}
                          </span>
                          <span className="badge-premium">{prop.league}</span>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                          <div>
                            <span className="text-sm text-gray-500">
                              Stat Type
                            </span>
                            <p className="font-semibold text-gray-900">
                              {prop.statType}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">Line</span>
                            <p className="text-2xl font-bold text-gray-900">
                              {prop.line}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Projection
                            </span>
                            <p className="font-semibold text-brand-600">
                              {prop.projection}
                            </p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-500">
                              Volume
                            </span>
                            <p className="font-semibold">
                              {prop.volume.toLocaleString()}
                            </p>
                          </div>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center space-x-6 text-sm">
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-500">Confidence:</span>
                            <span
                              className={`px-2 py-1 rounded-full text-xs font-medium ${getConfidenceColor(prop.confidence)}`}
                            >
                              {prop.confidence}%
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            {getSentimentIcon(prop.sentiment)}
                            <span className="text-gray-600">
                              Market Sentiment
                            </span>
                          </div>

                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">
                              {new Date(prop.gameTime).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          {prop.weather && (
                            <div className="flex items-center space-x-1">
                              <span className="text-gray-600">
                                🌤️ {prop.weather}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Betting Options */}
                      <div className="flex space-x-3 ml-6">
                        <button
                          onClick={() => togglePropSelection(prop.id, true)}
                          className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                            selectedProps.includes(`${prop.id}_over`)
                              ? "border-success-500 bg-success-50 text-success-700"
                              : "border-gray-200 hover:border-success-300 hover:bg-success-50"
                          }`}
                        >
                          <ArrowUp className="w-6 h-6 mb-1" />
                          <span className="text-sm font-medium">OVER</span>
                          <span className="text-lg font-bold">
                            {prop.overOdds > 0 ? "+" : ""}
                            {prop.overOdds}
                          </span>
                        </button>

                        <button
                          onClick={() => togglePropSelection(prop.id, false)}
                          className={`flex flex-col items-center p-4 rounded-xl transition-all duration-200 border-2 ${
                            selectedProps.includes(`${prop.id}_under`)
                              ? "border-error-500 bg-error-50 text-error-700"
                              : "border-gray-200 hover:border-error-300 hover:bg-error-50"
                          }`}
                        >
                          <ArrowDown className="w-6 h-6 mb-1" />
                          <span className="text-sm font-medium">UNDER</span>
                          <span className="text-lg font-bold">
                            {prop.underOdds > 0 ? "+" : ""}
                            {prop.underOdds}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Recent Performance */}
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">
                          Last 5 Games:
                        </span>
                        <div className="flex space-x-2">
                          {prop.lastGames.map((game, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 rounded text-xs font-medium ${
                                game > prop.line
                                  ? "bg-success-100 text-success-700"
                                  : "bg-error-100 text-error-700"
                              }`}
                            >
                              {game}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Bet Slip Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <div className="premium-card p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-bold text-gray-900">Bet Slip</h3>
                  <span className="badge-premium">
                    {selectedProps.length} picks
                  </span>
                </div>

                {selectedProps.length === 0 ? (
                  <div className="text-center py-8">
                    <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">
                      Select props to build your entry
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Selected Props */}
                    <div className="space-y-3">
                      {selectedProps.map((selection) => {
                        const [propId, direction] = selection.split("_");
                        const prop = mockProps.find((p) => p.id === propId);
                        if (!prop) return null;

                        return (
                          <div
                            key={selection}
                            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                          >
                            <div className="flex-1">
                              <p className="font-medium text-sm">
                                {prop.playerName}
                              </p>
                              <p className="text-xs text-gray-600">
                                {direction.toUpperCase()} {prop.line}{" "}
                                {prop.statType}
                              </p>
                            </div>
                            <button
                              onClick={() =>
                                setSelectedProps((prev) =>
                                  prev.filter((id) => id !== selection),
                                )
                              }
                              className="text-gray-400 hover:text-error-500"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Stake Input */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Entry Fee
                      </label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                          type="number"
                          value={stake}
                          onChange={(e) => setStake(Number(e.target.value))}
                          className="stake-input w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                          placeholder="100"
                        />
                      </div>
                    </div>

                    {/* Payout Display */}
                    <div className="bg-gradient-to-r from-brand-50 to-brand-100 p-4 rounded-xl">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-brand-700">
                          Potential Payout
                        </span>
                        <span className="text-2xl font-bold text-brand-600">
                          ${calculatePayout().toFixed(2)}
                        </span>
                      </div>
                      <div className="text-xs text-brand-600 mt-1">
                        {((calculatePayout() / stake - 1) * 100).toFixed(0)}x
                        multiplier
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      disabled={selectedProps.length < 2}
                      className={`w-full btn-premium ${
                        selectedProps.length < 2
                          ? "opacity-50 cursor-not-allowed"
                          : "hover:scale-105 active:scale-95"
                      }`}
                    >
                      <div className="flex items-center justify-center space-x-2">
                        <Trophy className="w-5 h-5" />
                        <span>Submit Entry</span>
                        <ArrowRight className="w-5 h-5" />
                      </div>
                    </button>

                    {selectedProps.length < 2 && (
                      <p className="text-xs text-center text-gray-500">
                        Select at least 2 props to submit
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrizePicksPageEnhanced;
