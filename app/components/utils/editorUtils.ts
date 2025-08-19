import { ViewPlugin, Decoration } from "@codemirror/view";
import { RangeSetBuilder } from "@codemirror/state";
import { diffLineDecoration } from "../styles/DiffViewer.styles";

// Create diff extension
export const createDiffExtension = (diffLines: Set<number>) => {
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
        decorations: decorationBuilder.finish(),
      };
    },
    { decorations: (plugin) => plugin.decorations }
  );
};

// Format JSON data with simple normalization (no sorting)
export const formatJson = (jsonData: any): string => {
  try {
    let parsed: any;
    
    if (typeof jsonData === "string") {
      // First normalize the string by removing extra whitespace and newlines
      const normalized = jsonData
        .replace(/\r\n/g, '\n')  // Normalize line endings
        .replace(/\r/g, '\n')    // Handle old Mac line endings
        .trim();                 // Remove leading/trailing whitespace
      
      parsed = JSON.parse(normalized);
    } else if (typeof jsonData === "object" && jsonData !== null) {
      parsed = jsonData;
    } else {
      return String(jsonData || "");
    }

    // Use consistent formatting - preserve original key order
    let result = JSON.stringify(parsed, null, 2);
    
    // Ensure consistent line endings
    result = result.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
    
    // Remove any trailing whitespace from lines
    result = result.split('\n').map(line => line.trimEnd()).join('\n');
    
    // Ensure file ends with single newline
    result = result.replace(/\n*$/, '\n');

    return result;
  } catch (error) {
    console.error("formatJson error:", error);
    return String(jsonData || "");
  }
};