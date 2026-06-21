import { useState, useMemo } from "react";
import { 
  BookOpen, 
  Compass, 
  Leaf, 
  HelpCircle, 
  Check, 
  Sparkles, 
  Search, 
  TrendingDown, 
  Lightbulb, 
  Info, 
  Flame, 
  Car, 
  Activity, 
  BadgeAlert, 
  ShoppingBag,
  Zap,
  UtensilsCrossed,
  Layers,
  ArrowRight
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { HabitAction } from "../types";

export interface EducationalTip {
  id: string;
  title: string;
  science: string;
  takeaway: string;
  category: "transportation" | "diet" | "energy" | "consumption";
  impact: "low" | "medium" | "high";
  kgSavedPerYear: number;
  funFact: string;
}

const CURATED_TIPS: EducationalTip[] = [
  {
    id: "tip-tires",
    title: "Keep Tires Properly Inflated",
    science: "Under-inflated tires increase rolling resistance, making your car's engine work harder. Correct tire pressure improves fuel mileage by up to 3% directly, conserving gasoline.",
    takeaway: "Check your tire pressure monthly. Keeping them at the recommended PSI saves fuel, extends tire life, and cuts carbon.",
    category: "transportation",
    impact: "medium",
    kgSavedPerYear: 100,
    funFact: "Over 2 billion gallons of fuel are wasted worldwide each year solely due to driving on under-inflated tires!"
  },
  {
    id: "tip-driving",
    title: "Smooth Acceleration & Coasting",
    science: "Aggressive driving like speeding, rapid acceleration, and sudden braking reduces gas mileage by 15% to 30% on highways, triggering high unburned hydrocarbon emissions.",
    takeaway: "Accelerate gently and coast to a stop. Keeping speeds steady dramatically dampens fuel combustion limits.",
    category: "transportation",
    impact: "high",
    kgSavedPerYear: 450,
    funFact: "Coasting towards red lights rather than braking at the last second can save up to $150 on gas annually."
  },
  {
    id: "tip-transit",
    title: "Embrace Multi-Modal Commutes",
    science: "Personal gasoline vehicles release high-intensity carbon per passenger mile. Bikes, trains, and electric buses share energy expenditures across multiple riders, reducing your direct footprint.",
    takeaway: "Substitute at least one drive per week with walking, cycling, or public transit.",
    category: "transportation",
    impact: "high",
    kgSavedPerYear: 350,
    funFact: "Taking public transport reduces your carbon transit emissions by over 70% compared to driving single-occupancy vehicles."
  },
  {
    id: "tip-meatless",
    title: "Go Meatless Once a Week",
    science: "Industrial livestock farming is incredibly land- and water-intensive, producing high methane output. Transitioning to plant-based proteins directly offsets agricultural heating.",
    takeaway: "Adopt 'Meatless Mondays' or dedicate another day completely to plant proteins like lentils, tofu, or chickpeas.",
    category: "diet",
    impact: "high",
    kgSavedPerYear: 220,
    funFact: "Producing 1 kg of beef releases up to 60 kg of greenhouse gases, whereas lentils produce less than 1 kg!"
  },
  {
    id: "tip-foodwaste",
    title: "Freeze Fruits & Veggies Before Spoiling",
    science: "Over one-third of global food is wasted. When organic matter decomposes in oxygen-poor landfills, it generates methane, which holds 25 times more warming potential than CO₂.",
    takeaway: "Meal-plan weekly, write accurate lists, and freeze surplus ingredients or wilting greens before they spoil.",
    category: "diet",
    impact: "high",
    kgSavedPerYear: 300,
    funFact: "If food waste were categorized as an independent nation, it would rank as the third largest carbon emitter globally."
  },
  {
    id: "tip-seasonal",
    title: "Prioritize In-Season Organic Yields",
    science: "Out-of-season produce is either flown long distances or cultivated in energy-intensive, heated artificial greenhouses. Local, seasonal choices heavily bypass transport and HVAC costs.",
    takeaway: "Shop local farmers' markets and plan your meals around what naturally harvest-ripens in your local climate.",
    category: "diet",
    impact: "medium",
    kgSavedPerYear: 120,
    funFact: "Air-freighted food is responsible for roughly 11% of dietary transportation emissions despite representing 0.2% of food weight."
  },
  {
    id: "tip-hvac",
    title: "Set Thermostat 1°C Cooler in Winter",
    science: "Space heating and air conditioning represent the largest share of household utility power. High indoor-to-outdoor temperature deltas require exponential engine workload.",
    takeaway: "Lower your winter thermostat by 1°C (and raise it by 1°C during summer cooling) to drastically downscale HVAC runs.",
    category: "energy",
    impact: "high",
    kgSavedPerYear: 320,
    funFact: "Adjusting your household temperature target by just 1°C can chop up to 10% off your energy expense!"
  },
  {
    id: "tip-vampire",
    title: "Cut Out Vampire Standby Loads",
    science: "Electronics (TVs, chargers, stereos, gaming rigs) remain in active standby 'vampire' mode to receive remote signals, constantly pulling voltage from household circuits.",
    takeaway: "Use smart power strips or unplug chargers and entertainment systems when you leave the house or go to sleep.",
    category: "energy",
    impact: "medium",
    kgSavedPerYear: 150,
    funFact: "Vampire energy consumption accounts for roughly 1% of global carbon emissions, essentially wasting energy 24/7."
  },
  {
    id: "tip-coldwash",
    title: "Wash Clothes with Cold Water",
    science: "Up to 90% of a laundry machine's energy consumption goes strictly to heating the water. Cold water enzymes can achieve beautiful hygiene without thermal demand.",
    takeaway: "Turn your laundry setting dial to cold. Save hot cycles exclusively for heavy grease or sanitation needs.",
    category: "energy",
    impact: "medium",
    kgSavedPerYear: 180,
    funFact: "Cold water washing also extends the lifetime of garments, reducing fabric wear and microplastic shedding."
  },
  {
    id: "tip-fastfashion",
    title: "Avoid Disposable Fast Fashion",
    science: "Modern synthetic textiles like polyester are produced via petrochemicals. Fast clothing lifecycles create heavy manufacturing energy demands and feed massive combustion piles.",
    takeaway: "Choose high-quality, durable fibers, repair tears, and opt for high-quality secondhand thrift apparel.",
    category: "consumption",
    impact: "high",
    kgSavedPerYear: 400,
    funFact: "The average fast fashion shirt is worn fewer than 7 times before reaching a landfill or incineration site."
  },
  {
    id: "tip-reusables",
    title: "Switch to Solid Reusables",
    science: "Single-use bottles, cups, and bags require active fossil fuel extraction, refining heat, transport fuel, and waste systems—only to be discarded after 15 minutes.",
    takeaway: "Keep a reliable reusable steel bottle, canvas bags, and a steel coffee mug in your car or backpack.",
    category: "consumption",
    impact: "medium",
    kgSavedPerYear: 110,
    funFact: "Manufacturing single-use plastic bottles in the US consumes more than 17 million barrels of oil every single year!"
  },
  {
    id: "tip-fiver",
    title: "Audit Demands with the 5 R's",
    science: "Refusing, reducing, and reusing raw items is far more effective than recycling. Extraction and processing cycles dominate a consumer item's cradle-to-grave emissions.",
    takeaway: "Practice the 48-hour pause rule before any major non-essential purchase to ask if you can borrow, rent, or skip it.",
    category: "consumption",
    impact: "high",
    kgSavedPerYear: 500,
    funFact: "Up to 80% of personal household carbon footprint is locked within the supply chains of products we buy and discard."
  }
];

interface EducationalTipsProps {
  onAdoptHabit: (habit: HabitAction) => void;
  alreadyAdoptedIds: string[];
}

export default function EducationalTips({ onAdoptHabit, alreadyAdoptedIds }: EducationalTipsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [funFactIndex, setFunFactIndex] = useState<number>(0);
  const [adoptedTips, setAdoptedTips] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("terra_read_tips");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error("Error parsing read tips:", e);
      return [];
    }
  });

  // Cycle through Curated Facts
  const handleNextFact = () => {
    setFunFactIndex((prev) => (prev + 1) % CURATED_TIPS.length);
  };

  const handleToggleReadTip = (tipId: string) => {
    const newAdopted = adoptedTips.includes(tipId)
      ? adoptedTips.filter((id) => id !== tipId)
      : [...adoptedTips, tipId];
    setAdoptedTips(newAdopted);
    localStorage.setItem("terra_read_tips", JSON.stringify(newAdopted));
  };

  // Convert an educational tip into a functional habit action
  const handleAdoptAsHabit = (tip: EducationalTip) => {
    // Determine target category
    const targetCategory: 'transportation' | 'energy' | 'lifestyle' = 
      tip.category === "transportation" ? "transportation" :
      tip.category === "energy" ? "energy" : "lifestyle";

    // Convert estimated annual saved kg to a daily habit weight
    // e.g. 365 kg per year is 1 kg per day
    const dailySaved = Number((tip.kgSavedPerYear / 365).toFixed(1)) || 1.0;

    const habit: HabitAction = {
      id: `adopted-${tip.id}`,
      name: tip.title,
      description: tip.takeaway,
      kgCo2Saved: dailySaved,
      category: targetCategory,
      isCustomAI: false
    };

    onAdoptHabit(habit);
    
    // Also mark as read/adopted in local list
    if (!adoptedTips.includes(tip.id)) {
      handleToggleReadTip(tip.id);
    }
  };

  // Filter tips based on search query and category
  const filteredTips = useMemo(() => {
    return CURATED_TIPS.filter((tip) => {
      const matchesCategory = selectedCategory === "all" || tip.category === selectedCategory;
      const matchesSearch = 
        tip.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.science.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tip.takeaway.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [selectedCategory, searchQuery]);

  // Overall statistics
  const totalAnnualSavingsSelected = useMemo(() => {
    return CURATED_TIPS.reduce((sum, tip) => sum + tip.kgSavedPerYear, 0);
  }, []);

  const totalCuratedCount = CURATED_TIPS.length;
  const completedCount = adoptedTips.length;
  const progressPercentage = Math.round((completedCount / totalCuratedCount) * 100);

  const activeFact = CURATED_TIPS[funFactIndex];

  return (
    <div className="space-y-8" id="educational-tips-container">
      
      {/* HEADER SECTION */}
      <div className="bg-[#556B2F] rounded-[32px] p-6 lg:p-8 text-white relative overflow-hidden shadow-md">
        <div className="absolute right-0 bottom-0 opacity-10 w-64 h-64 -mr-12 -mb-12 bg-white rounded-full"></div>
        <div className="absolute left-1/3 top-0 opacity-10 w-32 h-32 -mt-8 bg-white rounded-full"></div>
        
        <div className="max-w-xl space-y-3 relative z-10">
          <span className="px-3 py-1 bg-white/20 text-white rounded-full text-xs font-semibold uppercase tracking-wider inline-block">
            Decarbonization School
          </span>
          <h3 className="text-2xl sm:text-3xl font-serif italic tracking-tight">
            Curated Carbon Boundary Insights
          </h3>
          <p className="text-xs sm:text-sm text-white/90 leading-relaxed font-sans">
            Reduce carbon emissions effectively by understanding the science behind your habits. Review these clear planetary criteria, get actionable takeaways, and select action items to track in your ledger.
          </p>
        </div>

        {/* Global Progress Indicators */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4 items-center pt-6 border-t border-white/20 relative z-10">
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-mono font-medium">
              <span>Readiness Progress</span>
              <span className="font-bold">{completedCount} of {totalCuratedCount} Tips</span>
            </div>
            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
              <div 
                className="bg-[#D2B48C] h-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
          <div className="text-left sm:text-right">
            <p className="text-[10px] uppercase font-mono tracking-widest text-white/70">Total Potential Offsets</p>
            <p className="text-2xl font-serif italic text-[#D2B48C] font-bold">
              ~{totalAnnualSavingsSelected.toLocaleString()} kg CO₂ / yr
            </p>
          </div>
        </div>
      </div>

      {/* DYNAMIC FUN FACT SELECTOR BOX */}
      <div className="bg-[#F2F0E9] border border-[#E5E2D8] rounded-2xl p-5 flex flex-col sm:flex-row gap-5 items-start justify-between relative overflow-hidden transition-all">
        <div className="flex gap-3.5 items-start">
          <div className="w-10 h-10 rounded-full bg-[#BC9D7E]/20 text-[#A6805D] flex items-center justify-center font-bold text-lg shrink-0">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#888877]">
              Did You Know? (Fact {funFactIndex + 1}/{totalCuratedCount})
            </span>
            <p className="text-sm font-serif italic text-[#333322] leading-relaxed">
              "{activeFact.funFact}"
            </p>
            <span className="inline-block text-[10px] uppercase font-mono bg-white px-2 py-0.5 rounded text-[#556B2F] border border-[#E5E2D8] font-semibold">
              Source: {activeFact.title}
            </span>
          </div>
        </div>
        
        <button 
          onClick={handleNextFact}
          className="px-3.5 py-2 bg-white hover:bg-[#EAE7DD] border border-[#D5D2C8] text-[#556B2F] rounded-xl text-xs font-semibold shrink-0 transition flex items-center gap-1.5 self-end sm:self-center"
        >
          Next Fact
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* CONTROLS (SEARCH & CATEGORIES) */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between pb-4 border-b border-[#E5E2D8]">
        
        {/* Tab Filters */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {[
            { id: "all", label: "All Areas", icon: Layers },
            { id: "transportation", label: "Transportation", icon: Car },
            { id: "diet", label: "Diet & Food", icon: UtensilsCrossed },
            { id: "energy", label: "Utility Energy", icon: Zap },
            { id: "consumption", label: "Consumption", icon: ShoppingBag }
          ].map((cat) => {
            const Icon = cat.icon;
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs rounded-xl font-medium border flex items-center gap-2 transition ${
                  isActive
                    ? "bg-[#556B2F] text-white border-[#556B2F] shadow-xs"
                    : "bg-white text-[#666655] border-[#E5E2D8] hover:bg-[#F2F0E9] hover:text-[#333322]"
                }`}
              >
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search bar inputs */}
        <div className="relative w-full md:w-72">
          <input
            type="text"
            className="w-full bg-white border border-[#E5E2D8] rounded-xl pl-9 pr-4 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-[#556B2F]"
            placeholder="Search criteria or facts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="w-3.5 h-3.5 text-[#888877] absolute left-3 top-2.5" />
        </div>

      </div>

      {/* TIPS LISTING GRID */}
      {filteredTips.length === 0 ? (
        <div className="text-center py-12 bg-white border border-[#E5E2D8] border-dashed rounded-[32px] space-y-3">
          <p className="text-sm font-semibold text-[#666655]">No matching educational insights found.</p>
          <p className="text-xs text-[#888877]">Try adjusting your search filters or text query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <AnimatePresence mode="popLayout">
            {filteredTips.map((tip, idx) => {
              const isRead = adoptedTips.includes(tip.id);
              const customHabitId = `adopted-${tip.id}`;
              const hasAdoptedHabit = alreadyAdoptedIds.includes(customHabitId);
              
              const categoryColorMap = {
                transportation: { bg: "bg-[#8F9779]/10", text: "text-[#556B2F]", badge: "bg-[#e2e7d7]" },
                diet: { bg: "bg-[#D2B48C]/10", text: "text-[#8C6D4F]", badge: "bg-[#f5ebd8]" },
                energy: { bg: "bg-[#BC9D7E]/10", text: "text-[#A6805D]", badge: "bg-[#f2e6db]" },
                consumption: { bg: "bg-[#B0A990]/10", text: "text-[#736E5C]", badge: "bg-[#ebe8de]" }
              };

              const colors = categoryColorMap[tip.category];

              return (
                <motion.div
                  key={tip.id}
                  layout
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                  className={`bg-white border rounded-[28px] p-5 lg:p-6 flex flex-col justify-between transition-all duration-200 ${
                    isRead ? "border-[#556B2F]/40 shadow-xs" : "border-[#E5E2D8] hover:border-[#D5D2C8] shadow-2xs"
                  }`}
                  id={`educational-card-${tip.id}`}
                >
                  <div className="space-y-4">
                    
                    {/* Card Top Badges */}
                    <div className="flex justify-between items-start gap-2">
                      <div className="flex flex-wrap gap-1.5">
                        <span className={`text-[10px] font-mono tracking-wider font-semibold capitalize px-2 py-0.5 rounded-md ${colors.badge} ${colors.text}`}>
                          {tip.category}
                        </span>
                        
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                          tip.impact === "high" ? "bg-red-50 text-red-700" :
                          tip.impact === "medium" ? "bg-amber-50 text-amber-700" : "bg-blue-50 text-blue-700"
                        }`}>
                          {tip.impact} impact
                        </span>
                      </div>
                      
                      <button
                        onClick={() => handleToggleReadTip(tip.id)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                          isRead 
                            ? "bg-[#556B2F] text-white" 
                            : "bg-[#F2F0E9] hover:bg-[#E5E2D8] text-[#888877]"
                        }`}
                        title={isRead ? "Mark as unread" : "Mark as read"}
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Title */}
                    <h4 className="text-lg font-serif italic text-[#333322] font-semibold leading-snug">
                      {tip.title}
                    </h4>

                    {/* Science & Explanation */}
                    <p className="text-xs text-[#666655] leading-relaxed">
                      {tip.science}
                    </p>

                    {/* High-contrast Takeaway highlight */}
                    <div className={`p-4 rounded-2xl ${colors.bg} border-l-2 border-[#556B2F]`}>
                      <span className="block text-[9px] font-mono uppercase tracking-widest font-bold text-[#888877] mb-1">
                        Actionable Takeaway
                      </span>
                      <p className="text-xs font-medium text-[#333322] leading-tight">
                        {tip.takeaway}
                      </p>
                    </div>

                  </div>

                  {/* Card Bottom: savings valuation and direct adoption actions */}
                  <div className="mt-5 pt-4 border-t border-[#F2F0E9] flex flex-col sm:flex-row gap-3 items-center justify-between">
                    <div>
                      <span className="block text-[10px] uppercase font-mono tracking-widest text-[#888877]">Annual Offset potential</span>
                      <span className="text-sm font-mono font-bold text-[#556B2F]">
                        -{tip.kgSavedPerYear} kg CO₂ / yr
                      </span>
                    </div>

                    <button
                      onClick={() => handleAdoptAsHabit(tip)}
                      disabled={hasAdoptedHabit}
                      className={`w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        hasAdoptedHabit
                          ? "bg-[#F2F0E9] text-[#8F9779] border border-[#E5E2D8]/60 cursor-not-allowed"
                          : "bg-[#556B2F] hover:bg-[#435524] text-white shadow-xs"
                      }`}
                    >
                      {hasAdoptedHabit ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          In Action Logger
                        </>
                      ) : (
                        <>
                          <Leaf className="w-3.5 h-3.5" />
                          Adopt habit
                        </>
                      )}
                    </button>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* FOOTER CALL-TO-ACTION */}
      <div className="bg-[#F2F0E9] border border-[#E5E2D8] rounded-[28px] p-6 text-center space-y-3">
        <h4 className="font-serif leading-snug font-bold text-[#333322] text-lg">Want to calculate personalized custom actions?</h4>
        <p className="text-xs text-[#666655] max-w-lg mx-auto">
          Head over to the <strong>AI Insights</strong> tab. You can trigger an automatic evaluation of your personal transportation values and generate dynamic habits!
        </p>
      </div>

    </div>
  );
}
