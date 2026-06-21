import { CalculatorData } from "../types";

// Emission coefficients (all factors result in kg CO2 equivalent)
export const EMISSION_FACTORS = {
  car: {
    petrol: 0.192,   // kg CO2 per km
    diesel: 0.171,   // kg CO2 per km
    hybrid: 0.110,   // kg CO2 per km
    electric: 0.053, // kg CO2 per km (average grid dependency)
    none: 0,
  },
  transit: 0.041,    // kg CO2 per km
  flight: 90.0,      // kg CO2 per hour of short/long-haul flight blend
  electricity: 0.40, // kg CO2 per kWh
  gas: 0.20,         // kg CO2 per m3 or equivalent unit
  diet: {
    vegan: 4.10,        // kg CO2 per day
    vegetarian: 4.60,   // kg CO2 per day
    "moderate-meat": 6.80, // kg CO2 per day
    "heavy-meat": 9.00    // kg CO2 per day
  },
  recycling: {
    none: 1.37,     // kg CO2 per day
    partial: 0.82,  // kg CO2 per day
    full: 0.27      // kg CO2 per day
  }
};

// Comparative benchmarks (Annual Metric Tons CO2e per person)
export const CO2_BENCHMARKS = {
  usAverage: 16.0,
  euAverage: 6.4,
  worldAverage: 4.7,
  climateTarget: 2.0 // Recommended target per active individual to limit warming to 1.5°C
};

export interface FootprintResult {
  transportAnnualKg: number;
  energyAnnualKg: number;
  dietAnnualKg: number;
  lifestyleAnnualKg: number;
  totalAnnualKg: number;
  totalAnnualTons: number;
  treesNeeded: number; // 1 mature tree absorbs ~22kg of CO2 per year
}

export function calculateFootprint(data: CalculatorData): FootprintResult {
  // 1. Transportation
  const carFactor = EMISSION_FACTORS.car[data.carType] || 0;
  const carAnnualKg = data.carDistance * carFactor * 52;
  const transitAnnualKg = data.transitDistance * EMISSION_FACTORS.transit * 52;
  const flightsAnnualKg = data.flightsTime * EMISSION_FACTORS.flight;
  const transportAnnualKg = carAnnualKg + transitAnnualKg + flightsAnnualKg;

  // 2. Household Energy
  const electricityAnnualKg = data.electricity * EMISSION_FACTORS.electricity * 12;
  const gasAnnualKg = data.gas * EMISSION_FACTORS.gas * 12;
  const energyAnnualKg = electricityAnnualKg + gasAnnualKg;

  // 3. Diet
  const dietDailyKg = EMISSION_FACTORS.diet[data.diet] || 6.8;
  const dietAnnualKg = dietDailyKg * 365;

  // 4. Waste & Recycling
  const recyclingDailyKg = EMISSION_FACTORS.recycling[data.wasteRecycling] || 0.82;
  const lifestyleAnnualKg = recyclingDailyKg * 365;

  // Totals
  const totalAnnualKg = transportAnnualKg + energyAnnualKg + dietAnnualKg + lifestyleAnnualKg;
  const totalAnnualTons = Number((totalAnnualKg / 1000).toFixed(1));

  // 1 mature tree can absorb roughly 21.8 kg (rounded to 22kg) of CO2 per year
  const treesNeeded = Math.ceil(totalAnnualKg / 22);

  return {
    transportAnnualKg: Math.round(transportAnnualKg),
    energyAnnualKg: Math.round(energyAnnualKg),
    dietAnnualKg: Math.round(dietAnnualKg),
    lifestyleAnnualKg: Math.round(lifestyleAnnualKg),
    totalAnnualKg: Math.round(totalAnnualKg),
    totalAnnualTons,
    treesNeeded
  };
}

export const DEFAULT_CALCULATOR_VALUES: CalculatorData = {
  carDistance: 120,
  carType: "petrol",
  transitDistance: 45,
  flightsTime: 6,
  electricity: 280,
  gas: 40,
  diet: "moderate-meat",
  wasteRecycling: "partial"
};

// Preset Eco Actions for the Logger
export const DEFAULT_ACTIONS = [
  {
    id: "action-1",
    name: "Commuted green today",
    description: "Walked, biked, or used public transit instead of driving a personal vehicle today.",
    kgCo2Saved: 4.8,
    category: "transportation"
  },
  {
    id: "action-2",
    name: "Ate plant-based meals",
    description: "Skipped meat, dairy, and eggs today for fully sustainable plant-powered alternatives.",
    kgCo2Saved: 3.2,
    category: "lifestyle"
  },
  {
    id: "action-3",
    name: "Unused electronics blackout",
    description: "Unplugged vampire energy drains and kept non-essential electronics off all day.",
    kgCo2Saved: 0.6,
    category: "energy"
  },
  {
    id: "action-4",
    name: "Hang-dried your laundry",
    description: "Skipped the mechanical clothes dryer in favor of air-drying or clothesline drying.",
    kgCo2Saved: 1.8,
    category: "energy"
  },
  {
    id: "action-5",
    name: "Shortened shower to 5min",
    description: "Kept shower duration under five minutes to reduce heated water energy and fluid waste.",
    kgCo2Saved: 1.2,
    category: "energy"
  },
  {
    id: "action-6",
    name: "Thermostat offset by 1°C",
    description: "Set heating lower or cooling lighter to lessen HVAC strain and power draw.",
    kgCo2Saved: 1.5,
    category: "energy"
  }
] as const;
