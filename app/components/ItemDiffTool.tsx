"use client";

import { useEffect, useState, useCallback, useRef } from "react";
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
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Kbd,
  ButtonGroup,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from "@chakra-ui/react";
// ItemDiffTool - main component for comparing authoring vs published layouts
import { usePageContext } from "../utils/hooks/usePageContext";
import {
  LayoutComparisonService,
  ComparisonResult,
} from "../services/LayoutComparisonService";
import { DiffViewer, DiffViewerHandle } from "./DiffViewer";
import { LoadingSpinner } from "./LoadingSpinner";
import { ErrorDisplay } from "./ErrorDisplay";
import {
  mdiMagnify,
  mdiRefresh,
  mdiChevronUp,
  mdiChevronDown,
  mdiClose,
} from "@mdi/js";

interface ItemDiffToolProps {
  client: ClientSDK;
}

interface SearchState {
  query: string;
  searchMode: "preview" | "published";
  currentMatchIndex: number;
  totalMatches: number;
  isSearching: boolean;
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

  // Search state
  const [searchState, setSearchState] = useState<SearchState>({
    query: "",
    searchMode: "preview",
    currentMatchIndex: 0,
    totalMatches: 0,
    isSearching: false,
  });

  const diffViewerRef = useRef<DiffViewerHandle>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

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

  // Handle search
  const handleSearch = useCallback(
    (query: string, mode?: "preview" | "published") => {
      const searchMode = mode || searchState.searchMode;
      console.log("🔍 ItemDiffTool handleSearch:", {
        query,
        searchMode,
        hasRef: !!diffViewerRef.current,
      });

      if (!diffViewerRef.current || !query.trim()) {
        // Clear search if query is empty
        console.log("🧹 Clearing search - empty query or no ref");
        if (diffViewerRef.current) {
          diffViewerRef.current.clearSearch();
        }
        setSearchState((prev) => ({
          ...prev,
          query: "",
          currentMatchIndex: 0,
          totalMatches: 0,
          isSearching: false,
        }));
        return;
      }

      console.log("🔎 Starting search...");
      setSearchState((prev) => ({ ...prev, isSearching: true }));

      // Search in the selected editor only
      let matches = 0;
      if (searchMode === "preview") {
        console.log("🔍 Searching in preview...");
        matches = diffViewerRef.current.searchInPreview(query);
      } else {
        console.log("🔍 Searching in published...");
        matches = diffViewerRef.current.searchInPublished(query);
      }

      console.log("📊 Search results:", { matches, query, searchMode });

      setSearchState((prev) => ({
        ...prev,
        query,
        searchMode,
        currentMatchIndex: matches > 0 ? 1 : 0,
        totalMatches: matches,
        isSearching: false,
      }));
    },
    [searchState.searchMode, toast]
  );

  // Navigate to next match
  const handleNextMatch = useCallback(() => {
    console.log("➡️ ItemDiffTool handleNextMatch:", {
      totalMatches: searchState.totalMatches,
      mode: searchState.searchMode,
    });
    if (!diffViewerRef.current || searchState.totalMatches === 0) {
      console.log("❌ Cannot navigate next - no ref or no matches");
      return;
    }

    // Navigate within the selected editor only
    const success = diffViewerRef.current.findNextMatch(searchState.searchMode);
    console.log("📍 Next match result:", success);

    if (success) {
      const newIndex = diffViewerRef.current.getCurrentMatchIndex(
        searchState.searchMode
      );
      console.log("📍 Updating index to:", newIndex);
      setSearchState((prev) => ({
        ...prev,
        currentMatchIndex: newIndex,
      }));
    }
  }, [searchState]);

  // Navigate to previous match
  const handlePreviousMatch = useCallback(() => {
    console.log("⬅️ ItemDiffTool handlePreviousMatch:", {
      totalMatches: searchState.totalMatches,
      mode: searchState.searchMode,
    });
    if (!diffViewerRef.current || searchState.totalMatches === 0) {
      console.log("❌ Cannot navigate previous - no ref or no matches");
      return;
    }

    // Navigate within the selected editor only
    const success = diffViewerRef.current.findPreviousMatch(
      searchState.searchMode
    );
    console.log("📍 Previous match result:", success);

    if (success) {
      const newIndex = diffViewerRef.current.getCurrentMatchIndex(
        searchState.searchMode
      );
      console.log("📍 Updating index to:", newIndex);
      setSearchState((prev) => ({
        ...prev,
        currentMatchIndex: newIndex,
      }));
    }
  }, [searchState]);

  // Clear search
  const handleClearSearch = useCallback(() => {
    if (diffViewerRef.current) {
      diffViewerRef.current.clearSearch();
    }
    setSearchState((prev) => ({
      ...prev,
      query: "",
      currentMatchIndex: 0,
      totalMatches: 0,
      isSearching: false,
    }));
    if (searchInputRef.current) {
      searchInputRef.current.value = "";
    }
  }, []);

  // Handle search mode change
  const handleSearchModeChange = useCallback(
    (newMode: "preview" | "published") => {
      console.log("🔄 Changing search mode:", {
        from: searchState.searchMode,
        to: newMode,
      });
      if (newMode === searchState.searchMode) {
        console.log("✅ Mode unchanged, skipping");
        return;
      }

      // Clear current search when switching modes
      if (diffViewerRef.current) {
        console.log("🧹 Clearing search for mode change");
        diffViewerRef.current.clearSearch();
      }

      setSearchState((prev) => ({
        ...prev,
        searchMode: newMode,
        currentMatchIndex: 0,
        totalMatches: 0,
      }));

      // Re-run search in new mode if there's a query
      if (searchState.query) {
        console.log("🔍 Re-running search in new mode:", {
          query: searchState.query,
          newMode,
        });
        setTimeout(() => {
          handleSearch(searchState.query, newMode);
        }, 100);
      }
    },
    [searchState.query, searchState.searchMode, handleSearch]
  );

  // Keyboard shortcut for search (Ctrl/Cmd + F)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "f") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

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

              {/* Item Info & Comparison Status - Collapsible */}
              {comparisonResult?.itemInfo && (
                <Accordion allowToggle>
                  <AccordionItem
                    border="1px solid"
                    borderColor="gray.200"
                    borderRadius="md"
                    bg="gray.50"
                  >
                    <h2>
                      <AccordionButton>
                        <Box as="span" flex="1" textAlign="left">
                          <HStack spacing={3}>
                            <Badge
                              colorScheme={
                                comparisonResult.preview.error ? "red" : "green"
                              }
                              variant="subtle"
                              size="sm"
                            >
                              Preview:{" "}
                              {comparisonResult.preview.error
                                ? "MISSING"
                                : "FOUND"}
                            </Badge>
                            <Text variant="default">vs</Text>
                            <Badge
                              colorScheme={
                                comparisonResult.published.error
                                  ? "red"
                                  : "green"
                              }
                              variant="subtle"
                              size="sm"
                            >
                              Published:{" "}
                              {comparisonResult.published.error
                                ? "MISSING"
                                : "FOUND"}
                            </Badge>
                          </HStack>
                        </Box>
                        <AccordionIcon />
                      </AccordionButton>
                    </h2>
                    <AccordionPanel pb={4}>
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
                          <strong>Path:</strong>{" "}
                          {comparisonResult.itemInfo.path}
                        </Text>

                        {/* Detailed Comparison Status */}
                        <Box pt={2}>
                          <Text variant="strong" mb={3}>
                            Detailed Status
                          </Text>
                          <HStack spacing={6}>
                            <VStack align="start" spacing={0}>
                              <Text variant="default">Preview Version</Text>
                              <Badge
                                colorScheme={
                                  comparisonResult.preview.error
                                    ? "red"
                                    : "green"
                                }
                                variant="subtle"
                                size="sm"
                              >
                                {comparisonResult.preview.error
                                  ? "Not Found"
                                  : "Found"}
                              </Badge>
                            </VStack>
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
                                  ? "Not Found"
                                  : "Found"}
                              </Badge>
                            </VStack>
                          </HStack>
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                </Accordion>
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

                {/* Search Section */}
                <HStack spacing={3}>
                  <InputGroup size="md" flex="1">
                    <InputLeftElement pointerEvents="none">
                      <Icon color="gray.400">
                        <path d={mdiMagnify} />
                      </Icon>
                    </InputLeftElement>
                    <Input
                      ref={searchInputRef}
                      placeholder={`Search in ${searchState.searchMode === "preview" ? "Preview" : "Published"} JSON...`}
                      variant="outline"
                      bg="white"
                      onChange={(e) => handleSearch(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          if (e.shiftKey) {
                            handlePreviousMatch();
                          } else {
                            handleNextMatch();
                          }
                        }
                        if (e.key === "Escape") {
                          handleClearSearch();
                        }
                      }}
                    />
                    {searchState.query && (
                      <InputRightElement>
                        <IconButton
                          aria-label="Clear search"
                          icon={
                            <Icon>
                              <path d={mdiClose} />
                            </Icon>
                          }
                          size="sm"
                          variant="ghost"
                          onClick={handleClearSearch}
                        />
                      </InputRightElement>
                    )}
                  </InputGroup>

                  {/* Search Mode Toggle */}
                  <ButtonGroup size="sm" isAttached variant="outline">
                    <Button
                      colorScheme={
                        searchState.searchMode === "preview"
                          ? "primary"
                          : "gray"
                      }
                      variant={
                        searchState.searchMode === "preview"
                          ? "solid"
                          : "outline"
                      }
                      onClick={() => handleSearchModeChange("preview")}
                      size="sm"
                      bg={
                        searchState.searchMode === "preview"
                          ? "primary.500"
                          : "white"
                      }
                    >
                      Preview
                    </Button>
                    <Button
                      colorScheme={
                        searchState.searchMode === "published"
                          ? "primary"
                          : "gray"
                      }
                      variant={
                        searchState.searchMode === "published"
                          ? "solid"
                          : "outline"
                      }
                      onClick={() => handleSearchModeChange("published")}
                      size="sm"
                      bg={
                        searchState.searchMode === "published"
                          ? "primary.500"
                          : "white"
                      }
                    >
                      Published
                    </Button>
                  </ButtonGroup>

                  {searchState.query && (
                    <>
                      <HStack spacing={1}>
                        <IconButton
                          aria-label="Previous match"
                          icon={
                            <Icon>
                              <path d={mdiChevronUp} />
                            </Icon>
                          }
                          size="sm"
                          variant="outline"
                          bg="white"
                          onClick={handlePreviousMatch}
                          isDisabled={searchState.totalMatches === 0}
                        />
                        <IconButton
                          aria-label="Next match"
                          icon={
                            <Icon>
                              <path d={mdiChevronDown} />
                            </Icon>
                          }
                          size="sm"
                          variant="outline"
                          bg="white"
                          onClick={handleNextMatch}
                          isDisabled={searchState.totalMatches === 0}
                        />
                      </HStack>

                      <Badge
                        colorScheme={
                          searchState.totalMatches > 0
                            ? searchState.searchMode === "preview"
                              ? "blue"
                              : "green"
                            : "gray"
                        }
                        px={2}
                        py={1}
                        borderRadius="md"
                        fontSize="xs"
                      >
                        {searchState.totalMatches > 0
                          ? `${searchState.currentMatchIndex} of ${searchState.totalMatches}`
                          : "No matches"}
                      </Badge>
                    </>
                  )}
                </HStack>

                {searchState.query && searchState.totalMatches > 0 && (
                  <HStack spacing={4} fontSize="xs" color="gray.600">
                    <Text>
                      Searching in:{" "}
                      <Badge
                        size="sm"
                        colorScheme={
                          searchState.searchMode === "preview"
                            ? "blue"
                            : "green"
                        }
                      >
                        {searchState.searchMode === "preview"
                          ? "Preview"
                          : "Published"}{" "}
                        version
                      </Badge>
                    </Text>
                    <HStack spacing={1} color="gray.500">
                      <Kbd fontSize="xs">Ctrl/Cmd</Kbd>
                      <Text>+</Text>
                      <Kbd fontSize="xs">F</Kbd>
                    </HStack>
                  </HStack>
                )}
              </VStack>
            </CardHeader>
            <CardBody pt={0} pb={4}>
              {comparisonResult.preview.rendered &&
              comparisonResult.published.rendered ? (
                <DiffViewer
                  ref={diffViewerRef}
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
