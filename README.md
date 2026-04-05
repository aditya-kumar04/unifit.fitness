# UNIFIT — 30-Day Transformation Platform

A modern, premium fitness and transformation platform designed with a pristine, Apple/Notion-inspired dark aesthetic. This project is a complete migration of a static HTML/Tailwind CDN prototype into a fully functional **Vite + React** single-page application.

## Tech Stack

- **Framework:** React 18 + Vite
- **Routing:** React Router DOM v6
- **Styling:** Tailwind CSS v3
- **Icons:** Iconify for React (`@iconify/react`)
- **Typography:** DM Sans, Bebas Neue, Barlow Condensed, Anton (via Google Fonts)

## Project Structure

The project is structured entirely within the `client/` folder:

```
client/
├── public/               # Static assets
├── src/
│   ├── components/       # Shared UI components
│   │   ├── Navbar.jsx    # Configurable global top navigation
│   │   └── Footer.jsx    # Global footer (full & minimal variants)
│   ├── pages/            # View components mapping directly to routes
│   │   ├── Landing.jsx   # /           - Hero, features, pricing, testimonials
│   │   ├── Onboarding.jsx# /onboarding - 3-step interactive setup wizard
│   │   ├── Dashboard.jsx # /dashboard  - Daily tasks, macros, current streak
│   │   ├── Chat.jsx      # /chat       - Mentor direct messaging simulator
│   │   ├── Calories.jsx  # /calories   - AI food lookup and water tracking
│   │   ├── Progress.jsx  # /progress   - SVG weight chart and photo tracking
│   │   ├── Booking.jsx   # /booking    - Strategy call scheduling calendar
│   │   └── MentorPanel.jsx # /mentor   - Administrative dashboard for coaches
│   ├── App.jsx           # Master route configuration
│   ├── index.css         # Global Tailwind directives, keyframes, utilities
│   └── main.jsx          # React DOM entry point
├── tailwind.config.js    # Tailwind v3 config & theme extension
└── vite.config.js        # Vite bundler config
```

## Features & Functionality

This is a prototype focusing heavily on UI/UX with simulated local state (`useState`):

- **Scroll Reveal Animations:** Custom intersection observer hooks triggering CSS transform/opacity reveals on scroll.
- **Interactive Forms:** Multi-step boarding flow preserving state across "Goal", "Profile", and "Mentor Assignment" steps.
- **Simulated Chat:** Real-time UI updating with typing indicators and delayed automatic responses from the "Mentor".
- **Dynamic Data Visualization:** Hand-coded responsive SVG charts graphing simulated weight loss progress.
- **Calorie Tracking:** Keyword extraction checking input strings against a local mock database to log "macros" (Protein, Carbs, Fats).

## Getting Started

1. **Install Dependencies:**
   Make sure you have Node installed, then run:

   ```bash
   npm install
   ```

2. **Start the Development Server:**

   ```bash
   npm run dev
   ```

3. **Build for Production:**

   ```bash
   npm run build
   ```

## Design Language

The UI relies heavily on a high-contrast dark mode aesthetic:
- **Primary Background:** `#060203` (Deep off-black)
- **Primary Accent:** `#E63946` (Vibrant striking red)
- **Secondary Colors:** Varied low-contrast grays (`#161616`, `#1a1a1a`, `#333`, `#555`)
- **Textures:** A subtle, low-opacity SVG noise filter (`fractalNoise`) applied broadly to eliminate pure flat blacks, simulating film grain.
