export interface JsonViewerProps {
  previewJson: string | any;
  publishedJson: string | any;
  height?: string;
  diffMode?: boolean;
}

export interface DiffViewerHandle {
  searchInPreview: (query: string) => number;
  searchInPublished: (query: string) => number;
  findNextMatch: (editor: "preview" | "published") => boolean;
  findPreviousMatch: (editor: "preview" | "published") => boolean;
  clearSearch: () => void;
  getSearchMatches: (editor: "preview" | "published") => number;
  scrollToMatch: (editor: "preview" | "published", matchIndex: number) => void;
  getCurrentMatchIndex: (editor: "preview" | "published") => number;
}

export interface DiffResult {
  alignedText1: string;
  alignedText2: string;
  diffLines1: Set<number>;
  diffLines2: Set<number>;
}

export interface SearchState {
  preview: { query: string; currentTarget: number; total: number };
  published: { query: string; currentTarget: number; total: number };
}