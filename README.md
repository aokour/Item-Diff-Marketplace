# Sitecore XM Cloud Item Layout Diff Tool

![XMC Item Diff](screenshots/XMC%20Item%20Diff-1.png?t=1)

A Sitecore Marketplace application that enables developers and content authors to compare layout JSON between authoring and published versions of items in XM Cloud Pages.

## Features

- **Real-time Comparison**: Automatically compares layout JSON when items are selected in the page builder
- **Side-by-side Diff View**: Uses CodeMirror to display the 2 different versions of Item Layout JSON
- **Dual Environment Access**: Fetches data from both Preview (via XMC API) and Live (via Experience Edge) environments
- **Context Panel Integration**: Runs as a context panel in XM Cloud Pages for seamless workflow integration
- **Sitecore Blok Design**: Uses Sitecore's official design system for consistent UI/UX

## Architecture

### Data Sources

1. **Preview Data**: Retrieved via Sitecore Marketplace SDK using `xmc.preview.graphql` mutation
2. **Published Data**: Retrieved via Sitecore Marketplace SDK using `xmc.live.graphql` mutation

### Key Components

- `MarketplaceApp`: Main application wrapper with Chakra UI provider
- `ItemDiffTool`: Core component that orchestrates the comparison workflow
- `DiffViewer`: CodeMirror-based component for displaying side-by-side JSON diffs
- `LayoutComparisonService`: Service layer handling data fetching and comparison logic

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Development

Run the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Building for Production

```bash
npm run build
npm start
```

## Marketplace Deployment

### Extension Point Configuration

This app is configured to run as a **context panel** in XM Cloud Pages:

## Usage

1. **Open XM Cloud Pages** in your Sitecore environment
2. **Select any item** in the page tree or canvas
3. **Open the context panel** where the Item Layout Diff Tool is installed
4. **View the comparison** between authoring and published layout JSON
5. **Use the refresh button** to manually reload the comparison

## Dependencies

- **@sitecore-marketplace-sdk/client**: Core Marketplace SDK
- **@sitecore-marketplace-sdk/xmc**: XM Cloud specific APIs
- **@sitecore/blok-theme**: Sitecore design system
- **@chakra-ui/react**: UI component library
- **@codemirror/merge**: Diff viewer functionality
- **Next.js**: React framework for the application

## License

This project is licensed under the MIT License.
