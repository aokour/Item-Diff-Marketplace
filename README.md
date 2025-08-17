# Sitecore XM Cloud Item Layout Diff Tool

A Sitecore Marketplace application that enables developers and content authors to compare layout JSON between authoring and published versions of items in XM Cloud Pages.

## Features

- **Real-time Comparison**: Automatically compares layout JSON when items are selected in the page builder
- **Side-by-side Diff View**: Uses CodeMirror to display differences with syntax highlighting
- **Dual Environment Access**: Fetches data from both authoring (via XMC API) and published (via Experience Edge) environments
- **Context Panel Integration**: Runs as a context panel in XM Cloud Pages for seamless workflow integration
- **Sitecore Blok Design**: Uses Sitecore's official design system for consistent UI/UX

## Architecture

### Data Sources
1. **Authoring Data**: Retrieved via Sitecore Marketplace SDK using `xmc.authoring.graphql` mutation
2. **Published Data**: Retrieved via Experience Edge Delivery API using live context ID as API key

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

### 1. Extension Point Configuration

This app is configured to run as a **context panel** in XM Cloud Pages:

```json
{
  "extensionPoints": ["xmc:pages:contextpanel"],
  "permissions": [
    "xmc:authoring:read",
    "xmc:preview:read", 
    "xmc:live:read"
  ]
}
```

### 2. Required Permissions

The app requires access to:
- **Authoring environment**: For fetching draft/authoring content
- **Live environment**: For accessing the live context ID used as Experience Edge API key
- **Pages context**: For monitoring selected items in the page builder

### 3. Installation in Sitecore

1. Package the built application
2. Upload to Sitecore Marketplace
3. Install in your XM Cloud environment
4. Configure the app in XM Cloud Pages

## Usage

1. **Open XM Cloud Pages** in your Sitecore environment
2. **Select any item** in the page tree or canvas
3. **Open the context panel** where the Item Layout Diff Tool is installed
4. **View the comparison** between authoring and published layout JSON
5. **Use the refresh button** to manually reload the comparison

## Technical Details

### API Calls

#### Authoring Layout Query
```graphql
query GetAuthoringLayout($itemId: String!, $language: String!) {
  item(path: $itemId, language: $language) {
    id
    name
    path
    rendered
  }
}
```

#### Published Layout Query (Experience Edge)
```graphql
query GetPublishedLayout($siteName: String!, $routePath: String!, $language: String!) {
  layout(site: $siteName, routePath: $routePath, language: $language) {
    item {
      rendered
    }
  }
}
```

### Context ID Extraction

The app automatically extracts the live context ID from the Marketplace SDK's application context:

```typescript
const liveContextId = applicationContext.resourceAccess[0]?.context?.live;
```

This context ID serves as the API key for Experience Edge requests.

## Troubleshooting

### Common Issues

1. **"Experience Edge service not initialized"**
   - Ensure the app has access to live environment context
   - Verify the live context ID is available in application context

2. **"Page context subscription error"**
   - Confirm the app is running within XM Cloud Pages
   - Check that the context panel extension point is properly configured

3. **"Authoring fetch failed"**
   - Verify authoring environment permissions
   - Check XMC module is properly loaded

4. **"Published fetch failed"**
   - Ensure Experience Edge is accessible
   - Verify the live context ID is valid

### Debug Mode

Enable debug mode by setting the environment variable:
```bash
NODE_ENV=development
```

This will enable additional logging in the Marketplace SDK.

## Development Notes

### Local Development

For local development, the app will show an initialization error since it requires the Sitecore Marketplace environment. To test:

1. Deploy to a Sitecore environment
2. Use the browser dev tools to inspect network requests
3. Check console logs for debugging information

### Extending Functionality

The app can be extended to:
- Compare other item properties beyond layout JSON
- Support additional content environments
- Add export functionality for diff results
- Include version history comparisons

## Dependencies

- **@sitecore-marketplace-sdk/client**: Core Marketplace SDK
- **@sitecore-marketplace-sdk/xmc**: XM Cloud specific APIs
- **@sitecore/blok-theme**: Sitecore design system
- **@chakra-ui/react**: UI component library
- **@codemirror/merge**: Diff viewer functionality
- **Next.js**: React framework for the application

## License

This project is licensed under the MIT License.