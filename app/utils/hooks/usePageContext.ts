import { useEffect, useState, useCallback } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";

interface PageContextData {
  itemId?: string;
  itemPath?: string;
  language?: string;
  siteName?: string;
  routePath?: string;
}

export function usePageContext(client: ClientSDK | null) {
  const [pageContext, setPageContext] = useState<PageContextData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchInitialContext = useCallback(async () => {
    if (!client) return;

    try {
      setIsLoading(true);
      setError(null);

      console.log("XMC_ITEM_DIFF - Fetching initial page context...");
      // Get initial page context
      const { data } = await client.query("pages.context");
      console.log("XMC_ITEM_DIFF - Initial page context response:", data);
      
      if (data) {
        const contextData = {
          itemId: data.pageInfo?.id,
          itemPath: data.pageInfo?.path,
          language: data.pageInfo?.language || data.siteInfo?.language,
          siteName: data.siteInfo?.name,
          routePath: data.pageInfo?.route,
        };
        console.log("XMC_ITEM_DIFF - Setting page context:", contextData);
        setPageContext(contextData);
      } else {
        console.log("XMC_ITEM_DIFF - No data in page context response");
      }
    } catch (err) {
      console.error("XMC_ITEM_DIFF - Error fetching initial context:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch page context"));
    } finally {
      setIsLoading(false);
    }
  }, [client]);

  useEffect(() => {
    if (!client) return;

    let unsubscribe: (() => void) | undefined;

    const setupSubscription = async () => {
      try {
        console.log("XMC_ITEM_DIFF - Setting up page context subscription...");
        // Subscribe to page context changes
        const result = await client.query("pages.context", {
          subscribe: true,
          onSuccess: (data) => {
            console.log("XMC_ITEM_DIFF - Page context subscription update:", data);
            const contextData = {
              itemId: data.pageInfo?.id,
              itemPath: data.pageInfo?.path,
              language: data.pageInfo?.language || data.siteInfo?.language,
              siteName: data.siteInfo?.name,
              routePath: data.pageInfo?.route,
            };
            console.log("XMC_ITEM_DIFF - Setting page context from subscription:", contextData);
            setPageContext(contextData);
            setIsLoading(false);
            setError(null);
          },
          onError: (err) => {
            console.error("XMC_ITEM_DIFF - Subscription error:", err);
            setError(err instanceof Error ? err : new Error("Page context subscription error"));
            setIsLoading(false);
          }
        });

        unsubscribe = result.unsubscribe;
      } catch (err) {
        setError(err instanceof Error ? err : new Error("Failed to subscribe to page context"));
        setIsLoading(false);
      }
    };

    // Fetch initial context and setup subscription
    fetchInitialContext();
    setupSubscription();

    return () => {
      unsubscribe?.();
    };
  }, [client, fetchInitialContext]);

  return {
    pageContext,
    isLoading,
    error,
    refetch: fetchInitialContext,
  };
}