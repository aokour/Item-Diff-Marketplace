'use client';

import { Box } from "@chakra-ui/react";
import { useMarketplaceClient } from "../utils/hooks/useMarketplaceClient";
import { ItemDiffTool } from "./ItemDiffTool";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";

export function MarketplaceApp() {
  return <MarketplaceAppContent />;
}

function MarketplaceAppContent() {
  const { client, error, isInitialized, isLoading } = useMarketplaceClient();

  if (isLoading) {
    return <LoadingSpinner message="Initializing Sitecore Marketplace client..." />;
  }

  if (error) {
    return (
      <ErrorDisplay
        title="Marketplace Connection Error"
        message={error.message}
        details="Failed to initialize the Sitecore Marketplace SDK. Please ensure you're running within the Sitecore environment."
      />
    );
  }

  if (!isInitialized || !client) {
    return <LoadingSpinner message="Connecting to Sitecore..." />;
  }

  return (
    <Box p={4} minH="100vh" bg="gray.50">
      <ItemDiffTool client={client} />
    </Box>
  );
}