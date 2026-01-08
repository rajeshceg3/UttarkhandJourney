# Uttarakhand Journey

## Mission Overview
Uttarakhand Journey is a mission-critical travel planning application designed to assist operatives (travelers) in navigating the "Land of Gods". The system allows users to explore key locations, build custom itineraries, and visualize their route on an interactive map.

## Tech Stack (Arsenal)
- **Core:** Vanilla JavaScript (ES Modules)
- **Styling:** Tailwind CSS
- **Mapping:** Leaflet & Leaflet Routing Machine
- **Notifications:** Toastify JS
- **Icons:** Feather Icons
- **Build Tool:** Vite
- **Testing:** Vitest

## Installation & Deployment (Standard Operating Procedures)

### Prerequisites
- Node.js (v18+ recommended)
- npm

### Setup
1. Clone the repository:
   ```bash
   git clone https://github.com/rajeshceg3/UttarkhandJourney.git
   cd UttarkhandJourney
   ```
2. Install dependencies:
   ```bash
   npm install
   ```

### Execution
- **Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Run Tests:**
  ```bash
  npm test
  ```
- **Lint Code:**
  ```bash
  npm run lint
  ```

## Architecture
- `src/components/`: Modular UI logic (Map, Sidebar, Modal).
- `src/data/`: Static intelligence data (Locations).
- `src/utils/`: Utility functions (Storage).
- `src/main.js`: Command center (Entry point).

## Security Protocols
- **CSP:** Enforced via meta tags in `index.html`.
- **Sanitization:** Input sanitization protocols active for DOM injection.

## License
ISC
