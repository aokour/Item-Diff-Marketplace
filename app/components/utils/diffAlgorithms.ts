import { DiffResult } from "../types/DiffViewer.types";

// Legacy compatibility functions - no longer used with native CodeMirror MergeView
// Kept for potential fallback scenarios or compatibility during migration

// Structured diff algorithm optimized for JSON comparison with proper alignment
export const computeSimpleDiff = (text1: string, text2: string): DiffResult => {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  
  return computeStructuredDiff(lines1, lines2);
};

// Structured diff algorithm that prioritizes semantic alignment over optimal matching
function computeStructuredDiff(lines1: string[], lines2: string[]): DiffResult {
  const m = lines1.length;
  const n = lines2.length;
  
  // Use simple sliding window approach for better semantic matching
  const alignedLines1: string[] = [];
  const alignedLines2: string[] = [];
  const diffLines1 = new Set<number>();
  const diffLines2 = new Set<number>();
  
  let i = 0, j = 0;
  let alignedIndex = 0;
  
  while (i < m || j < n) {
    if (i >= m) {
      // Only lines left in document 2 - insert
      alignedLines1.push('');
      alignedLines2.push(lines2[j]);
      diffLines2.add(alignedIndex);
      j++;
    } else if (j >= n) {
      // Only lines left in document 1 - delete
      alignedLines1.push(lines1[i]);
      alignedLines2.push('');
      diffLines1.add(alignedIndex);
      i++;
    } else if (lines1[i] === lines2[j]) {
      // Lines match exactly
      alignedLines1.push(lines1[i]);
      alignedLines2.push(lines2[j]);
      i++;
      j++;
    } else {
      // Lines differ - look ahead to find the best alignment
      let bestMatch = null;
      let lookAhead = 5; // How far to look ahead
      
      // Look for line1[i] in upcoming lines2
      for (let k = j + 1; k < Math.min(j + lookAhead, n); k++) {
        if (lines1[i] === lines2[k]) {
          bestMatch = {type: 'insert', distance: k - j};
          break;
        }
      }
      
      // Look for line2[j] in upcoming lines1
      for (let k = i + 1; k < Math.min(i + lookAhead, m); k++) {
        if (lines2[j] === lines1[k]) {
          const newMatch = {type: 'delete', distance: k - i};
          if (!bestMatch || newMatch.distance < bestMatch.distance) {
            bestMatch = newMatch;
          }
          break;
        }
      }
      
      if (bestMatch?.type === 'insert') {
        // line1[i] matches with a later line2, so insert line2[j] as gap
        alignedLines1.push('');
        alignedLines2.push(lines2[j]);
        diffLines2.add(alignedIndex);
        j++;
      } else if (bestMatch?.type === 'delete') {
        // line2[j] matches with a later line1, so delete line1[i] as gap
        alignedLines1.push(lines1[i]);
        alignedLines2.push('');
        diffLines1.add(alignedIndex);
        i++;
      } else {
        // No good match found - treat as modification
        alignedLines1.push(lines1[i]);
        alignedLines2.push(lines2[j]);
        diffLines1.add(alignedIndex);
        diffLines2.add(alignedIndex);
        i++;
        j++;
      }
    }
    
    alignedIndex++;
  }
  
  // Optional: Log alignment stats in development
  if (process.env.NODE_ENV === 'development') {
    console.log(`🔧 Aligned ${alignedLines1.length} lines (was ${m} vs ${n})`);
  }
  
  return {
    alignedText1: alignedLines1.join("\n"),
    alignedText2: alignedLines2.join("\n"),
    diffLines1,
    diffLines2,
  };
}


// Simple naive diff (for comparison)
export const computeNaiveDiff = (text1: string, text2: string): DiffResult => {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");
  const diffLines1 = new Set<number>();
  const diffLines2 = new Set<number>();

  const maxLength = Math.max(lines1.length, lines2.length);
  
  for (let i = 0; i < maxLength; i++) {
    const line1 = i < lines1.length ? lines1[i] : "";
    const line2 = i < lines2.length ? lines2[i] : "";
    
    if (line1 !== line2) {
      if (line1) diffLines1.add(i);
      if (line2) diffLines2.add(i);
    }
  }

  return {
    alignedText1: text1,
    alignedText2: text2,
    diffLines1,
    diffLines2,
  };
};

// Legacy function - replaced by native CodeMirror MergeView
export const computeDiffWithAlignment = (text1: string, text2: string): DiffResult => {
  console.warn("⚠️ computeDiffWithAlignment is deprecated - using native CodeMirror MergeView instead");
  return computeSimpleDiff(text1, text2);
};