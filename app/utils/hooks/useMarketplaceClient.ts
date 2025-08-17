import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import { XMC } from "@sitecore-marketplace-sdk/xmc";

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

  try {
    console.log("XMC_ITEM_DIFF - Initializing Marketplace SDK...");
    const config = {
      target: window.parent,
      modules: [XMC], // Include XMC for accessing authoring APIs
      debug: process.env.NODE_ENV === 'development',
    };

    client = await ClientSDK.init(config);
    console.log("XMC_ITEM_DIFF - Marketplace SDK initialized successfully");
    return client;
  } catch (error) {
    console.error("XMC_ITEM_DIFF - SDK initialization error:", error);
    throw new Error(`Sitecore Marketplace SDK initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function useMarketplaceClient(
  options: UseMarketplaceClientOptions = {}
) {
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
            error instanceof Error
              ? error
              : new Error("Failed to initialize MarketplaceClient"),
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