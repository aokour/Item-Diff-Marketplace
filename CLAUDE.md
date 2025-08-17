# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Sitecore XM Cloud Marketplace application that enables comparing layout JSON between authoring and published versions of items. It runs as a context panel in XM Cloud Pages and provides side-by-side diff views using CodeMirror.

## Development Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linting
npm run lint
```

## Architecture

### Core Service Pattern
The application follows a service-oriented architecture with three main services:

1. **LayoutComparisonService** (`app/services/LayoutComparisonService.ts`): Orchestrates data fetching and coordinates between authoring and published environments
2. **AuthoringService** (`app/services/AuthoringService.ts`): Handles XMC API calls for authoring content using GraphQL mutations
3. **ExperienceEdgeService** (`app/services/ExperienceEdgeService.ts`): Manages Experience Edge API calls for published content

### Component Hierarchy
```
MarketplaceApp (Chakra UI provider)
├── ItemDiffTool (main orchestrator)
├── DiffViewer (CodeMirror diff display)
├── LoadingSpinner
└── ErrorDisplay
```

### Data Flow
1. App initializes by fetching application context via `client.query("application.context")`
2. Live context ID is extracted and used as API key for Experience Edge
3. Page context subscription monitors selected items: `client.subscribe("page.context")`
4. When item selected, both authoring and published layouts are fetched in parallel
5. Results are compared and displayed in CodeMirror diff viewer

## Key Technologies

- **Next.js 15**: App Router with TypeScript
- **Chakra UI**: Component library (will be replaced with Sitecore Blok theme in production)
- **CodeMirror 6**: Diff viewer with merge functionality (`@codemirror/merge`)
- **Sitecore Marketplace SDK**: Core client and XMC modules for API access

## Marketplace Integration

### Extension Point Configuration
- Extension point: `xmc:pages:contextpanel`
- Required permissions: `xmc:authoring:read`, `xmc:preview:read`, `xmc:live:read`
- Entry point: `/` (Next.js root)
- Configuration in `marketplace-manifest.json`

### Environment Context
The app requires Sitecore Marketplace environment to function. Local development will show initialization errors since it depends on:
- Marketplace SDK client initialization
- Live context ID from application context
- Page context subscription for item selection

### API Patterns
- Authoring queries use XMC GraphQL with item paths and language parameters
- Published queries use Experience Edge with site name, route path, and language
- Error handling preserves partial results when one environment fails

## Development Notes

### TypeScript Configuration
- Build errors ignored for missing Sitecore packages (`ignoreBuildErrors: true`)
- ESLint warnings ignored during builds for deployment compatibility

### Service Initialization
Services must be initialized in this order:
1. Marketplace client connection
2. Application context retrieval
3. Live context ID extraction
4. Experience Edge service setup
5. Page context subscription

### Error Handling Strategy
- Services return `{ error: string }` objects instead of throwing
- Parallel fetching with `Promise.allSettled()` to get partial results
- User-friendly error messages distinguish between authoring/published failures

## Testing Considerations

The application requires Sitecore environment for proper testing. For debugging:
- Deploy to Sitecore environment
- Use browser dev tools for network inspection
- Enable debug mode with `NODE_ENV=development`
- Check console logs for Marketplace SDK initialization