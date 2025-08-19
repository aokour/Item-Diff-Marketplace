import { DiffResult } from "../types/DiffViewer.types";

// Safe alignment algorithm with proper gap handling
export const computeDiffWithAlignment = (text1: string, text2: string): DiffResult => {
  const lines1 = text1.split("\n");
  const lines2 = text2.split("\n");

  console.log("🔍 Input lengths:", lines1.length, lines2.length);

  // Safety check for very large inputs
  if (lines1.length > 10000 || lines2.length > 10000) {
    console.error("Input too large, using simple diff");
    return computeSimpleDiff(text1, text2);
  }

  // Create lookup sets for efficient checking
  const lines1Set = new Set(lines1);
  const lines2Set = new Set(lines2);

  const alignedText1: string[] = [];
  const alignedText2: string[] = [];
  const diffLines1 = new Set<number>();
  const diffLines2 = new Set<number>();

  let i1 = 0, i2 = 0;
  let alignedIndex = 0;
  let iterations = 0;
  const MAX_ITERATIONS = Math.max(lines1.length, lines2.length) * 2; // Safety limit

  while ((i1 < lines1.length || i2 < lines2.length) && iterations < MAX_ITERATIONS) {
    iterations++;
    
    const line1 = i1 < lines1.length ? lines1[i1] : null;
    const line2 = i2 < lines2.length ? lines2[i2] : null;

    if (line1 && line2 && line1 === line2) {
      // Lines match exactly - add both and advance
      alignedText1.push(line1);
      alignedText2.push(line2);
      i1++;
      i2++;
    } else if (line1 && !line2) {
      // Preview has more lines - add gap to published
      alignedText1.push(line1);
      alignedText2.push(""); // Gap
      diffLines1.add(alignedIndex);
      i1++;
    } else if (!line1 && line2) {
      // Published has more lines - add gap to preview
      alignedText1.push(""); // Gap
      alignedText2.push(line2);
      diffLines2.add(alignedIndex);
      i2++;
    } else if (line1 && line2) {
      // Both lines exist but differ - try to find if line1 exists later in lines2
      let foundInLines2 = false;
      for (let j = i2 + 1; j < Math.min(i2 + 5, lines2.length); j++) {
        if (lines2[j] === line1) {
          // Found line1 later in lines2, so line2 is unique - add gap to preview
          alignedText1.push(""); // Gap
          alignedText2.push(line2);
          diffLines2.add(alignedIndex);
          i2++;
          foundInLines2 = true;
          break;
        }
      }
      
      if (!foundInLines2) {
        // Try to find if line2 exists later in lines1
        let foundInLines1 = false;
        for (let j = i1 + 1; j < Math.min(i1 + 5, lines1.length); j++) {
          if (lines1[j] === line2) {
            // Found line2 later in lines1, so line1 is unique - add gap to published
            alignedText1.push(line1);
            alignedText2.push(""); // Gap
            diffLines1.add(alignedIndex);
            i1++;
            foundInLines1 = true;
            break;
          }
        }
        
        if (!foundInLines1) {
          // Lines are genuinely different
          alignedText1.push(line1);
          alignedText2.push(line2);
          diffLines1.add(alignedIndex);
          diffLines2.add(alignedIndex);
          i1++;
          i2++;
        }
      }
    } else {
      // Shouldn't reach here, but safety break
      break;
    }

    alignedIndex++;
  }

  if (iterations >= MAX_ITERATIONS) {
    console.warn("🔍 Hit iteration limit, using simple diff");
    return computeSimpleDiff(text1, text2);
  }

  console.log("🔍 Final aligned lengths:", alignedText1.length, alignedText2.length);
  console.log("🔍 Diff lines preview:", Array.from(diffLines1).slice(0, 10));
  console.log("🔍 Diff lines published:", Array.from(diffLines2).slice(0, 10));

  return {
    alignedText1: alignedText1.join("\n"),
    alignedText2: alignedText2.join("\n"),
    diffLines1,
    diffLines2,
  };
};

// Fallback simple diff for large inputs
export const computeSimpleDiff = (text1: string, text2: string): DiffResult => {
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