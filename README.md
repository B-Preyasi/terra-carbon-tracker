# Terra — Personal Carbon Boundary & Sustainablity Tracker

**Terra** is a beautifully designed, full-stack, AI-powered carbon tracker and sustainability planner. Built with a sleek, nature-inspired palette (muted forest greens and warm off-whites) and powered by React 18, TypeScript, Tailwind CSS, and the Gemini API, Terra helps individuals visualize their environmental footprints against safe planetary thresholds, build targeted offsets, and log daily eco-friendly habits.

---

## 🎨 Design Philosophy & User Experience

Terra is developed around a highly scannable, calming visual structure using the **Forest Sage & Clean Amber Theme**:
- **Typography Pairing**: Elegant serif display headers paired with clean sans-serif bodies and robust monospaced numbers.
- **High Negative Space**: Generous padding, organic rounded cards, and smooth micro-transitions (staggered cards powered by `motion`).
- **Planetary Context**: Instead of abstract numbers, footprints are actively contrasted against calculated scientific sustainability thresholds.

---

## 🚀 Key Features

### 1. Carbon Boundary Calculator
- Interactive evaluation inputs covering **Dietary Habits**, **Home Heating/Energy**, **Commute Distances**, and **Material Consumption**.
- Real-time calculations yielding immediate carbon footprints calibrated against local standards and ideal thresholds.

### 2. Metric Overview (`MetricOverview.tsx`)
- High-contrast visual gauges charting current emissions vs. limits.
- Breakdowns by category (Diet, Utilities, Commuting) with customizable recommendations based on calculated limits.

### 3. Sustainability Action Logger
- Adopt concrete commitments (e.g., using public transit, line drying, or choosing a vegetarian diet).
- Track cumulative sustainability streaks and calculate real-time offset limits dynamically.

### 4. Eco-Tips & Study Library (`EducationalTips.tsx`)
- Specialized bite-sized factual card deck highlighting empirical scientific data.
- Search and categorize by themes (Transport, Energy, Food, Waste).
- Direct **"Adopt Habit"** CTA, linking educational learning to operational habit tracking instantly.

### 5. Gemini-Powered Eco-Advisor
- A full-powered conversational AI chat interface connected to server-side endpoints.
- Provides deep-grounded recommendations tailored specifically to your active calculator footprint profile.

---

## 🛠️ Archictecture & Tech Stack

Terra is structured as a robust full-stack application:

- **Frontend**: React 18, TypeScript, Tailwind CSS, [framer-motion (motion/react)](https://motion.dev/), Lucide Icons
- **Backend**: Express (custom NodeJS server running tsx)
- **AI Integrations**: Server-side Google Gemini Developer Agent
- **Styles**: Custom CSS-utility tokens inside `@import "tailwindcss";`

### File Guidelines & Directory Map
```text
├── server.ts               # Custom Express server with Gemini API endpoint proxies
├── index.html              # Core application entry frame
├── package.json            # Script registries, tool versions, and project details
├── src/
│   ├── App.tsx             # Primary router, side navigation panel, and global state controller
│   ├── main.tsx            # Initial mounting point
│   ├── index.css           # Global custom theme tokens and Tailwind imports
│   ├── types.ts            # Centralized TypeScript definitions and contracts
│   ├── components/
│   │   ├── MetricOverview.tsx    # Circular charts and footprint limit cards
│   │   └── EducationalTips.tsx   # Curated action cards, facts, and tip search
│   └── utils/
│       └── carbonCalculator.ts  # Calibrated scientific metrics calculations code
```

---

## 💻 Getting Started & Local Installation

Follow these steps to clone, configure, and boot the application locally:

### 1. Prerequisites
Make sure you have [Node.js](https://nodejs.org/) (v18+) and `npm` installed.

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (based on `.env.example`):
```bash
GEMINI_API_KEY=your_actual_gemini_api_key_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Run the Dev Server
```bash
npm run dev
```
The application will boot up locally at `http://localhost:3000`.

### 5. Build for Production
To package the app for optimized distribution, run:
```bash
npm run build
```
This compiles the static assets into `/dist` and bundles the custom Express backend into CJS standard output ready for high-reliability hosting envs.

---

## 🌿 User Identification
The app includes high-contrast visual indicators highlighting active developer credentials:
- **Custodian Profile**: Dedicated to **Bandana Preyasi** (`BP`), Earth Custodian.

---

## ⚖️ License
This project is licensed under the MIT License. Feel free to use, modify, and distribute for educational or personal sustainability tracker projects!
