export const MODEL_TOKEN_LIMIT = 30000;
export const OUTPUT_BUDGET = 2000;
export const SYSTEM_PROMPT_BUDGET = 2000;
export const INPUT_BUDGET =
  MODEL_TOKEN_LIMIT - OUTPUT_BUDGET - SYSTEM_PROMPT_BUDGET;

export const estimateTokens = (s: string) => Math.ceil(s.length / 4);

export function tokensUsedForSelection(
  filteredChunks: string[],
  selectedIds: Set<string>,
  getFilename: (chunk: string) => string
) {
  return filteredChunks
    .filter((chunk) => selectedIds.has(getFilename(chunk)))
    .map((c) => estimateTokens(c))
    .reduce((a, b) => a + b, 0);
}

export function percentUsedForSelection(
  filteredChunks: string[],
  selectedIds: Set<string>,
  getFilename: (chunk: string) => string,
  inputBudget = INPUT_BUDGET
) {
  const used = tokensUsedForSelection(filteredChunks, selectedIds, getFilename);
  return Math.min(100, Math.round((used / inputBudget) * 100));
}

export function canAddChunkFactory(
  filteredChunks: string[],
  selectedIds: Set<string>,
  getFilename: (chunk: string) => string,
  inputBudget = INPUT_BUDGET
) {
  return (id: string) => {
    const currentSelected = tokensUsedForSelection(
      filteredChunks,
      selectedIds,
      getFilename
    );
    const adding = estimateTokens(
      filteredChunks.find((c) => getFilename(c) === id) || ""
    );
    return currentSelected + adding <= inputBudget;
  };
}

export function buildBudgetDiff(
  filteredChunks: string[],
  selectedIds: Set<string>,
  getFilename: (chunk: string) => string,
  inputBudget = INPUT_BUDGET
) {
  const selected = filteredChunks
    .filter((chunk) => selectedIds.has(getFilename(chunk)))
    .map((chunk) => ({
      id: getFilename(chunk),
      text: chunk,
      tokens: estimateTokens(chunk),
    }))
    .sort((a, b) => a.tokens - b.tokens);

  let used = 0;
  const included: string[] = [];
  const includedIds: string[] = [];
  const skippedIds: string[] = [];

  for (const { id, text, tokens } of selected) {
    if (used + tokens <= inputBudget) {
      included.push(text);
      includedIds.push(id);
      used += tokens;
    } else {
      skippedIds.push(id);
    }
  }

  return {
    diff: included.join("\n"),
    includedIds,
    skippedIds,
    tokensUsed: used,
    tokensBudget: inputBudget,
  };
}
