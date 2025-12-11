export const clamp = (value: number, minSize: number = 0): number => {
  if (value < minSize) {
    return minSize;
  }
  if (value > 1) {
    return 1;
  }
  return value;
}

export const clampWithinBounds = (value: number, minSize: number = 0): number =>  {
  if (minSize >= 1) {
    return 0;
  }

  const maxStart = 1 - minSize;
  return Math.max(0, Math.min(value, maxStart));
}
