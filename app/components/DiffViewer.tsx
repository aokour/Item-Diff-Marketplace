"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { syntaxHighlighting } from "@codemirror/language";
import { MergeView, unifiedMergeView, goToNextChunk, goToPreviousChunk } from "@codemirror/merge";
import { Box, useColorModeValue } from "@chakra-ui/react";
import {
  JsonViewerProps,
  DiffViewerHandle,
} from "./types/DiffViewer.types";
import { jsonTheme, customEditorTheme } from "./styles/DiffViewer.styles";
import { 
  formatJson, 
  createDiffExtension, 
  searchHighlightField, 
  searchInEditor, 
  navigateToSearchResult, 
  clearSearch,
  SearchResult 
} from "./utils/editorUtils";
import { computeSimpleDiff, computeNaiveDiff } from "./utils/diffAlgorithms";
import "./DiffViewer.css";

// ============================================================================
// Main Component
// ============================================================================

export const DiffViewer = forwardRef<DiffViewerHandle, JsonViewerProps>(
  ({ previewJson, publishedJson, height = "600px", diffMode = true, viewMode = 'side-by-side', diffAlgorithm = 'line-by-line', lineAlgorithm = 'lcs' }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const mergeViewRef = useRef<MergeView | null>(null);
    const unifiedViewRef = useRef<EditorView | null>(null);
    const [loading, setLoading] = useState(true);
    const isDark = useColorModeValue(false, true);

    // Track current search state with native CodeMirror search
    const searchStateRef = useRef({
      preview: { query: "", currentTarget: 0, total: 0, results: [] as SearchResult[] },
      published: { query: "", currentTarget: 0, total: 0, results: [] as SearchResult[] },
    });

    useEffect(() => {
      if (!containerRef.current) return;

      // Clean up previous views
      if (mergeViewRef.current) {
        mergeViewRef.current.destroy();
        mergeViewRef.current = null;
      }
      if (unifiedViewRef.current) {
        unifiedViewRef.current.destroy();
        unifiedViewRef.current = null;
      }

      // Clear container
      containerRef.current.innerHTML = "";

      // Format JSON based on diff mode
      const formattedPreview = diffMode
        ? formatJson(previewJson)
        : typeof previewJson === "string"
          ? previewJson
          : JSON.stringify(previewJson, null, 2);
      const formattedPublished = diffMode
        ? formatJson(publishedJson)
        : typeof publishedJson === "string"
          ? publishedJson
          : JSON.stringify(publishedJson, null, 2);

      if (!formattedPreview || !formattedPublished) {
        setLoading(false);
        return;
      }

      try {
        const baseExtensions = [
          lineNumbers(),
          json(),
          syntaxHighlighting(jsonTheme),
          customEditorTheme,
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
          searchHighlightField,
        ];

        if (diffMode && viewMode === 'side-by-side') {
          // Create header structure for side-by-side view
          const wrapper = document.createElement("div");
          wrapper.className = "json-viewer-wrapper";

          const headersContainer = document.createElement("div");
          headersContainer.className = "json-viewer-headers";

          const previewHeader = document.createElement("div");
          previewHeader.className = "json-viewer-header";
          previewHeader.innerHTML = `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(100%) brightness(1.2);" /> Preview Version`;

          const publishedHeader = document.createElement("div");
          publishedHeader.className = "json-viewer-header";
          publishedHeader.innerHTML = `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Published Version`;

          headersContainer.appendChild(previewHeader);
          headersContainer.appendChild(publishedHeader);

          const editorsContainer = document.createElement("div");
          editorsContainer.className = "json-viewer-editors";

          wrapper.appendChild(headersContainer);
          wrapper.appendChild(editorsContainer);
          containerRef.current.appendChild(wrapper);

          if (diffAlgorithm === 'line-by-line') {
            // Pure custom line-by-line diff without native MergeView
            const lineLevelDiff = lineAlgorithm === 'lcs' 
              ? computeSimpleDiff(formattedPreview, formattedPublished)
              : computeNaiveDiff(formattedPreview, formattedPublished);
            
            // Create separate editor containers
            const previewContainer = document.createElement("div");
            previewContainer.className = "json-viewer-editor";
            previewContainer.style.borderRight = "1px solid rgba(120, 131, 146, 0.4)";
            
            const publishedContainer = document.createElement("div");
            publishedContainer.className = "json-viewer-editor";
            
            editorsContainer.appendChild(previewContainer);
            editorsContainer.appendChild(publishedContainer);

            // Create separate editors with custom diff highlighting using ALIGNED text
            const previewView = new EditorView({
              state: EditorState.create({
                doc: lineLevelDiff.alignedText1, // Use aligned text with gaps
                extensions: [
                  ...baseExtensions,
                  createDiffExtension(lineLevelDiff.diffLines1, 'left'),
                ],
              }),
              parent: previewContainer,
            });

            const publishedView = new EditorView({
              state: EditorState.create({
                doc: lineLevelDiff.alignedText2, // Use aligned text with gaps
                extensions: [
                  ...baseExtensions,
                  createDiffExtension(lineLevelDiff.diffLines2, 'right'),
                ],
              }),
              parent: publishedContainer,
            });

            // Store references for the handle
            mergeViewRef.current = {
              a: previewView,
              b: publishedView,
              destroy: () => {
                previewView.destroy();
                publishedView.destroy();
              }
            } as any;
          } else {
            // Use native MergeView for 'native' and 'hybrid' modes
            const mergeContainer = document.createElement("div");
            mergeContainer.className = "json-viewer-merge-container";
            editorsContainer.appendChild(mergeContainer);

            // Configure extensions based on diff algorithm
            let aExtensions = [...baseExtensions];
            let bExtensions = [...baseExtensions];

            if (diffAlgorithm === 'hybrid') {
              // Add custom line highlighting on top of native diff
              const lineLevelDiff = lineAlgorithm === 'lcs' 
                ? computeSimpleDiff(formattedPreview, formattedPublished)
                : computeNaiveDiff(formattedPreview, formattedPublished);
              aExtensions.push(createDiffExtension(lineLevelDiff.diffLines1, 'left'));
              bExtensions.push(createDiffExtension(lineLevelDiff.diffLines2, 'right'));
            }

            // Create native MergeView
            const mergeView = new MergeView({
              a: {
                doc: formattedPreview,
                extensions: aExtensions,
              },
              b: {
                doc: formattedPublished,
                extensions: bExtensions,
              },
              parent: mergeContainer,
              collapseUnchanged: formattedPreview.split('\n').length > 100 ? { margin: 3 } : undefined,
            });

            mergeViewRef.current = mergeView;
          }
        } else if (diffMode && viewMode === 'unified') {
          // Create unified merge view (uses native diff algorithm)
          const view = new EditorView({
            parent: containerRef.current,
            doc: formattedPublished,
            extensions: [
              ...baseExtensions,
              unifiedMergeView({
                original: formattedPreview,
                collapseUnchanged: formattedPreview.split('\n').length > 100 ? { margin: 3 } : undefined,
              }),
            ],
          });

          unifiedViewRef.current = view;
        } else {
          // Non-diff mode: show clean raw JSON without any diff highlighting
          const wrapper = document.createElement("div");
          wrapper.className = "json-viewer-wrapper";

          const headersContainer = document.createElement("div");
          headersContainer.className = "json-viewer-headers";

          const previewHeader = document.createElement("div");
          previewHeader.className = "json-viewer-header";
          previewHeader.innerHTML = `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(100%) brightness(1.2);" /> Preview Version (Raw)`;

          const publishedHeader = document.createElement("div");
          publishedHeader.className = "json-viewer-header";
          publishedHeader.innerHTML = `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Published Version (Raw)`;

          headersContainer.appendChild(previewHeader);
          headersContainer.appendChild(publishedHeader);

          const editorsContainer = document.createElement("div");
          editorsContainer.className = "json-viewer-editors";

          wrapper.appendChild(headersContainer);
          wrapper.appendChild(editorsContainer);
          containerRef.current.appendChild(wrapper);

          // Create separate editor containers for clean raw view
          const previewContainer = document.createElement("div");
          previewContainer.className = "json-viewer-editor";
          previewContainer.style.borderRight = "1px solid rgba(120, 131, 146, 0.4)";
          
          const publishedContainer = document.createElement("div");
          publishedContainer.className = "json-viewer-editor";
          
          editorsContainer.appendChild(previewContainer);
          editorsContainer.appendChild(publishedContainer);

          // Create separate editors with NO diff highlighting - raw JSON only
          const previewView = new EditorView({
            state: EditorState.create({
              doc: formattedPreview, // Use original unaligned text
              extensions: baseExtensions, // No diff extensions
            }),
            parent: previewContainer,
          });

          const publishedView = new EditorView({
            state: EditorState.create({
              doc: formattedPublished, // Use original unaligned text
              extensions: baseExtensions, // No diff extensions
            }),
            parent: publishedContainer,
          });

          // Store references for the handle (same structure as line-by-line mode)
          mergeViewRef.current = {
            a: previewView,
            b: publishedView,
            destroy: () => {
              previewView.destroy();
              publishedView.destroy();
            }
          } as any;
        }

        setTimeout(() => {
          setLoading(false);
        }, 300);

      } catch (error) {
        console.error("MergeView creation failed:", error);
        setLoading(false);
      }
    }, [previewJson, publishedJson, isDark, diffMode, viewMode, diffAlgorithm, lineAlgorithm]);

    // Expose simplified API for compatibility with existing usage
    useImperativeHandle(
      ref,
      () => ({
        searchInPreview: (query: string) => {
          const view = mergeViewRef.current?.a || unifiedViewRef.current;
          if (!view) return 0;
          
          try {
            const results = searchInEditor(view, query);
            searchStateRef.current.preview = {
              query,
              currentTarget: results.length > 0 ? 1 : 0, // Start at 1 for 1-based indexing
              total: results.length,
              results,
            };
            
            if (results.length > 0) {
              navigateToSearchResult(view, results, 0);
            } else {
              clearSearch(view);
            }
            
            return results.length;
          } catch (error) {
            console.error("Search in preview failed:", error);
            return 0;
          }
        },

        searchInPublished: (query: string) => {
          const view = mergeViewRef.current?.b || unifiedViewRef.current;
          if (!view) return 0;
          
          try {
            const results = searchInEditor(view, query);
            searchStateRef.current.published = {
              query,
              currentTarget: results.length > 0 ? 1 : 0, // Start at 1 for 1-based indexing
              total: results.length,
              results,
            };
            
            if (results.length > 0) {
              navigateToSearchResult(view, results, 0);
            } else {
              clearSearch(view);
            }
            
            return results.length;
          } catch (error) {
            console.error("Search in published failed:", error);
            return 0;
          }
        },

        findNextMatch: (editor: "preview" | "published") => {
          const searchState = searchStateRef.current[editor];
          const view = editor === "preview" 
            ? (mergeViewRef.current?.a || unifiedViewRef.current)
            : (mergeViewRef.current?.b || unifiedViewRef.current);
          
          if (!view || !searchState.results.length) {
            // Fallback to chunk navigation for diff mode
            if (diffMode) {
              try {
                const currentView = unifiedViewRef.current || 
                  (mergeViewRef.current && editor === "preview" ? mergeViewRef.current.a : mergeViewRef.current?.b);
                
                if (currentView) {
                  goToNextChunk(currentView);
                  return true;
                }
              } catch (error) {
                console.error("Chunk navigation failed:", error);
              }
            }
            return false;
          }
          
          // Use 0-based index for array access, but display as 1-based
          const currentZeroIndex = searchState.currentTarget - 1; // Convert from 1-based to 0-based
          const nextZeroIndex = (currentZeroIndex + 1) % searchState.total;
          searchState.currentTarget = nextZeroIndex + 1; // Convert back to 1-based for display
          
          return navigateToSearchResult(view, searchState.results, nextZeroIndex);
        },

        findPreviousMatch: (editor: "preview" | "published") => {
          const searchState = searchStateRef.current[editor];
          const view = editor === "preview" 
            ? (mergeViewRef.current?.a || unifiedViewRef.current)
            : (mergeViewRef.current?.b || unifiedViewRef.current);
          
          if (!view || !searchState.results.length) {
            // Fallback to chunk navigation for diff mode
            if (diffMode) {
              try {
                const currentView = unifiedViewRef.current || 
                  (mergeViewRef.current && editor === "preview" ? mergeViewRef.current.a : mergeViewRef.current?.b);
                
                if (currentView) {
                  goToPreviousChunk(currentView);
                  return true;
                }
              } catch (error) {
                console.error("Chunk navigation failed:", error);
              }
            }
            return false;
          }
          
          // Use 0-based index for array access, but display as 1-based
          const currentZeroIndex = searchState.currentTarget - 1; // Convert from 1-based to 0-based
          const prevZeroIndex = currentZeroIndex === 0 
            ? searchState.total - 1 
            : currentZeroIndex - 1;
          searchState.currentTarget = prevZeroIndex + 1; // Convert back to 1-based for display
          
          return navigateToSearchResult(view, searchState.results, prevZeroIndex);
        },

        clearSearch: () => {
          try {
            // Clear search highlights in both editors
            const previewView = mergeViewRef.current?.a || unifiedViewRef.current;
            const publishedView = mergeViewRef.current?.b || unifiedViewRef.current;
            
            if (previewView) clearSearch(previewView);
            if (publishedView && publishedView !== previewView) clearSearch(publishedView);
            
            searchStateRef.current.preview = {
              query: "",
              currentTarget: 0,
              total: 0,
              results: [],
            };
            searchStateRef.current.published = {
              query: "",
              currentTarget: 0,
              total: 0,
              results: [],
            };
          } catch (error) {
            console.error("Clear search failed:", error);
          }
        },

        getSearchMatches: (editor: "preview" | "published") => {
          return searchStateRef.current[editor].total;
        },

        scrollToMatch: (editor: "preview" | "published", matchIndex: number) => {
          const searchState = searchStateRef.current[editor];
          const view = editor === "preview" 
            ? (mergeViewRef.current?.a || unifiedViewRef.current)
            : (mergeViewRef.current?.b || unifiedViewRef.current);
          
          if (!view || !searchState.results.length || matchIndex < 0 || matchIndex >= searchState.total) {
            return;
          }
          
          // matchIndex is 0-based from the caller, store as 1-based for display
          searchState.currentTarget = matchIndex + 1;
          navigateToSearchResult(view, searchState.results, matchIndex);
        },

        getCurrentMatchIndex: (editor: "preview" | "published") => {
          return searchStateRef.current[editor].currentTarget;
        },
      }),
      [diffMode]
    );

    return (
      <Box
        height={height}
        maxHeight={height}
        width="100%"
        border="1px solid"
        borderColor={isDark ? "gray.600" : "gray.200"}
        borderRadius="md"
        bg={isDark ? "gray.800" : "white"}
        overflow="auto"
        position="relative"
        className="json-viewer-container"
        sx={{
          "&::-webkit-scrollbar": {
            width: "12px",
            height: "12px",
          },
          "&::-webkit-scrollbar-track": {
            background: "#1a202c",
            borderRadius: "6px",
          },
          "&::-webkit-scrollbar-thumb": {
            background: "#4a5568",
            borderRadius: "6px",
            border: "2px solid #1a202c",
          },
          "&::-webkit-scrollbar-thumb:hover": {
            background: "#718096",
          },
          "&::-webkit-scrollbar-corner": {
            background: "#1a202c",
          },
        }}
      >
        {loading && (
          <Box
            position="absolute"
            top="0"
            left="0"
            right="0"
            bottom="0"
            display="flex"
            alignItems="center"
            justifyContent="center"
            bg={isDark ? "gray.800" : "white"}
            zIndex="10"
          >
            <Box
              width="24px"
              height="24px"
              border="2px solid"
              borderColor="blue.200"
              borderTopColor="blue.500"
              borderRadius="50%"
              animation="spin 1s linear infinite"
            />
          </Box>
        )}

        <div ref={containerRef} className="w-full" />
      </Box>
    );
  }
);

DiffViewer.displayName = "DiffViewer";

// Re-export types for external use
export type { DiffViewerHandle } from "./types/DiffViewer.types";
