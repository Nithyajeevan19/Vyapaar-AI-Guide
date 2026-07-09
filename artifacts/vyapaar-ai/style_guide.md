# Vyapaar AI — Luxury Design System Style Guide

This style guide documents the elevated design foundations for the Vyapaar AI SaaS application, inspired by top-tier Indian fintech platforms (like Razorpay and Stripe). It establishes a polished, warm, and sophisticated aesthetic using our signature **Deep Navy Blue**, **Warm Cream**, and **Antique Gold** color palette.

---

## 1. Typography & Hierarchy

We pair a high-contrast display serif for premium editorial warmth with a modern geometric grotesque for data density and readability.

### Type Pairing
* **Display & Headings**: `Fraunces` (Google Font display serif). Used for all major page titles, card headers, numbers, and hero sections.
  * *CSS Variable*: `font-display` or `font-serif`
* **Body Text & Tables**: `Manrope` (with `Inter` fallback). Clean sans-serif optimized for crisp rendering on small screens.
  * *CSS Variable*: `font-sans`

### Sample Type Styles
* **Page Title (h1)**: `font-display text-3xl font-black tracking-tight text-foreground`
* **Section Header (h2)**: `font-display text-xl font-bold tracking-tight text-foreground`
* **Card Title (h3)**: `font-display text-base font-bold text-foreground`
* **Body / Meta Text**: `font-sans text-sm text-muted-foreground`

---

## 2. Elevation & Box Shadows

Shadows are soft and warm-tinted, picking up subtle cues from our navy and gold palette rather than looking like cold, flat default grey.

| Shadow Token | Tailwind Class | Description | Value (Light Mode) |
| :--- | :--- | :--- | :--- |
| **Card Shadow** | `shadow-card` | Resting state for main dashboard blocks, widgets, and charts. | `0px 1px 3px rgba(15,23,42,0.02)`, `0px 4px 12px rgba(15,23,42,0.01)` |
| **Raised Shadow** | `shadow-raised` | Interactive states (hover on cards, active buttons). | `0px 4px 8px rgba(15,23,42,0.03)`, `0px 12px 24px rgba(197,160,89,0.03)` |
| **Modal Shadow** | `shadow-modal` | Centered slide-overs, dialog overlays, popup forms. | `0px 12px 24px rgba(15,23,42,0.05)`, `0px 24px 48px rgba(197,160,89,0.05)` |
| **Floating Shadow** | `shadow-floating` | Tooltips, dropdown lists, and contextual menus. | `0px 4px 20px rgba(15,23,42,0.04)`, `0px 8px 30px rgba(197,160,89,0.06)` |

---

## 3. Antique Gold Accent Rules

Gold is a powerful color that must be used with **maximum restraint**. Overusing gold cheapens the aesthetic; restricting it makes it feel premium.

### Allowed Gold Accent Zones
1. **Primary Action CTAs**: Accent/primary gold buttons (white text on gold backgrounds).
2. **Active State Indicators**: Underlines on selected navigation items or dots on active tabs.
3. **Key Numeral Highlights**: Strategic statistics on the dashboard (e.g. total revenue metrics) to draw focus.

### Forbidden Zones
* Avoid using gold borders for general panels (use subtle `--border` instead).
* Avoid text coloring generic headings or body paragraphs in gold.

---

## 4. Spacing & Roundings
* **Border Radius**: Set to a refined `--radius: 0.75rem` (12px) for general cards and modals. Buttons use `--radius-md` (8px) for a crisp, structural feel.
* **Layout Margins**: Grid lines follow standard increments (e.g. `p-6` or `p-8` spacing) to ensure clean grid alignments.

---

## 5. Micro-interactions & Transitions

Smooth easings make the interface feel alive. Avoid abrupt CSS changes or linear/harsh easing profiles.

* **Hovers**: Use a fast, responsive transition.
  * *Easing*: `transition-fast` (150ms `cubic-bezier(0.16, 1, 0.3, 1)`)
* **Panels / Drawers**: Smooth out screen entries with an expressive expo curve.
  * *Easing*: `transition-smooth` (250ms `cubic-bezier(0.16, 1, 0.3, 1)`)
* **Interactive Elasticity**: Subtle bounce on toggles and active state shifts.
  * *Easing*: `transition-panel` (350ms `cubic-bezier(0.34, 1.56, 0.64, 1)`)
