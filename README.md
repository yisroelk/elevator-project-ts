# Elevator Simulation Project

A TypeScript-based elevator simulation system that models multiple buildings with configurable floors and elevators.

## Features

- Multiple building support with customizable configurations
- Real-time elevator movement simulation
- Dynamic floor request handling and elevator dispatching
- Interactive UI with floor buttons and elevator status
- Configurable settings panel for simulation parameters
- Sound effects for elevator arrivals
- Countdown timers for estimated arrival times

## Project Structure

```
src/
├── components/         # UI components
│   └── settingsPanel.ts
├── core/              # Core simulation logic
│   ├── building.ts
│   ├── buildingFactory.ts
│   ├── elevator.ts
│   ├── floor.ts
│   └── SettingsManager.ts
├── styles/            # CSS styling
│   ├── classes.ts
│   ├── help.css
│   ├── main.css
│   └── styles.css
├── types/             # TypeScript type definitions
│   ├── BuildingEvents.ts
│   ├── BuildingSettings.ts
│   └── BuildingTypes.ts
└── utils/             # Utility functions
    ├── DomUtils.ts
    └── EventEmitter.ts
```

## Core Components

### Building

- Main coordinator class managing elevators and floors
- Handles elevator request logic and dispatching
- Implements scoring algorithm for optimal elevator selection

### Elevator

- Controls individual elevator behavior
- Manages movement between floors
- Maintains queue of floor requests
- Calculates timing estimates
- Emits events for state changes

### Floor

- Represents individual building floors
- Tracks elevator presence
- Manages call button states
- Handles countdown timers
- Controls arrival sound effects

## Setup and Configuration

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm start
   ```

## Development

The project is built using:

- TypeScript for type-safe development
- Webpack for bundling
- CSS for styling
- HTML5 for the user interface

### Key Files

- `index.ts`: Main entry point and UI initialization
- `buildingFactory.ts`: Creates building instances
- `SettingsManager.ts`: Manages global configuration
- `DomUtils.ts`: DOM manipulation utilities
- `EventEmitter.ts`: Event handling base class

## Building and Running

1. Development mode:

   ```bash
   npm run dev
   ```

2. Production build:
   ```bash
   npm run build
   ```
