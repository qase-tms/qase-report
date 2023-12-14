export const formatMs = (durationMs: number): string => {
  const roundedMs = Math.floor(durationMs);

  if (durationMs < 0) {
    return '_';
  }

  const ms = roundedMs % 1000;

  const totalSeconds = Math.floor(roundedMs / 1000);

  const seconds = totalSeconds % 60;

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const hours = Math.floor(totalSeconds / 3600);

  const timeParts: [number, string][] = [
    [hours, 'h'],
    [minutes, 'm'],
    [seconds, 's'],
    [ms, 'ms'],
  ];

  const firstNonZeroIndex = timeParts.findIndex(([value]) => value > 0);
  if (firstNonZeroIndex === -1) {
    return '0ms';
  }
  timeParts.splice(0, firstNonZeroIndex);

  return timeParts.map(p => p.join('')).join(' ');
};
