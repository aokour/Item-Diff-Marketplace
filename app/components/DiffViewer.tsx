'use client';

import { useEffect, useRef, useState } from "react";
import { EditorState } from "@codemirror/state";
import { EditorView, lineNumbers } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { syntaxHighlighting, HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";
import { Box, useColorModeValue } from "@chakra-ui/react";

interface JsonViewerProps {
  previewJson: string | any;
  publishedJson: string | any;
  height?: string;
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

// Custom theme for side-by-side editors
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
});

export function DiffViewer({ previewJson, publishedJson, height = "600px" }: JsonViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const previewViewRef = useRef<EditorView | null>(null);
  const publishedViewRef = useRef<EditorView | null>(null);
  const [loading, setLoading] = useState(true);
  const isDark = useColorModeValue(false, true);

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

    // Common extensions
    const commonExtensions = [
      lineNumbers(),
      json(),
      syntaxHighlighting(jsonTheme),
      customEditorTheme,
      EditorState.readOnly.of(true),
      EditorView.editable.of(false),
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
      previewHeader.textContent = '🔵 Preview Version';
      
      const publishedHeader = document.createElement('div');
      publishedHeader.className = 'json-viewer-header';
      publishedHeader.textContent = '🟢 Published Version';
      
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

      // Create editors
      const previewView = new EditorView({
        state: EditorState.create({
          doc: formattedPreview,
          extensions: commonExtensions,
        }),
        parent: previewContainer,
      });

      const publishedView = new EditorView({
        state: EditorState.create({
          doc: formattedPublished,
          extensions: commonExtensions,
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
}