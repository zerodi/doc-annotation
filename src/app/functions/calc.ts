import { clamp } from './clamp';
import { DragContext } from '../types/drag-context';

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

  const image = frame.querySelector('img');
  const naturalWidth = image?.naturalWidth || frameRect.width;
  const naturalHeight = image?.naturalHeight || frameRect.height;

  const centerX = event.clientX - offsetX;
  const centerY = event.clientY - offsetY;
  const relativeX = clamp((centerX - frameRect.left) / frameRect.width);
  const relativeY = clamp((centerY - frameRect.top) / frameRect.height);

  return {
    x: Math.round(relativeX * naturalWidth),
    y: Math.round(relativeY * naturalHeight),
    relativeX,
    relativeY,
  };
}
