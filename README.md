# Elevator Simulation Project

A TypeScript-based elevator simulation system that models multiple buildings with configurable floors and elevators. The system supports both standard and express elevators with real-time movement visualization.

## Features

- Multiple building support with customizable configurations
- Two elevator types: Standard and Express (high-rise)
- Real-time elevator movement simulation with smooth animations
- Dynamic floor request handling and intelligent elevator dispatching
- Interactive UI with floor buttons and elevator status
- Comprehensive settings panel for simulation parameters
- Sound effects for elevator arrivals
- Real-time countdown timers for estimated arrival times
- Tooltips showing detailed elevator and building information
- Support for multiple concurrent elevator operations

## Project Structure

```
src/
├── components/         # UI components
│   ├── BuildingComponent.ts
│   ├── ElevatorComponent.ts
│   ├── FloorComponent.ts
│   └── settingsPanel.ts
├── core/              # Core simulation logic
│   ├── abstractBuildingFactory.ts
│   ├── building.ts
│   ├── buildingFactory.ts
│   ├── elevator.ts
│   ├── expressElevator.ts
│   ├── floor.ts
│   ├── highRiseBuildingFactory.ts
│   └── SettingsManager.ts
├── styles/            # CSS styling
│   ├── cssclasses.ts
│   ├── styles.css
│   ├── buttons/
│   │   └── buttons.css
│   ├── elevator/
│   │   └── elevator.css
│   ├── floor/
│   │   └── floor.css
│   ├── layout/
│   │   └── layout.css
│   ├── settings/
│   │   └── settings.css
│   └── tooltips/
│       └── tooltips.css
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
- Implements factory pattern to support different building types (standard/high-rise)
- Uses a scoring algorithm for optimal elevator selection:
  - Calculates estimated arrival times based on current position
  - Considers current elevator state (idle/moving/stopping)
  - Accounts for queued floor requests
- Manages event propagation between elevators and floors
- Validates building configurations (min floors, elevators, floor height)

### Elevator

- Controls individual elevator behavior with state management (idle/moving/stopping)
- Implements precise physical movement simulation:
  - Tracks exact position between floors
  - Updates position at 60Hz for smooth animation
  - Emits position change events for UI updates
- Intelligent timing system:
  - Calculates ETAs considering movement and stop times
  - Manages multiple floor requests in a queue
  - Handles variable floor passing times and stop delays
- Event-driven architecture for coordinating with building and UI

### Express Elevator (High-Rise Extension)

- Extends base elevator for high-rise buildings
- Implements express mode for long-distance travel:
  - 2x speed multiplier for trips over 5 floors
  - Dynamic speed adjustment based on travel distance
  - Optimized for serving distant floors efficiently

### Floor

- Represents individual building floors with complete state management
- Handles elevator presence tracking and button states
- Features sophisticated countdown system:
  - Real-time ETA updates
  - Smooth countdown display
  - Auto-reset on elevator arrival
- Manages audio feedback with preloaded sounds
- Event emission for UI synchronization

### Settings Manager

- Singleton pattern for global configuration management
- Supports hierarchical settings:
  - Global defaults
  - Per-building configurations
  - Per-elevator settings
- Real-time configuration updates
- Validates and propagates setting changes

## Architecture Patterns

The project implements several design patterns:

- Factory Pattern: For building and elevator creation
- Observer Pattern: For event handling and UI updates
- Singleton Pattern: For settings management
- Template Method: In building factory implementation

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

#### Core Logic

- `core/building.ts`: Central coordinator implementing elevator selection algorithm and event handling
- `core/elevator.ts`: Elevator movement simulation with 60Hz position updates and precise timing
- `core/expressElevator.ts`: High-rise elevator extension with 2x speed for long-distance travel
- `core/floor.ts`: Floor management with countdown timers and elevator presence tracking
- `core/SettingsManager.ts`: Global configuration with hierarchical settings management

#### Factory Pattern Implementation

- `core/abstractBuildingFactory.ts`: Abstract factory defining component creation contracts
- `core/buildingFactory.ts`: Standard building factory implementation
- `core/highRiseBuildingFactory.ts`: High-rise building factory with express elevators

#### UI Components

- `components/settingsPanel.ts`: Interactive settings UI with real-time configuration updates
- `styles/`: Modular CSS organization with separate files for components and themes

#### Utilities

- `utils/EventEmitter.ts`: Type-safe event handling system
- `utils/DomUtils.ts`: Reusable DOM manipulation utilities

#### Types and Interfaces

- `types/BuildingEvents.ts`: Event type definitions for building system
- `types/BuildingSettings.ts`: Configuration interfaces and default settings
- `types/BuildingTypes.ts`: Core type definitions and event payload types

## Building and Running

1. Development mode:

   ```bash
   npm run dev
   ```

2. Production build:
   ```bash
   npm run build
   ```
