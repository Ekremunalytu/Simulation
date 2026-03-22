Create a premium, highly interactive educational simulation web app using **Vite + React + TypeScript + Tailwind CSS**.

## Goal
This app is a **local-first simulation workspace** for understanding difficult Computer Engineering topics through:
- interactive visualizations
- animated diagrams
- dynamic charts
- formula breakdowns
- parameter manipulation
- code/output style panels
- intuitive concept explanations

The purpose is NOT to build a public product or a blog.
This is a private, local learning tool focused on simulations and concept understanding.

---

## Design Direction
Use a **dark, minimal, premium, futuristic UI**.

### Visual Style
- near-black / black background
- subtle purple / blue / cyan accent colors
- clean spacing
- elegant rounded cards
- soft glow and subtle gradients
- premium glassmorphism only where helpful
- modern technical aesthetic
- immersive but uncluttered

### The interface should feel like:
- an advanced interactive learning lab
- a premium technical simulator
- a polished dark-mode educational workspace

### Avoid
- generic SaaS landing page design
- childish educational style
- bright backgrounds
- cluttered dashboards
- blog/documentation appearance
- overly colorful UI
- excessive decorations

---

## Core Experience
The app should be centered around **interactive topic modules**.

Each topic/simulation page should include:

1. **Topic Header**
   - title
   - one-sentence intuition
   - short explanation of why the concept matters

2. **Main Simulation Area**
   - large central visual panel
   - animated graphs / diagrams / visual state changes
   - immediate response to user interaction

3. **Controls Panel**
   - sliders
   - toggles
   - numeric inputs
   - presets
   - reset button

4. **Formula / Logic Panel**
   - mathematical expression display
   - explanation of parameters
   - highlighted current values
   - intuitive explanation of what changes and why

5. **Explanation Panel**
   - dynamic explanation based on current simulation state
   - beginner-friendly but technically correct

6. **Code / Output Section**
   - code-block styled card
   - result / output / interpretation panel
   - optional tabs for “Intuition / Formula / Code”

7. **Comparison View** when relevant
   - side-by-side concept comparison
   - visual emphasis on differences

---

## UX Requirements
- smooth transitions
- polished hover states
- subtle micro-interactions
- animated reveal for panels
- slider movement should visibly affect the simulation in real time
- changes should feel immediate and satisfying
- maintain strong visual hierarchy
- laptop and desktop first, but still responsive

---

## Animation Requirements
Use **Framer Motion** for refined animations.

Animations should be:
- smooth
- subtle
- purposeful
- tied to understanding

Use:
- fade + slide transitions
- scale/opacity hover effects
- animated chart/graph updates
- highlighted active states
- progressive reveal of explanations

Avoid:
- excessive motion
- distracting or gimmicky effects
- random floating elements with no learning value

---

## Component System
Build reusable UI components such as:
- AppShell
- Sidebar
- SimulationCard
- ControlPanel
- FormulaCard
- ExplanationCard
- VisualizationPanel
- CodePanel
- ComparisonCard
- PresetSelector
- TopicHeader
- TabSwitcher

---

## Layout
Use a clean application layout:
- left sidebar for topic navigation
- main content region
- optional right panel for formulas/explanations
- large central simulation viewport

---

## Topics this UI should support
The design system should work well for technical simulations such as:
- Decision Trees
- SVM
- Linear Regression
- Gradient Descent
- SQL Joins
- Indexing
- B+ Trees
- Taylor Series
- Integration concepts
- Graph algorithms
- Recursion
- Probability concepts

---

## Output
Generate:
1. a polished dark-mode app shell
2. a reusable simulation page template
3. a homepage/dashboard showing available simulation modules
4. at least one example simulation page
5. a consistent premium visual system across all screens

The result should look like a serious, modern, visually rich technical learning tool built for deep understanding.