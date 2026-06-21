export interface CalculatorData {
  carDistance: number; // km per week
  carType: 'petrol' | 'diesel' | 'hybrid' | 'electric' | 'none';
  transitDistance: number; // km per week
  flightsTime: number; // flight hours per year
  electricity: number; // kWh per month
  gas: number; // m3 or gas units per month
  diet: 'vegan' | 'vegetarian' | 'moderate-meat' | 'heavy-meat';
  wasteRecycling: 'none' | 'partial' | 'full';
}

export interface HabitAction {
  id: string;
  name: string;
  description: string;
  kgCo2Saved: number;
  category: 'transportation' | 'energy' | 'lifestyle';
  isCustomAI?: boolean;
}

export interface LoggedDay {
  date: string; // YYYY-MM-DD
  actionsLogged: string[]; // habit action IDs
  totalKgSaved: number;
}

export interface CategoryInsights {
  transport: string;
  energy: string;
  diet: string;
}

export interface AIInsights {
  summary: string;
  categoryInsights: CategoryInsights;
  recommendedHabits: HabitAction[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}
