import { ViewPlugin, Decoration, DecorationSet, EditorView } from "@codemirror/view";
import { RangeSetBuilder, StateField, StateEffect, Extension } from "@codemirror/state";
import { SearchCursor } from "@codemirror/search";
import { diffLineAddedDecoration, diffLineRemovedDecoration } from "../styles/DiffViewer.styles";

// Create diff extension
export const createDiffExtension = (diffLines: Set<number>, side: 'left' | 'right' = 'left'): Extension => {
  return ViewPlugin.define(
    (view) => {
      try {
        const decorationBuilder = new RangeSetBuilder<Decoration>();
        
        // Choose decoration based on side
        const decoration = side === 'left' ? diffLineRemovedDecoration : diffLineAddedDecoration;

        // Sort line numbers to ensure proper order for RangeSetBuilder
        const sortedLines = Array.from(diffLines).sort((a, b) => a - b);

        for (const lineNumber of sortedLines) {
          if (lineNumber >= 0 && lineNumber < view.state.doc.lines) {
            const line = view.state.doc.line(lineNumber + 1); // doc.line is 1-indexed
            decorationBuilder.add(line.from, line.from, decoration);
          }
        }

        return {
          decorations: decorationBuilder.finish(),
        };
      } catch (error) {
        console.error(`Error creating diff decorations:`, error);
        return { decorations: new RangeSetBuilder<Decoration>().finish() };
      }
    },
    { decorations: (plugin) => plugin.decorations }
  );
};

// Search functionality using native CodeMirror SearchCursor
export interface SearchResult {
  from: number;
  to: number;
}

export interface SearchHighlightData {
  results: SearchResult[];
  currentIndex: number;
}

// Create search highlight effect
export const addSearchHighlight = StateEffect.define<SearchHighlightData>();
export const clearSearchHighlight = StateEffect.define();

// Search highlight decoration
const searchHighlightDecoration = Decoration.mark({
  class: "cm-search-highlight"
});

const searchTargetDecoration = Decoration.mark({
  class: "cm-search-highlight-target"
});

// Search state field for managing highlights
export const searchHighlightField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(decorations, transaction) {
    // Apply position mapping for document changes
    decorations = decorations.map(transaction.changes);
    
    for (let effect of transaction.effects) {
      if (effect.is(addSearchHighlight)) {
        const builder = new RangeSetBuilder<Decoration>();
        const { results, currentIndex } = effect.value;
        results.forEach((result, index) => {
          const decoration = index === currentIndex ? searchTargetDecoration : searchHighlightDecoration;
          builder.add(result.from, result.to, decoration);
        });
        decorations = builder.finish();
      } else if (effect.is(clearSearchHighlight)) {
        decorations = Decoration.none;
      }
    }
    return decorations;
  },
  provide: field => EditorView.decorations.from(field)
});

// Search function that returns all matches
export const searchInEditor = (view: EditorView, query: string): SearchResult[] => {
  if (!query.trim()) return [];
  
  const results: SearchResult[] = [];
  // Create case-insensitive search cursor
  const cursor = new SearchCursor(view.state.doc, query, 0, view.state.doc.length, x => x.toLowerCase());
  
  while (!cursor.next().done) {
    results.push({
      from: cursor.value.from,
      to: cursor.value.to
    });
  }
  
  return results;
};

// Navigate to specific search result
export const navigateToSearchResult = (view: EditorView, results: SearchResult[], index: number) => {
  if (index < 0 || index >= results.length) return false;
  
  const result = results[index];
  
  // Highlight all results with correct current index and scroll to target
  view.dispatch({
    selection: { anchor: result.from, head: result.to },
    effects: [addSearchHighlight.of({ results, currentIndex: index })],
    scrollIntoView: true
  });
  
  return true;
};

// Clear all search highlights
export const clearSearch = (view: EditorView) => {
  view.dispatch({
    effects: [clearSearchHighlight.of(null)]
  });
};

// Format JSON data with simple normalization (no sorting)
export const formatJson = (jsonData: any): string => {
  try {
    let parsed: any;

    if (typeof jsonData === "string") {
      // First normalize the string by removing extra whitespace and newlines
      const normalized = jsonData
        .replace(/\r\n/g, "\n") // Normalize line endings
        .replace(/\r/g, "\n") // Handle old Mac line endings
        .trim(); // Remove leading/trailing whitespace

      parsed = JSON.parse(normalized);
    } else if (typeof jsonData === "object" && jsonData !== null) {
      parsed = jsonData;
    } else {
      return String(jsonData || "");
    }

    // Use consistent formatting - preserve original key order
    let result = JSON.stringify(parsed, null, 2);

    // Ensure consistent line endings
    result = result.replace(/\r\n/g, "\n").replace(/\r/g, "\n");

    // Remove any trailing whitespace from lines
    result = result
      .split("\n")
      .map((line) => line.trimEnd())
      .join("\n");

    // Ensure file ends with single newline
    result = result.replace(/\n*$/, "\n");

    return result;
  } catch (error) {
    console.error("formatJson error:", error);
    return String(jsonData || "");
  }
};
