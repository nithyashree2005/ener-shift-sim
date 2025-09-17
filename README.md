# ⚡ EnerShift – Smart Renewable Energy Simulator  

EnerShift is an **AI-powered renewable energy management dashboard** that simulates and optimizes rural electrification using **solar, wind, and battery storage**.  
It provides **real-time insights, location-aware adjustments, and AI-based recommendations** so communities can manage renewable energy more efficiently.  

---

## 🚀 Getting Started  

You can run EnerShift in three different ways depending on your workflow:  

### 1️⃣ Run Locally (Recommended)  
If you prefer working on your own IDE (like VS Code):  

```sh
# Step 1: Clone the repository
git clone <YOUR_REPO_URL>

# Step 2: Go into the project folder
cd enershift

# Step 3: Install dependencies
npm install

# Step 4: Start the development server
npm run dev


## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS

#Features

📍 Smart Location Detection – Adjusts simulation using your current location

☀️ NASA Real-Time Data – Fetches solar radiation & temperature from NASA POWER API

🔋 AI Battery Management – Intelligent charge/discharge with load prioritization

📊 Interactive Dashboard – Graphs for solar, wind, demand, and battery status

🧠 Smart Recommendations – Actionable tips for energy saving & optimization


#🔎 How It Works

Detect Location – The app automatically detects your location (latitude & longitude).

Fetch NASA POWER Data – Using your coordinates, EnerShift connects to the NASA POWER API
 to fetch:

☀️ Solar radiation (ALLSKY_SFC_SW_DWN)

🌡 Temperature (T2M)

Other renewable energy parameters

Simulate Renewable Generation – NASA’s real-time data is used to calculate solar & wind energy availability.

AI-Based Battery Management – The system decides whether to:

Charge the battery

Discharge to meet demand

Share excess power with the grid/village

Enter critical load mode when energy is very low

Visualize & Recommend – Results are shown in interactive charts with AI-powered suggestions.
