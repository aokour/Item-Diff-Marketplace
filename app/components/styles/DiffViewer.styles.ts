import { EditorView, Decoration } from "@codemirror/view";
import { HighlightStyle } from "@codemirror/language";
import { tags } from "@lezer/highlight";

// Define custom syntax highlighting theme
export const jsonTheme = HighlightStyle.define([
  { tag: tags.content, color: "#adbac7" },
  { tag: tags.punctuation, color: "#adbac7" },
  { tag: [tags.propertyName, tags.attributeName], color: "#f69d50" },
  { tag: [tags.keyword, tags.operator], color: "#f47067" },
  { tag: [tags.string], color: "#96d0ff" },
  { tag: [tags.number, tags.bool, tags.null], color: "#6cb6ff" },
  { tag: tags.comment, color: "#768390" },
]);

// Search decorations and theme
export const searchDecoration = Decoration.mark({ class: "cm-search-highlight" });
export const searchTargetDecoration = Decoration.mark({
  class: "cm-search-highlight-target",
});

// Simple diff decorations
export const diffLineDecoration = Decoration.line({ class: "cm-diff-line" });

// Custom theme for side-by-side editors with search highlighting
export const customEditorTheme = EditorView.theme({
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