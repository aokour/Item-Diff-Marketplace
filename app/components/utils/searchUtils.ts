import { EditorState, RangeSetBuilder } from "@codemirror/state";
import { EditorView, ViewPlugin, Decoration } from "@codemirror/view";
import { SearchCursor, RegExpCursor } from "@codemirror/search";
import {
  searchDecoration,
  searchTargetDecoration,
} from "../styles/DiffViewer.styles";
import { SearchState } from "../types/DiffViewer.types";

// Search cursor factory function from the article
export const createSearchCursor = (
  text: any,
  query: string,
  regexp: boolean,
  caseSensitive: boolean,
  from: number,
  to: number
) => {
  if (regexp) {
    const options = { ignoreCase: !caseSensitive };
    return new RegExpCursor(text, query, options, from, to);
  } else {
    const filter = caseSensitive ? undefined : (x: string) => x.toLowerCase();
    return new SearchCursor(text, query, from, to, filter);
  }
};

// Create search highlighting ViewPlugin based on the article
export const createSearchViewPlugin = (
  isPreview: boolean,
  searchState: React.MutableRefObject<SearchState>
) => {
  return ViewPlugin.define(
    (view) => {
      const plugin = {
        decorations: Decoration.none,
        update({ view, state }: { view: EditorView; state: EditorState }) {
          const searchKey = isPreview ? "preview" : "published";
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
        },
      };

      return plugin;
    },
    { decorations: (plugin) => plugin.decorations }
  );
};

// Create search target ViewPlugin for current match highlighting
export const createSearchTargetViewPlugin = (
  isPreview: boolean,
  searchState: React.MutableRefObject<SearchState>
) => {
  return ViewPlugin.define(
    (view) => {
      const plugin = {
        decorations: Decoration.none,
        update({ state }: { state: EditorState }) {
          const searchKey = isPreview ? "preview" : "published";
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
        },
      };

      return plugin;
    },
    { decorations: (plugin) => plugin.decorations }
  );
};
