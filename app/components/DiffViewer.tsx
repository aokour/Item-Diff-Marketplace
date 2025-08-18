'use client';

import { useEffect, useRef, useState, useImperativeHandle, forwardRef } from "react";
import { EditorState, Compartment, RangeSetBuilder } from "@codemirror/state";
import { EditorView, lineNumbers, ViewPlugin, Decoration } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Box, useColorModeValue } from "@chakra-ui/react";
import { SearchCursor, RegExpCursor } from "@codemirror/search";
import * as Diff from "diff";

interface JsonViewerProps {
  previewJson: string | any;
  publishedJson: string | any;
  height?: string;
}

export interface DiffViewerHandle {
  searchInPreview: (query: string) => number;
  searchInPublished: (query: string) => number;
  findNextMatch: (editor: 'preview' | 'published') => boolean;
  findPreviousMatch: (editor: 'preview' | 'published') => boolean;
  clearSearch: () => void;
  getSearchMatches: (editor: 'preview' | 'published') => number;
  scrollToMatch: (editor: 'preview' | 'published', matchIndex: number) => void;
  getCurrentMatchIndex: (editor: 'preview' | 'published') => number;
}

// Define custom syntax highlighting theme
const jsonTheme = HighlightStyle.define([
  { tag: tags.content, color: "#adbac7" },
  { tag: tags.punctuation, color: "#adbac7" },
  { tag: [tags.propertyName, tags.attributeName], color: "#f69d50" },
  { tag: [tags.keyword, tags.operator], color: "#f47067" },
  { tag: [tags.string], color: "#96d0ff" },
  { tag: [tags.number, tags.bool, tags.null], color: "#6cb6ff" },
  { tag: tags.comment, color: "#768390" },
]);

// Search decorations and theme
const searchDecoration = Decoration.mark({ class: 'cm-search-highlight' });
const searchTargetDecoration = Decoration.mark({ class: 'cm-search-highlight-target' });

// Simple diff decorations
const diffLineDecoration = Decoration.line({ class: 'cm-diff-line' });

// Custom theme for side-by-side editors with search highlighting
const customEditorTheme = EditorView.theme({
  "&": {
    backgroundColor: "#22272e",
    color: "#adbac7",
    fontSize: "12px",
    fontFamily: 'Monaco, Menlo, "Ubuntu Mono", Consolas, monospace',
    lineHeight: "1.5",
  },
  ".cm-content": {
    caretColor: "#539bf5",
    padding: "10px",
  },
  ".cm-gutters": {
    backgroundColor: "#22272e",
    color: "#636e7b",
    border: "none",
    borderRight: "1px solid rgba(120, 131, 146, 0.4)",
  },
  ".cm-lineNumbers .cm-gutterElement": {
    padding: "0 16px 0 8px",
  },
  // Custom search highlighting based on article approach
  ".cm-search-highlight": {
    backgroundColor: "rgba(255, 255, 0, 0.3) !important",
    outline: "2px solid rgba(255, 255, 0, 0.4) !important",
    borderRadius: "2px !important",
  },
  ".cm-search-highlight-target": {
    backgroundColor: "rgba(255, 165, 0, 0.5) !important",
    outline: "2px solid rgba(255, 165, 0, 0.8) !important",
    borderRadius: "2px !important",
    fontWeight: "bold !important",
  },
});

export const DiffViewer = forwardRef<DiffViewerHandle, JsonViewerProps>(({ previewJson, publishedJson, height = "600px" }, ref) => {
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
  
  const searchState = useRef<{
    preview: { query: string; currentTarget: number; total: number };
    published: { query: string; currentTarget: number; total: number };
  }>({
    preview: { query: '', currentTarget: 0, total: 0 },
    published: { query: '', currentTarget: 0, total: 0 }
  });

  // Search cursor factory function from the article
  const createSearchCursor = (text: any, query: string, regexp: boolean, caseSensitive: boolean, from: number, to: number) => {
    if (regexp) {
      const options = { ignoreCase: !caseSensitive };
      return new RegExpCursor(text, query, options, from, to);
    } else {
      const filter = caseSensitive ? undefined : (x: string) => x.toLowerCase();
      return new SearchCursor(text, query, from, to, filter);
    }
  };

  // Create search highlighting ViewPlugin based on the article
  const createSearchViewPlugin = (isPreview: boolean) => {
    return ViewPlugin.define(
      (view) => {
        const plugin = {
          decorations: Decoration.none,
          update({view, state}: {view: EditorView, state: EditorState}) {
            const searchKey = isPreview ? 'preview' : 'published';
            const query = searchState.current[searchKey].query;
            
            if (!query) {
              plugin.decorations = Decoration.none;
              return;
            }

            const decorationBuilder = new RangeSetBuilder<Decoration>();
            const limit = 1000;

            // Search in visible ranges for performance
            for (const range of view.visibleRanges) {
              const cursor = createSearchCursor(
                state.doc,
                query,
                false, // regexp
                false, // caseSensitive
                range.from,
                range.to
              );

              let index = 0;
              while (!cursor.next().done && index < limit) {
                decorationBuilder.add(
                  cursor.value.from,
                  cursor.value.to,
                  searchDecoration
                );
                index++;
              }
            }

            plugin.decorations = decorationBuilder.finish();
          }
        };

        return plugin;
      },
      { decorations: (plugin) => plugin.decorations }
    );
  };

  // Create search target ViewPlugin for current match highlighting
  const createSearchTargetViewPlugin = (isPreview: boolean) => {
    return ViewPlugin.define(
      (view) => {
        const plugin = {
          decorations: Decoration.none,
          update({state}: {state: EditorState}) {
            const searchKey = isPreview ? 'preview' : 'published';
            const { query, currentTarget } = searchState.current[searchKey];
            
            if (!query || currentTarget === 0) {
              plugin.decorations = Decoration.none;
              return;
            }

            const decorationBuilder = new RangeSetBuilder<Decoration>();
            const cursor = createSearchCursor(
              state.doc,
              query,
              false, // regexp
              false, // caseSensitive
              0,
              state.doc.length
            );

            let index = 0;
            let total = 0;
            while (!cursor.next().done) {
              total++;
              if (total === currentTarget) {
                decorationBuilder.add(
                  cursor.value.from,
                  cursor.value.to,
                  searchTargetDecoration
                );
              }
              index++;
            }

            searchState.current[searchKey].total = total;
            plugin.decorations = decorationBuilder.finish();
          }
        };

        return plugin;
      },
      { decorations: (plugin) => plugin.decorations }
    );
  };

  // Simple function to compute different lines
  const computeDiffLines = (text1: string, text2: string): Set<number> => {
    const lines1 = text1.split('\n');
    const lines2 = text2.split('\n');
    const diffLines = new Set<number>();
    
    const maxLines = Math.max(lines1.length, lines2.length);
    
    for (let i = 0; i < maxLines; i++) {
      const line1 = lines1[i] || '';
      const line2 = lines2[i] || '';
      
      if (line1 !== line2) {
        diffLines.add(i);
      }
    }
    
    return diffLines;
  };

  // Create simple diff extension
  const createDiffExtension = (diffLines: Set<number>) => {
    return ViewPlugin.define(
      (view) => {
        const decorationBuilder = new RangeSetBuilder<Decoration>();
        
        for (const lineNumber of diffLines) {
          if (lineNumber < view.state.doc.lines) {
            const line = view.state.doc.line(lineNumber + 1); // doc.line is 1-indexed
            decorationBuilder.add(line.from, line.from, diffLineDecoration);
          }
        }
        
        return {
          decorations: decorationBuilder.finish()
        };
      },
      { decorations: (plugin) => plugin.decorations }
    );
  };

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

    // Format JSON data
    const formatJson = (jsonData: any): string => {
      try {
        if (typeof jsonData === 'string') {
          const parsed = JSON.parse(jsonData);
          return JSON.stringify(parsed, null, 2);
        }
        if (typeof jsonData === 'object' && jsonData !== null) {
          return JSON.stringify(jsonData, null, 2);
        }
        return String(jsonData || '');
      } catch (error) {
        return String(jsonData || '');
      }
    };

    const formattedPreview = formatJson(previewJson);
    const formattedPublished = formatJson(publishedJson);

    if (!formattedPreview || !formattedPublished) {
      setLoading(false);
      return;
    }

    // Compute different lines
    const diffLines = computeDiffLines(formattedPreview, formattedPublished);
    console.log('🔍 Different lines:', Array.from(diffLines).sort((a, b) => a - b));

    // Common extensions with search compartments
    const previewExtensions = [
      lineNumbers(),
      json(),
      syntaxHighlighting(jsonTheme),
      customEditorTheme,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      previewSearchCompartment.current.of([]),
      previewTargetCompartment.current.of([]),
      createDiffExtension(diffLines),
    ];
    
    const publishedExtensions = [
      lineNumbers(),
      json(),
      syntaxHighlighting(jsonTheme),
      customEditorTheme,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
      publishedSearchCompartment.current.of([]),
      publishedTargetCompartment.current.of([]),
      createDiffExtension(diffLines),
    ];

    try {
      // Add global CSS for proper scrolling behavior
      const styleId = "json-viewer-custom-styles";
      if (!document.getElementById(styleId)) {
        const styleEl = document.createElement("style");
        styleEl.id = styleId;
        styleEl.textContent = `
          /* Custom scrollbar styles */
          .json-viewer-container::-webkit-scrollbar,
          .json-viewer-editor::-webkit-scrollbar,
          .cm-scroller::-webkit-scrollbar {
            width: 12px !important;
            height: 12px !important;
          }
          
          .json-viewer-container::-webkit-scrollbar-track,
          .json-viewer-editor::-webkit-scrollbar-track,
          .cm-scroller::-webkit-scrollbar-track {
            background: #1a202c !important;
            border-radius: 6px !important;
          }
          
          .json-viewer-container::-webkit-scrollbar-thumb,
          .json-viewer-editor::-webkit-scrollbar-thumb,
          .cm-scroller::-webkit-scrollbar-thumb {
            background: #4a5568 !important;
            border-radius: 6px !important;
            border: 2px solid #1a202c !important;
          }
          
          .json-viewer-container::-webkit-scrollbar-thumb:hover,
          .json-viewer-editor::-webkit-scrollbar-thumb:hover,
          .cm-scroller::-webkit-scrollbar-thumb:hover {
            background: #718096 !important;
          }
          
          .json-viewer-container::-webkit-scrollbar-corner,
          .json-viewer-editor::-webkit-scrollbar-corner,
          .cm-scroller::-webkit-scrollbar-corner {
            background: #1a202c !important;
          }
          
          /* Base container styles */
          .json-viewer-container {
            height: 100% !important;
            max-height: 600px !important;
            overflow: auto !important;
            position: relative !important;
          }
          
          .json-viewer-wrapper {
            height: 100% !important;
            display: flex !important;
            flex-direction: column !important;
          }
          
          /* Headers */
          .json-viewer-headers {
            display: flex !important;
            width: 100% !important;
            position: sticky !important;
            top: 0 !important;
            z-index: 100 !important;
            background: #22272e !important;
            border-bottom: 1px solid rgba(120, 131, 146, 0.4) !important;
            flex-shrink: 0 !important;
          }
          
          .json-viewer-header {
            flex: 1 1 50% !important;
            width: 50% !important;
            max-width: 50% !important;
            padding: 12px 16px !important;
            font-size: 14px !important;
            font-weight: 600 !important;
            color: #adbac7 !important;
            background: #22272e !important;
            border-right: 1px solid rgba(120, 131, 146, 0.4) !important;
          }
          
          .json-viewer-header:last-child {
            border-right: none !important;
          }
          
          /* Side-by-side layout */
          .json-viewer-editors {
            display: flex !important;
            width: 100% !important;
            flex: 1 !important;
            min-height: 0 !important;
            box-sizing: border-box !important;
          }
          
          .json-viewer-editor {
            flex: 1 1 50% !important;
            width: 50% !important;
            max-width: 50% !important;
            box-sizing: border-box !important;
            overflow-x: auto !important;
            overflow-y: hidden !important;
          }
          
          /* Editor elements */
          .json-viewer-editor .cm-editor {
            height: 100% !important;
            width: 100% !important;
            overflow: hidden !important;
            font-family: Monaco, Menlo, "Ubuntu Mono", Consolas, monospace !important;
            font-size: 12px !important;
          }
          
          .json-viewer-editor .cm-scroller {
            overflow-x: auto !important;
            overflow-y: hidden !important;
            height: 100% !important;
            scrollbar-width: thin !important;
            scrollbar-color: #4a5568 #1a202c !important;
          }
          
          .json-viewer-editor .cm-content {
            width: max-content !important;
            min-width: 100% !important;
            height: auto !important;
            padding: 0 10px !important;
          }
          
          .json-viewer-editor .cm-line {
            white-space: pre !important;
            word-wrap: normal !important;
            overflow-wrap: normal !important;
          }
          
          .json-viewer-editor .cm-gutters {
            position: sticky !important;
            left: 0 !important;
            height: auto !important;
            border-right: 1px solid rgba(120, 131, 146, 0.4) !important;
            background-color: #22272e !important;
            color: #636e7b !important;
            z-index: 10 !important;
          }
          
          /* Simple diff highlighting */
          .cm-diff-line {
            background-color: rgba(46, 160, 67, 0.15) !important;
            border-left: 3px solid #2ea043 !important;
          }

          /* Enhanced Search match highlighting */
          .cm-searchMatch {
            background-color: #FFEB3B !important;
            border: 2px solid #FFC107 !important;
            border-radius: 3px !important;
            color: #000000 !important;
            font-weight: bold !important;
            text-shadow: none !important;
            box-shadow: 0 0 0 2px rgba(255, 193, 7, 0.3) !important;
            outline: none !important;
            position: relative !important;
            z-index: 100 !important;
          }
          
          .cm-searchMatch.cm-searchMatch-selected {
            background-color: #FF5722 !important;
            border: 3px solid #D84315 !important;
            border-radius: 3px !important;
            color: white !important;
            font-weight: bold !important;
            text-shadow: 0 1px 2px rgba(0,0,0,0.5) !important;
            box-shadow: 0 0 0 3px rgba(255, 87, 34, 0.4) !important;
            outline: none !important;
            position: relative !important;
            z-index: 101 !important;
          }
          
          /* Additional search match highlighting */
          .json-viewer-editor .cm-searchMatch {
            background-color: #FFEB3B !important;
            border: 2px solid #FFC107 !important;
            border-radius: 3px !important;
            color: #000000 !important;
            font-weight: bold !important;
            position: relative !important;
            z-index: 100 !important;
          }
          
          .json-viewer-editor .cm-searchMatch.cm-searchMatch-selected {
            background-color: #FF5722 !important;
            border: 3px solid #D84315 !important;
            color: white !important;
            position: relative !important;
            z-index: 101 !important;
          }
        `;
        document.head.appendChild(styleEl);
      }

      // Create container structure with wrapper
      const wrapper = document.createElement('div');
      wrapper.className = 'json-viewer-wrapper';
      
      const headersContainer = document.createElement('div');
      headersContainer.className = 'json-viewer-headers';
      
      const previewHeader = document.createElement('div');
      previewHeader.className = 'json-viewer-header';
      previewHeader.innerHTML = '<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle; filter: grayscale(100%) brightness(1.2);" /> Preview Version';
      
      const publishedHeader = document.createElement('div');
      publishedHeader.className = 'json-viewer-header';
      publishedHeader.innerHTML = '<img src="https://delivery-sitecore.sitecorecontenthub.cloud/api/public/content/mark-xm_cloud" style="width: 16px; height: 16px; display: inline-block; margin-right: 8px; vertical-align: middle;" /> Published Version';
      
      headersContainer.appendChild(previewHeader);
      headersContainer.appendChild(publishedHeader);
      
      const editorsContainer = document.createElement('div');
      editorsContainer.className = 'json-viewer-editors';
      
      const previewContainer = document.createElement('div');
      previewContainer.className = 'json-viewer-editor';
      previewContainer.style.borderRight = '1px solid rgba(120, 131, 146, 0.4)';
      
      const publishedContainer = document.createElement('div');
      publishedContainer.className = 'json-viewer-editor';
      
      editorsContainer.appendChild(previewContainer);
      editorsContainer.appendChild(publishedContainer);
      
      wrapper.appendChild(headersContainer);
      wrapper.appendChild(editorsContainer);
      containerRef.current.appendChild(wrapper);

      // Create editors with separate extensions
      const previewView = new EditorView({
        state: EditorState.create({
          doc: formattedPreview,
          extensions: previewExtensions,
        }),
        parent: previewContainer,
      });

      const publishedView = new EditorView({
        state: EditorState.create({
          doc: formattedPublished,
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
  }, [previewJson, publishedJson, isDark]);


  // Expose search methods via ref using the proper article approach
  useImperativeHandle(ref, () => ({
    searchInPreview: (query: string) => {
      console.log('🔍 DiffViewer Search in Preview:', { query, hasView: !!previewViewRef.current });
      if (!previewViewRef.current || !query) {
        // Clear search
        searchState.current.preview = { query: '', currentTarget: 0, total: 0 };
        previewViewRef.current?.dispatch({
          effects: [
            previewSearchCompartment.current.reconfigure([]),
            previewTargetCompartment.current.reconfigure([])
          ]
        });
        return 0;
      }
      
      const view = previewViewRef.current;
      
      try {
        // Update search state
        searchState.current.preview.query = query;
        searchState.current.preview.currentTarget = 1;
        
        // Count total matches first
        const cursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
        let total = 0;
        while (!cursor.next().done) {
          total++;
        }
        searchState.current.preview.total = total;
        
        // Configure search highlighting
        const searchPlugin = createSearchViewPlugin(true);
        const targetPlugin = createSearchTargetViewPlugin(true);
        
        view.dispatch({
          effects: [
            previewSearchCompartment.current.reconfigure(searchPlugin),
            previewTargetCompartment.current.reconfigure(targetPlugin)
          ]
        });
        
        // Scroll to first match if found using OOTB scrolling
        if (total > 0) {
          const firstCursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
          if (!firstCursor.next().done) {
            const match = firstCursor.value;
            view.dispatch({
              effects: EditorView.scrollIntoView(match.from, {
                y: 'center',
                x: 'nearest'
              }),
              selection: { anchor: match.from, head: match.to }
            });
          }
        }
        
        console.log('🔍 DiffViewer Found matches:', total);
        return total;
      } catch (error) {
        console.error('❌ DiffViewer Search failed:', error);
        return 0;
      }
    },
    
    searchInPublished: (query: string) => {
      console.log('🔍 DiffViewer Search in Published:', { query, hasView: !!publishedViewRef.current });
      if (!publishedViewRef.current || !query) {
        // Clear search
        searchState.current.published = { query: '', currentTarget: 0, total: 0 };
        publishedViewRef.current?.dispatch({
          effects: [
            publishedSearchCompartment.current.reconfigure([]),
            publishedTargetCompartment.current.reconfigure([])
          ]
        });
        return 0;
      }
      
      const view = publishedViewRef.current;
      
      try {
        // Update search state
        searchState.current.published.query = query;
        searchState.current.published.currentTarget = 1;
        
        // Count total matches first
        const cursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
        let total = 0;
        while (!cursor.next().done) {
          total++;
        }
        searchState.current.published.total = total;
        
        // Configure search highlighting
        const searchPlugin = createSearchViewPlugin(false);
        const targetPlugin = createSearchTargetViewPlugin(false);
        
        view.dispatch({
          effects: [
            publishedSearchCompartment.current.reconfigure(searchPlugin),
            publishedTargetCompartment.current.reconfigure(targetPlugin)
          ]
        });
        
        // Scroll to first match if found using OOTB scrolling
        if (total > 0) {
          const firstCursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
          if (!firstCursor.next().done) {
            const match = firstCursor.value;
            view.dispatch({
              effects: EditorView.scrollIntoView(match.from, {
                y: 'center',
                x: 'nearest'
              }),
              selection: { anchor: match.from, head: match.to }
            });
          }
        }
        
        console.log('🔍 DiffViewer Found matches:', total);
        return total;
      } catch (error) {
        console.error('❌ DiffViewer Search failed:', error);
        return 0;
      }
    },
    
    findNextMatch: (editor: 'preview' | 'published') => {
      const view = editor === 'preview' ? previewViewRef.current : publishedViewRef.current;
      const searchKey = editor;
      console.log(`➡️ DiffViewer Find next in ${editor}`);
      if (!view) return false;
      
      try {
        const { query, currentTarget, total } = searchState.current[searchKey];
        if (!query || total === 0) return false;
        
        const nextTarget = currentTarget >= total ? 1 : currentTarget + 1;
        searchState.current[searchKey].currentTarget = nextTarget;
        
        // Find the target match
        const cursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
        let index = 0;
        while (!cursor.next().done) {
          index++;
          if (index === nextTarget) {
            const match = cursor.value;
            view.dispatch({
              effects: EditorView.scrollIntoView(match.from, {
                y: 'center',
                x: 'nearest'
              }),
              selection: { anchor: match.from, head: match.to }
            });
            
            // Update target highlighting
            const targetPlugin = createSearchTargetViewPlugin(editor === 'preview');
            const compartment = editor === 'preview' ? previewTargetCompartment : publishedTargetCompartment;
            view.dispatch({
              effects: compartment.current.reconfigure(targetPlugin)
            });
            break;
          }
        }
        
        return true;
      } catch (error) {
        console.error('❌ DiffViewer Next failed:', error);
        return false;
      }
    },
    
    findPreviousMatch: (editor: 'preview' | 'published') => {
      const view = editor === 'preview' ? previewViewRef.current : publishedViewRef.current;
      const searchKey = editor;
      console.log(`⬅️ DiffViewer Find previous in ${editor}`);
      if (!view) return false;
      
      try {
        const { query, currentTarget, total } = searchState.current[searchKey];
        if (!query || total === 0) return false;
        
        const prevTarget = currentTarget <= 1 ? total : currentTarget - 1;
        searchState.current[searchKey].currentTarget = prevTarget;
        
        // Find the target match
        const cursor = createSearchCursor(view.state.doc, query, false, false, 0, view.state.doc.length);
        let index = 0;
        while (!cursor.next().done) {
          index++;
          if (index === prevTarget) {
            const match = cursor.value;
            view.dispatch({
              effects: EditorView.scrollIntoView(match.from, {
                y: 'center',
                x: 'nearest'
              }),
              selection: { anchor: match.from, head: match.to }
            });
            
            // Update target highlighting
            const targetPlugin = createSearchTargetViewPlugin(editor === 'preview');
            const compartment = editor === 'preview' ? previewTargetCompartment : publishedTargetCompartment;
            view.dispatch({
              effects: compartment.current.reconfigure(targetPlugin)
            });
            break;
          }
        }
        
        return true;
      } catch (error) {
        console.error('❌ DiffViewer Previous failed:', error);
        return false;
      }
    },
    
    clearSearch: () => {
      console.log('🧹 DiffViewer Clearing search');
      try {
        // Clear search state
        searchState.current.preview = { query: '', currentTarget: 0, total: 0 };
        searchState.current.published = { query: '', currentTarget: 0, total: 0 };
        
        // Clear decorations
        if (previewViewRef.current) {
          previewViewRef.current.dispatch({
            effects: [
              previewSearchCompartment.current.reconfigure([]),
              previewTargetCompartment.current.reconfigure([])
            ]
          });
        }
        if (publishedViewRef.current) {
          publishedViewRef.current.dispatch({
            effects: [
              publishedSearchCompartment.current.reconfigure([]),
              publishedTargetCompartment.current.reconfigure([])
            ]
          });
        }
      } catch (error) {
        console.error('❌ DiffViewer Clear failed:', error);
      }
    },
    
    getSearchMatches: (editor: 'preview' | 'published') => {
      const searchKey = editor;
      return searchState.current[searchKey].total;
    },
    
    scrollToMatch: (editor: 'preview' | 'published', matchIndex: number) => {
      // Implementation for scrolling to specific match
      return;
    },
    
    getCurrentMatchIndex: (editor: 'preview' | 'published') => {
      const searchKey = editor;
      return searchState.current[searchKey].currentTarget;
    },
  }), []);

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
        '&::-webkit-scrollbar': {
          width: '12px',
          height: '12px',
        },
        '&::-webkit-scrollbar-track': {
          background: '#1a202c',
          borderRadius: '6px',
        },
        '&::-webkit-scrollbar-thumb': {
          background: '#4a5568',
          borderRadius: '6px',
          border: '2px solid #1a202c',
        },
        '&::-webkit-scrollbar-thumb:hover': {
          background: '#718096',
        },
        '&::-webkit-scrollbar-corner': {
          background: '#1a202c',
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
});

DiffViewer.displayName = 'DiffViewer';