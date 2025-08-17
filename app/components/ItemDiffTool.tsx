"use client";

import { useEffect, useState, useCallback } from "react";
import { ClientSDK } from "@sitecore-marketplace-sdk/client";
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardHeader,
  CardBody,
  Badge,
  Flex,
  useToast,
  Skeleton,
  Icon,
} from "@chakra-ui/react";
// ItemDiffTool - main component for comparing authoring vs published layouts
import { usePageContext } from "../utils/hooks/usePageContext";
import {
  LayoutComparisonService,
  ComparisonResult,
} from "../services/LayoutComparisonService";
import { DiffViewer } from "./DiffViewer";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import { mdiMagnify } from "@mdi/js";
import { mdiRefresh } from "@mdi/js";

interface ItemDiffToolProps {
  client: ClientSDK;
}

export function ItemDiffTool({ client }: ItemDiffToolProps) {
  const {
    pageContext,
    isLoading: isPageLoading,
    error: pageError,
  } = usePageContext(client);
  const [comparisonService, setComparisonService] =
    useState<LayoutComparisonService | null>(null);
  const [comparisonResult, setComparisonResult] =
    useState<ComparisonResult | null>(null);
  const [isComparing, setIsComparing] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const toast = useToast();

  // Initialize the comparison service
  useEffect(() => {
    const initializeService = async () => {
      try {
        setIsInitializing(true);
        const service = new LayoutComparisonService(client);
        await service.initialize();
        setComparisonService(service);
      } catch (error) {
        toast({
          title: "Initialization Failed",
          description:
            error instanceof Error
              ? error.message
              : "Failed to initialize services",
          status: "error",
          duration: 5000,
          isClosable: true,
          render: ({ title, description }) => (
            <Box
              p={4}
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              shadow="sm"
            >
              <Text variant="strong" color="red.800">
                {title}
              </Text>
              <Text variant="default" mt={1} color="red.700">
                {description}
              </Text>
            </Box>
          ),
        });
      } finally {
        setIsInitializing(false);
      }
    };

    initializeService();
  }, [client, toast]);

  // Perform comparison when page context changes
  const performComparison = useCallback(async () => {
    if (!comparisonService || !pageContext?.itemId) {
      return;
    }

    setIsComparing(true);
    setComparisonResult(null);

    try {
      const result = await comparisonService.compareLayouts(
        pageContext.siteName || "website",
        pageContext.routePath || "/",
        pageContext.language || "en"
      );

      setComparisonResult(result);

      // Show status toast
      const hasPreviewData = !result.preview.error;
      const hasPublishedData = !result.published.error;

      if (hasPreviewData && hasPublishedData) {
        console.log("Comparison Complete");
      } else if (hasPreviewData || hasPublishedData) {
        toast({
          title: "Partial Data Retrieved",
          description: "Only one version could be fetched",
          status: "warning",
          duration: 3000,
          render: ({ title, description }) => (
            <Box
              p={4}
              bg="orange.50"
              border="1px solid"
              borderColor="orange.200"
              borderRadius="md"
              shadow="sm"
            >
              <Text variant="strong" color="orange.800">
                {title}
              </Text>
              <Text variant="default" mt={1} color="orange.700">
                {description}
              </Text>
            </Box>
          ),
        });
      } else {
        toast({
          title: "No Data Retrieved",
          description: "Could not fetch either version",
          status: "error",
          duration: 4000,
          render: ({ title, description }) => (
            <Box
              p={4}
              bg="red.50"
              border="1px solid"
              borderColor="red.200"
              borderRadius="md"
              shadow="sm"
            >
              <Text variant="strong" color="red.800">
                {title}
              </Text>
              <Text variant="default" mt={1} color="red.700">
                {description}
              </Text>
            </Box>
          ),
        });
      }
    } catch (error) {
      toast({
        title: "Comparison Failed",
        description:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        status: "error",
        duration: 5000,
        render: ({ title, description }) => (
          <Box
            p={4}
            bg="red.50"
            border="1px solid"
            borderColor="red.200"
            borderRadius="md"
            shadow="sm"
          >
            <Text variant="strong" color="red.800">
              {title}
            </Text>
            <Text variant="default" mt={1} color="red.700">
              {description}
            </Text>
          </Box>
        ),
      });
    } finally {
      setIsComparing(false);
    }
  }, [comparisonService, pageContext, toast]);

  // Auto-compare when page context changes (with safety checks)
  useEffect(() => {
    if (
      pageContext?.itemId &&
      comparisonService &&
      !isComparing &&
      !isInitializing
    ) {
      performComparison();
    }
  }, [pageContext?.itemId, !!comparisonService, isInitializing]);

  // Show loading state during initialization
  if (isInitializing) {
    return <LoadingSpinner message="Initializing Sitecore Item Diff Tool..." />;
  }

  // Show page context loading
  if (isPageLoading) {
    return <LoadingSpinner message="Loading page context..." />;
  }

  // Show page context error
  if (pageError) {
    return (
      <ErrorDisplay
        title="Page Context Error"
        message={pageError.message}
        details="Failed to load page context. Ensure you're in the Sitecore page builder."
      />
    );
  }

  // Show no item selected state
  if (!pageContext?.itemId) {
    return (
      <Box p={6} textAlign="center">
        <VStack spacing={4}>
          <Text variant="large">No Item Selected</Text>
          <Text variant="subtle">
            Select an item in the page builder to compare its preview and
            published versions.
          </Text>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      p={6}
      maxW="100%"
      h="100vh"
      overflow="auto"
      bg="gray.50"
      fontFamily="system-ui, -apple-system, sans-serif"
    >
      <VStack spacing={6} align="stretch" h="100%">
        {/* Header */}
        <Card shadow="sm" border="1px solid" borderColor="gray.200">
          <CardHeader pb={3}>
            <VStack spacing={4} align="stretch">
              <Flex justify="space-between" align="center">
                <VStack align="start" spacing={1}>
                  <Text variant="subtle">
                    Compare layout differences between preview and published
                    versions
                  </Text>
                </VStack>

                <Button
                  variant="solid"
                  isLoading={isComparing}
                  loadingText="Comparing..."
                  onClick={performComparison}
                  leftIcon={
                    <Icon>
                      <path d={mdiRefresh} />
                    </Icon>
                  }
                >
                  Refresh
                </Button>
              </Flex>

              {/* Item Info & Comparison Status */}
              {comparisonResult?.itemInfo && (
                <Box
                  p={4}
                  bg="gray.50"
                  borderRadius="md"
                  border="1px solid"
                  borderColor="gray.200"
                >
                  <VStack align="start" spacing={4}>
                    {/* Item Details */}
                    <HStack spacing={3}>
                      <Text variant="strong">
                        {comparisonResult.itemInfo.displayName ||
                          comparisonResult.itemInfo.name}
                      </Text>
                      <Badge colorScheme="blue" size="sm">
                        {pageContext.language?.toUpperCase() || "EN"}
                      </Badge>
                    </HStack>
                    <Text variant="small" fontFamily="mono">
                      <strong>Path:</strong> {comparisonResult.itemInfo.path}
                    </Text>

                    {/* Comparison Status */}
                    <Box pt={2}>
                      <Text variant="strong" mb={3}>
                        Comparison Status
                      </Text>
                      <HStack spacing={6}>
                        <HStack spacing={3}>
                          <VStack align="start" spacing={0}>
                            <Text variant="default">Preview Version</Text>
                            <Badge
                              colorScheme={
                                comparisonResult.preview.error ? "red" : "green"
                              }
                              variant="subtle"
                              size="sm"
                            >
                              {comparisonResult.preview.error
                                ? "Failed"
                                : "Loaded"}
                            </Badge>
                          </VStack>
                        </HStack>
                        <HStack spacing={3}>
                          <VStack align="start" spacing={0}>
                            <Text variant="default">Published Version</Text>
                            <Badge
                              colorScheme={
                                comparisonResult.published.error
                                  ? "red"
                                  : "green"
                              }
                              variant="subtle"
                              size="sm"
                            >
                              {comparisonResult.published.error
                                ? "Failed"
                                : "Loaded"}
                            </Badge>
                          </VStack>
                        </HStack>
                      </HStack>
                    </Box>
                  </VStack>
                </Box>
              )}
            </VStack>
          </CardHeader>
        </Card>

        {/* Loading State */}
        {isComparing && (
          <Card flex="1">
            <CardBody>
              <VStack spacing={4}>
                <Skeleton height="20px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
                <Skeleton height="16px" />
              </VStack>
            </CardBody>
          </Card>
        )}

        {/* Diff Viewer */}
        {!isComparing && comparisonResult && (
          <Card shadow="md" border="1px solid" borderColor="gray.200" h="auto">
            <CardHeader
              pb={3}
              bg="gray.50"
              borderBottomWidth="1px"
              borderColor="gray.200"
            >
              <VStack spacing={3} align="stretch">
                <HStack spacing={4} justify="space-between">
                  <VStack align="start" spacing={0}>
                    <Text variant="strong">
                      <Icon>
                        <path d={mdiMagnify} />
                      </Icon>
                      Layout Differences
                    </Text>
                    <Text variant="small">Side-by-side comparison view</Text>
                  </VStack>
                </HStack>
              </VStack>
            </CardHeader>
            <CardBody pt={0} pb={4}>
              {comparisonResult.preview.rendered &&
              comparisonResult.published.rendered ? (
                <DiffViewer
                  previewJson={comparisonResult.preview.rendered}
                  publishedJson={comparisonResult.published.rendered}
                  height="auto"
                />
              ) : (
                <VStack spacing={4} py={8}>
                  {comparisonResult.preview.error && (
                    <ErrorDisplay
                      title="Preview Error"
                      message={comparisonResult.preview.error}
                      showRetry={false}
                    />
                  )}
                  {comparisonResult.published.error && (
                    <ErrorDisplay
                      title="Published Error"
                      message={comparisonResult.published.error}
                      showRetry={false}
                    />
                  )}
                </VStack>
              )}
            </CardBody>
          </Card>
        )}
      </VStack>
    </Box>
  );
}
