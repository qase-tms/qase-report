const BARS_MARGIN = 24;
const BARS_GAP = 36;

export const getBarsOffsets = (stepDepth: number) => {
  return new Array(stepDepth).fill(0).map((a, i) => -i * BARS_GAP - BARS_MARGIN);
};
