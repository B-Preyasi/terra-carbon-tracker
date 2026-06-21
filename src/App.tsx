import { useState, useEffect, useRef, FormEvent } from "react";
import { 
  calculateFootprint, 
  DEFAULT_CALCULATOR_VALUES, 
  DEFAULT_ACTIONS, 
  FootprintResult 
} from "./utils/carbonCalculator";
import { CalculatorData, HabitAction, LoggedDay, AIInsights, ChatMessage } from "./types";
import MetricOverview from "./components/MetricOverview";
import { 
  Sparkles, 
  MessageSquare, 
  TrendingDown, 
  User, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Check, 
  ChevronRight, 
  Leaf, 
  Calendar, 
  Flame, 
  AlertCircle, 
  HelpCircle, 
  Award,
  Globe,
  Compass,
  ArrowRight,
  BookOpen,
  Trees
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import EducationalTipsCustom from "./components/EducationalTips";

export default function App() {
  // Current active navigation tab
  const [activeTab, setActiveTab] = useState<"overview" | "insights" | "logger" | "tips">("overview");

  // Safe localStorage helper
  const safeGetItem = <T,>(key: string, defaultValue: T): T => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error parsing localStorage key "${key}":`, e);
      return defaultValue;
    }
  };

  // Calculator State
  const [calculator, setCalculator] = useState<CalculatorData>(() => {
    return safeGetItem("terra_calculator", DEFAULT_CALCULATOR_VALUES);
  });

  // Calculate live results
  const results: FootprintResult = calculateFootprint(calculator);

  // Persistence handler for calculator changes
  useEffect(() => {
    localStorage.setItem("terra_calculator", JSON.stringify(calculator));
  }, [calculator]);

  // AI Insights State
  const [aiInsights, setAiInsights] = useState<AIInsights | null>(() => {
    return safeGetItem<AIInsights | null>("terra_ai_insights", null);
  });
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);

  // Custom Habit Actions added by user
  const [customActions, setCustomActions] = useState<HabitAction[]>(() => {
    return safeGetItem<HabitAction[]>("terra_custom_actions", []);
  });

  // New Custom Habit Input form state
  const [showAddCustomForm, setShowAddCustomForm] = useState(false);
  const [newActionName, setNewActionName] = useState("");
  const [newActionDesc, setNewActionDesc] = useState("");
  const [newActionSavedKg, setNewActionSavedKg] = useState("1.5");
  const [newActionCategory, setNewActionCategory] = useState<"transportation" | "energy" | "lifestyle">("lifestyle");

  // Track Logged days state
  const [loggedDays, setLoggedDays] = useState<Record<string, LoggedDay>>(() => {
    try {
      const saved = localStorage.getItem("terra_logged_days");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing logged days:", e);
    }
    
    // Seed standard item for demonstration
    const todayStr = new Date().toISOString().split("T")[0];
    return {
      [todayStr]: {
        date: todayStr,
        actionsLogged: ["action-1", "action-2"],
        totalKgSaved: 8.0
      }
    };
  });

  // Today's date YYYY-MM-DD
  const getTodayString = () => {
    return new Date().toISOString().split("T")[0];
  };
  const todayKey = getTodayString();

  // Chat/Conversation state
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem("terra_chat_messages");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error("Error parsing chat messages:", e);
    }
    return [
      {
        id: "welcome",
        role: "assistant",
        content: "Hello! I am your personal **Terra Eco-Advisor**. I've analyzed your household carbon profile. Ask me any practical tips to reduce home heating, cook sustainable meals, save commute emissions, or offset your footprints!",
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      }
    ];
  });
  const [userQuery, setUserQuery] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto scroll chat
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isTyping]);

  // Sync to local storage
  useEffect(() => {
    localStorage.setItem("terra_logged_days", JSON.stringify(loggedDays));
    localStorage.setItem("terra_custom_actions", JSON.stringify(customActions));
    localStorage.setItem("terra_chat_messages", JSON.stringify(chatMessages));
  }, [loggedDays, customActions, chatMessages]);

  // Quick helper: All available actions combining DEFAULT and custom AI / personal actions
  const allAvailableActions: HabitAction[] = [
    ...DEFAULT_ACTIONS.map(a => ({ ...a, isCustomAI: false })),
    ...customActions,
    ...(aiInsights?.recommendedHabits.map((a, i) => ({
      id: `ai-rec-${i}`,
      name: a.name,
      description: a.description,
      kgCo2Saved: a.kgCo2Saved,
      category: a.category as any,
      isCustomAI: true
    })) || [])
  ];

  // Calculate Cumulative total carbon saved through habit logs
  const totalAccumulatedSavings = (Object.values(loggedDays) as LoggedDay[]).reduce(
    (acc: number, day) => acc + day.totalKgSaved, 
    0
  );

  // Calculate streak of consecutive logging days
  const calculateStreak = (): number => {
    const dates = Object.keys(loggedDays).sort();
    if (dates.length === 0) return 0;
    
    let streak = 0;
    let checkDate = new Date();
    
    while (true) {
      const dateStr = checkDate.toISOString().split("T")[0];
      if (loggedDays[dateStr]) {
        streak++;
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  };

  const currentStreak = calculateStreak();

  // Reset Calculator values back to standard defaults
  const handleResetCalculator = () => {
    if (window.confirm("Restore standard default values for your carbon calculation profile?")) {
      setCalculator(DEFAULT_CALCULATOR_VALUES);
    }
  };

  // Log or un-log an action for today
  const handleToggleLogAction = (actionId: string) => {
    const todayLog = loggedDays[todayKey] || {
      date: todayKey,
      actionsLogged: [],
      totalKgSaved: 0
    };

    let updatedActions = [...todayLog.actionsLogged];
    const isAlreadyLogged = updatedActions.includes(actionId);

    if (isAlreadyLogged) {
      updatedActions = updatedActions.filter(id => id !== actionId);
    } else {
      updatedActions.push(actionId);
    }

    // Re-calculate daily saved total
    const dailyTotal = updatedActions.reduce((sum, id) => {
      const actionRef = allAvailableActions.find(act => act.id === id);
      return sum + (actionRef ? actionRef.kgCo2Saved : 0);
    }, 0);

    setLoggedDays(prev => ({
      ...prev,
      [todayKey]: {
        date: todayKey,
        actionsLogged: updatedActions,
        totalKgSaved: Number(dailyTotal.toFixed(1))
      }
    }));
  };

  // Add Custom Habit item
  const handleAddCustomHabit = (e: FormEvent) => {
    e.preventDefault();
    if (!newActionName.trim() || !newActionDesc.trim()) return;

    const newHabit: HabitAction = {
      id: "custom-" + Date.now(),
      name: newActionName.trim(),
      description: newActionDesc.trim(),
      kgCo2Saved: Number(parseFloat(newActionSavedKg).toFixed(1)) || 1.0,
      category: newActionCategory,
      isCustomAI: false
    };

    setCustomActions(prev => [newHabit, ...prev]);
    setNewActionName("");
    setNewActionDesc("");
    setNewActionSavedKg("1.5");
    setShowAddCustomForm(false);
  };

  // Delete Custom Habit
  const handleDeleteCustomHabit = (id: string) => {
    setCustomActions(prev => prev.filter(c => c.id !== id));
    // Also remove from today's logs if it was active
    const todayLog = loggedDays[todayKey];
    if (todayLog && todayLog.actionsLogged.includes(id)) {
      handleToggleLogAction(id);
    }
  };

  // Adopt Educational Tip as Custom Habit
  const handleAdoptEducationalTip = (habit: HabitAction) => {
    setCustomActions(prev => {
      if (prev.some(h => h.id === habit.id)) return prev;
      return [habit, ...prev];
    });
  };

  // Dynamic fetch AI insights from Gemini server endpoint
  const handleGenerateAIInsights = async () => {
    setLoadingInsights(true);
    setInsightsError(null);
    try {
      const response = await fetch("/api/insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ calculatorData: calculator })
      });
      if (!response.ok) {
        throw new Error("Insights generation failed on server. Ensure your Gemini API Key is configured.");
      }
      const data = await response.json();
      setAiInsights(data);
      localStorage.setItem("terra_ai_insights", JSON.stringify(data));
      
      // Auto post a notification message to advisor chat
      const alertMsg: ChatMessage = {
        id: "alert-" + Date.now(),
        role: "assistant",
        content: `✨ **System Update:** I've analyzed your newly updated carbon dashboard limits! I generated custom targeted habits representing **${data.recommendedHabits.length} new available actions** tailored directly for you based on transportation & meals profiles. Check your action list!`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, alertMsg]);
    } catch (err: any) {
      console.error(err);
      setInsightsError(err.message || "Something went wrong. Please check your setup.");
    } finally {
      setLoadingInsights(false);
    }
  };

  // Send Chat message to Advisor
  const handleSendChatMessage = async (msgText: string) => {
    if (!msgText.trim()) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: msgText,
      timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages(prev => [...prev, userMsg]);
    setUserQuery("");
    setIsTyping(true);

    try {
      // Map messaging history standard structure
      const msgHistory = chatMessages.map(m => ({
        role: m.role === "user" ? "user" : "model",
        content: m.content
      }));

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: msgText,
          history: msgHistory,
          calculatorData: calculator
        })
      });

      if (!response.ok) {
        throw new Error("Server failed to respond. Verify secrets configured.");
      }

      const data = await response.json();
      const assistantMsg: ChatMessage = {
        id: "ai-" + Date.now(),
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, assistantMsg]);
    } catch (err: any) {
      const errorMsg: ChatMessage = {
        id: "ai-err-" + Date.now(),
        role: "assistant",
        content: `⚠️ **API Connection Error:** I couldn't reach the backend server to generate an intelligent advisor response. Please ensure your \`GEMINI_API_KEY\` is loaded in the AI Studio environment controls.`,
        timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
      };
      setChatMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  // Starter suggestion triggers
  const handleStarterTopic = (topic: string) => {
    handleSendChatMessage(topic);
  };

  return (
    <div className="w-full min-h-screen bg-[#FDFCF9] text-[#333322] flex flex-col md:flex-row font-sans" id="app-root">
      
      {/* SIDE NAVIGATION PANEL */}
      <aside className="w-full md:w-72 bg-[#F2F0E9] border-b md:border-b-0 md:border-r border-[#E5E2D8] flex flex-col p-6 md:p-8 shrink-0">
        <div className="flex items-center gap-3 mb-8 md:mb-12">
          <div className="w-10 h-10 bg-[#556B2F] rounded-full flex items-center justify-center text-white shadow-xs">
            <Trees className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-serif italic text-[#556B2F] font-bold leading-tight">Terra</h1>
            <p className="text-[10px] uppercase font-mono tracking-widest text-[#888877] font-semibold">Planetary Balance</p>
          </div>
        </div>
        
        {/* Navigation block */}
        <nav className="flex-1 space-y-6 flex flex-row md:flex-col justify-between md:justify-start gap-2 md:gap-0">
          <div className="space-y-1.5 w-full">
            <p className="hidden md:block text-[10px] uppercase tracking-widest text-[#888877] font-bold mb-3">Main Navigation</p>
            
            <button 
              onClick={() => setActiveTab("overview")}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "overview" 
                  ? "bg-[#556B2F] text-white shadow-sm font-medium" 
                  : "text-[#666655] hover:bg-[#EAE7DD] hover:text-[#333322]"
              }`}
            >
              <Compass className="w-4 h-4 shrink-0" />
              <span className="text-sm">Carbon Overview</span>
            </button>

            <button 
              onClick={() => setActiveTab("insights")}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "insights" 
                  ? "bg-[#556B2F] text-white shadow-sm font-medium" 
                  : "text-[#666655] hover:bg-[#EAE7DD] hover:text-[#333322]"
              }`}
            >
              <Sparkles className="w-4 h-4 shrink-0" />
              <span className="text-sm flex-1 flex items-center justify-between">
                <span>AI Insights</span>
                {aiInsights && <span className="w-2 h-2 rounded-full bg-orange-400"></span>}
              </span>
            </button>

            <button 
              onClick={() => setActiveTab("logger")}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "logger" 
                  ? "bg-[#556B2F] text-white shadow-sm font-medium" 
                  : "text-[#666655] hover:bg-[#EAE7DD] hover:text-[#333322]"
              }`}
            >
              <Leaf className="w-4 h-4 shrink-0" />
              <span className="text-sm">Action Logger</span>
            </button>

            <button 
              onClick={() => setActiveTab("tips")}
              className={`w-full text-left flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                activeTab === "tips" 
                  ? "bg-[#556B2F] text-white shadow-sm font-medium" 
                  : "text-[#666655] hover:bg-[#EAE7DD] hover:text-[#333322]"
              }`}
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span className="text-sm">Eco-Tips</span>
            </button>
          </div>
        </nav>

        {/* User stats widget */}
        <div className="mt-8 md:mt-auto p-4 bg-[#E5E2D8] rounded-2xl space-y-3.5 hidden md:block">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#8F9779] text-white flex items-center justify-center font-bold text-sm uppercase">
              BP
            </div>
            <div>
              <p className="text-xs font-semibold text-[#333322]">Bandana Preyasi</p>
              <p className="text-[10px] text-[#666655] font-mono">Earth Custodian</p>
            </div>
          </div>
          
          <div className="pt-2 border-t border-[#D5D2C8] flex justify-between items-center text-xs">
            <span className="text-[#666655]">Total Saved:</span>
            <span className="font-mono font-bold text-[#556B2F] bg-white/70 px-2 py-0.5 rounded-md">
              {totalAccumulatedSavings.toFixed(1)} kg CO₂
            </span>
          </div>

          {currentStreak > 0 && (
            <div className="flex items-center gap-1.5 justify-center text-xs text-orange-700 bg-orange-50 py-1 rounded-lg">
              <Flame className="w-3.5 h-3.5 fill-current" />
              <span><strong>{currentStreak} Day</strong> Logger Streak!</span>
            </div>
          )}
        </div>
      </aside>

      {/* MAIN MAIN CONTENT CONTAINER */}
      <main className="flex-1 flex flex-col p-6 min-h-0 md:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
        
        {/* TOP STATUS ROW & GREETING */}
        <header className="flex flex-col sm:flex-row justify-between sm:items-end gap-4 pb-6 mb-8 border-b border-[#E5E2D8]">
          <div>
            <h2 className="text-3xl sm:text-4xl font-serif italic text-[#556B2F]">Welcome to Terra</h2>
            <p className="text-xs sm:text-sm text-[#888877] mt-1">
              {activeTab === "overview" && "Configure inputs to evaluate, calculate, and adjust your lifestyle footprint limits."}
              {activeTab === "insights" && "Empowering carbon boundaries research using advanced conversational intelligence."}
              {activeTab === "logger" && "Log actionable daily sustainability habits to track accumulative offsets."}
              {activeTab === "tips" && "Explore our specialized bite-sized school of scientific carbon boundary reductions."}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="bg-[#F2F0E9] border border-[#E5E2D8] px-3.5 py-1.5 rounded-xl text-xs flex items-center gap-2">
              <Calendar className="w-3.5 h-3.5 text-[#556B2F]" />
              <span className="font-mono text-[#666655]">Today: June 21, 2026</span>
            </div>
          </div>
        </header>

        {/* Dynamic Navigation Content router */}
        <div className="flex-1 min-h-0">
          <AnimatePresence mode="wait">
            
            {/* TAB 1: CARBON CALCULATOR & REPORT OVERVIEW */}
            {activeTab === "overview" && (
              <motion.div 
                key="tab-overview"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                
                {/* Left Inputs column: Interactive Form */}
                <div className="lg:col-span-6 bg-white border border-[#E5E2D8] rounded-[32px] p-6 lg:p-8 space-y-6">
                  <div className="flex justify-between items-center pb-2 border-b border-[#F2F0E9]">
                    <div className="flex items-center gap-2">
                      <TrendingDown className="w-5 h-5 text-[#556B2F]" />
                      <h3 className="text-lg font-serif font-bold text-[#556B2F]">Lifestyle Coefficients</h3>
                    </div>
                    <button 
                      onClick={handleResetCalculator}
                      className="p-1 px-2.5 rounded-lg border border-[#E5E2D8] hover:bg-[#F2F0E9] text-xs font-mono text-[#666655] transition flex items-center gap-1.5"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Restore Defaults
                    </button>
                  </div>

                  {/* TRANSPORTATION CONTROLS */}
                  <div className="space-y-4">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#888877] border-l-2 border-[#8F9779] pl-2">
                      1. Transportation & Travel
                    </p>

                    {/* Car type selection */}
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#333322]">Primary Personal Car Propulsion</label>
                      <div className="grid grid-cols-2 xs:grid-cols-3 sm:grid-cols-5 gap-2">
                        {(["petrol", "diesel", "hybrid", "electric", "none"] as const).map((type) => (
                          <button
                            key={type}
                            type="button"
                            onClick={() => setCalculator(prev => ({ ...prev, carType: type }))}
                            className={`px-2 py-2 text-xs border rounded-xl font-medium transition capitalize ${
                              calculator.carType === type
                                ? "bg-[#556B2F] text-white border-[#556B2F] shadow-xs"
                                : "text-[#666655] bg-[#FDFCF9] border-[#E5E2D8] hover:bg-[#F2F0E9]"
                            }`}
                          >
                            {type}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Car Weekly Driving Distance */}
                    {calculator.carType !== "none" && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <label className="text-[#666655]">Car Commuting Distance</label>
                          <span className="font-mono text-[#556B2F] bg-[#F2F0E9] px-2 py-0.5 rounded-md text-[11px] font-bold">
                            {calculator.carDistance} km / week
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="800"
                          step="10"
                          value={calculator.carDistance}
                          onChange={(e) => setCalculator(prev => ({ ...prev, carDistance: parseInt(e.target.value) }))}
                          className="w-full accent-[#556B2F] h-1.5 bg-[#F2F0E9] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    )}

                    {/* Public Transit Distance */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <label className="text-[#666655]">Public Transit Commuting</label>
                        <span className="font-mono text-[#556B2F] bg-[#F2F0E9] px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {calculator.transitDistance} km / week
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="500"
                        step="5"
                        value={calculator.transitDistance}
                        onChange={(e) => setCalculator(prev => ({ ...prev, transitDistance: parseInt(e.target.value) }))}
                        className="w-full accent-[#556B2F] h-1.5 bg-[#F2F0E9] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Annual Flights Hours */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs font-medium">
                        <label className="text-[#666655]">Annual Air Travel duration</label>
                        <span className="font-mono text-[#556B2F] bg-[#F2F0E9] px-2 py-0.5 rounded-md text-[11px] font-bold">
                          {calculator.flightsTime} Flight Hrs / year
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="120"
                        step="2"
                        value={calculator.flightsTime}
                        onChange={(e) => setCalculator(prev => ({ ...prev, flightsTime: parseInt(e.target.value) }))}
                        className="w-full accent-[#556B2F] h-1.5 bg-[#F2F0E9] rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  {/* HOUSEHOLD ENERGY PANEL */}
                  <div className="space-y-4 pt-4 border-t border-[#F2F0E9]">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#888877] border-l-2 border-[#BC9D7E] pl-2">
                      2. Home Utility & Heating
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Electricity utilization slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <label className="text-[#666655]">Electricity bill</label>
                          <span className="font-mono text-[#556B2F] bg-[#F2F0E9] px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                            {calculator.electricity} kWh / month
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="1200"
                          step="20"
                          value={calculator.electricity}
                          onChange={(e) => setCalculator(prev => ({ ...prev, electricity: parseInt(e.target.value) }))}
                          className="w-full accent-[#556B2F] h-1.5 bg-[#F2F0E9] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>

                      {/* Gas heating slider */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-medium">
                          <label className="text-[#666655]">Heating Gas</label>
                          <span className="font-mono text-[#556B2F] bg-[#F2F0E9] px-1.5 py-0.5 rounded-md text-[10px] font-bold">
                            {calculator.gas} m³ / month
                          </span>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="300"
                          step="5"
                          value={calculator.gas}
                          onChange={(e) => setCalculator(prev => ({ ...prev, gas: parseInt(e.target.value) }))}
                          className="w-full accent-[#BC9D7E] h-1.5 bg-[#F2F0E9] rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* DIET & DIETARY FOOTPRINT */}
                  <div className="space-y-4 pt-4 border-t border-[#F2F0E9]">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#888877] border-l-2 border-[#D2B48C] pl-2">
                      3. Nutrition Patterns
                    </p>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#333322]">Primary Dietary Preference</label>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {(["vegan", "vegetarian", "moderate-meat", "heavy-meat"] as const).map((dietType) => (
                          <button
                            key={dietType}
                            onClick={() => setCalculator(prev => ({ ...prev, diet: dietType }))}
                            className={`px-1.5 py-2 text-xs border rounded-xl font-medium transition capitalize ${
                              calculator.diet === dietType
                                ? "bg-[#556B2F] text-white border-[#556B2F] shadow-xs"
                                : "text-[#666655] bg-[#FDFCF9] border-[#E5E2D8] hover:bg-[#F2F0E9]"
                            }`}
                          >
                            {dietType.replace("-", " ")}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* RECYCLING & HOUSEHOLD WASTE */}
                  <div className="space-y-4 pt-4 border-t border-[#F2F0E9]">
                    <p className="text-[11px] uppercase tracking-widest font-bold text-[#888877] border-l-2 border-[#B0A990] pl-2">
                      4. Waste Management & Re-use
                    </p>

                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#333322]">Recycling Completeness</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(["none", "partial", "full"] as const).map((recyclingType) => (
                          <button
                            key={recyclingType}
                            onClick={() => setCalculator(prev => ({ ...prev, wasteRecycling: recyclingType }))}
                            className={`px-3 py-2 text-xs border rounded-xl font-medium transition capitalize ${
                              calculator.wasteRecycling === recyclingType
                                ? "bg-[#556B2F] text-white border-[#556B2F] shadow-xs"
                                : "text-[#666655] bg-[#FDFCF9] border-[#E5E2D8] hover:bg-[#F2F0E9]"
                            }`}
                          >
                            {recyclingType}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* TRIGGER AI ADVISOR */}
                  <div className="pt-4 border-t border-[#F2F0E9] flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div className="text-center sm:text-left">
                      <p className="text-xs font-bold text-[#556B2F] flex items-center gap-1 justify-center sm:justify-start">
                        <Sparkles className="w-3.5 h-3.5" /> 
                        Planetary Footprint Synced
                      </p>
                      <p className="text-[11px] text-[#888877] mt-0.5">Need customized reduction plans for these numbers?</p>
                    </div>
                    <button
                      onClick={() => {
                        setActiveTab("insights");
                        if (!aiInsights) {
                          handleGenerateAIInsights();
                        }
                      }}
                      className="w-full sm:w-auto px-4 py-2 bg-[#556B2F] text-white rounded-xl text-xs font-bold shadow-xs hover:bg-[#435524] transition duration-150 flex items-center justify-center gap-1.5"
                    >
                      AI Advice Hub
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                </div>

                {/* Right Results Column: Display Metric Card */}
                <div className="lg:col-span-6 space-y-6">
                  <MetricOverview results={results} />
                </div>

              </motion.div>
            )}

            {/* TAB 2: AI INSIGHTS & PERSONAL ADVISOR CHAT */}
            {activeTab === "insights" && (
              <motion.div 
                key="tab-insights"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                
                {/* Left Side: Generative plan cards */}
                <div className="lg:col-span-6 space-y-6">
                  
                  {/* Generate / Header card */}
                  <div className="bg-[#F2F0E9] border border-[#E5E2D8] rounded-[32px] p-6 lg:p-8 flex flex-col justify-between relative overflow-hidden">
                    <div className="absolute right-0 top-0 opacity-10 w-44 h-44 -mr-8 -mt-8 bg-[#556B2F] rounded-full"></div>
                    
                    <div className="space-y-3 relative z-10">
                      <span className="px-3 py-1 bg-[#556B2F]/10 text-[#556B2F] rounded-full text-xs font-bold inline-block">
                        Planetary Boundary Research AI
                      </span>
                      <h3 className="text-2xl font-serif italic text-[#556B2F] tracking-tight">
                        Generative Impact Analysis
                      </h3>
                      <p className="text-sm leading-relaxed text-[#666655]">
                        Terra utilizes server-side Gemini models to critique your transportation, food, and energy limits, yielding customized, daily-savable carbon metrics.
                      </p>
                    </div>

                    <div className="mt-6 flex flex-col sm:flex-row gap-4 items-center relative z-10">
                      <button
                        onClick={handleGenerateAIInsights}
                        disabled={loadingInsights}
                        className="w-full sm:w-auto px-5 py-2.5 bg-[#556B2F] text-white rounded-xl text-xs font-bold transition shadow-xs hover:bg-[#435524] disabled:bg-[#8F9779] flex items-center justify-center gap-2 shrink-0"
                      >
                        {loadingInsights ? (
                          <>
                            <div className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin"></div>
                            Rebuilding Profile...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-3.5 h-3.5" />
                            {aiInsights ? "Re-evaluate Carbon Profile" : "Generate Custom Action Plan"}
                          </>
                        )}
                      </button>
                      
                      {aiInsights && (
                        <p className="text-[11px] text-[#888877]">
                          Profile sync timestamp: <strong className="font-mono">{new Date().toLocaleDateString()}</strong>
                        </p>
                      )}
                    </div>

                    {insightsError && (
                      <div className="mt-4 p-3.5 bg-rose-50 text-rose-800 rounded-xl border border-rose-200/50 text-xs flex gap-2 items-start">
                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                        <p>{insightsError}</p>
                      </div>
                    )}
                  </div>

                  {/* Generated Analysis sections */}
                  {!aiInsights && !loadingInsights ? (
                    <div className="bg-white border border-[#E5E2D8] border-dashed rounded-[32px] p-8 text-center space-y-4">
                      <div className="w-12 h-12 rounded-full bg-[#F2F0E9] flex items-center justify-center text-[#556B2F] mx-auto text-xl">
                        ✦
                      </div>
                      <div className="max-w-md mx-auto space-y-1">
                        <h4 className="font-serif font-bold text-lg text-[#333322]">No Active Generative Profile Yet</h4>
                        <p className="text-xs text-[#888877] leading-relaxed">
                          Click the generate button above to let our server-side Eco-Advisor process your current transport, diet, and utility settings into customized habit savings, complete with metric calculations.
                        </p>
                      </div>
                    </div>
                  ) : loadingInsights ? (
                    <div className="bg-white border border-[#E5E2D8] rounded-[32px] p-8 space-y-6">
                      <div className="space-y-2">
                        <div className="h-4 bg-[#F2F0E9] rounded-md animate-pulse w-1/4"></div>
                        <div className="h-6 bg-[#F2F0E9] rounded-md animate-pulse w-3/4"></div>
                      </div>
                      <div className="space-y-3 pt-4 border-t border-[#F2F0E9]">
                        <div className="h-3 bg-[#F2F0E9] rounded-sm animate-pulse w-full"></div>
                        <div className="h-3 bg-[#F2F0E9] rounded-sm animate-pulse w-11/12"></div>
                        <div className="h-3 bg-[#F2F0E9] rounded-sm animate-pulse w-5/6"></div>
                      </div>
                      <div className="grid grid-cols-3 gap-4 pt-4">
                        <div className="h-16 bg-[#F2F0E9] rounded-2xl animate-pulse"></div>
                        <div className="h-16 bg-[#F2F0E9] rounded-2xl animate-pulse"></div>
                        <div className="h-16 bg-[#F2F0E9] rounded-2xl animate-pulse"></div>
                      </div>
                    </div>
                  ) : (
                    aiInsights && (
                      <div className="space-y-6">
                        
                        {/* Summary Block */}
                        <div className="bg-white border border-[#E5E2D8] rounded-[32px] p-6 lg:p-8 space-y-4 shadow-2xs">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#888877]">Planetary Synoptic Summary</h4>
                          <p className="font-serif text-lg italic text-[#333322] leading-relaxed">
                            "{aiInsights.summary}"
                          </p>
                        </div>

                        {/* Category Critique Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          
                          <div className="bg-white border border-[#E5E2D8] rounded-2xl p-5 space-y-3">
                            <span className="w-1.5 h-6 rounded-full bg-[#8F9779] inline-block"></span>
                            <h5 className="font-semibold text-xs text-[#333322] uppercase tracking-wider">Transportation</h5>
                            <p className="text-xs text-[#666655] leading-relaxed">
                              {aiInsights.categoryInsights.transport}
                            </p>
                          </div>

                          <div className="bg-white border border-[#E5E2D8] rounded-2xl p-5 space-y-3">
                            <span className="w-1.5 h-6 rounded-full bg-[#BC9D7E] inline-block"></span>
                            <h5 className="font-semibold text-xs text-[#333322] uppercase tracking-wider font-mono">Utility Energy</h5>
                            <p className="text-xs text-[#666655] leading-relaxed">
                              {aiInsights.categoryInsights.energy}
                            </p>
                          </div>

                          <div className="bg-white border border-[#E5E2D8] rounded-2xl p-5 space-y-3">
                            <span className="w-1.5 h-6 rounded-full bg-[#D2B48C] inline-block"></span>
                            <h5 className="font-semibold text-xs text-[#333322] uppercase tracking-wider">Diet & Nutrition</h5>
                            <p className="text-xs text-[#666655] leading-relaxed">
                              {aiInsights.categoryInsights.diet}
                            </p>
                          </div>

                        </div>

                        {/* AI Recommended Custom Habit definitions */}
                        <div className="bg-white border border-[#E5E2D8] rounded-[32px] p-6 space-y-4">
                          <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#888877]">
                            Generative Habit Prescriptions
                          </h4>
                          <p className="text-xs text-[#666655]">
                            The following actions were created specifically for your profile. They are now automatically preloaded in your **Action Logger list** for tracking!
                          </p>

                          <div className="divide-y divide-[#F2F0E9] space-y-1">
                            {aiInsights.recommendedHabits.map((item, index) => (
                              <div key={index} className="flex gap-4 items-start py-3.5 first:pt-0 last:pb-0">
                                <div className="w-7 h-7 rounded-full bg-[#556B2F]/10 text-[#556B2F] text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                                  {index + 1}
                                </div>
                                <div className="flex-1">
                                  <div className="flex justify-between items-center gap-2">
                                    <h5 className="text-sm font-semibold text-[#333322]">{item.name}</h5>
                                    <span className="text-xs font-mono font-bold text-[#556B2F] bg-[#F2F0E9] px-2 py-0.5 rounded">
                                      +{item.kgCo2Saved} kg Today
                                    </span>
                                  </div>
                                  <p className="text-xs text-[#666655] mt-1 pr-6 leading-relaxed">
                                    {item.description}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>

                      </div>
                    )
                  )}

                </div>

                {/* Right Side: Interactive AI Advisor chat panel */}
                <div className="lg:col-span-6 bg-white border border-[#E5E2D8] rounded-[32px] h-[550px] flex flex-col overflow-hidden">
                  
                  {/* Chat header */}
                  <div className="px-5 py-4 bg-[#F2F0E9] border-b border-[#E5E2D8] flex justify-between items-center shrink-0">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#556B2F] text-white flex items-center justify-center text-sm font-bold">
                        ✦
                      </div>
                      <div>
                        <h4 className="font-serif italic font-semibold text-sm text-[#333322]">Conversational Eco-Advisor</h4>
                        <p className="text-[10px] uppercase font-mono text-[#666655]">Live planetary insights advice</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        if (window.confirm("Restore conversational session logs back to standard welcome status?")) {
                          setChatMessages([
                            {
                              id: "welcome",
                              role: "assistant",
                              content: "Hello! I am your personal **Terra Eco-Advisor**. Ask me any practical tips to reduce home heating, cook sustainable meals, save commute emissions, or offset your footprints!",
                              timestamp: new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
                            }
                          ]);
                        }
                      }}
                      className="p-1 px-2 border border-[#E5E2D8] hover:bg-white text-[10px] font-mono text-[#888877] rounded-lg transition"
                    >
                      Clear Logs
                    </button>
                  </div>

                  {/* Messages Scroll Area */}
                  <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-[#FDFCF9]">
                    {chatMessages.map((msg) => {
                      const isAI = msg.role === "assistant";
                      return (
                        <div 
                          key={msg.id} 
                          className={`flex gap-3 max-w-[85%] ${isAI ? "self-start" : "ml-auto flex-row-reverse"}`}
                        >
                          {isAI && (
                            <div className="w-6 h-6 rounded-full bg-[#F2F0E9] border border-[#E5E2D8] text-[#556B2F] flex items-center justify-center text-xs shrink-0 font-serif italic mt-1 font-bold shadow-xs">
                              ◈
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className={`p-3.5 rounded-2xl text-xs leading-relaxed ${
                              isAI 
                                ? "bg-white border border-[#E5E2D8] text-[#333322] shadow-[0_1px_2px_rgba(0,0,0,0.03)]" 
                                : "bg-[#556B2F] text-white"
                            }`}>
                              {/* Quick custom bold highlighting parse */}
                              {msg.content.split("\n\n").map((para, pIdx) => {
                                // Basic markdown bold replacement logic
                                const words = para.split(" ");
                                return (
                                  <p key={pIdx} className={pIdx > 0 ? "mt-2" : ""}>
                                    {para.split("**").map((textBlock, tIdx) => {
                                      return tIdx % 2 === 1 ? (
                                        <strong key={tIdx} className="font-bold">{textBlock}</strong>
                                      ) : (
                                        textBlock
                                      );
                                    })}
                                  </p>
                                );
                              })}
                            </div>
                            <span className={`block text-[9px] font-mono text-[#888877] ${isAI ? "pl-1" : "text-right pr-1"}`}>
                              {msg.timestamp}
                            </span>
                          </div>
                        </div>
                      );
                    })}

                    {isTyping && (
                      <div className="flex gap-3 max-w-[85%] self-start">
                        <div className="w-6 h-6 rounded-full bg-[#F2F0E9] border border-[#E5E2D8] text-[#556B2F] flex items-center justify-center text-xs shrink-0 font-serif italic mt-1 font-bold animate-pulse">
                          ◈
                        </div>
                        <div className="bg-white border border-[#E5E2D8] p-3 px-4 rounded-2xl text-xs flex items-center gap-1.5 shadow-2xs">
                          <span className="w-1.5 h-1.5 bg-[#888877] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#888877] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                          <span className="w-1.5 h-1.5 bg-[#888877] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                        </div>
                      </div>
                    )}
                    <div ref={chatBottomRef} />
                  </div>

                  {/* Starter conversational suggestion chips */}
                  {chatMessages.length === 1 && (
                    <div className="px-5 py-3 border-t border-[#E5E2D8] bg-[#F2F0E9]/30 flex flex-nowrap overflow-x-auto gap-2 scrollbar-none shrink-0">
                      {[
                        "How can I reduce transit emissions?",
                        "Meal tips for low carbon footprint?",
                        "Vampire energy household advice?",
                        "Thermostat heating calculations"
                      ].map((topic, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleStarterTopic(topic)}
                          className="px-3 py-1.5 bg-white hover:bg-[#F2F0E9] border border-[#E5E2D8] text-[#666655] rounded-lg text-[10px] font-medium shrink-0 transition"
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Chat Input form */}
                  <form 
                    onSubmit={(e) => {
                      e.preventDefault();
                      handleSendChatMessage(userQuery);
                    }}
                    className="p-4 border-t border-[#E5E2D8] bg-[#F2F0E9] flex gap-2.5 items-center shrink-0"
                  >
                    <input
                      type="text"
                      className="flex-1 bg-white border border-[#E5E2D8] rounded-xl px-3.5 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
                      placeholder="Ask Terra: e.g. How does buying local help emissions?"
                      value={userQuery}
                      onChange={(e) => setUserQuery(e.target.value)}
                      disabled={isTyping}
                    />
                    <button
                      type="submit"
                      disabled={!userQuery.trim() || isTyping}
                      className="px-3 py-2 bg-[#556B2F] hover:bg-[#435524] disabled:bg-[#8F9779] text-white rounded-xl text-xs font-semibold shrink-0 transition"
                    >
                      Ask
                    </button>
                  </form>

                </div>

              </motion.div>
            )}

            {/* TAB 3: DAILY OFFSET LOGGER & HISTORIC HUB */}
            {activeTab === "logger" && (
              <motion.div 
                key="tab-logger"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
              >
                
                {/* Left side: Available actions logger ledger */}
                <div className="lg:col-span-8 bg-white border border-[#E5E2D8] rounded-[32px] p-6 lg:p-8 space-y-6">
                  
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-2 border-b border-[#F2F0E9]">
                    <div className="flex items-center gap-2">
                      <Leaf className="w-5 h-5 text-[#556B2F]" />
                      <h3 className="text-lg font-serif font-bold text-[#556B2F]">Available Habits Ledger</h3>
                    </div>
                    
                    <button
                      onClick={() => setShowAddCustomForm(!showAddCustomForm)}
                      className="p-1.5 px-3 bg-[#556B2F]/10 text-[#556B2F] hover:bg-[#556B2F]/20 text-xs rounded-xl font-bold transition flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      Add Custom Habit
                    </button>
                  </div>

                  {/* Add Custom Habit Form (Toggle) */}
                  <AnimatePresence>
                    {showAddCustomForm && (
                      <motion.form
                        onSubmit={handleAddCustomHabit}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="bg-[#F2F0E9] p-5 rounded-2xl border border-[#E5E2D8] space-y-4 overflow-hidden"
                      >
                        <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-[#333322]">Define Custom Habit</h4>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                          <div className="sm:col-span-6 space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#666655]">Habit Title</label>
                            <input
                              type="text"
                              required
                              value={newActionName}
                              onChange={(e) => setNewActionName(e.target.value)}
                              className="w-full bg-white border border-[#E5E2D8] rounded-lg px-2.5 py-1.5 text-xs"
                              placeholder="e.g. Carpooled to school"
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#666655]">Est. CO₂ Saved (kg)</label>
                            <input
                              type="number"
                              required
                              step="0.1"
                              value={newActionSavedKg}
                              onChange={(e) => setNewActionSavedKg(e.target.value)}
                              className="w-full bg-white border border-[#E5E2D8] rounded-lg px-2.5 py-1.5 text-xs font-mono"
                              placeholder="1.5"
                            />
                          </div>

                          <div className="sm:col-span-3 space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#666655]">Category</label>
                            <select
                              value={newActionCategory}
                              onChange={(e: any) => setNewActionCategory(e.target.value)}
                              className="w-full bg-white border border-[#E5E2D8] rounded-lg px-2.5 py-1.5 text-xs"
                            >
                              <option value="transportation">Transportation</option>
                              <option value="energy">Home Utility</option>
                              <option value="lifestyle">Lifestyle</option>
                            </select>
                          </div>

                          <div className="sm:col-span-12 space-y-1.5">
                            <label className="block text-[11px] font-bold text-[#666655]">Description / Environmental Impact Mechanism</label>
                            <input
                              type="text"
                              required
                              value={newActionDesc}
                              onChange={(e) => setNewActionDesc(e.target.value)}
                              className="w-full bg-white border border-[#E5E2D8] rounded-lg px-2.5 py-1.5 text-xs"
                              placeholder="e.g. Commutes shared with classmate, eliminating 1 personal vehicle leg."
                            />
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            type="button"
                            onClick={() => setShowAddCustomForm(false)}
                            className="px-3 py-1.5 border border-[#E5E2D8] rounded-xl text-xs"
                          >
                            Cancel
                          </button>
                          <button
                            type="submit"
                            className="px-4 py-1.5 bg-[#556B2F] text-white rounded-xl text-xs font-bold"
                          >
                            Save Habit
                          </button>
                        </div>
                      </motion.form>
                    )}
                  </AnimatePresence>

                  {/* Habit cards listed */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allAvailableActions.map((act) => {
                      const todayLog = loggedDays[todayKey] || { actionsLogged: [] };
                      const isLoggedToday = todayLog.actionsLogged.includes(act.id);
                      
                      // Choose emoji based on name elements
                      let emoji = "🌱";
                      const n = act.name.toLowerCase();
                      if (n.includes("commute") || n.includes("cycle") || n.includes("bike") || n.includes("transit") || n.includes("walk")) emoji = "🚲";
                      else if (n.includes("meat") || n.includes("plant") || n.includes("vegan") || n.includes("diet") || n.includes("meal")) emoji = "🥗";
                      else if (n.includes("electronic") || n.includes("unplug") || n.includes("energy") || n.includes("vampire")) emoji = "🔌";
                      else if (n.includes("dry") || n.includes("hang") || n.includes("laundry") || n.includes("clothes")) emoji = "👕";
                      else if (n.includes("shower") || n.includes("hot water") || n.includes("water")) emoji = "🚿";
                      else if (n.includes("thermostat") || n.includes("heat") || n.includes("co2")) emoji = "🌡️";

                      let badgeTheme = "bg-[#B0A990]/10 text-[#333322]";
                      if (act.category === "transportation") badgeTheme = "bg-[#8F9779]/10 text-[#8F9779]";
                      else if (act.category === "energy") badgeTheme = "bg-[#BC9D7E]/10 text-[#BC9D7E]";

                      return (
                        <div 
                          key={act.id}
                          className={`border rounded-2xl p-4 flex gap-4 transition duration-150 h-full justify-between flex-col ${
                            isLoggedToday 
                              ? "bg-[#556B2F]/5 border-[#556B2F]/30" 
                              : "bg-[#FDFCF9]/50 border-[#E5E2D8] hover:bg-[#F2F0E9]/30"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start gap-2">
                              {/* Left icon wrapper */}
                              <div className="flex gap-2.5 items-center">
                                <span className="text-xl shrink-0">{emoji}</span>
                                <h4 className="font-semibold text-sm text-[#333322] leading-snug">{act.name}</h4>
                              </div>
                              <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded shrink-0 bg-white border border-[#E5E2D8]">
                                {act.kgCo2Saved} kg
                              </span>
                            </div>
                            <p className="text-xs text-[#666655] px-0.5 leading-relaxed">{act.description}</p>
                          </div>

                          <div className="pt-3 border-t border-[#F2F0E9] flex justify-between items-center mt-2 shrink-0">
                            <div className="flex gap-1.5 items-center">
                              <span className={`text-[10px] font-mono capitalize px-2 py-0.5 rounded-full ${badgeTheme}`}>
                                {act.category === "energy" ? "Utility Energy" : act.category}
                              </span>
                              {act.isCustomAI && (
                                <span className="bg-orange-50 text-orange-700 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase border border-orange-100">AI</span>
                              )}
                              {!act.isCustomAI && act.id.startsWith("custom-") && (
                                <span className="bg-blue-50 text-blue-700 text-[9px] font-bold px-1.5 py-0.2 rounded font-mono uppercase border border-blue-100">Personal</span>
                              )}
                            </div>

                            <div className="flex items-center gap-1.5">
                              {/* Only permit deleting created custom actions to keep defaults intact */}
                              {act.id.startsWith("custom-") && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCustomHabit(act.id)}
                                  className="p-1.5 text-[#888877] hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                                  title="Delete custom action"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}

                              <button
                                onClick={() => handleToggleLogAction(act.id)}
                                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 leading-none ${
                                  isLoggedToday
                                    ? "bg-[#556B2F] text-white shadow-3xs"
                                    : "border border-[#E5E2D8] text-[#556B2F] hover:bg-[#F2F0E9] bg-white"
                                }`}
                              >
                                {isLoggedToday ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 stroke-[3px]" />
                                    Logged
                                  </>
                                ) : (
                                  "+ Log Action"
                                )}
                              </button>
                            </div>
                          </div>

                        </div>
                      );
                    })}
                  </div>

                </div>

                {/* Right side: Today tracker and historic summary logs */}
                <div className="lg:col-span-4 space-y-6">
                  
                  {/* Today score widget */}
                  <div className="bg-[#F2F0E9] border border-[#E5E2D8] rounded-[32px] p-6 text-center space-y-4">
                    <span className="text-[10px] uppercase font-mono font-bold tracking-widest text-[#888877]">Today's Offset Track</span>
                    
                    <div className="space-y-1">
                      <p className="text-5xl font-serif font-bold text-[#556B2F]">
                        {(loggedDays[todayKey]?.totalKgSaved || 0).toFixed(1)}
                      </p>
                      <p className="text-xs font-mono text-[#666655] uppercase tracking-wide">kg CO₂e Offsets Saved Today</p>
                    </div>

                    <div className="pt-2 flex justify-center gap-6 text-xs text-[#666655]">
                      <div className="text-center">
                        <span className="block font-mono font-bold text-gray-900 border-b border-[#D5D2C8] pb-1">
                          {loggedDays[todayKey]?.actionsLogged.length || 0}
                        </span>
                        <span className="text-[10px] mt-1 block">Logged Actions</span>
                      </div>
                      <div className="border-r border-[#D5D2C8] my-1"></div>
                      <div className="text-center">
                        <span className="block font-mono font-bold text-gray-900 border-b border-[#D5D2C8] pb-1">
                          {currentStreak} Days
                        </span>
                        <span className="text-[10px] mt-1 block">Consecutive Logs</span>
                      </div>
                    </div>
                  </div>

                  {/* Offset History list */}
                  <div className="bg-white border border-[#E5E2D8] rounded-[32px] p-6 space-y-4">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-mono font-bold uppercase tracking-widest text-[#888877]">Offset History logs</h4>
                      <span className="text-[10px] font-mono text-[#888877]">{Object.keys(loggedDays).length} records</span>
                    </div>

                    <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1">
                      {(Object.values(loggedDays) as LoggedDay[])
                        .sort((a, b) => b.date.localeCompare(a.date))
                        .map((day) => {
                          const dateObj = new Date(day.date + "T00:00:00");
                          const formattedDate = dateObj.toLocaleDateString(undefined, { 
                            month: "short", 
                            day: "numeric", 
                            weekday: "short" 
                          });

                          return (
                            <div 
                              key={day.date} 
                              className="p-3 bg-[#FDFCF9] rounded-xl border border-[#E5E2D8]/80 flex justify-between items-center transition"
                            >
                              <div className="space-y-0.5">
                                <p className="text-xs font-semibold text-[#333322]">{formattedDate}</p>
                                <p className="text-[10px] text-[#888877] font-mono">{day.actionsLogged.length} habits completed</p>
                              </div>
                              <span className="text-xs font-mono font-bold text-[#556B2F] bg-[#556B2F]/10 px-2 py-1 rounded">
                                -{day.totalKgSaved} kg CO₂
                              </span>
                            </div>
                          );
                        })}
                    </div>

                    <div className="pt-2 border-t border-[#F2F0E9] text-center">
                      <div className="p-3.5 bg-[#556B2F] rounded-2xl text-white flex flex-col justify-center text-center">
                        <span className="text-[10px] opacity-75 uppercase tracking-widest font-bold font-mono">Planetary Absorption Equivalence</span>
                        <p className="text-sm italic leading-relaxed mt-1 pr-1 font-serif">
                          "Your cumulative habit offsets have kept <strong>{totalAccumulatedSavings.toFixed(1)} kg CO₂</strong> out of the atmosphere—equivalent to the absorption capacity of a full mature forest tree over <strong>{Math.ceil(totalAccumulatedSavings / 22)} years</strong>!"
                        </p>
                      </div>
                    </div>
                  </div>

                </div>

              </motion.div>
            )}

            {activeTab === "tips" && (
              <motion.div
                key="tab-tips"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
              >
                <EducationalTipsCustom 
                  onAdoptHabit={handleAdoptEducationalTip} 
                  alreadyAdoptedIds={customActions.map(c => c.id)} 
                />
              </motion.div>
            )}

          </AnimatePresence>
        </div>

      </main>
    </div>
  );
}
