import { clamp, clampWithinBounds } from './clamp';
import { DragContext } from '../types/context';
import { RelativeRect, RelPosition } from '../types/position';

export const calcRelativePos = (
  event: MouseEvent,
  element: HTMLElement & Partial<HTMLImageElement>,
) => {
  const rect = element.getBoundingClientRect();

  if (!rect.width || !rect.height) {
    return null;
  }

  const relativeX = clamp((event.clientX - rect.left) / rect.width);
  const relativeY = clamp((event.clientY - rect.top) / rect.height);

  return {
    x: Math.round(relativeX * rect.width),
    y: Math.round(relativeY * rect.height),
    relativeX,
    relativeY,
  };
}

export const calcOffsetPos = (
  event: MouseEvent,
  dragContext: DragContext,
) => {
  const { frame, offsetX, offsetY } = dragContext;
  const frameRect = frame.getBoundingClientRect();

  if (!frameRect.width || !frameRect.height) {
    return;
  }

  const left = event.clientX - offsetX;
  const top = event.clientY - offsetY;
  const relativeX = clamp((left - frameRect.left) / frameRect.width);
  const relativeY = clamp((top - frameRect.top) / frameRect.height);

  return {
    x: Math.round(relativeX * frameRect.width),
    y: Math.round(relativeY * frameRect.height),
    relativeX,
    relativeY,
  };
}

export const calcRect = (start: RelPosition, end: RelPosition): RelativeRect => {
  const minSize = 0.02;
  const startX = clampWithinBounds(start.relativeX, minSize);
  const startY = clampWithinBounds(start.relativeY, minSize);

  const clampedEndX = Math.max(startX, Math.min(end.relativeX, 1));
  const clampedEndY = Math.max(startY, Math.min(end.relativeY, 1));

  const maxWidth = 1 - startX;
  const maxHeight = 1 - startY;

  const width = Math.max(minSize, Math.min(clampedEndX - startX, maxWidth));
  const height = Math.max(minSize, Math.min(clampedEndY - startY, maxHeight));

  return {
    relativeX: startX,
    relativeY: startY,
    relativeWidth: width,
    relativeHeight: height,
  };
}
