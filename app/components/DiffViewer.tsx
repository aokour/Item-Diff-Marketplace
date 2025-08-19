"use client";

import {
  useEffect,
  useRef,
  useState,
  useImperativeHandle,
  forwardRef,
} from "react";
import { EditorState, Compartment } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { syntaxHighlighting } from "@codemirror/language";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { JsonViewerProps, DiffViewerHandle, SearchState } from "./types/DiffViewer.types";
import { jsonTheme, customEditorTheme } from "./styles/DiffViewer.styles";
import { computeDiffWithAlignment } from "./utils/diffAlgorithms";
import { createSearchCursor, createSearchViewPlugin, createSearchTargetViewPlugin } from "./utils/searchUtils";
import { createDiffExtension, formatJson } from "./utils/editorUtils";
import "./DiffViewer.css";

// ============================================================================
// Main Component
// ============================================================================

export const DiffViewer = forwardRef<DiffViewerHandle, JsonViewerProps>(
  ({ previewJson, publishedJson, height = "600px", diffMode = true }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const previewViewRef = useRef<EditorView | null>(null);
    const publishedViewRef = useRef<EditorView | null>(null);
    const [loading, setLoading] = useState(true);
    const isDark = useColorModeValue(false, true);

    // Search state management
    const previewSearchCompartment = useRef(new Compartment());
    const previewTargetCompartment = useRef(new Compartment());
    const publishedSearchCompartment = useRef(new Compartment());
    const publishedTargetCompartment = useRef(new Compartment());

    const searchState = useRef<SearchState>({
      preview: { query: "", currentTarget: 0, total: 0 },
      published: { query: "", currentTarget: 0, total: 0 },
    });



    useEffect(() => {
      if (!containerRef.current) return;

      // Clean up previous editors
      if (previewViewRef.current) {
        previewViewRef.current.destroy();
        previewViewRef.current = null;
      }
      if (publishedViewRef.current) {
        publishedViewRef.current.destroy();
        publishedViewRef.current = null;
      }

      // Clear container
      containerRef.current.innerHTML = "";


      // Format JSON based on diff mode
      const formattedPreview = diffMode ? formatJson(previewJson) : (typeof previewJson === "string" ? previewJson : JSON.stringify(previewJson, null, 2));
      const formattedPublished = diffMode ? formatJson(publishedJson) : (typeof publishedJson === "string" ? publishedJson : JSON.stringify(publishedJson, null, 2));

      if (!formattedPreview || !formattedPublished) {
        setLoading(false);
        return;
      }

      // Compute aligned diff with gaps only in diff mode
      const diffResult = diffMode ? computeDiffWithAlignment(formattedPreview, formattedPublished) : {
        alignedText1: formattedPreview,
        alignedText2: formattedPublished,
        diffLines1: new Set<number>(),
        diffLines2: new Set<number>()
      };

      try {
        // Create container structure with wrapper
        const wrapper = document.createElement("div");
        wrapper.className = "json-viewer-wrapper";

        const headersContainer = document.createElement("div");
        headersContainer.className = "json-viewer-headers";

        const previewHeader = document.createElement("div");
        previewHeader.className = "json-viewer-header";
        previewHeader.innerHTML =
          `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(100%) brightness(1.2);" /> Preview Version${diffMode ? '' : ' (Raw)'}`;

        const publishedHeader = document.createElement("div");
        publishedHeader.className = "json-viewer-header";
        publishedHeader.innerHTML =
          `<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Published Version${diffMode ? '' : ' (Raw)'}`;

        headersContainer.appendChild(previewHeader);
        headersContainer.appendChild(publishedHeader);

        const editorsContainer = document.createElement("div");
        editorsContainer.className = "json-viewer-editors";

        const previewContainer = document.createElement("div");
        previewContainer.className = "json-viewer-editor";
        previewContainer.style.borderRight = "1px solid rgba(120, 131, 146, 0.4)";

        const publishedContainer = document.createElement("div");
        publishedContainer.className = "json-viewer-editor";

        editorsContainer.appendChild(previewContainer);
        editorsContainer.appendChild(publishedContainer);

        wrapper.appendChild(headersContainer);
        wrapper.appendChild(editorsContainer);
        containerRef.current.appendChild(wrapper);

        // Common extensions with search compartments
        const baseExtensions = [
          lineNumbers(),
          json(),
          syntaxHighlighting(jsonTheme),
          customEditorTheme,
          EditorState.readOnly.of(true),
          EditorView.editable.of(false),
        ];

        const previewExtensions = [
          ...baseExtensions,
          previewSearchCompartment.current.of([]),
          previewTargetCompartment.current.of([]),
          ...(diffMode ? [createDiffExtension(diffResult.diffLines1)] : []),
        ];

        const publishedExtensions = [
          ...baseExtensions,
          publishedSearchCompartment.current.of([]),
          publishedTargetCompartment.current.of([]),
          ...(diffMode ? [createDiffExtension(diffResult.diffLines2)] : []),
        ];

        // Create editors with separate extensions using aligned text
        const previewView = new EditorView({
          state: EditorState.create({
            doc: diffResult.alignedText1,
            extensions: previewExtensions,
          }),
          parent: previewContainer,
        });

        const publishedView = new EditorView({
          state: EditorState.create({
            doc: diffResult.alignedText2,
            extensions: publishedExtensions,
          }),
          parent: publishedContainer,
        });

        previewViewRef.current = previewView;
        publishedViewRef.current = publishedView;

        // Apply layout fixes
        const fixLayout = () => {
          if (!containerRef.current) return;

          const container = containerRef.current;
          container.style.height = "auto";
          container.style.overflow = "visible";
          container.style.display = "flex";
          container.style.flexDirection = "column";
        };

        fixLayout();
        setTimeout(fixLayout, 100);
        setTimeout(() => {
          fixLayout();
          setLoading(false);
        }, 300);

        return () => {
          if (previewViewRef.current) {
            previewViewRef.current.destroy();
            previewViewRef.current = null;
          }
          if (publishedViewRef.current) {
            publishedViewRef.current.destroy();
            publishedViewRef.current = null;
          }
        };
      } catch (error) {
        setLoading(false);
      }
    }, [previewJson, publishedJson, isDark, diffMode]);

    // Expose search methods via ref using the proper article approach
    useImperativeHandle(
      ref,
      () => ({
        searchInPreview: (query: string) => {
          console.log("🔍 DiffViewer Search in Preview:", {
            query,
            hasView: !!previewViewRef.current,
          });
          if (!previewViewRef.current || !query) {
            // Clear search
            searchState.current.preview = {
              query: "",
              currentTarget: 0,
              total: 0,
            };
            previewViewRef.current?.dispatch({
              effects: [
                previewSearchCompartment.current.reconfigure([]),
                previewTargetCompartment.current.reconfigure([]),
              ],
            });
            return 0;
          }

          const view = previewViewRef.current;

          try {
            // Update search state
            searchState.current.preview.query = query;
            searchState.current.preview.currentTarget = 1;

            // Count total matches first
            const cursor = createSearchCursor(
              view.state.doc,
              query,
              false,
              false,
              0,
              view.state.doc.length
            );
            let total = 0;
            while (!cursor.next().done) {
              total++;
            }
            searchState.current.preview.total = total;

            // Configure search highlighting
            const searchPlugin = createSearchViewPlugin(true, searchState);
            const targetPlugin = createSearchTargetViewPlugin(true, searchState);

            view.dispatch({
              effects: [
                previewSearchCompartment.current.reconfigure(searchPlugin),
                previewTargetCompartment.current.reconfigure(targetPlugin),
              ],
            });

            // Scroll to first match if found using OOTB scrolling
            if (total > 0) {
              const firstCursor = createSearchCursor(
                view.state.doc,
                query,
                false,
                false,
                0,
                view.state.doc.length
              );
              if (!firstCursor.next().done) {
                const match = firstCursor.value;
                view.dispatch({
                  effects: EditorView.scrollIntoView(match.from, {
                    y: "center",
                    x: "nearest",
                  }),
                  selection: { anchor: match.from, head: match.to },
                });
              }
            }

            console.log("🔍 DiffViewer Found matches:", total);
            return total;
          } catch (error) {
            console.error("❌ DiffViewer Search failed:", error);
            return 0;
          }
        },

        searchInPublished: (query: string) => {
          console.log("🔍 DiffViewer Search in Published:", {
            query,
            hasView: !!publishedViewRef.current,
          });
          if (!publishedViewRef.current || !query) {
            // Clear search
            searchState.current.published = {
              query: "",
              currentTarget: 0,
              total: 0,
            };
            publishedViewRef.current?.dispatch({
              effects: [
                publishedSearchCompartment.current.reconfigure([]),
                publishedTargetCompartment.current.reconfigure([]),
              ],
            });
            return 0;
          }

          const view = publishedViewRef.current;

          try {
            // Update search state
            searchState.current.published.query = query;
            searchState.current.published.currentTarget = 1;

            // Count total matches first
            const cursor = createSearchCursor(
              view.state.doc,
              query,
              false,
              false,
              0,
              view.state.doc.length
            );
            let total = 0;
            while (!cursor.next().done) {
              total++;
            }
            searchState.current.published.total = total;

            // Configure search highlighting
            const searchPlugin = createSearchViewPlugin(false, searchState);
            const targetPlugin = createSearchTargetViewPlugin(false, searchState);

            view.dispatch({
              effects: [
                publishedSearchCompartment.current.reconfigure(searchPlugin),
                publishedTargetCompartment.current.reconfigure(targetPlugin),
              ],
            });

            // Scroll to first match if found using OOTB scrolling
            if (total > 0) {
              const firstCursor = createSearchCursor(
                view.state.doc,
                query,
                false,
                false,
                0,
                view.state.doc.length
              );
              if (!firstCursor.next().done) {
                const match = firstCursor.value;
                view.dispatch({
                  effects: EditorView.scrollIntoView(match.from, {
                    y: "center",
                    x: "nearest",
                  }),
                  selection: { anchor: match.from, head: match.to },
                });
              }
            }

            console.log("🔍 DiffViewer Found matches:", total);
            return total;
          } catch (error) {
            console.error("❌ DiffViewer Search failed:", error);
            return 0;
          }
        },

        findNextMatch: (editor: "preview" | "published") => {
          const view =
            editor === "preview"
              ? previewViewRef.current
              : publishedViewRef.current;
          const searchKey = editor;
          console.log(`➡️ DiffViewer Find next in ${editor}`);
          if (!view) return false;

          try {
            const { query, currentTarget, total } =
              searchState.current[searchKey];
            if (!query || total === 0) return false;

            const nextTarget = currentTarget >= total ? 1 : currentTarget + 1;
            searchState.current[searchKey].currentTarget = nextTarget;

            // Find the target match
            const cursor = createSearchCursor(
              view.state.doc,
              query,
              false,
              false,
              0,
              view.state.doc.length
            );
            let index = 0;
            while (!cursor.next().done) {
              index++;
              if (index === nextTarget) {
                const match = cursor.value;
                view.dispatch({
                  effects: EditorView.scrollIntoView(match.from, {
                    y: "center",
                    x: "nearest",
                  }),
                  selection: { anchor: match.from, head: match.to },
                });

                // Update target highlighting
                const targetPlugin = createSearchTargetViewPlugin(
                  editor === "preview", searchState
                );
                const compartment =
                  editor === "preview"
                    ? previewTargetCompartment
                    : publishedTargetCompartment;
                view.dispatch({
                  effects: compartment.current.reconfigure(targetPlugin),
                });
                break;
              }
            }

            return true;
          } catch (error) {
            console.error("❌ DiffViewer Next failed:", error);
            return false;
          }
        },

        findPreviousMatch: (editor: "preview" | "published") => {
          const view =
            editor === "preview"
              ? previewViewRef.current
              : publishedViewRef.current;
          const searchKey = editor;
          console.log(`⬅️ DiffViewer Find previous in ${editor}`);
          if (!view) return false;

          try {
            const { query, currentTarget, total } =
              searchState.current[searchKey];
            if (!query || total === 0) return false;

            const prevTarget = currentTarget <= 1 ? total : currentTarget - 1;
            searchState.current[searchKey].currentTarget = prevTarget;

            // Find the target match
            const cursor = createSearchCursor(
              view.state.doc,
              query,
              false,
              false,
              0,
              view.state.doc.length
            );
            let index = 0;
            while (!cursor.next().done) {
              index++;
              if (index === prevTarget) {
                const match = cursor.value;
                view.dispatch({
                  effects: EditorView.scrollIntoView(match.from, {
                    y: "center",
                    x: "nearest",
                  }),
                  selection: { anchor: match.from, head: match.to },
                });

                // Update target highlighting
                const targetPlugin = createSearchTargetViewPlugin(
                  editor === "preview", searchState
                );
                const compartment =
                  editor === "preview"
                    ? previewTargetCompartment
                    : publishedTargetCompartment;
                view.dispatch({
                  effects: compartment.current.reconfigure(targetPlugin),
                });
                break;
              }
            }

            return true;
          } catch (error) {
            console.error("❌ DiffViewer Previous failed:", error);
            return false;
          }
        },

        clearSearch: () => {
          console.log("🧹 DiffViewer Clearing search");
          try {
            // Clear search state
            searchState.current.preview = {
              query: "",
              currentTarget: 0,
              total: 0,
            };
            searchState.current.published = {
              query: "",
              currentTarget: 0,
              total: 0,
            };

            // Clear decorations
            if (previewViewRef.current) {
              previewViewRef.current.dispatch({
                effects: [
                  previewSearchCompartment.current.reconfigure([]),
                  previewTargetCompartment.current.reconfigure([]),
                ],
              });
            }
            if (publishedViewRef.current) {
              publishedViewRef.current.dispatch({
                effects: [
                  publishedSearchCompartment.current.reconfigure([]),
                  publishedTargetCompartment.current.reconfigure([]),
                ],
              });
            }
          } catch (error) {
            console.error("❌ DiffViewer Clear failed:", error);
          }
        },

        getSearchMatches: (editor: "preview" | "published") => {
          const searchKey = editor;
          return searchState.current[searchKey].total;
        },

        scrollToMatch: (
          _editor: "preview" | "published",
          _matchIndex: number
        ) => {
          // Implementation for scrolling to specific match
          return;
        },

        getCurrentMatchIndex: (editor: "preview" | "published") => {
          const searchKey = editor;
          return searchState.current[searchKey].currentTarget;
        },
      }),
      []
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
