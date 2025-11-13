# Monthly Report Slideshow

Professional slideshow presentation system for monthly work reports built with Vue 3, TypeScript, Tailwind CSS, PrimeVue, and GSAP.

## Features

- 📊 Interactive slideshow presentation
- 🎨 Professional design with custom theme
- ✨ GSAP animations with customizable animation types
- 📱 Responsive grid and fullscreen views
- ⌨️ Keyboard navigation support
- 🖼️ Image support with multiple layout options

## Tech Stack

- Vue 3 + TypeScript
- Vite 6
- Tailwind CSS v4
- PrimeVue
- GSAP
- Marked (for markdown parsing)

## Getting Started

### Prerequisites

- Node.js 22.18.0
- pnpm v10.11.1

### Installation

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

## Project Structure

```
v_repor_/
├── docs/                # Project documentation and planning
├── src/
│   ├── assets/          # Images, fonts, CSS
│   ├── components/      # Vue components
│   ├── composables/     # Vue composables
│   ├── data/            # Data types and report data
│   └── utils/           # Utility functions
├── public/              # Static assets
└── dist/                # Build output
```

## Acknowledgments

This project was built based on the following sources:

### Planning Documents

- **Project Plan**: `docs/monthly-report-slideshow-project.plan.md`
  - Comprehensive phased implementation plan
  - Defines project structure, components, animations, and deployment strategy
  - Includes detailed specifications for all features and components

- **Raw Plan**: `docs/my_raw_plan.md`
  - Initial requirements and specifications
  - Original design concepts and feature requests
  - Component requirements and animation specifications

### Data Source

- **Report Data**: `docs/October_2025_Report.md`
  - October 2025 work report used as JSON data source
  - Contains feature summaries, task lists, and statistics
  - Structured by Feature and Type categories

### Project Context

This slideshow system was designed to be reusable for future monthly reports, with a data-driven architecture that allows easy integration of new report data while maintaining consistent design and animation systems.

## License

MIT


node scripts/generatePinEncryption.js <6-digit-pin>
