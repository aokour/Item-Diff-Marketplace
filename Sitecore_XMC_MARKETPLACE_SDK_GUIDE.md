# Sitecore Marketplace SDK - Comprehensive Developer Guide

A complete guide to building custom marketplace applications using the Sitecore Marketplace SDK for JavaScript/TypeScript.

## Table of Contents

1. [Overview](#overview)
2. [Getting Started](#getting-started)
3. [Sitecore Blok Design System](#sitecore-blok-design-system)
4. [Architecture](#architecture)
5. [Package Details](#package-details)
6. [Installation & Setup](#installation--setup)
7. [Core Concepts](#core-concepts)
8. [Client SDK Usage](#client-sdk-usage)
9. [XMC Module](#xmc-module)
10. [Advanced Features](#advanced-features)
11. [Best Practices](#best-practices)
12. [Troubleshooting](#troubleshooting)
13. [API Reference](#api-reference)

## Overview

The Sitecore Marketplace SDK is an open-source JavaScript/TypeScript library that enables developers to build applications that extend and customize Sitecore products. The SDK provides secure, bidirectional communication between marketplace applications and Sitecore products through the browser's PostMessage API.

### Key Benefits

- **Type-safe APIs**: Built with TypeScript for better development experience
- **Secure Communication**: Uses PostMessage API with origin validation
- **Modular Architecture**: Separate packages for different functionalities
- **Developer-friendly**: Inspired by GraphQL and React Query patterns
- **Live Updates**: Support for subscriptions and real-time data

## Getting Started

### Prerequisites

- Node.js 16 or later
- npm 10 or later (or pnpm 10+)
- Access to Sitecore Cloud Portal
- XM Cloud subscription (for XMC features)
- TailwindCSS (for Blok design system)

### Quick Start

```bash
# Install the core client package (required for all apps)
npm install @sitecore-marketplace-sdk/client

# Install XMC module if you need XM Cloud API integration
npm install @sitecore-marketplace-sdk/xmc

# Current versions:
# @sitecore-marketplace-sdk/client: v0.2.2
# @sitecore-marketplace-sdk/xmc: v0.3.0
# @sitecore-marketplace-sdk/core: v0.2.2
```

## Sitecore Blok Design System

Sitecore recommends using their **Blok design system** for building marketplace applications. Blok is Sitecore's official product design system built on **shadcn/ui** and **Tailwind CSS**, providing a consistent and polished user experience that integrates seamlessly with Sitecore products.

### What is Blok?

Blok is a comprehensive design system that includes:

- **React Components**: Pre-built UI components following Sitecore design standards based on shadcn/ui
- **Tailwind CSS Integration**: Utility-first CSS framework for rapid UI development
- **Design Tokens**: Consistent spacing, colors, typography, and themes via CSS variables
- **Component Registry**: Easy installation of individual components via CLI
- **Best Practices**: Established patterns for common UI scenarios
- **Accessibility**: Built-in ARIA compliance and keyboard navigation

### Prerequisites

Before installing Blok, ensure you have:

```bash
# Node.js 16 or later
node --version

# npm 10 or later
npm --version

# TailwindCSS installed and configured in your project
# See: https://tailwindcss.com/docs/installation
```

### Installation

Blok uses a component-based installation similar to shadcn/ui. You install only the components you need:

#### Step 1: Initialize shadcn/ui

Run the shadcn/ui initialization command in your project's root:

```bash
npx shadcn@latest init
```

During initialization:
- Choose a base color when prompted
- The CLI will detect your Vite setup and Tailwind configuration
- Creates `components.json` configuration file
- Updates your CSS with necessary CSS variables
- Creates `src/lib/utils.js` with utility functions

#### Step 2: Install Blok Components

You can install individual Blok components or the complete registry:

```bash
# Install a single component
npx shadcn@latest add https://blok.sitecore.com/r/button.json

# Install all Blok components at once
npx shadcn@latest add https://blok.sitecore.com/r/blok-components.json
```

The complete registry includes:
- **Basic UI**: Button, Card, Input, Badge, Avatar, etc.
- **Advanced**: Calendar, DataTable, Charts, Dialog, etc.
- **Layout**: Navigation, Breadcrumbs, Sidebar, etc.
- **Forms**: Select, Checkbox, Radio, Switch, etc.

### Basic Setup

1. **Configure Tailwind CSS** (if not already done):

```javascript
// tailwind.config.js
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        // ... other color variables
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

2. **Add CSS variables** (automatically added by shadcn init):

```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    /* ... other CSS variables */
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    /* ... dark mode variables */
  }
}
```

3. **Use Blok components in your marketplace app:**

```typescript
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useMarketplaceClient } from '@/utils/hooks/useMarketplaceClient';

function MarketplaceApp() {
  const { client, isInitialized } = useMarketplaceClient();
  const { toast } = useToast();

  const handleAction = async () => {
    try {
      await client.mutate('pages.reloadCanvas');
      toast({
        title: 'Success',
        description: 'Canvas reloaded successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to reload canvas',
        variant: 'destructive',
      });
    }
  };

  if (!isInitialized) {
    return (
      <div className="p-6">
        <p>Loading marketplace application...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold">My Marketplace App</h1>

      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Perform common actions in your Sitecore environment
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={handleAction}>Reload Canvas</Button>
        </CardContent>
      </Card>
    </div>
  );
}
```

### Key Benefits of Using Blok

1. **Consistent User Experience**: Blok ensures your marketplace app feels native within Sitecore
2. **Modern Stack**: Built on shadcn/ui and Tailwind CSS for maximum flexibility
3. **Accessibility**: Built-in accessibility features and ARIA compliance
4. **Responsive Design**: Mobile-first responsive components out of the box
5. **Theme Integration**: Automatic support for light/dark themes via CSS variables
6. **Developer Experience**: TypeScript support and comprehensive documentation
7. **Tree-shakeable**: Install only the components you need
8. **Customizable**: Full control over component styling with Tailwind

### Common Patterns with Blok + Marketplace SDK

#### Loading States

```typescript
import { Skeleton } from '@/components/ui/skeleton';

function LoadingState() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-24 w-full" />
    </div>
  );
}
```

#### Error Handling with Toast

```typescript
import { useToast } from '@/hooks/use-toast';

function useMarketplaceToast() {
  const { toast } = useToast();

  const showSuccess = (title: string, description?: string) => {
    toast({
      title,
      description,
      duration: 3000,
    });
  };

  const showError = (title: string, description?: string) => {
    toast({
      title,
      description,
      variant: 'destructive',
      duration: 5000,
    });
  };

  return { showSuccess, showError };
}
```

#### Data Display Components

```typescript
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

function SitesList({ sites }: { sites: Site[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Site</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Collection</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sites.map((site) => (
          <TableRow key={site.id}>
            <TableCell>
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={site.iconUrl} />
                  <AvatarFallback>{site.displayName[0]}</AvatarFallback>
                </Avatar>
                <span>{site.displayName}</span>
              </div>
            </TableCell>
            <TableCell>
              <Badge variant={site.isActive ? 'default' : 'secondary'}>
                {site.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </TableCell>
            <TableCell>{site.collection}</TableCell>
            <TableCell>
              <Button variant="outline" size="sm">
                Manage
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
```

#### Form Components

```typescript
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function SiteConfigForm() {
  return (
    <form className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="siteName">Site Name</Label>
        <Input id="siteName" placeholder="Enter site name" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="collection">Collection</Label>
        <Select>
          <SelectTrigger id="collection">
            <SelectValue placeholder="Select a collection" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="collection1">Collection 1</SelectItem>
            <SelectItem value="collection2">Collection 2</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button type="submit">Create Site</Button>
    </form>
  );
}
```

### Resources

- **Official Documentation**: [Blok Design System](https://blok.sitecore.com/)
- **Beta Documentation**: [shadcn-based Blok](https://blok-shadcn.vercel.app/)
- **shadcn/ui Documentation**: [ui.shadcn.com](https://ui.shadcn.com/)
- **Tailwind CSS Documentation**: [tailwindcss.com](https://tailwindcss.com/)
- **Component Registry**: [blok.sitecore.com/r/](https://blok.sitecore.com/r/)

### Migration from Chakra UI

If you're migrating from the old Chakra UI-based Blok:

1. **Remove Chakra UI dependencies**:
```bash
npm uninstall @chakra-ui/react @chakra-ui/cli @emotion/react @emotion/styled framer-motion @sitecore/blok-theme
```

2. **Install Tailwind CSS** and configure it for your project

3. **Initialize shadcn/ui** and install Blok components as shown above

4. **Update components**: Replace Chakra components with shadcn/Blok equivalents
   - `Box` → `div` with Tailwind classes
   - `VStack/HStack` → `div` with `flex` classes
   - `useToast` → Blok's `useToast` hook
   - Component props → className-based styling

Using Blok with the Marketplace SDK ensures your applications not only function seamlessly within Sitecore but also provide a consistent, professional user experience that matches Sitecore's modern design standards.

## Architecture

The Sitecore Marketplace SDK uses a layered architecture with secure PostMessage communication:

```
┌─────────────────────────────────────────────┐
│              Your Application               │
├─────────────────────────────────────────────┤
│         XMC Module (optional)               │
│    ┌─────────────────────────────────────┐  │
│    │  Client SDK (required)              │  │
│    │  ┌───────────────────────────────┐  │  │
│    │  │     Core SDK (internal)       │  │  │
│    │  └───────────────────────────────┘  │  │
│    └─────────────────────────────────────┘  │
├─────────────────────────────────────────────┤
│            PostMessage API                  │
├─────────────────────────────────────────────┤
│              Sitecore Host                  │
└─────────────────────────────────────────────┘
```

### Extension Points

Marketplace applications can be embedded in various locations within Sitecore:

```typescript
// Available extension points (v0.2.0+)
enum AllowedExtensionPoints {
  standalone = 'standalone', // Standalone application
  xmcFullscreen = 'xmc:fullscreen', // Full-screen overlay
  xmcPagesContextPanel = 'xmc:pages:contextpanel', // Pages context panel
  xmcPagesCustomField = 'xmc:pages:customfield', // Custom field component
  xmcDashboardBlocks = 'xmc:dashboardblocks', // Dashboard blocks (v0.1.6+)
}
```

**Important Notes**:
- The `AllowedTouchpoints` enum is **deprecated** (v0.2.0). Use `AllowedExtensionPoints` instead.
- In ApplicationContext, use `extensionPoints` instead of deprecated `touchpoints` property.
- In ApplicationContext, use `resourceAccess` instead of deprecated `resources` property.
- Both old and new properties are available in responses for backward compatibility.
- Dashboard blocks support multiple implementations per extension point (v0.1.6+).

### Communication Flow

1. **Secure Handshake**: Core SDK establishes secure communication with Sitecore host
2. **Origin Validation**: All messages are validated against trusted origins
3. **Query/Mutation Pattern**: Application makes typed requests to Sitecore APIs
4. **Real-time Updates**: Support for subscriptions to live data changes
5. **Event System**: Bidirectional event communication between app and host
6. **State Management**: Client SDK manages query state and subscriptions
7. **Module System**: Extensible architecture for additional API integrations

### Security Features

- **Origin Validation**: All PostMessage communications are validated
- **Handshake Protocol**: Secure connection establishment
- **Token Management**: Automatic authentication token handling
- **Request Timeouts**: Configurable timeouts prevent hanging requests
- **Error Handling**: Comprehensive error codes and handling

## Package Details

### Core Package (`@sitecore-marketplace-sdk/core`)

**Purpose**: Internal package handling low-level communication

- Secure handshake protocol
- Request-response pattern implementation
- Event publish-subscribe system
- Origin validation
- PostMessage API abstraction

**Exported Classes and Functions**:

- `CoreSDK` - Main SDK class for low-level communication
- `CoreError` - Error handling with predefined error codes
- `ErrorCode` - Enumeration of all SDK error codes
- `AllowedExtensionPoints` - Valid extension points for embedding applications
- Various TypeScript interfaces for configuration and messaging

**Note**: Developers typically don't interact with this package directly.

### Client Package (`@sitecore-marketplace-sdk/client`)

**Purpose**: Main SDK for all marketplace applications

- Required for all marketplace apps
- Query and mutation APIs
- State management
- Subscription handling
- Error management

**Exported Classes and Functions**:

- `ClientSDK` - Main client SDK class with static `init()` method
- `objectToJsonArrayBuffer()` - Utility function for converting objects to ArrayBuffer
- Various TypeScript interfaces and types for queries, mutations, and configuration

**Key Features**:

- One-off data requests
- Live data subscriptions
- Host state querying
- User information access
- Page context management

### XMC Package (`@sitecore-marketplace-sdk/xmc`)

**Purpose**: XM Cloud-specific API integrations

- Authoring and Management GraphQL API
- XM Apps REST API
- Experience Edge Token API
- Experience Edge Admin API

**Exported Modules and Functions**:

- `XMC` - Main module for XM Cloud integration
- Generated TypeScript types for all XM Cloud APIs
- Augmentation modules for extending the base client SDK
- Operation-specific client modules (authoring, content, content-transfer, xmapp)

**When to Use**: When your app needs to interact with XM Cloud services.

## Installation & Setup

### 1. Basic Installation

```bash
# Core client (required)
npm install @sitecore-marketplace-sdk/client

# XMC module (optional, for XM Cloud integration)
npm install @sitecore-marketplace-sdk/xmc
```

### 2. Create Initialization Hook

Create a reusable hook for SDK initialization:

```typescript
// utils/hooks/useMarketplaceClient.ts
import { ClientSDK } from '@sitecore-marketplace-sdk/client';
import { XMC } from '@sitecore-marketplace-sdk/xmc';
import { useEffect, useState, useCallback, useMemo, useRef } from 'react';

export interface MarketplaceClientState {
  client: ClientSDK | null;
  error: Error | null;
  isLoading: boolean;
  isInitialized: boolean;
}

export interface UseMarketplaceClientOptions {
  retryAttempts?: number;
  retryDelay?: number;
  autoInit?: boolean;
}

const DEFAULT_OPTIONS: Required<UseMarketplaceClientOptions> = {
  retryAttempts: 3,
  retryDelay: 1000,
  autoInit: true,
};

let client: ClientSDK | undefined = undefined;

async function getMarketplaceClient() {
  if (client) {
    return client;
  }

  const config = {
    target: window.parent,
    modules: [XMC], // Include XMC if needed
  };

  client = await ClientSDK.init(config);
  return client;
}

export function useMarketplaceClient(options: UseMarketplaceClientOptions = {}) {
  const opts = useMemo(() => ({ ...DEFAULT_OPTIONS, ...options }), [options]);

  const [state, setState] = useState<MarketplaceClientState>({
    client: null,
    error: null,
    isLoading: false,
    isInitialized: false,
  });

  const isInitializingRef = useRef(false);

  const initializeClient = useCallback(
    async (attempt = 1): Promise<void> => {
      let shouldProceed = false;
      setState((prev) => {
        if (prev.isLoading || prev.isInitialized || isInitializingRef.current) {
          return prev;
        }
        shouldProceed = true;
        isInitializingRef.current = true;
        return { ...prev, isLoading: true, error: null };
      });

      if (!shouldProceed) return;

      try {
        const client = await getMarketplaceClient();
        setState({
          client,
          error: null,
          isLoading: false,
          isInitialized: true,
        });
      } catch (error) {
        if (attempt < opts.retryAttempts) {
          await new Promise((resolve) => setTimeout(resolve, opts.retryDelay));
          return initializeClient(attempt + 1);
        }

        setState({
          client: null,
          error:
            error instanceof Error ? error : new Error('Failed to initialize MarketplaceClient'),
          isLoading: false,
          isInitialized: false,
        });
      } finally {
        isInitializingRef.current = false;
      }
    },
    [opts.retryAttempts, opts.retryDelay]
  );

  useEffect(() => {
    if (opts.autoInit) {
      initializeClient();
    }

    return () => {
      isInitializingRef.current = false;
      setState({
        client: null,
        error: null,
        isLoading: false,
        isInitialized: false,
      });
    };
  }, [opts.autoInit, initializeClient]);

  return useMemo(
    () => ({
      ...state,
      initialize: initializeClient,
    }),
    [state, initializeClient]
  );
}
```

### 3. Initialize in Your App

```typescript
// src/pages/index.tsx
import { useState, useEffect } from 'react';
import type { ApplicationContext } from '@sitecore-marketplace-sdk/client';
import { useMarketplaceClient } from '@/utils/hooks/useMarketplaceClient';

function App() {
  const { client, error, isInitialized } = useMarketplaceClient();
  const [appContext, setAppContext] = useState<ApplicationContext>();

  useEffect(() => {
    if (!error && isInitialized && client) {
      console.log('Marketplace client initialized successfully.');

      // Get application context
      client
        .query('application.context')
        .then((res) => {
          console.log('Success retrieving application.context:', res.data);
          setAppContext(res.data);
        })
        .catch((error) => {
          console.error('Error retrieving application.context:', error);
        });
    } else if (error) {
      console.error('Error initializing Marketplace client:', error);
    }
  }, [client, error, isInitialized]);

  return (
    <div>
      <h1>Welcome to {appContext?.name}</h1>
      <p>App ID: {appContext?.id}</p>
      <p>Installation ID: {appContext?.installationId}</p>
    </div>
  );
}

export default App;
```

## Core Concepts

### Queries vs Mutations

**Queries**: Read operations that fetch data from the host

- Can be one-off requests or subscriptions
- Don't modify state
- Support caching and real-time updates

**Mutations**: Write operations that trigger changes

- Modify host state
- Trigger HTTP requests
- Can cause side effects

### Application Context

Every marketplace app has access to its context, which includes:

```typescript
interface ApplicationContext {
  id: string; // Your app's unique ID
  name: string; // App display name
  type: 'portal' | 'pages'; // Where the app runs
  url: string; // App's base URL
  iconUrl: string; // App icon URL
  installationId: string; // Unique installation instance

  // NEW in v0.2.2
  organizationId?: string; // Organization ID
  MarketplaceAppTenantId?: string; // Marketplace app tenant ID

  // Preferred (v0.2.0+) - replaces deprecated "resources"
  resourceAccess?: Array<{
    // Granted resource access
    resourceId: string;
    tenantId: string;
    tenantName: string;
    context: {
      live: string; // Live environment context ID
      preview: string; // Preview environment context ID
    };
  }>;

  // Preferred (v0.2.0+) - replaces deprecated "touchpoints"
  extensionPoints?: Array<{
    extensionPointId: string;
    route?: string;
    meta?: Array<{
      route: string;
      id: string;
      title?: string;
      description?: string;
      iconUrl?: string;
      pictureUrl?: string;
      developerName?: string;
      displayField?: string; // NEW for custom fields
    }>;
  }>;

  // NEW in v0.2.2 - IFrame permissions
  permissions?: {
    iframe?: {
      sandbox?: string[]; // e.g., ["allow-popups", "allow-popups-to-escape-sandbox"]
      allow?: string[]; // e.g., ["clipboard-write", "clipboard-read"]
    };
  };

  // Deprecated (maintained for backward compatibility)
  resources?: Array<...>; // Use resourceAccess instead
  touchpoints?: Array<...>; // Use extensionPoints instead
}
```

**Migration Notes**:
- Use `resourceAccess` instead of `resources` (both available for compatibility)
- Use `extensionPoints` instead of `touchpoints` (both available for compatibility)
- New `organizationId` and `MarketplaceAppTenantId` fields provide tenant context
- New `permissions` field controls iframe sandbox and allow permissions for security

### Host State

The host state provides information about the current Sitecore environment:

```typescript
// Query host state
const { data: hostState } = await client.query('host.state', {
  subscribe: true, // Get live updates
  onSuccess: (newState) => {
    console.log('Host state updated:', newState);
  },
});
```

## Client SDK Usage

### Available Queries

#### `application.context`

Get application metadata and resource access information.

```typescript
const { data } = await client.query('application.context');
console.log('App name:', data.name);
console.log('Resource access:', data.resourceAccess);
```

#### `host.user`

Get current user information.

```typescript
const { data: user } = await client.query('host.user');
console.log('User ID:', user.id);
console.log('User email:', user.email);
```

#### `host.state`

Get current host application state (supports subscriptions).

```typescript
const { data, unsubscribe } = await client.query('host.state', {
  subscribe: true,
  onSuccess: (newState) => {
    console.log('State updated:', newState);
  },
});

// Cleanup when done
// unsubscribe?.();
```

#### `host.route`

Get current route information.

```typescript
const { data: route } = await client.query('host.route');
console.log('Current route:', route);
```

#### `pages.context`

Get page builder context (supports subscriptions).

```typescript
const { data, unsubscribe } = await client.query('pages.context', {
  subscribe: true,
  onSuccess: (pageContext) => {
    console.log('Page context:', pageContext);
  },
});
```

#### `site.context`

Get site-specific context information.

```typescript
const { data: siteContext } = await client.query('site.context');
console.log('Site context:', siteContext);
```

### Available Mutations

#### `pages.reloadCanvas` (v0.1.2+)

Reload the XM Cloud page builder canvas.

```typescript
await client.mutate('pages.reloadCanvas');

// With error handling
try {
  await client.mutate('pages.reloadCanvas');
  console.log('Canvas reloaded successfully');
} catch (error) {
  console.error('Failed to reload canvas:', error);
}
```

#### `pages.context` (v0.1.4+)

Navigate to a different page in the page builder with full control over item, language, and version.

```typescript
// Navigate to a specific page
await client.mutate('pages.context', {
  params: {
    itemId: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
    language: 'en',
    itemVersion: 1, // Note: number type (changed from string in v0.1.6)
  },
});

// Navigate with minimal params
await client.mutate('pages.context', {
  params: {
    itemId: '{110D559F-DEA5-42EA-9C1C-8A5DF7E70EF9}',
  },
});

// Example: Navigate from site list
const handleNavigateToPage = async (pageId: string, language: string) => {
  try {
    await client.mutate('pages.context', {
      params: {
        itemId: pageId,
        language: language,
        itemVersion: 1,
      },
    });
  } catch (error) {
    console.error('Navigation failed:', error);
  }
};
```

**Parameters**:
- `itemId` (string, optional): The Sitecore item ID to navigate to
- `language` (string, optional): The language version to load
- `itemVersion` (number, optional): The specific version number (changed from string to number in v0.1.6)

### Additional Client Methods

#### `navigateToExternalUrl()`

Open external URLs.

```typescript
await client.navigateToExternalUrl('https://example.com', true); // Open in new tab
await client.navigateToExternalUrl('https://example.com', false); // Open in same tab

// Error handling
try {
  await client.navigateToExternalUrl('https://example.com');
} catch (error) {
  console.error('Navigation failed:', error);
}
```

#### `emitRouteEvent()`

Broadcast route events to other listeners.

```typescript
// Send route event
await client.emitRouteEvent('/products/123');

// Route events with context
await client.emitRouteEvent('/products/123?category=electronics');
```

#### `getValue()` and `setValue()`

Get/set values in the host application (for custom field scenarios).

```typescript
// Get current value from host
const currentValue = await client.getValue();
console.log('Current field value:', currentValue);

// Set value in host without canvas reload
await client.setValue('new-value', false);

// Set value and trigger canvas reload
await client.setValue('updated-content', true);

// Example: Custom field component
const updateField = async (newValue: string) => {
  try {
    await client.setValue(newValue, true);
    console.log('Field updated successfully');
  } catch (error) {
    console.error('Failed to update field:', error);
  }
};
```

#### `closeApp()`

Request the host to close the application.

```typescript
// Close the current app
await client.closeApp();

// Close with confirmation
const confirmClose = () => {
  if (confirm('Are you sure you want to close this application?')) {
    client.closeApp();
  }
};
```

#### `openProfile()` and `logout()`

User account management.

```typescript
// Open user profile dialog
await client.openProfile();

// Logout current user
await client.logout();

// Combined user menu actions
const handleUserMenuAction = async (action: string) => {
  switch (action) {
    case 'profile':
      await client.openProfile();
      break;
    case 'logout':
      if (confirm('Are you sure you want to logout?')) {
        await client.logout();
      }
      break;
  }
};
```

#### `destroy()`

Clean up SDK resources and subscriptions.

```typescript
// Clean up when component unmounts or app closes
useEffect(() => {
  return () => {
    client.destroy();
  };
}, []);

// Manual cleanup
const cleanup = () => {
  client.destroy();
  console.log('SDK resources cleaned up');
};
```

## Utility Functions

### `objectToJsonArrayBuffer()`

Convert JavaScript objects to JSON ArrayBuffer format (mainly for internal use).

```typescript
import { objectToJsonArrayBuffer } from '@sitecore-marketplace-sdk/client';

// Convert object to ArrayBuffer
const data = { name: 'example', value: 123 };
const buffer = objectToJsonArrayBuffer(data);

// This is primarily used internally by the SDK for PostMessage communication
console.log('Converted to ArrayBuffer:', buffer);
```

### Navigation and UI Integration

#### Navbar Configuration

Configure navigation items in the host application:

```typescript
// Define navbar configuration
const navbarConfig: NavbarItemsProps = {
  appLogo: '/assets/app-logo.png',
  appName: 'My Marketplace App',
  menu: [
    {
      label: 'Dashboard',
      link: '/dashboard',
      icon: dashboardIcon,
    },
    {
      label: 'Content',
      subMenu: [
        {
          label: 'Pages',
          link: '/content/pages',
        },
        {
          label: 'Media',
          link: '/content/media',
        },
      ],
    },
  ],
  helpLinks: [
    {
      label: 'Documentation',
      link: 'https://docs.example.com',
    },
    {
      label: 'Support',
      link: 'https://support.example.com',
    },
  ],
};

// Initialize client with navbar
const client = await ClientSDK.init({
  target: window.parent,
  navbarItems: navbarConfig,
});
```

### Event Handling

#### Route Events

```typescript
// Handle route updates from host
const client = await ClientSDK.init({
  target: window.parent,
  events: {
    onRouteUpdate: (route: string) => {
      console.log('Route changed:', route);
      // Update app state based on route
      handleRouteChange(route);
    },
  },
});
```

#### Page Context Events

```typescript
// Handle page context changes in XM Cloud Pages
const client = await ClientSDK.init({
  target: window.parent,
  events: {
    onPageContextUpdate: (data: any) => {
      console.log('Page context updated:', data);
      // Update component state
      setPageContext(data);
    },
  },
});
```

## XMC Module

The XMC module provides comprehensive integration with Sitecore XM Cloud APIs, including Content Management, Site Management, Language Management, and Content Transfer operations.

### Installation & Setup

```typescript
import { XMC } from '@sitecore-marketplace-sdk/xmc';

const config = {
  target: window.parent,
  modules: [XMC], // Add XMC module
};

const client = await ClientSDK.init(config);
```

### Agent API - AI-Powered XM Cloud Operations (v0.3.0+)

The Agent API is a comprehensive set of operations designed for AI agents and automation tools to interact with XM Cloud. It provides high-level, intent-based operations for managing sites, pages, content, components, assets, and personalization.

**Key Features**:
- **AI-First Design**: Operations optimized for LLM/AI agent consumption
- **High-Level Operations**: Intent-based methods that abstract complex multi-step workflows
- **Type-Safe**: Full TypeScript support with generated types
- **Comprehensive Coverage**: Covers all major XM Cloud capabilities

#### Sites Operations

Manage XM Cloud sites and retrieve site information:

```typescript
// List all sites in environment
const { data: sites } = await client.query('xmc.agent.sitesGetSitesList', {
  params: {
    query: { sitecoreContextId: previewContextId },
  },
});

// Get detailed information about a specific site
const { data: siteDetails } = await client.query('xmc.agent.sitesGetSiteDetails', {
  params: {
    path: { site_id: 'site-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get all pages belonging to a site
const { data: pages } = await client.query('xmc.agent.sitesGetAllPagesBySite', {
  params: {
    path: { site_id: 'site-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get site ID from any item ID
const { data: siteId } = await client.query('xmc.agent.sitesGetSiteIdFromItem', {
  params: {
    path: { item_id: 'item-id' },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Pages Operations

Create, modify, and query pages in XM Cloud:

```typescript
// Create a new page
const { data: newPage } = await client.mutate('xmc.agent.pagesCreatePage', {
  params: {
    body: {
      name: 'New Page',
      parentPath: '/sitecore/content/MyApp/Home',
      templateId: '{template-id}',
      language: 'en',
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get page details
const { data: page } = await client.query('xmc.agent.pagesGetPage', {
  params: {
    path: { page_id: 'page-id', site_id: 'site-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Add language version to page
await client.mutate('xmc.agent.pagesAddLanguageToPage', {
  params: {
    path: { page_id: 'page-id' },
    body: { language: 'fr-FR' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get all components on a page
const { data: components } = await client.query('xmc.agent.pagesGetComponentsOnPage', {
  params: {
    path: { page_id: 'page-id' },
    query: { sitecoreContextId: previewContextId, language: 'en' },
  },
});

// Add component to a page
await client.mutate('xmc.agent.pagesAddComponentOnPage', {
  params: {
    path: { page_id: 'page-id' },
    body: {
      componentId: '{component-id}',
      placeholderKey: 'main',
      datasourceId: '{datasource-id}',
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Set component datasource
await client.mutate('xmc.agent.pagesSetComponentDatasource', {
  params: {
    path: { rendering_id: 'rendering-id' },
    body: { datasourceId: '{datasource-id}' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Search within a site
const { data: searchResults } = await client.query('xmc.agent.pagesSearchSite', {
  params: {
    path: { site_id: 'site-id' },
    query: {
      searchQuery: 'homepage',
      sitecoreContextId: previewContextId,
    },
  },
});

// Get page path from live URL
const { data: pagePath } = await client.query('xmc.agent.pagesGetPagePathByLiveUrl', {
  params: {
    path: { site_id: 'site-id' },
    query: {
      url: 'https://example.com/products',
      sitecoreContextId: previewContextId,
    },
  },
});

// Get page screenshot
const { data: screenshot } = await client.query('xmc.agent.pagesGetPageScreenshot', {
  params: {
    path: { page_id: 'page-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get page HTML
const { data: html } = await client.query('xmc.agent.pagesGetPageHtml', {
  params: {
    path: { page_id: 'page-id' },
    query: { sitecoreContextId: previewContextId, language: 'en' },
  },
});

// Get page preview URL
const { data: previewUrl } = await client.query('xmc.agent.pagesGetPagePreviewUrl', {
  params: {
    path: { page_id: 'page-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get page template information
const { data: template } = await client.query('xmc.agent.pagesGetPageTemplateById', {
  params: {
    path: { template_id: 'template-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get allowed components for a placeholder
const { data: allowedComponents } = await client.query('xmc.agent.pagesGetAllowedComponentsByPlaceholder', {
  params: {
    path: { page_id: 'page-id' },
    query: {
      placeholderKey: 'main',
      sitecoreContextId: previewContextId,
    },
  },
});
```

#### Content Operations

Manage content items in Sitecore:

```typescript
// Create a new content item
const { data: contentItem } = await client.mutate('xmc.agent.contentCreateContentItem', {
  params: {
    body: {
      name: 'New Content Item',
      templateId: '{template-id}',
      parentPath: '/sitecore/content/MyApp/Data',
      language: 'en',
      fields: {
        Title: 'My Title',
        Description: 'My Description',
      },
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get content item by ID
const { data: content } = await client.query('xmc.agent.contentGetContentItemById', {
  params: {
    path: { item_id: 'item-id' },
    query: { sitecoreContextId: previewContextId, language: 'en' },
  },
});

// Get content item by path
const { data: contentByPath } = await client.query('xmc.agent.contentGetContentItemByPath', {
  params: {
    query: {
      path: '/sitecore/content/MyApp/Data/Item',
      sitecoreContextId: previewContextId,
      language: 'en',
    },
  },
});

// Update content item
await client.mutate('xmc.agent.contentUpdateContent', {
  params: {
    path: { item_id: 'item-id' },
    body: {
      fields: {
        Title: 'Updated Title',
        Description: 'Updated Description',
      },
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Delete content item
await client.mutate('xmc.agent.contentDeleteContent', {
  params: {
    path: { item_id: 'item-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// List available insert options for an item
const { data: insertOptions } = await client.query('xmc.agent.contentListAvailableInsertoptions', {
  params: {
    path: { item_id: 'parent-item-id' },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Components Operations

Manage components and their datasources:

```typescript
// Create component datasource
const { data: datasource } = await client.mutate('xmc.agent.componentsCreateComponentDatasource', {
  params: {
    body: {
      name: 'Hero Datasource',
      templateId: '{datasource-template-id}',
      parentPath: '/sitecore/content/MyApp/Data/Datasources',
      fields: {
        Title: 'Hero Title',
        Text: 'Hero description',
      },
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Search for component datasources
const { data: datasources } = await client.query('xmc.agent.componentsSearchComponentDatasources', {
  params: {
    query: {
      searchQuery: 'hero',
      sitecoreContextId: previewContextId,
    },
  },
});

// List all available components
const { data: allComponents } = await client.query('xmc.agent.componentsListComponents', {
  params: {
    query: { sitecoreContextId: previewContextId },
  },
});

// Get component details
const { data: component } = await client.query('xmc.agent.componentsGetComponent', {
  params: {
    path: { component_id: 'component-id' },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Assets Operations

Upload and manage media assets:

```typescript
// Upload an asset
const { data: asset } = await client.mutate('xmc.agent.assetsUploadAsset', {
  params: {
    body: {
      file: fileBlob, // File or Blob object
      fileName: 'hero-image.jpg',
      parentPath: '/sitecore/media library/MyApp/Images',
      alt: 'Hero image',
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Search for assets
const { data: foundAssets } = await client.query('xmc.agent.assetsSearchAssets', {
  params: {
    query: {
      searchQuery: 'hero',
      sitecoreContextId: previewContextId,
    },
  },
});

// Get asset information
const { data: assetInfo } = await client.query('xmc.agent.assetsGetAssetInformation', {
  params: {
    path: { asset_id: 'asset-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Update asset metadata
await client.mutate('xmc.agent.assetsUpdateAsset', {
  params: {
    path: { asset_id: 'asset-id' },
    body: {
      alt: 'Updated alt text',
      title: 'Updated title',
    },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Personalization Operations

Create and manage personalized content:

```typescript
// Create personalization version
const { data: personalizationVersion } = await client.mutate('xmc.agent.personalizationCreatePersonalizationVersion', {
  params: {
    path: { page_id: 'page-id' },
    body: {
      name: 'Mobile Users',
      conditionId: '{condition-template-id}',
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get personalization versions for a page
const { data: versions } = await client.query('xmc.agent.personalizationGetPersonalizationVersionsByPage', {
  params: {
    path: { page_id: 'page-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// Get available condition templates
const { data: conditionTemplates } = await client.query('xmc.agent.personalizationGetConditionTemplates', {
  params: {
    query: { sitecoreContextId: previewContextId },
  },
});

// Get specific condition template
const { data: conditionTemplate } = await client.query('xmc.agent.personalizationGetConditionTemplateById', {
  params: {
    path: { template_id: 'template-id' },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Jobs Operations

Monitor background jobs:

```typescript
// Get job details
const { data: job } = await client.query('xmc.agent.jobsGetJob', {
  params: {
    path: { job_id: 'job-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// List available operations
const { data: operations } = await client.query('xmc.agent.jobsListOperations', {
  params: {
    query: { sitecoreContextId: previewContextId },
  },
});

// Revert a job
await client.mutate('xmc.agent.jobsRevertJob', {
  params: {
    path: { job_id: 'job-id' },
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Environment Operations

Get environment information:

```typescript
// List all languages in environment
const { data: languages } = await client.query('xmc.agent.environmentsListLanguages', {
  params: {
    query: { sitecoreContextId: previewContextId },
  },
});
```

#### Use Cases for Agent API

The Agent API is ideal for:

1. **AI Assistants**: LLMs can use these high-level operations to help users manage XM Cloud
2. **Automation Scripts**: Simplify common workflows with intent-based operations
3. **Content Migration**: Bulk operations for moving content between environments
4. **Site Generators**: Programmatically create and populate sites
5. **Quality Assurance**: Automated testing and validation of content
6. **DevOps Integration**: CI/CD pipelines that interact with XM Cloud

**Example: AI-Powered Page Creator**

```typescript
async function createLandingPage(
  siteName: string,
  pageName: string,
  components: Array<{ type: string; content: any }>
) {
  // Get site ID
  const sites = await client.query('xmc.agent.sitesGetSitesList', {
    params: { query: { sitecoreContextId: previewContextId } },
  });
  const site = sites.data.find((s) => s.name === siteName);

  // Create page
  const page = await client.mutate('xmc.agent.pagesCreatePage', {
    params: {
      body: {
        name: pageName,
        parentPath: `/sitecore/content/${siteName}/Home`,
        templateId: '{page-template-id}',
        language: 'en',
      },
      query: { sitecoreContextId: previewContextId },
    },
  });

  // Add components to page
  for (const component of components) {
    // Create datasource
    const datasource = await client.mutate('xmc.agent.componentsCreateComponentDatasource', {
      params: {
        body: {
          name: `${component.type} Datasource`,
          templateId: component.templateId,
          parentPath: `/sitecore/content/${siteName}/Data`,
          fields: component.content,
        },
        query: { sitecoreContextId: previewContextId },
      },
    });

    // Add component to page
    await client.mutate('xmc.agent.pagesAddComponentOnPage', {
      params: {
        path: { page_id: page.data.id },
        body: {
          componentId: component.componentId,
          placeholderKey: 'main',
          datasourceId: datasource.data.id,
        },
        query: { sitecoreContextId: previewContextId },
      },
    });
  }

  return page.data;
}
```

### Context IDs - Critical for GraphQL Operations

**IMPORTANT**: All XMC GraphQL operations require a `sitecoreContextId` to be passed in the `params.query` object. Failing to include this will result in "No sitecore context" errors.

#### Understanding Context Types

- **Preview Context ID**: Used for authoring and preview GraphQL queries (`xmc.authoring.graphql`, `xmc.preview.graphql`)
- **Live Context ID**: Used for published content queries (`xmc.live.graphql`)

#### Getting Context IDs

Context IDs are available from the application context:

```typescript
// Get application context to extract context IDs
const { data: appContext } = await client.query('application.context');

// Extract context IDs from resource access
const resourceAccess = appContext.resourceAccess[0]; // First resource
const liveContextId = resourceAccess.context.live;
const previewContextId = resourceAccess.context.preview;

console.log('Live Context ID:', liveContextId);
console.log('Preview Context ID:', previewContextId);
```

#### Correct Usage Pattern

```typescript
// ✅ CORRECT: Include sitecoreContextId in params.query
const { data } = await client.mutate('xmc.authoring.graphql', {
  params: {
    query: {
      sitecoreContextId: previewContextId, // Required!
    },
    body: {
      query: `query { item(path: "/sitecore/content/Home") { id name } }`,
    },
  },
});

// ❌ INCORRECT: Missing sitecoreContextId will cause errors
const { data } = await client.mutate('xmc.authoring.graphql', {
  params: {
    body: {
      query: `query { item(path: "/sitecore/content/Home") { id name } }`,
    },
  },
}); // Will fail with "No sitecore context" error
```

### Content Management APIs

#### Authoring and Management GraphQL API

Execute GraphQL queries and mutations against the Sitecore Authoring API:

**IMPORTANT**: All GraphQL operations require a `sitecoreContextId` in the `params.query` object. Use the **preview context ID** for authoring or preview queries and the **live context ID** for published content queries.

```typescript
// Authoring API - supports both queries and mutations
// REQUIRES: sitecoreContextId in params.query (use preview context for authoring)
const { data } = await client.mutate('xmc.authoring.graphql', {
  params: {
    query: {
      sitecoreContextId: 'preview-context-id', // Required for authoring queries
    },
    body: {
      query: `
        query GetItems($path: String!) {
          item(path: $path) {
            id
            name
            path
            fields {
              name
              value
            }
          }
        }
      `,
      variables: {
        path: '/sitecore/content/Home',
      },
    },
  },
});

// Mutation example with context ID
const updateResult = await client.mutate('xmc.authoring.graphql', {
  params: {
    query: {
      sitecoreContextId: 'preview-context-id', // Required for authoring mutations
    },
    body: {
      query: `
        mutation UpdateItem($path: String!, $fields: [FieldValueInput!]!) {
          updateItem(path: $path, fields: $fields) {
            item {
              id
              name
            }
          }
        }
      `,
      variables: {
        path: '/sitecore/content/Home',
        fields: [{ name: 'Title', value: 'Updated Title' }],
      },
    },
  },
});
```

#### Content Delivery APIs

Query published content from Preview and Live environments:

```typescript
// Preview API - query draft/preview content
// REQUIRES: sitecoreContextId in params.query (use preview context)
const previewData = await client.mutate('xmc.preview.graphql', {
  params: {
    query: {
      sitecoreContextId: 'preview-context-id', // Required for preview queries
    },
    body: {
      query: `
        query GetPreviewContent {
          search(first: 10) {
            results {
              id
              name
              url
              path
            }
          }
        }
      `,
    },
  },
});

// Live API - query published content
// REQUIRES: sitecoreContextId in params.query (use live context)
const liveData = await client.mutate('xmc.live.graphql', {
  params: {
    query: {
      sitecoreContextId: 'live-context-id', // Required for live queries
    },
    body: {
      query: `
        query GetLiveContent($siteName: String!) {
          site(name: $siteName) {
            siteInfo {
              name
              language
            }
            routes {
              name
              path
            }
          }
        }
      `,
      variables: {
        siteName: 'my-site',
      },
    },
  },
});
```

### Content Transfer Operations

Manage content transfers between environments:

```typescript
// Create a new content transfer
const transfer = await client.mutate('xmc.contentTransfer.createContentTransfer', {
  params: {
    body: {
      name: 'Migration Transfer',
      sourceEnvironment: 'staging',
      targetEnvironment: 'production',
      items: ['/sitecore/content/Home'],
    },
  },
});

// Get transfer status
const status = await client.query('xmc.contentTransfer.getContentTransferStatus', {
  params: {
    path: { transferId: transfer.data.id },
  },
});

// Save content chunks during transfer
await client.mutate('xmc.contentTransfer.saveChunk', {
  params: {
    path: {
      transferId: transfer.data.id,
      chunkSetId: 'chunk-set-1',
      chunkId: 'chunk-1',
    },
    body: new ArrayBuffer(1024), // Binary chunk data
  },
});

// Retrieve content chunks
const chunk = await client.query('xmc.contentTransfer.getChunk', {
  params: {
    path: {
      transferId: transfer.data.id,
      chunkSetId: 'chunk-set-1',
      chunkId: 'chunk-1',
    },
  },
});

// Complete chunk set transfer
await client.mutate('xmc.contentTransfer.completeChunkSetTransfer', {
  params: {
    path: { transferId: transfer.data.id, chunkSetId: 'chunk-set-1' },
  },
});

// Consume transferred files
const consumeResult = await client.query('xmc.contentTransfer.consumeFile', {
  params: {
    query: { database: 'master', blobId: 'blob-id' },
  },
});

// Get blob state
const blobState = await client.query('xmc.contentTransfer.getBlobState', {
  params: {
    path: { blobId: 'blob-id' },
    query: { database: 'master' },
  },
});

// Delete content transfer
await client.mutate('xmc.contentTransfer.deleteContentTransfer', {
  params: {
    path: { transferId: transfer.data.id },
  },
});
```

### Language Management

Manage languages in your XM Cloud environment:

```typescript
// List all languages in environment
const languages = await client.query('xmc.xmapp.listLanguages', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// List supported languages
const supportedLanguages = await client.query('xmc.xmapp.listSupportedLanguages', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// Add a new language
const newLanguage = await client.mutate('xmc.xmapp.createLanguage', {
  params: {
    body: {
      iso: 'fr-FR',
      regionIsoCode: 'FR',
      spellChecker: 'French',
      sitecoreContextId: 'context-id',
    },
  },
});

// Update language settings
await client.mutate('xmc.xmapp.updateLanguage', {
  params: {
    path: { iso: 'fr-FR' },
    body: {
      spellChecker: 'French (France)',
      sitecoreContextId: 'context-id',
    },
  },
});

// Delete a language
await client.mutate('xmc.xmapp.deleteLanguage', {
  params: {
    path: { iso: 'fr-FR' },
    body: { sitecoreContextId: 'context-id' },
  },
});
```

### Site Collection Management

Manage site collections:

```typescript
// List all collections
const collections = await client.query('xmc.xmapp.listCollections', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// Get collection details
const collection = await client.query('xmc.xmapp.retrieveCollection', {
  params: {
    path: { collectionId: 'collection-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Create a new collection
const newCollection = await client.mutate('xmc.xmapp.createCollection', {
  params: {
    body: {
      name: 'My Collection',
      displayName: 'My Site Collection',
      description: 'Collection for marketing sites',
      sitecoreContextId: 'context-id',
    },
  },
});

// Update collection
await client.mutate('xmc.xmapp.updateCollection', {
  params: {
    path: { collectionId: 'collection-id' },
    body: {
      displayName: 'Updated Collection Name',
      description: 'Updated description',
      sitecoreContextId: 'context-id',
    },
  },
});

// Rename collection
await client.mutate('xmc.xmapp.renameCollection', {
  params: {
    path: { collectionId: 'collection-id' },
    body: {
      name: 'new-collection-name',
      sitecoreContextId: 'context-id',
    },
  },
});

// Sort collections
await client.mutate('xmc.xmapp.sortCollections', {
  params: {
    body: {
      sortedCollectionIds: ['collection-1', 'collection-2', 'collection-3'],
      sitecoreContextId: 'context-id',
    },
  },
});

// Validate collection name
const validation = await client.mutate('xmc.xmapp.validateCollectionName', {
  params: {
    body: {
      name: 'proposed-collection-name',
      sitecoreContextId: 'context-id',
    },
  },
});

// List sites in collection
const collectionSites = await client.query('xmc.xmapp.listCollectionSites', {
  params: {
    path: { collectionId: 'collection-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Delete collection
await client.mutate('xmc.xmapp.deleteCollection', {
  params: {
    path: { collectionId: 'collection-id' },
    body: { sitecoreContextId: 'context-id' },
  },
});
```

### Comprehensive Site Management

#### Basic Site Operations

```typescript
// List all sites
const { data } = await client.query('xmc.xmapp.listSites', {
  params: {
    query: {
      sitecoreContextId: 'your-context-id',
    },
  },
});

// Get site details
const site = await client.query('xmc.xmapp.retrieveSite', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Create new site
const newSite = await client.mutate('xmc.xmapp.createSite', {
  params: {
    body: {
      name: 'New Site',
      displayName: 'My New Site',
      templateId: 'template-id',
      collectionId: 'collection-id',
      sitecoreContextId: 'your-context-id',
    },
  },
});

// Update site
await client.mutate('xmc.xmapp.updateSite', {
  params: {
    path: { siteId: 'site-id' },
    body: {
      displayName: 'Updated Site Name',
      description: 'Updated description',
      sitecoreContextId: 'context-id',
    },
  },
});

// Copy/duplicate site
const copiedSite = await client.mutate('xmc.xmapp.copySite', {
  params: {
    path: { siteId: 'source-site-id' },
    body: {
      name: 'copied-site',
      displayName: 'Copied Site',
      collectionId: 'target-collection-id',
      sitecoreContextId: 'context-id',
    },
  },
});

// Rename site
await client.mutate('xmc.xmapp.renameSite', {
  params: {
    path: { siteId: 'site-id' },
    body: {
      name: 'new-site-name',
      sitecoreContextId: 'context-id',
    },
  },
});

// Sort sites
await client.mutate('xmc.xmapp.sortSites', {
  params: {
    body: {
      sortedSiteIds: ['site-1', 'site-2', 'site-3'],
      sitecoreContextId: 'context-id',
    },
  },
});

// Validate site name
const siteValidation = await client.mutate('xmc.xmapp.validateSiteName', {
  params: {
    body: {
      name: 'proposed-site-name',
      sitecoreContextId: 'context-id',
    },
  },
});

// Upload site thumbnail
const thumbnail = await client.mutate('xmc.xmapp.uploadSiteThumbnail', {
  params: {
    path: { siteId: 'site-id' },
    body: {
      file: imageFile, // File object
      sitecoreContextId: 'context-id',
    },
  },
});

// Delete site
await client.mutate('xmc.xmapp.deleteSite', {
  params: {
    path: { siteId: 'site-id' },
    body: { sitecoreContextId: 'context-id' },
  },
});
```

#### Site Favorites

```typescript
// Get favorite sites
const favorites = await client.query('xmc.xmapp.getFavoriteSites', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// Add site to favorites
await client.mutate('xmc.xmapp.addFavoriteSite', {
  params: {
    body: {
      siteId: 'site-id',
      sitecoreContextId: 'context-id',
    },
  },
});

// Remove site from favorites
await client.mutate('xmc.xmapp.removeFavoriteSite', {
  params: {
    path: { siteId: 'site-id' },
    body: { sitecoreContextId: 'context-id' },
  },
});
```

#### Site Templates and Analytics

```typescript
// List available site templates
const templates = await client.query('xmc.xmapp.listSiteTemplates', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// List sites with analytics tracking
const trackedSites = await client.query('xmc.xmapp.listTrackedSites', {
  params: {
    query: {
      analyticsIdentifier: 'analytics-id',
      sitecoreContextId: 'context-id',
    },
  },
});

// Detach analytics identifier from sites
await client.mutate('xmc.xmapp.detachAnalyticsIdentifier', {
  params: {
    body: {
      siteIds: ['site-1', 'site-2'],
      sitecoreContextId: 'context-id',
    },
  },
});
```

### Page Management

#### Page Hierarchy and Navigation

```typescript
// Get site hierarchy
const siteHierarchy = await client.query('xmc.xmapp.retrieveSiteHierarchy', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Get page hierarchy
const pageHierarchy = await client.query('xmc.xmapp.retrievePageHierarchy', {
  params: {
    query: {
      sitecoreContextId: 'context-id',
      itemId: 'page-id',
    },
  },
});

// List page ancestors
const ancestors = await client.query('xmc.xmapp.listPageAncestors', {
  params: {
    query: {
      sitecoreContextId: 'context-id',
      itemId: 'page-id',
    },
  },
});

// List page children
const children = await client.query('xmc.xmapp.listPageChildren', {
  params: {
    query: {
      sitecoreContextId: 'context-id',
      itemId: 'page-id',
    },
  },
});
```

#### Page Variants and Personalization

```typescript
// List page variants
const variants = await client.query('xmc.xmapp.listPageVariants', {
  params: {
    query: {
      sitecoreContextId: 'context-id',
      itemId: 'page-id',
    },
  },
});

// Get live page state
const liveState = await client.query('xmc.xmapp.getLivePageState', {
  params: {
    query: {
      sitecoreContextId: 'context-id',
      itemId: 'page-id',
    },
  },
});

// Aggregate live page variants
const liveVariants = await client.mutate('xmc.xmapp.aggregateLivePageVariants', {
  params: {
    body: {
      pageRequests: [
        {
          itemId: 'page-1',
          language: 'en',
        },
        {
          itemId: 'page-2',
          language: 'en',
        },
      ],
      sitecoreContextId: 'context-id',
    },
  },
});

// Aggregate page data
const pageData = await client.mutate('xmc.xmapp.aggregatePageData', {
  params: {
    body: {
      pageRequests: [
        {
          itemId: 'page-1',
          language: 'en',
          includeComponents: true,
        },
      ],
      sitecoreContextId: 'context-id',
    },
  },
});
```

### Host Management

Manage rendering hosts for your sites:

```typescript
// List hosts for a site
const hosts = await client.query('xmc.xmapp.listHosts', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Get host details
const host = await client.query('xmc.xmapp.retrieveHost', {
  params: {
    path: { hostId: 'host-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Create a new host
const newHost = await client.mutate('xmc.xmapp.createHost', {
  params: {
    body: {
      name: 'production.mysite.com',
      siteId: 'site-id',
      sitecoreContextId: 'context-id',
    },
  },
});

// Update host
await client.mutate('xmc.xmapp.updateHost', {
  params: {
    path: { hostId: 'host-id' },
    body: {
      name: 'updated.mysite.com',
      sitecoreContextId: 'context-id',
    },
  },
});

// Get rendering hosts
const renderingHosts = await client.query('xmc.xmapp.getRenderingHosts', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Delete host
await client.mutate('xmc.xmapp.deleteHost', {
  params: {
    path: { hostId: 'host-id' },
    body: { sitecoreContextId: 'context-id' },
  },
});
```

### Background Jobs

Monitor background operations:

```typescript
// List all background jobs
const jobs = await client.query('xmc.xmapp.listJobs', {
  params: {
    query: { sitecoreContextId: 'context-id' },
  },
});

// Get specific job details
const job = await client.query('xmc.xmapp.retrieveJob', {
  params: {
    path: { jobId: 'job-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});
```

### Site Analytics and Configuration

#### Localization Statistics

```typescript
// Get localization statistics
const localizationStats = await client.query('xmc.xmapp.retrieveLocalizationStatistics', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});
```

#### Sitemap Configuration

```typescript
// Get sitemap configuration
const sitemapConfig = await client.query('xmc.xmapp.retrieveSitemapConfiguration', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});

// Update sitemap configuration
await client.mutate('xmc.xmapp.updateSitemapConfiguration', {
  params: {
    path: { siteId: 'site-id' },
    body: {
      enabled: true,
      includeAlternateLanguageLinks: true,
      cacheConfiguration: {
        enabled: true,
        duration: '1.00:00:00', // 1 day
      },
      sitecoreContextId: 'context-id',
    },
  },
});
```

#### Workflow Statistics

```typescript
// Get workflow statistics
const workflowStats = await client.query('xmc.xmapp.retrieveWorkflowStatistics', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: 'context-id' },
  },
});
```

### Experimental Server-Side XMC Client (v0.2.1+)

For server-side applications or scenarios where you don't have access to the ClientSDK (e.g., Node.js backends, API routes), the XMC module provides an experimental server-side client.

**Use Cases**:
- Server-side rendering (SSR) with Next.js, Remix, etc.
- API routes and serverless functions
- Backend services and automation scripts
- CI/CD pipelines
- Node.js applications without browser context

**Important**: This is an **experimental** feature. The API may change in future versions.

#### Installation & Setup

```typescript
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';

// Create XMC client with token provider
const xmc = await experimental_createXMCClient({
  getAccessToken: async () => {
    // Return access token from your auth provider
    // Examples: Auth0, Azure AD, custom JWT provider
    return await auth0.getAccessTokenSilently();
  },
});
```

#### Available Namespaces

The experimental XMC client provides access to all XMC operations through namespaced APIs:

```typescript
// Sites API
xmc.sites.*

// Pages API
xmc.pages.*

// Authoring GraphQL API
xmc.authoring.*

// Content Transfer API
xmc.contentTransfer.*

// Preview GraphQL API
xmc.preview.*

// Live GraphQL API
xmc.live.*

// Agent API (v0.3.0+)
xmc.agent.*
```

#### Sites API Examples

```typescript
// List all languages
const languages = await xmc.sites.listLanguages({
  query: { sitecoreContextId: 'your-context-id' },
});

// List all sites
const sites = await xmc.sites.listSites({
  query: { sitecoreContextId: 'your-context-id' },
});

// Get site details
const site = await xmc.sites.retrieveSite({
  path: { siteId: 'site-id' },
  query: { sitecoreContextId: 'your-context-id' },
});

// Create a new site
const newSite = await xmc.sites.createSite({
  body: {
    name: 'My Site',
    displayName: 'My New Site',
    templateId: 'template-id',
    collectionId: 'collection-id',
    sitecoreContextId: 'your-context-id',
  },
});
```

#### Authoring GraphQL API Examples

```typescript
// Execute GraphQL query
const result = await xmc.authoring.graphql({
  body: {
    query: `
      query GetItems($path: String!) {
        item(path: $path) {
          id
          name
          path
          fields {
            name
            value
          }
        }
      }
    `,
    variables: {
      path: '/sitecore/content/Home',
    },
  },
  query: { sitecoreContextId: 'your-context-id' },
});

// Execute GraphQL mutation
const mutationResult = await xmc.authoring.graphql({
  body: {
    query: `
      mutation UpdateItem($path: String!, $fields: [FieldValueInput!]!) {
        updateItem(path: $path, fields: $fields) {
          item {
            id
            name
          }
        }
      }
    `,
    variables: {
      path: '/sitecore/content/Home',
      fields: [{ name: 'Title', value: 'Updated Title' }],
    },
  },
  query: { sitecoreContextId: 'your-context-id' },
});
```

#### Agent API Examples (v0.3.0+)

```typescript
// List all sites using Agent API
const sitesList = await xmc.agent.sitesGetSitesList({
  query: { sitecoreContextId: 'your-context-id' },
});

// Get page details
const page = await xmc.agent.pagesGetPage({
  path: { page_id: 'page-id', site_id: 'site-id' },
  query: { sitecoreContextId: 'your-context-id' },
});

// Create content item
const contentItem = await xmc.agent.contentCreateContentItem({
  body: {
    name: 'New Item',
    templateId: 'template-id',
    parentPath: '/sitecore/content/Home',
    language: 'en',
    fields: {
      Title: 'My Title',
      Text: 'My content',
    },
  },
  query: { sitecoreContextId: 'your-context-id' },
});

// Upload asset
const asset = await xmc.agent.assetsUploadAsset({
  body: {
    file: fileBuffer,
    fileName: 'image.jpg',
    parentPath: '/sitecore/media library/Images',
    alt: 'Alt text',
  },
  query: { sitecoreContextId: 'your-context-id' },
});
```

#### Next.js API Route Example

```typescript
// pages/api/sites.ts
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import type { NextApiRequest, NextApiResponse } from 'next';

// Create XMC client instance
let xmcClient: Awaited<ReturnType<typeof experimental_createXMCClient>> | null = null;

async function getXMCClient() {
  if (!xmcClient) {
    xmcClient = await experimental_createXMCClient({
      getAccessToken: async () => {
        // Implement your token retrieval logic
        return process.env.XMC_ACCESS_TOKEN!;
      },
    });
  }
  return xmcClient;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const xmc = await getXMCClient();
    const contextId = req.query.contextId as string;

    // Fetch sites using XMC client
    const sites = await xmc.sites.listSites({
      query: { sitecoreContextId: contextId },
    });

    res.status(200).json({ sites });
  } catch (error) {
    console.error('Error fetching sites:', error);
    res.status(500).json({ error: 'Failed to fetch sites' });
  }
}
```

#### Server-Side Rendering (SSR) Example

```typescript
// app/sites/page.tsx (Next.js App Router)
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';

async function getSites(contextId: string) {
  const xmc = await experimental_createXMCClient({
    getAccessToken: async () => process.env.XMC_ACCESS_TOKEN!,
  });

  return xmc.sites.listSites({
    query: { sitecoreContextId: contextId },
  });
}

export default async function SitesPage() {
  const contextId = process.env.SITECORE_CONTEXT_ID!;
  const sites = await getSites(contextId);

  return (
    <div>
      <h1>Sites</h1>
      <ul>
        {sites.map((site) => (
          <li key={site.id}>{site.displayName}</li>
        ))}
      </ul>
    </div>
  );
}
```

#### Authentication Integration

**Auth0 Example**:

```typescript
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import { auth0 } from './auth0-config';

const xmc = await experimental_createXMCClient({
  getAccessToken: async () => {
    const token = await auth0.getAccessTokenSilently({
      audience: 'https://api.sitecorecloud.io',
      scope: 'openid profile email',
    });
    return token;
  },
});
```

**Azure AD Example**:

```typescript
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';
import { msalInstance } from './msal-config';

const xmc = await experimental_createXMCClient({
  getAccessToken: async () => {
    const account = msalInstance.getAllAccounts()[0];
    const response = await msalInstance.acquireTokenSilent({
      scopes: ['https://api.sitecorecloud.io/.default'],
      account,
    });
    return response.accessToken;
  },
});
```

**Custom JWT Provider**:

```typescript
import { experimental_createXMCClient } from '@sitecore-marketplace-sdk/xmc';

const xmc = await experimental_createXMCClient({
  getAccessToken: async () => {
    // Fetch token from your custom auth service
    const response = await fetch('/api/auth/token');
    const { accessToken } = await response.json();
    return accessToken;
  },
});
```

#### Key Features

1. **No Browser Dependency**: Works in Node.js without window or PostMessage
2. **Type-Safe**: Full TypeScript support with generated types
3. **All XMC Operations**: Access to sites, pages, authoring, content transfer, and agent APIs
4. **Flexible Authentication**: Bring your own token provider
5. **Auth0 Token Exchange**: Automatic header injection for Marketplace auth (v0.2.2+)

#### Auth0 Token Exchange (v0.2.2+)

The experimental client automatically adds required headers for Auth0 token exchange:

```typescript
// Headers added automatically:
{
  'sc-resource': 'marketplace',
  'sc-marketplace-auth': 'interactive/v1'
}
```

These headers enable seamless token exchange between Marketplace apps and XM Cloud APIs.

#### Limitations

- **Experimental Status**: API may change in future versions
- **Token Management**: You must implement token refresh logic
- **Error Handling**: Implement retry logic for network failures
- **Rate Limiting**: No built-in rate limiting - implement as needed

#### Best Practices

1. **Singleton Pattern**: Create one XMC client instance and reuse it
2. **Token Caching**: Cache tokens and refresh before expiration
3. **Error Handling**: Implement comprehensive error handling and retries
4. **Context IDs**: Always validate context IDs before making requests
5. **Type Safety**: Leverage TypeScript types for all operations

## Advanced Features

### Error Handling

#### Complete Error Code Reference

```typescript
import { CoreError, ErrorCode } from '@sitecore-marketplace-sdk/core';

// Available error codes
enum ErrorCode {
  // Communication Errors
  TIMEOUT = 'TIMEOUT',
  CONNECTION_ERROR = 'CONNECTION_ERROR',
  HANDSHAKE_FAILED = 'HANDSHAKE_FAILED',
  INVALID_ORIGIN = 'INVALID_ORIGIN',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR',

  // Request/Response Errors
  INVALID_REQUEST = 'INVALID_REQUEST',
  METHOD_NOT_FOUND = 'METHOD_NOT_FOUND',
  EXECUTION_ERROR = 'EXECUTION_ERROR',

  // State/Event Errors
  SUBSCRIPTION_ERROR = 'SUBSCRIPTION_ERROR',
  INVALID_STATE = 'INVALID_STATE',

  // Runtime Errors
  NOT_INITIALIZED = 'NOT_INITIALIZED',
  ALREADY_INITIALIZED = 'ALREADY_INITIALIZED',
  NOT_CONNECTED = 'NOT_CONNECTED',
  INITIALIZATION_ERROR = 'INITIALIZATION_ERROR',

  // Host Specific
  HOST_NOT_READY = 'HOST_NOT_READY',
  TOKEN_ERROR = 'TOKEN_ERROR',

  // Client Specific
  CLIENT_NOT_READY = 'CLIENT_NOT_READY',
  IFRAME_ERROR = 'IFRAME_ERROR',
}

// Comprehensive error handling
try {
  const { data } = await client.query('application.context');
} catch (error) {
  if (error instanceof CoreError) {
    switch (error.code) {
      case ErrorCode.TIMEOUT:
        console.error('Request timed out:', error.message);
        // Implement retry logic
        break;
      case ErrorCode.HANDSHAKE_FAILED:
        console.error('Failed to establish connection:', error.message);
        // Try reinitializing SDK
        break;
      case ErrorCode.INVALID_ORIGIN:
        console.error('Invalid origin detected:', error.details);
        // Check security configuration
        break;
      case ErrorCode.METHOD_NOT_FOUND:
        console.error('Method not available:', error.details);
        // Check if module is loaded
        break;
      case ErrorCode.TOKEN_ERROR:
        console.error('Authentication failed:', error.message);
        // Redirect to login
        break;
      default:
        console.error('SDK Error:', error.code, error.message);
    }
  } else {
    console.error('Unexpected error:', error);
  }
}

// Static factory methods for creating errors
const timeoutError = CoreError.timeout({ requestId: 'req-123' });
const invalidOriginError = CoreError.invalidOrigin('https://malicious-site.com');
const notInitializedError = CoreError.notInitialized();
const methodNotFoundError = CoreError.methodNotFound('nonexistent.method');
const executionError = CoreError.executionError(new Error('Database connection failed'));
```

### Subscription Management

```typescript
class SubscriptionManager {
  private subscriptions = new Map<string, () => void>();

  async subscribe(key: string, callback: (data: any) => void) {
    const { unsubscribe } = await client.query('host.state', {
      subscribe: true,
      onSuccess: callback,
    });

    this.subscriptions.set(key, unsubscribe || (() => {}));
  }

  unsubscribe(key: string) {
    const unsubscribe = this.subscriptions.get(key);
    if (unsubscribe) {
      unsubscribe();
      this.subscriptions.delete(key);
    }
  }

  cleanup() {
    this.subscriptions.forEach((unsubscribe) => unsubscribe());
    this.subscriptions.clear();
  }
}

// Usage
const subscriptionManager = new SubscriptionManager();

subscriptionManager.subscribe('hostState', (newState) => {
  console.log('Host state changed:', newState);
});

// Cleanup on unmount
// subscriptionManager.cleanup();
```

### Custom Hooks

```typescript
// Custom hook for host state
function useHostState() {
  const { client } = useMarketplaceClient();
  const [hostState, setHostState] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!client) return;

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        const result = await client.query('host.state', {
          subscribe: true,
          onSuccess: (newState) => {
            setHostState(newState);
            setIsLoading(false);
          },
        });
        unsubscribe = result.unsubscribe;
      } catch (error) {
        console.error('Failed to subscribe to host state:', error);
        setIsLoading(false);
      }
    };

    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [client]);

  return { hostState, isLoading };
}
```

## Best Practices

### 1. SDK Initialization

- Always initialize the SDK before making any queries or mutations
- Use a singleton pattern to avoid multiple initializations
- Implement retry logic for failed initializations
- Handle initialization errors gracefully

### 2. State Management

```typescript
// Good: Centralized state management
const AppProvider = ({ children }) => {
  const { client, isInitialized } = useMarketplaceClient();
  const [appState, setAppState] = useState({});

  useEffect(() => {
    if (!isInitialized || !client) return;

    // Initialize app state
    Promise.all([
      client.query('application.context'),
      client.query('host.user'),
      client.query('host.state', { subscribe: true }),
    ]).then(([context, user, hostState]) => {
      setAppState({
        context: context.data,
        user: user.data,
        hostState: hostState.data,
      });
    });
  }, [client, isInitialized]);

  return <AppContext.Provider value={{ client, appState }}>{children}</AppContext.Provider>;
};
```

### 3. Error Handling

```typescript
// Good: Comprehensive error handling
async function safeQuery(client: ClientSDK, key: string, options?: any) {
  try {
    return await client.query(key, options);
  } catch (error) {
    // Log error for debugging
    console.error(`Query failed for ${key}:`, error);

    // Handle specific error types
    if (error instanceof CoreError) {
      switch (error.code) {
        case 'TIMEOUT':
          // Retry logic
          break;
        case 'UNAUTHORIZED':
          // Redirect to login
          break;
        default:
          // Generic error handling
          break;
      }
    }

    // Re-throw or return safe default
    throw error;
  }
}
```

### 4. Performance Optimization

```typescript
// Good: Debounced queries
import { debounce } from 'lodash';

const debouncedSearch = debounce(async (searchTerm: string) => {
  try {
    const results = await client.query('xmc.content.search', {
      params: { query: searchTerm },
    });
    setSearchResults(results.data);
  } catch (error) {
    console.error('Search failed:', error);
  }
}, 300);

// Good: Cleanup subscriptions
useEffect(() => {
  const subscriptions: Array<() => void> = [];

  const setupSubscriptions = async () => {
    const { unsubscribe: unsubscribeState } = await client.query('host.state', {
      subscribe: true,
      onSuccess: handleStateChange,
    });

    const { unsubscribe: unsubscribePages } = await client.query('pages.context', {
      subscribe: true,
      onSuccess: handlePageChange,
    });

    subscriptions.push(unsubscribeState, unsubscribePages);
  };

  if (client) {
    setupSubscriptions();
  }

  return () => {
    subscriptions.forEach((unsubscribe) => unsubscribe?.());
  };
}, [client]);
```

### 5. TypeScript Usage

```typescript
// Good: Use proper types
import type { ApplicationContext, UserInfo, PagesContext } from '@sitecore-marketplace-sdk/client';

interface AppContextType {
  applicationContext?: ApplicationContext;
  userInfo?: UserInfo;
  pagesContext?: PagesContext;
}

// Good: Generic query wrapper
async function typedQuery<T>(
  client: ClientSDK,
  key: keyof QueryMap,
  options?: QueryOptions<typeof key>
): Promise<T> {
  const result = await client.query(key, options);
  return result.data as T;
}
```

### 6. Using Agent API vs Traditional XMC Operations (v0.3.0+)

Choose the right API for your use case:

```typescript
// ✅ Use Agent API for: AI assistants, automation, high-level operations
const page = await client.mutate('xmc.agent.pagesCreatePage', {
  params: {
    body: {
      name: 'New Page',
      parentPath: '/sitecore/content/Home',
      templateId: 'template-id',
      language: 'en',
    },
    query: { sitecoreContextId: previewContextId },
  },
});

// ✅ Use XMApp API for: Specific low-level operations, fine-grained control
const site = await client.query('xmc.xmapp.retrieveSite', {
  params: {
    path: { siteId: 'site-id' },
    query: { sitecoreContextId: previewContextId },
  },
});

// ✅ Use GraphQL for: Complex queries, custom data shapes
const result = await client.mutate('xmc.authoring.graphql', {
  params: {
    query: { sitecoreContextId: previewContextId },
    body: {
      query: `query { items(path: "/sitecore/content") { id name } }`,
    },
  },
});
```

**Agent API Best Practices**:
- Use for AI-powered workflows and automation
- Ideal for creating content programmatically
- Better error messages and intent-based operations
- Abstracts away multi-step workflows

**Traditional XMC Best Practices**:
- Use when you need precise control
- Better for reading specific resources
- Use GraphQL for complex data requirements

### 7. Extension Points Migration (v0.2.0+)

Migrate from deprecated touchpoints to extension points:

```typescript
// ❌ Old (deprecated but still works)
const touchpoints = context.data.touchpoints;
const resources = context.data.resources;

// ✅ New (recommended)
const extensionPoints = context.data.extensionPoints;
const resourceAccess = context.data.resourceAccess;

// Both properties are available for backward compatibility
// Update your code gradually to use the new naming
```

### 8. Experimental Server-Side XMC (v0.2.1+)

Best practices for server-side XMC client:

```typescript
// ✅ Singleton pattern - create once, reuse everywhere
let xmcClient: Awaited<ReturnType<typeof experimental_createXMCClient>> | null = null;

async function getXMCClient() {
  if (!xmcClient) {
    xmcClient = await experimental_createXMCClient({
      getAccessToken: async () => {
        // Cache and refresh tokens before expiration
        return await tokenProvider.getToken();
      },
    });
  }
  return xmcClient;
}

// ✅ Error handling and retries
async function safeFetch<T>(operation: () => Promise<T>, retries = 3): Promise<T> {
  for (let i = 0; i < retries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise((resolve) => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
  throw new Error('Max retries exceeded');
}

// ✅ Context ID validation
function validateContextId(contextId: string) {
  if (!contextId || !contextId.match(/^[a-f0-9-]{36}$/i)) {
    throw new Error('Invalid context ID format');
  }
  return contextId;
}
```

### 9. IFrame Permissions (v0.2.2+)

Control iframe sandbox and allow permissions:

```typescript
// Access permissions from application context
const { data: context } = await client.query('application.context');

if (context.permissions?.iframe) {
  console.log('Sandbox permissions:', context.permissions.iframe.sandbox);
  console.log('Allow permissions:', context.permissions.iframe.allow);
}

// Typical permissions:
// sandbox: ["allow-popups", "allow-popups-to-escape-sandbox"]
// allow: ["clipboard-write", "clipboard-read"]
```

### 10. Blok Design System Integration

Best practices for using shadcn/Blok:

```typescript
// ✅ Use Tailwind utility classes
<div className="flex items-center gap-4 p-6">
  <Button variant="default">Primary Action</Button>
  <Button variant="outline">Secondary Action</Button>
</div>

// ✅ Leverage Blok components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

// ✅ Consistent spacing with Tailwind
<div className="space-y-6"> {/* Vertical spacing */}
  <div className="flex gap-4"> {/* Horizontal spacing */}
    {/* Content */}
  </div>
</div>

// ❌ Avoid inline styles
<div style={{ padding: '24px' }}> {/* Don't do this */}

// ✅ Use Tailwind classes instead
<div className="p-6"> {/* Do this */}
```

## Troubleshooting

### Common Issues

#### 1. Initialization Failures

**Problem**: SDK fails to initialize
**Solutions**:

- Verify the app is running inside Sitecore's iframe
- Check network connectivity
- Ensure proper origin configuration
- Implement retry logic

```typescript
const { client, error, initialize } = useMarketplaceClient({
  retryAttempts: 5,
  retryDelay: 2000,
});

if (error) {
  console.error('Initialization failed:', error);
  // Show retry button
}
```

#### 2. Query/Mutation Failures

**Problem**: Requests fail unexpectedly
**Solutions**:

- Check parameter validation
- Verify resource access permissions
- Handle timeout errors
- Implement proper error boundaries

#### 3. Subscription Issues

**Problem**: Live updates stop working
**Solutions**:

- Check connection status
- Implement reconnection logic
- Clean up old subscriptions
- Monitor memory usage

#### 4. TypeScript Errors

**Problem**: Type mismatches or missing types
**Solutions**:

- Install peer dependencies
- Update SDK versions
- Check TypeScript configuration
- Use proper type assertions

#### 5. GraphQL Context Errors

**Problem**: "No sitecore context" errors in GraphQL responses
**Cause**: Missing `sitecoreContextId` in GraphQL requests

**Solutions**:

```typescript
// ✅ Always include sitecoreContextId in params.query
const { data } = await client.mutate('xmc.authoring.graphql', {
  params: {
    query: {
      sitecoreContextId: contextId, // Essential!
    },
    body: {
      query: `...your GraphQL query...`,
    },
  },
});

// Get context IDs from application context
const getContextIds = async () => {
  const { data: appContext } = await client.query('application.context');
  const resource = appContext.resourceAccess[0];

  return {
    liveContextId: resource.context.live,
    previewContextId: resource.context.preview,
  };
};

// Use correct context ID for each API:
// - xmc.authoring.graphql → previewContextId
// - xmc.preview.graphql → previewContextId
// - xmc.live.graphql → liveContextId
```

**Debug Tips**:

- Verify application context contains `resourceAccess` array
- Check that context IDs are valid UUIDs
- Ensure you're using the correct context type for each API
- Add logging to confirm context IDs are being passed correctly

### Debug Mode

```typescript
// Enable debug logging
const client = await ClientSDK.init({
  target: window.parent,
  debug: true, // Enable debug mode
});
```

### Network Debugging

```typescript
// Monitor network requests
client.query('application.context', {
  onSuccess: (data) => console.log('Query success:', data),
  onError: (error) => console.error('Query error:', error),
});
```

## API Reference

### ClientSDK Methods

| Method                                | Description        | Parameters                       | Returns                   |
| ------------------------------------- | ------------------ | -------------------------------- | ------------------------- |
| `init(config)`                        | Initialize SDK     | `ClientSDKInitConfig`            | `Promise<ClientSDK>`      |
| `query(key, options?)`                | Execute query      | `QueryKey`, `QueryOptions`       | `Promise<QueryResult>`    |
| `mutate(key, options?)`               | Execute mutation   | `MutationKey`, `MutationOptions` | `Promise<MutationResult>` |
| `navigateToExternalUrl(url, newTab?)` | Open external URL  | `string`, `boolean?`             | `Promise<void>`           |
| `emitRouteEvent(route)`               | Emit route event   | `string`                         | `Promise<void>`           |
| `getValue()`                          | Get host value     | -                                | `Promise<any>`            |
| `setValue(value, reload?)`            | Set host value     | `string`, `boolean?`             | `Promise<void>`           |
| `closeApp()`                          | Close application  | -                                | `Promise<void>`           |
| `openProfile()`                       | Open user profile  | -                                | `Promise<void>`           |
| `logout()`                            | Log out user       | -                                | `Promise<void>`           |
| `destroy()`                           | Clean up resources | -                                | `void`                    |

### Available Query Keys

| Key                   | Description                      | Subscribable | Response Type        |
| --------------------- | -------------------------------- | ------------ | -------------------- |
| `application.context` | App metadata and resource access | No           | `ApplicationContext` |
| `host.user`           | Current user information         | No           | `UserInfo`           |
| `host.state`          | Host application state           | Yes          | `HostState`          |
| `host.route`          | Current route                    | No           | `string`             |
| `pages.context`       | Page builder context             | Yes          | `PagesContext`       |
| `site.context`        | Site-specific context            | No           | `SiteContext`        |

### Available Mutation Keys

#### Core Mutations

| Key                  | Description                | Parameters           | Response Type |
| -------------------- | -------------------------- | -------------------- | ------------- |
| `pages.reloadCanvas` | Reload page builder canvas | None                 | `void`        |
| `pages.context`      | Navigate to different page | `PagesContextParams` | `void`        |

### XMC Operations (when XMC module is loaded)

#### Content Management APIs

**Note**: All GraphQL operations require `sitecoreContextId` in `params.query`. Use preview context for authoring/preview, live context for published content.

| Key                     | Description               | Type     | Parameters       | Response Type     | Context Required |
| ----------------------- | ------------------------- | -------- | ---------------- | ----------------- | ---------------- |
| `xmc.authoring.graphql` | Execute authoring GraphQL | Mutation | `GraphQLRequest` | `GraphQLResponse` | Preview Context  |
| `xmc.preview.graphql`   | Execute preview GraphQL   | Mutation | `GraphQLRequest` | `GraphQLResponse` | Preview Context  |
| `xmc.live.graphql`      | Execute live GraphQL      | Mutation | `GraphQLRequest` | `GraphQLResponse` | Live Context     |

#### Content Transfer Operations

| Key                                            | Description            | Type     | Parameters                            | Response Type           |
| ---------------------------------------------- | ---------------------- | -------- | ------------------------------------- | ----------------------- |
| `xmc.contentTransfer.createContentTransfer`    | Create transfer        | Mutation | `CreateTransferRequest`               | `ContentTransfer`       |
| `xmc.contentTransfer.getContentTransferStatus` | Get transfer status    | Query    | `{ transferId }`                      | `ContentTransferStatus` |
| `xmc.contentTransfer.saveChunk`                | Save chunk data        | Mutation | `SaveChunkRequest`                    | `void`                  |
| `xmc.contentTransfer.getChunk`                 | Retrieve chunk data    | Query    | `{ transferId, chunkSetId, chunkId }` | `ChunkData`             |
| `xmc.contentTransfer.completeChunkSetTransfer` | Complete chunk set     | Mutation | `CompleteChunkSetRequest`             | `void`                  |
| `xmc.contentTransfer.consumeFile`              | Start file consumption | Query    | `{ database, blobId }`                | `ConsumeFileResponse`   |
| `xmc.contentTransfer.getBlobState`             | Get blob state         | Query    | `{ blobId, database }`                | `BlobState`             |
| `xmc.contentTransfer.deleteContentTransfer`    | Delete transfer        | Mutation | `{ transferId }`                      | `void`                  |

#### Language Management

| Key                                | Description                | Type     | Parameters                   | Response Type         |
| ---------------------------------- | -------------------------- | -------- | ---------------------------- | --------------------- |
| `xmc.xmapp.listLanguages`          | List environment languages | Query    | `{ sitecoreContextId }`      | `Language[]`          |
| `xmc.xmapp.listSupportedLanguages` | List supported languages   | Query    | `{ sitecoreContextId }`      | `SupportedLanguage[]` |
| `xmc.xmapp.createLanguage`         | Add language               | Mutation | `CreateLanguageRequest`      | `Language`            |
| `xmc.xmapp.updateLanguage`         | Update language            | Mutation | `UpdateLanguageRequest`      | `Language`            |
| `xmc.xmapp.deleteLanguage`         | Delete language            | Mutation | `{ iso, sitecoreContextId }` | `void`                |

#### Site Collections

| Key                                | Description              | Type     | Parameters                            | Response Type          |
| ---------------------------------- | ------------------------ | -------- | ------------------------------------- | ---------------------- |
| `xmc.xmapp.listCollections`        | List site collections    | Query    | `{ sitecoreContextId }`               | `SiteCollection[]`     |
| `xmc.xmapp.retrieveCollection`     | Get collection details   | Query    | `{ collectionId, sitecoreContextId }` | `SiteCollection`       |
| `xmc.xmapp.createCollection`       | Create collection        | Mutation | `CreateCollectionRequest`             | `SiteCollection`       |
| `xmc.xmapp.updateCollection`       | Update collection        | Mutation | `UpdateCollectionRequest`             | `SiteCollection`       |
| `xmc.xmapp.renameCollection`       | Rename collection        | Mutation | `RenameCollectionRequest`             | `SiteCollection`       |
| `xmc.xmapp.sortCollections`        | Sort collections         | Mutation | `SortCollectionsRequest`              | `void`                 |
| `xmc.xmapp.validateCollectionName` | Validate name            | Mutation | `ValidateNameRequest`                 | `NameValidationResult` |
| `xmc.xmapp.listCollectionSites`    | List sites in collection | Query    | `{ collectionId, sitecoreContextId }` | `Site[]`               |
| `xmc.xmapp.deleteCollection`       | Delete collection        | Mutation | `{ collectionId, sitecoreContextId }` | `void`                 |

#### Site Management

| Key                                   | Description                  | Type     | Parameters                                   | Response Type          |
| ------------------------------------- | ---------------------------- | -------- | -------------------------------------------- | ---------------------- |
| `xmc.xmapp.listSites`                 | List all sites               | Query    | `{ sitecoreContextId }`                      | `Site[]`               |
| `xmc.xmapp.retrieveSite`              | Get site details             | Query    | `{ siteId, sitecoreContextId }`              | `Site`                 |
| `xmc.xmapp.createSite`                | Create new site              | Mutation | `CreateSiteRequest`                          | `Site`                 |
| `xmc.xmapp.updateSite`                | Update site                  | Mutation | `UpdateSiteRequest`                          | `Site`                 |
| `xmc.xmapp.copySite`                  | Duplicate site               | Mutation | `CopySiteRequest`                            | `Site`                 |
| `xmc.xmapp.renameSite`                | Rename site                  | Mutation | `RenameSiteRequest`                          | `Site`                 |
| `xmc.xmapp.sortSites`                 | Sort sites                   | Mutation | `SortSitesRequest`                           | `void`                 |
| `xmc.xmapp.validateSiteName`          | Validate site name           | Mutation | `ValidateNameRequest`                        | `NameValidationResult` |
| `xmc.xmapp.uploadSiteThumbnail`       | Upload thumbnail             | Mutation | `UploadThumbnailRequest`                     | `UploadMediaOutput`    |
| `xmc.xmapp.deleteSite`                | Delete site                  | Mutation | `{ siteId, sitecoreContextId }`              | `void`                 |
| `xmc.xmapp.getFavoriteSites`          | Get favorite sites           | Query    | `{ sitecoreContextId }`                      | `Site[]`               |
| `xmc.xmapp.addFavoriteSite`           | Add to favorites             | Mutation | `AddFavoriteRequest`                         | `void`                 |
| `xmc.xmapp.removeFavoriteSite`        | Remove from favorites        | Mutation | `{ siteId, sitecoreContextId }`              | `void`                 |
| `xmc.xmapp.listTrackedSites`          | List analytics-tracked sites | Query    | `{ analyticsIdentifier, sitecoreContextId }` | `Site[]`               |
| `xmc.xmapp.listSiteTemplates`         | List site templates          | Query    | `{ sitecoreContextId }`                      | `SiteTemplate[]`       |
| `xmc.xmapp.detachAnalyticsIdentifier` | Detach analytics             | Mutation | `DetachAnalyticsRequest`                     | `void`                 |

#### Page Management

| Key                                   | Description           | Type     | Parameters                      | Response Type                     |
| ------------------------------------- | --------------------- | -------- | ------------------------------- | --------------------------------- |
| `xmc.xmapp.listPageVariants`          | List page variants    | Query    | `{ sitecoreContextId, itemId }` | `PageVariantsResponse`            |
| `xmc.xmapp.getLivePageState`          | Check page live state | Query    | `{ sitecoreContextId, itemId }` | `LivePageState`                   |
| `xmc.xmapp.retrieveSiteHierarchy`     | Get site hierarchy    | Query    | `{ siteId, sitecoreContextId }` | `PageHierarchy`                   |
| `xmc.xmapp.retrievePageHierarchy`     | Get page hierarchy    | Query    | `{ sitecoreContextId, itemId }` | `PageHierarchy`                   |
| `xmc.xmapp.listPageAncestors`         | List page ancestors   | Query    | `{ sitecoreContextId, itemId }` | `PageResponse[]`                  |
| `xmc.xmapp.listPageChildren`          | List page children    | Query    | `{ sitecoreContextId, itemId }` | `PageResponse[]`                  |
| `xmc.xmapp.aggregateLivePageVariants` | Get live variants     | Mutation | `AggregateVariantsRequest`      | `PageVariantsAggregationResponse` |
| `xmc.xmapp.aggregatePageData`         | Aggregate page data   | Mutation | `AggregatePageDataRequest`      | `PageAggregationResponse`         |

#### Host Management

| Key                           | Description         | Type     | Parameters                      | Response Type     |
| ----------------------------- | ------------------- | -------- | ------------------------------- | ----------------- |
| `xmc.xmapp.listHosts`         | List site hosts     | Query    | `{ siteId, sitecoreContextId }` | `Host[]`          |
| `xmc.xmapp.retrieveHost`      | Get host details    | Query    | `{ hostId, sitecoreContextId }` | `Host`            |
| `xmc.xmapp.createHost`        | Create host         | Mutation | `CreateHostRequest`             | `Host`            |
| `xmc.xmapp.updateHost`        | Update host         | Mutation | `UpdateHostRequest`             | `Host`            |
| `xmc.xmapp.deleteHost`        | Delete host         | Mutation | `{ hostId, sitecoreContextId }` | `void`            |
| `xmc.xmapp.getRenderingHosts` | Get rendering hosts | Query    | `{ siteId, sitecoreContextId }` | `RenderingHost[]` |

#### Background Jobs

| Key                     | Description          | Type  | Parameters                     | Response Type |
| ----------------------- | -------------------- | ----- | ------------------------------ | ------------- |
| `xmc.xmapp.listJobs`    | List background jobs | Query | `{ sitecoreContextId }`        | `Job[]`       |
| `xmc.xmapp.retrieveJob` | Get job details      | Query | `{ jobId, sitecoreContextId }` | `Job`         |

#### Analytics and Configuration

| Key                                        | Description            | Type     | Parameters                      | Response Type            |
| ------------------------------------------ | ---------------------- | -------- | ------------------------------- | ------------------------ |
| `xmc.xmapp.retrieveLocalizationStatistics` | Get localization stats | Query    | `{ siteId, sitecoreContextId }` | `LocalizationStatistics` |
| `xmc.xmapp.retrieveSitemapConfiguration`   | Get sitemap config     | Query    | `{ siteId, sitecoreContextId }` | `SitemapConfiguration`   |
| `xmc.xmapp.updateSitemapConfiguration`     | Update sitemap config  | Mutation | `UpdateSitemapRequest`          | `SitemapConfiguration`   |
| `xmc.xmapp.retrieveWorkflowStatistics`     | Get workflow stats     | Query    | `{ siteId, sitecoreContextId }` | `WorkflowStatistics`     |

#### Agent API Operations (v0.3.0+)

The Agent API provides AI-first, high-level operations for XM Cloud management. All operations require `sitecoreContextId`.

**Sites Operations**:

| Key                                   | Description                     | Type  | Parameters                              | Response Type  |
| ------------------------------------- | ------------------------------- | ----- | --------------------------------------- | -------------- |
| `xmc.agent.sitesGetSitesList`         | List all sites                  | Query | `{ sitecoreContextId }`                 | `Site[]`       |
| `xmc.agent.sitesGetSiteDetails`       | Get detailed site information   | Query | `{ site_id, sitecoreContextId }`        | `SiteDetails`  |
| `xmc.agent.sitesGetAllPagesBySite`    | Get all pages in a site         | Query | `{ site_id, sitecoreContextId }`        | `Page[]`       |
| `xmc.agent.sitesGetSiteIdFromItem`    | Get site ID from any item       | Query | `{ item_id, sitecoreContextId }`        | `string`       |

**Pages Operations**:

| Key                                             | Description                       | Type     | Parameters                                          | Response Type         |
| ----------------------------------------------- | --------------------------------- | -------- | --------------------------------------------------- | --------------------- |
| `xmc.agent.pagesCreatePage`                     | Create new page                   | Mutation | `CreatePageRequest`                                 | `Page`                |
| `xmc.agent.pagesGetPage`                        | Get page details                  | Query    | `{ page_id, site_id, sitecoreContextId }`           | `PageDetails`         |
| `xmc.agent.pagesAddLanguageToPage`              | Add language version to page      | Mutation | `{ page_id, language, sitecoreContextId }`          | `void`                |
| `xmc.agent.pagesGetComponentsOnPage`            | Get all components on page        | Query    | `{ page_id, language?, sitecoreContextId }`         | `Component[]`         |
| `xmc.agent.pagesAddComponentOnPage`             | Add component to page             | Mutation | `AddComponentRequest`                               | `void`                |
| `xmc.agent.pagesSetComponentDatasource`         | Set component datasource          | Mutation | `{ rendering_id, datasourceId, sitecoreContextId }` | `void`                |
| `xmc.agent.pagesSearchSite`                     | Search within a site              | Query    | `{ site_id, searchQuery, sitecoreContextId }`       | `SearchResults`       |
| `xmc.agent.pagesGetPagePathByLiveUrl`           | Get page path from live URL       | Query    | `{ site_id, url, sitecoreContextId }`               | `string`              |
| `xmc.agent.pagesGetPageScreenshot`              | Get page screenshot               | Query    | `{ page_id, sitecoreContextId }`                    | `Screenshot`          |
| `xmc.agent.pagesGetPageHtml`                    | Get page HTML                     | Query    | `{ page_id, language?, sitecoreContextId }`         | `string`              |
| `xmc.agent.pagesGetPagePreviewUrl`              | Get page preview URL              | Query    | `{ page_id, sitecoreContextId }`                    | `string`              |
| `xmc.agent.pagesGetPageTemplateById`            | Get page template info            | Query    | `{ template_id, sitecoreContextId }`                | `Template`            |
| `xmc.agent.pagesGetAllowedComponentsByPlaceholder` | Get allowed components for placeholder | Query | `{ page_id, placeholderKey, sitecoreContextId }`   | `Component[]`         |

**Content Operations**:

| Key                                          | Description                  | Type     | Parameters                                     | Response Type     |
| -------------------------------------------- | ---------------------------- | -------- | ---------------------------------------------- | ----------------- |
| `xmc.agent.contentCreateContentItem`         | Create content item          | Mutation | `CreateContentItemRequest`                     | `ContentItem`     |
| `xmc.agent.contentGetContentItemById`        | Get content item by ID       | Query    | `{ item_id, language?, sitecoreContextId }`    | `ContentItem`     |
| `xmc.agent.contentGetContentItemByPath`      | Get content item by path     | Query    | `{ path, language?, sitecoreContextId }`       | `ContentItem`     |
| `xmc.agent.contentUpdateContent`             | Update content item          | Mutation | `UpdateContentRequest`                         | `void`            |
| `xmc.agent.contentDeleteContent`             | Delete content item          | Mutation | `{ item_id, sitecoreContextId }`               | `void`            |
| `xmc.agent.contentListAvailableInsertoptions` | List available insert options | Query   | `{ item_id, sitecoreContextId }`               | `Template[]`      |

**Components Operations**:

| Key                                             | Description                    | Type     | Parameters                                    | Response Type       |
| ----------------------------------------------- | ------------------------------ | -------- | --------------------------------------------- | ------------------- |
| `xmc.agent.componentsCreateComponentDatasource` | Create component datasource    | Mutation | `CreateDatasourceRequest`                     | `Datasource`        |
| `xmc.agent.componentsSearchComponentDatasources` | Search for datasources        | Query    | `{ searchQuery, sitecoreContextId }`          | `Datasource[]`      |
| `xmc.agent.componentsListComponents`            | List all components            | Query    | `{ sitecoreContextId }`                       | `Component[]`       |
| `xmc.agent.componentsGetComponent`              | Get component details          | Query    | `{ component_id, sitecoreContextId }`         | `ComponentDetails`  |

**Assets Operations**:

| Key                                    | Description              | Type     | Parameters                            | Response Type   |
| -------------------------------------- | ------------------------ | -------- | ------------------------------------- | --------------- |
| `xmc.agent.assetsUploadAsset`          | Upload media asset       | Mutation | `UploadAssetRequest`                  | `Asset`         |
| `xmc.agent.assetsSearchAssets`         | Search for assets        | Query    | `{ searchQuery, sitecoreContextId }`  | `Asset[]`       |
| `xmc.agent.assetsGetAssetInformation`  | Get asset information    | Query    | `{ asset_id, sitecoreContextId }`     | `AssetDetails`  |
| `xmc.agent.assetsUpdateAsset`          | Update asset metadata    | Mutation | `UpdateAssetRequest`                  | `void`          |

**Personalization Operations**:

| Key                                                         | Description                       | Type     | Parameters                                | Response Type          |
| ----------------------------------------------------------- | --------------------------------- | -------- | ----------------------------------------- | ---------------------- |
| `xmc.agent.personalizationCreatePersonalizationVersion`     | Create personalization version    | Mutation | `CreatePersonalizationRequest`            | `PersonalizationVersion` |
| `xmc.agent.personalizationGetPersonalizationVersionsByPage` | Get personalization versions      | Query    | `{ page_id, sitecoreContextId }`          | `PersonalizationVersion[]` |
| `xmc.agent.personalizationGetConditionTemplates`            | Get available condition templates | Query    | `{ sitecoreContextId }`                   | `ConditionTemplate[]`  |
| `xmc.agent.personalizationGetConditionTemplateById`         | Get condition template details    | Query    | `{ template_id, sitecoreContextId }`      | `ConditionTemplate`    |

**Jobs Operations**:

| Key                           | Description              | Type     | Parameters                       | Response Type |
| ----------------------------- | ------------------------ | -------- | -------------------------------- | ------------- |
| `xmc.agent.jobsGetJob`        | Get job details          | Query    | `{ job_id, sitecoreContextId }`  | `Job`         |
| `xmc.agent.jobsListOperations` | List available operations | Query   | `{ sitecoreContextId }`          | `Operation[]` |
| `xmc.agent.jobsRevertJob`     | Revert a job             | Mutation | `{ job_id, sitecoreContextId }`  | `void`        |

**Environment Operations**:

| Key                                    | Description           | Type  | Parameters              | Response Type |
| -------------------------------------- | --------------------- | ----- | ----------------------- | ------------- |
| `xmc.agent.environmentsListLanguages`  | List all languages    | Query | `{ sitecoreContextId }` | `Language[]`  |

### Error Codes

| Code             | Description           | Common Causes                    |
| ---------------- | --------------------- | -------------------------------- |
| `TIMEOUT`        | Request timeout       | Network issues, slow responses   |
| `UNAUTHORIZED`   | Authentication failed | Invalid tokens, expired sessions |
| `FORBIDDEN`      | Access denied         | Insufficient permissions         |
| `NOT_FOUND`      | Resource not found    | Invalid IDs, deleted resources   |
| `INVALID_PARAMS` | Invalid parameters    | Malformed requests               |

## Integration Patterns

### Common Use Cases

#### Content Management Tools

Build tools that help content editors manage and organize content:

```typescript
// Content audit application
const auditContent = async () => {
  const sites = await client.query('xmc.xmapp.listSites', {
    params: { query: { sitecoreContextId: contextId } },
  });

  for (const site of sites.data) {
    const hierarchy = await client.query('xmc.xmapp.retrieveSiteHierarchy', {
      params: {
        path: { siteId: site.id },
        query: { sitecoreContextId: contextId },
      },
    });

    // Analyze content structure
    analyzeContentStructure(hierarchy.data);
  }
};
```

#### Analytics and Reporting

Create dashboards and reports using site and page data:

```typescript
// Site analytics dashboard
const generateSiteReport = async (siteId: string) => {
  const [localizationStats, workflowStats, site] = await Promise.all([
    client.query('xmc.xmapp.retrieveLocalizationStatistics', {
      params: {
        path: { siteId },
        query: { sitecoreContextId: contextId },
      },
    }),
    client.query('xmc.xmapp.retrieveWorkflowStatistics', {
      params: {
        path: { siteId },
        query: { sitecoreContextId: contextId },
      },
    }),
    client.query('xmc.xmapp.retrieveSite', {
      params: {
        path: { siteId },
        query: { sitecoreContextId: contextId },
      },
    }),
  ]);

  return {
    site: site.data,
    localization: localizationStats.data,
    workflow: workflowStats.data,
  };
};
```

#### Site Management Automation

Automate site creation and management tasks:

```typescript
// Bulk site operations
const createSitesFromTemplate = async (templateId: string, siteConfigs: SiteConfig[]) => {
  const results = [];

  for (const config of siteConfigs) {
    try {
      const site = await client.mutate('xmc.xmapp.createSite', {
        params: {
          body: {
            name: config.name,
            displayName: config.displayName,
            templateId,
            collectionId: config.collectionId,
            sitecoreContextId: contextId,
          },
        },
      });

      // Configure hosts
      if (config.hosts) {
        for (const hostConfig of config.hosts) {
          await client.mutate('xmc.xmapp.createHost', {
            params: {
              body: {
                name: hostConfig.name,
                siteId: site.id,
                sitecoreContextId: contextId,
              },
            },
          });
        }
      }

      results.push({ success: true, site });
    } catch (error) {
      results.push({ success: false, error, config });
    }
  }

  return results;
};
```

## Advanced Usage

### Custom Module Development

You can extend the SDK by creating custom modules:

```typescript
import { SDKModule } from '@sitecore-marketplace-sdk/client';

// Define your custom module
const MyCustomModule: SDKModule = {
  namespace: 'mycustom',
  invokeOperation: (operationName: string, ...args: any[]) => {
    switch (operationName) {
      case 'customOperation':
        return handleCustomOperation(...args);
      case 'batchOperation':
        return handleBatchOperation(...args);
      default:
        throw new Error(`Operation '${operationName}' not found`);
    }
  },
};

// Register module with client
const client = await ClientSDK.init({
  target: window.parent,
  modules: [MyCustomModule],
});

// Use custom operation
const result = await client.query('mycustom.customOperation', {
  params: { customParam: 'value' },
});
```

### Environment Detection

```typescript
// Detect current environment
const detectEnvironment = () => {
  const hostname = window.location.hostname;

  if (hostname.includes('localhost') || hostname.includes('127.0.0.1')) {
    return 'development';
  } else if (hostname.includes('staging')) {
    return 'staging';
  } else if (hostname.includes('sitecorecloud.io')) {
    return 'production';
  }

  return 'unknown';
};

// Configure SDK based on environment
const environment = detectEnvironment();
const client = await ClientSDK.init({
  target: window.parent,
  timeout: environment === 'development' ? 10000 : 5000,
  modules: environment === 'production' ? [XMC] : [],
});
```

### Performance Optimization

#### Lazy Loading Modules

```typescript
// Conditionally load XMC module
const shouldLoadXMC = await checkXMCAvailability();
const modules = shouldLoadXMC ? [XMC] : [];

const client = await ClientSDK.init({
  target: window.parent,
  modules,
});
```

#### Query Optimization

```typescript
// Use React Query with SDK
import { useQuery } from 'react-query';

const useApplicationContext = () => {
  const { client } = useMarketplaceClient();

  return useQuery('application.context', () => client.query('application.context'), {
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: false,
  });
};
```

## Getting Help and Resources

### Official Documentation

- [Sitecore Marketplace Developer Portal](https://doc.sitecore.com/mp/en/developers/marketplace/introduction-to-sitecore-marketplace.html)
- [XM Cloud Developer Documentation](https://doc.sitecore.com/xmc/en/developers/)
- [Sitecore Community](https://community.sitecore.com/)

### Package Information

#### NPM Packages

```bash
# Core client SDK (required)
npm install @sitecore-marketplace-sdk/client

# XM Cloud integration (optional)
npm install @sitecore-marketplace-sdk/xmc
```

#### Version Compatibility

| Package                       | Current Version | Sitecore XM Cloud | Node.js | TypeScript |
| ----------------------------- | --------------- | ----------------- | ------- | ---------- |
| @sitecore-marketplace-sdk/client | 0.2.2        | Latest            | 16+     | 5.0+       |
| @sitecore-marketplace-sdk/xmc    | 0.3.0        | Latest            | 16+     | 5.0+       |
| @sitecore-marketplace-sdk/core   | 0.2.2        | Latest            | 16+     | 5.0+       |

**Version History**:
- **v0.3.0 (XMC)**: Added comprehensive Agent API for AI-powered operations
- **v0.2.2**: Added Auth0 token exchange support, organization ID, permissions control
- **v0.2.1 (XMC)**: Added experimental server-side XMC client
- **v0.2.0**: Extension points naming (replaces touchpoints), enhanced context fields
- **v0.1.6**: Dashboard blocks support multiple implementations, itemVersion type change
- **v0.1.4**: Added site.context query, pages.context mutation, custom field support
- **v0.1.2**: Initial release with pages.reloadCanvas mutation

### Support Channels

- **GitHub Issues**: Report bugs and request features
- **Community Forums**: Get help from other developers
- **Sitecore Support**: Enterprise support for licensed customers

### Contributing

The Sitecore Marketplace SDK is open source and welcomes contributions:

- **Source Code**: Available on GitHub
- **Bug Reports**: Use GitHub Issues
- **Feature Requests**: Community discussion and RFC process
- **Documentation**: Help improve this guide

### License

The Sitecore Marketplace SDK is licensed under the Apache 2.0 License.

---

_This comprehensive guide covers all aspects of building marketplace applications with the Sitecore Marketplace SDK. It serves as a complete reference for developers working on external projects that integrate with Sitecore XM Cloud._

_For the latest updates and additional resources, refer to the official [Marketplace developer documentation](https://doc.sitecore.com/mp/en/developers/marketplace/introduction-to-sitecore-marketplace.html)._
