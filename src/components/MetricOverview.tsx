import { FootprintResult, CO2_BENCHMARKS } from "../utils/carbonCalculator";
import { Trees, Info, Landmark, MapPin, Globe, ShieldCheck } from "lucide-react";
import { motion } from "motion/react";

interface MetricOverviewProps {
  results: FootprintResult;
}

export default function MetricOverview({ results }: MetricOverviewProps) {
  const { totalAnnualTons, transportAnnualKg, energyAnnualKg, dietAnnualKg, lifestyleAnnualKg, treesNeeded } = results;

  // Determine health levels according to Earth boundary thresholds
  // < 3 tons is excellent (near sustainable target of 2.0)
  // 3 - 8 tons is moderate/average
  // > 8 tons is intensive
  let badgeColor = "bg-[#556B2F]/10 text-[#556B2F] border-[#556B2F]/20";
  let ringColor = "stroke-[#556B2F]";
  let statusText = "Safe Alignment";
  let descriptionText = "Incredible! Your personal carbon footprint is aligned with the planetary target. You are leading by example.";

  if (totalAnnualTons > 8.0) {
    badgeColor = "bg-[#C07A65]/10 text-[#C07A65] border-[#C07A65]/20";
    ringColor = "stroke-[#C07A65]"; // Terracotta Clay for high
    statusText = "Intensive Footprint";
    descriptionText = "Your footprint sits above safe sustainable thresholds. Sustainable upgrades in home energy and travel can yield the highest reduction gains.";
  } else if (totalAnnualTons >= 3.0) {
    badgeColor = "bg-[#BC9D7E]/10 text-[#A6805D] border-[#BC9D7E]/20";
    ringColor = "stroke-[#BC9D7E]"; // Warm Sand for moderate
    statusText = "Moderate Impact";
    descriptionText = "You sit within the average western range. Small habit shifts and targeted lifestyle changes will help you reach the 2.0-ton climate goal.";
  }

  // Calculate percentage of World Average (4.7 tons)
  const pctOfWorldAvg = Math.round((totalAnnualTons / CO2_BENCHMARKS.worldAverage) * 100);

  // Radials Calculation
  const radius = 50;
  const circ = 2 * Math.PI * radius;
  const maxGaugeVal = 16.0;
  const fillPercentage = Math.min(100, (totalAnnualTons / maxGaugeVal) * 100);
  const strokeDashoffset = circ - (fillPercentage / 100) * circ;

  const categories = [
    { name: "Transportation", value: transportAnnualKg, color: "bg-[#8F9779]", rawVal: (transportAnnualKg / 1000).toFixed(1) + " t" },
    { name: "Household Energy", value: energyAnnualKg, color: "bg-[#BC9D7E]", rawVal: (energyAnnualKg / 1000).toFixed(1) + " t" },
    { name: "Nutrition & Diet", value: dietAnnualKg, color: "bg-[#D2B48C]", rawVal: (dietAnnualKg / 1000).toFixed(1) + " t" },
    { name: "Lifestyle & Waste", value: lifestyleAnnualKg, color: "bg-[#B0A990]", rawVal: (lifestyleAnnualKg / 1000).toFixed(1) + " t" },
  ];

  const totalKg = transportAnnualKg + energyAnnualKg + dietAnnualKg + lifestyleAnnualKg;

  return (
    <div className="bg-white rounded-[32px] border border-[#E5E2D8] p-6 lg:p-8 space-y-8" id="results-card">
      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 md:gap-8">
        
        {/* Radial Carbon Gauge */}
        <div className="relative w-44 h-44 flex-shrink-0 flex items-center justify-center">
          <svg className="w-full h-full -rotate-90">
            {/* Soft Neutral Background Ring */}
            <circle
              className="text-[#F2F0E9]"
              strokeWidth="11"
              stroke="currentColor"
              fill="transparent"
              r={radius}
              cx="88"
              cy="88"
            />
            {/* Active Natural Progress Tone */}
            <motion.circle
              className={ringColor}
              strokeWidth="11"
              strokeLinecap="round"
              fill="transparent"
              r={radius}
              cx="88"
              cy="88"
              initial={{ strokeDashoffset: circ }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              style={{ strokeDasharray: circ }}
            />
          </svg>

          {/* Core Metric readouts */}
          <div className="absolute text-center flex flex-col items-center">
            <span className="text-4xl font-serif font-bold text-[#333322]">{totalAnnualTons}</span>
            <span className="text-[10px] font-mono tracking-wider text-[#888877] uppercase mt-0.5">tCO₂e / year</span>
          </div>
        </div>

        {/* Info summary & details */}
        <div className="flex-1 space-y-3.5 text-center sm:text-left">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <span className="text-[10px] uppercase font-mono tracking-widest font-bold text-[#888877]">Annual Standing</span>
            <div className={`px-2.5 py-0.5 rounded-full border text-xs font-semibold ${badgeColor}`}>
              {statusText}
            </div>
          </div>

          <h2 className="text-2xl font-serif italic text-[#556B2F] tracking-tight">
            Climate Alignment Report
          </h2>

          <p className="text-sm leading-relaxed text-[#666655]">
            {descriptionText}
          </p>

          <div className="grid grid-cols-2 gap-4 pt-1">
            <div className="bg-[#F2F0E9] rounded-2xl p-3 border border-[#E5E2D8]/60 flex items-start gap-2.5">
              <Trees className="w-5 h-5 text-[#556B2F] mt-0.5 flex-shrink-0" />
              <div>
                <span className="block text-lg font-bold text-[#333322] leading-tight">{treesNeeded}</span>
                <span className="text-[11px] text-[#888877] font-medium block">Trees absorption offset</span>
              </div>
            </div>

            <div className="bg-[#F2F0E9] rounded-2xl p-3 border border-[#E5E2D8]/60 flex items-start gap-2.5">
              <Globe className="w-5 h-5 text-[#8F9779] mt-0.5 flex-shrink-0" />
              <div>
                <span className="block text-lg font-bold text-[#333322] leading-tight">{pctOfWorldAvg}%</span>
                <span className="text-[11px] text-[#888877] font-medium block">Of global individual avg</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      <hr className="border-[#E5E2D8]" />

      {/* Category Breakdowns */}
      <div className="space-y-4">
        <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#888877]">
          Source impact division
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {categories.map((cat, i) => {
            const rawPercentage = totalKg > 0 ? (cat.value / totalKg) * 100 : 0;
            const percentage = Math.round(rawPercentage);
            return (
              <div key={i} className="space-y-1.5 p-3.5 bg-[#FDFCF9] rounded-2xl border border-[#E5E2D8]/80 hover:bg-[#F2F0E9]/50 transition duration-150">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-[#333322]">{cat.name}</span>
                  <div className="space-x-1.5 font-mono text-[#888877]">
                    <span className="font-bold text-[#556B2F]">{cat.rawVal}</span>
                    <span>({percentage}%)</span>
                  </div>
                </div>
                <div className="relative w-full h-2.5 bg-[#F2F0E9] rounded-full overflow-hidden">
                  <motion.div
                    className={`absolute top-0 left-0 h-full rounded-full ${cat.color}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: "easeOut" }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <hr className="border-[#E5E2D8]" />

      {/* Earth System Standards */}
      <div className="space-y-4">
        <div className="flex items-center gap-1.5">
          <Landmark className="w-4 h-4 text-[#888877]" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-[#888877]">
            Planetary Benchmarks (Annual Tons CO₂)
          </h3>
        </div>

        <div className="space-y-3.5">
          {/* Active Profile */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[#333322] w-28 sm:w-32 py-0.5">Your Footprint</span>
            <div className="flex-1 bg-[#F2F0E9] h-6 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className={`h-full opacity-90 rounded-xl absolute left-0 top-0 transition-all duration-300 ${
                  totalAnnualTons <= 3.0 ? "bg-[#556B2F]" : totalAnnualTons <= 8.0 ? "bg-[#BC9D7E]" : "bg-[#C07A65]"
                }`}
                style={{ width: `${(Math.min(totalAnnualTons, maxGaugeVal) / maxGaugeVal) * 100}%` }}
              />
              <span className="relative z-10 px-2.5 text-[10px] font-mono font-bold text-white uppercase">
                {totalAnnualTons} t (Current)
              </span>
            </div>
          </div>

          {/* Secure Goal */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666655] w-28 sm:w-32 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#556B2F]" />
              Safe Target
            </span>
            <div className="flex-1 bg-[#F2F0E9] h-6 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className="h-full bg-[#556B2F] rounded-xl absolute left-0 top-0"
                style={{ width: `${(CO2_BENCHMARKS.climateTarget / maxGaugeVal) * 100}%` }}
              />
              <span className="relative z-10 px-2.5 text-[10px] font-mono font-bold text-white uppercase">
                {CO2_BENCHMARKS.climateTarget} t (Safe Planetary boundary)
              </span>
            </div>
          </div>

          {/* World Average */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666655] w-28 sm:w-32 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#8F9779]" />
              Global Mean
            </span>
            <div className="flex-1 bg-[#F2F0E9] h-6 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className="h-full bg-[#8F9779] rounded-xl absolute left-0 top-0"
                style={{ width: `${(CO2_BENCHMARKS.worldAverage / maxGaugeVal) * 100}%` }}
              />
              <span className="relative z-10 px-2.5 text-[10px] font-mono font-bold text-white uppercase">
                {CO2_BENCHMARKS.worldAverage} t
              </span>
            </div>
          </div>

          {/* EU Average */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666655] w-28 sm:w-32 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#BC9D7E]" />
              EU Average
            </span>
            <div className="flex-1 bg-[#F2F0E9] h-6 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className="h-full bg-[#BC9D7E] rounded-xl absolute left-0 top-0"
                style={{ width: `${(CO2_BENCHMARKS.euAverage / maxGaugeVal) * 100}%` }}
              />
              <span className="relative z-10 px-2.5 text-[10px] font-mono font-bold text-white uppercase">
                {CO2_BENCHMARKS.euAverage} t
              </span>
            </div>
          </div>

          {/* US Average */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-[#666655] w-28 sm:w-32 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#B0A990]" />
              US Average
            </span>
            <div className="flex-1 bg-[#F2F0E9] h-6 rounded-xl relative overflow-hidden flex items-center">
              <div 
                className="h-full bg-[#B0A990] rounded-xl absolute left-0 top-0"
                style={{ width: `${(CO2_BENCHMARKS.usAverage / maxGaugeVal) * 100}%` }}
              />
              <span className="relative z-10 px-2.5 text-[10px] font-mono font-bold text-white uppercase">
                {CO2_BENCHMARKS.usAverage} t
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-start gap-2.5 text-[12px] leading-relaxed text-[#666655] bg-[#F2F0E9] p-4 rounded-2xl border border-[#E5E2D8]">
          <Info className="w-4 h-4 text-[#888877] mt-0.5 flex-shrink-0" />
          <p>
            The planetary <strong>Climate Target of 2.0 tons</strong> per person annually is defined by climate agreements to keep global heating within 1.5°C over pre-industrial baselines. Moving towards safe standards involves systemic green energy adoption alongside key individual actions.
          </p>
        </div>
      </div>

    </div>
  );
}
