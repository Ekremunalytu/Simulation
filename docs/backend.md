Design the internal architecture for a **local-first educational simulation app** built with **Vite + React + TypeScript**.

## Important Context
This project is NOT a SaaS product and does NOT need:
- authentication
- cloud backend
- database
- admin panel
- CMS
- public API
- SEO features

This is a private local app used to run and explore interactive simulations for Computer Engineering topics.

The architecture should prioritize:
- modularity
- maintainability
- easy expansion
- reusable simulation patterns
- clean state management
- separation of UI and simulation logic

---

## Primary Goal
Build a scalable simulation system where new modules can be added easily, such as:
- machine learning algorithms
- database concepts
- calculus visualizations
- algorithm demos
- graph and tree explorations

Each simulation module should be independently pluggable while sharing common infrastructure.

---

## Architecture Requirements

### 1. App Structure
Create a clean folder structure such as:
- app shell / layout
- reusable UI components
- simulation engine layer
- per-topic modules
- shared utilities
- formula helpers
- chart/visualization helpers
- local persistence utilities

### 2. Module-Based Design
Each topic should live in its own module folder and contain:
- metadata
- default state
- presets
- controls config
- formulas
- explanation logic
- visualization logic
- optional quiz/comparison data

Example modules:
- svm
- decision-tree
- sql-joins
- taylor-series
- gradient-descent

Each module should be easy to register into the app.

---

## 3. Simulation Contract
Define a reusable module interface / contract so every simulation can provide:
- id
- title
- category
- description
- default parameters
- preset configurations
- explanation generator
- formula representation
- visualization component
- control schema
- optional code example
- optional comparison mode

---

## 4. State Management
Use a simple and maintainable state strategy.

Prioritize:
- local component state where sufficient
- lightweight global state only when necessary
- clear separation between:
  - UI state
  - simulation parameters
  - derived/computed values

Use a minimal approach such as:
- React state/hooks first
- Zustand only if shared state becomes useful

Do NOT introduce heavy state architecture prematurely.

---

## 5. Derived Logic Layer
Simulation math and logic should not live directly inside UI components.

Create separate logic/helpers for:
- calculations
- derived outputs
- thresholds
- classification results
- graph points
- step-by-step explanation data
- formula parameter substitution

The UI should consume processed outputs from this logic layer.

---

## 6. Local Persistence
Support optional local persistence for:
- last opened module
- saved parameter presets
- recent simulations
- UI preferences

Use:
- localStorage
or a similarly lightweight client-side persistence layer

Do NOT add a real backend or remote database.

---

## 7. Routing
Use lightweight client-side routing for:
- home/dashboard
- per-simulation pages
- category grouping if needed

Example routes:
- /
- /simulations/svm
- /simulations/decision-tree
- /simulations/sql-joins
- /simulations/taylor-series

---

## 8. Reusability Goals
Create reusable systems for:
- control generation
- formula display
- explanation rendering
- preset application
- chart data updates
- visualization wrappers
- topic registry / module registry

This should allow adding a new simulation with minimal boilerplate.

---

## 9. Performance
The app should stay lightweight and responsive.

Focus on:
- memoized derived calculations where useful
- lazy loading simulation modules when reasonable
- avoiding unnecessary rerenders
- clean separation of computation and rendering

Do not optimize prematurely, but keep the architecture performance-aware.

---

## 10. Developer Experience
The codebase should be easy to extend.

Priorities:
- clear naming
- typed configs
- predictable module structure
- reusable hooks
- low cognitive overhead
- easy debugging

---

## Deliverables
Generate:
1. a recommended folder structure
2. a simulation module contract/interface
3. a topic registry pattern
4. a state management approach
5. a local persistence strategy
6. an example module implementation structure
7. guidance for how to add future simulations consistently

The output should feel like a clean internal architecture plan for a serious local simulation workspace, not a startup backend.