import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { CommonModule } from '@angular/common';
import { Annotation as AnnotationComponent } from '../../components/annotation/annotation';
import { DragContainer } from '../../directives/drag-container';
import { DragElement } from '../../directives/drag-element';
import { AnnotationDocument } from './document-resolver';
import { Zoom } from '../../services/zoom';
import { Save } from '../../services/save';
import { RelativeRect, RelPosition } from '../../types/position';
import { AnnotationModel } from '../../types/annotation-model';
import { calcRect, calcRelativePos } from '../../functions/calc';
import { CreateContext, ResizeContext } from '../../types/context';
import { clamp, clampWithinBounds } from '../../functions/clamp';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [CommonModule, FormsModule, AnnotationComponent, DragContainer, DragElement],
  templateUrl: './document.html',
  styleUrl: './document.less',
})
export class Document implements OnInit, OnDestroy {
  public readonly zoom = inject(Zoom);
  public readonly save = inject(Save);
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, {
    initialValue: { document: undefined },
  });
  protected readonly zoomValue = toSignal(this.zoom.value$, { initialValue: 1 });
  protected readonly document = computed<AnnotationDocument | undefined>(
    () => this.routeData().document as AnnotationDocument | undefined,
  );
  protected readonly droppedPositions = signal<Record<number, RelPosition>>({});
  protected readonly selections = signal<Record<number, RelativeRect | null>>({});
  protected readonly annotations = signal<Record<number, AnnotationModel[]>>({});
  private saveSub?: Subscription;
  private createContext: CreateContext | null = null;
  private resizeContext: ResizeContext | null = null;

  protected handleDrop(index: number, position: RelPosition): void {
    this.droppedPositions.update(current => ({ ...current, [index]: position }));
  }

  protected startAnnotation(index: number, event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (target?.closest('app-annotation')) {
      return;
    }

    this.teardownCreate();
    const frame = event.currentTarget as HTMLElement;
    const start = this.computePosition(event, frame);

    if (!start) {
      return;
    }

    const rect = calcRect(start, start);

    this.createContext = {
      pageIndex: index,
      frame,
      start,
      lastPosition: start,
    };

    this.selections.update(current => ({ ...current, [index]: rect }));

    event.preventDefault();
    window.addEventListener('pointermove', this.handleCreateMove, { passive: false });
    window.addEventListener('pointerup', this.handleCreateEnd, { passive: true });
  }

  protected handleRemoveAnnotation(index: number, annotationId: string): void {
    this.annotations.update(current => {
      const pageAnnotations = current[index];

      if (!pageAnnotations) {
        return current;
      }

      const updatedAnnotations = pageAnnotations.filter(annotation => annotation.id !== annotationId);

      if (updatedAnnotations.length === pageAnnotations.length) {
        return current;
      }

      const nextAnnotations = { ...current };

      if (updatedAnnotations.length) {
        nextAnnotations[index] = updatedAnnotations;
      } else {
        delete nextAnnotations[index];
      }

      return nextAnnotations;
    });
  }

  protected handleAnnotationDrag(pageIndex: number, annotationId: string, position: RelPosition): void {
    this.annotations.update(current => {
      const pageAnnotations = current[pageIndex];

      if (!pageAnnotations) {
        return current;
      }

      const index = pageAnnotations.findIndex(annotation => annotation.id === annotationId);

      if (index === -1) {
        return current;
      }

      const updated = [...pageAnnotations];

      const currentRect = updated[index].rect;

      updated[index] = {
        ...updated[index],
        rect: {
          ...currentRect,
          relativeX: clampWithinBounds(position.relativeX, currentRect.relativeWidth),
          relativeY: clampWithinBounds(position.relativeY, currentRect.relativeHeight),
        },
      };

      return { ...current, [pageIndex]: updated };
    });
  }

  protected updateAnnotationText(pageIndex: number, annotationId: string, text: string): void {
    this.annotations.update(state => {
      const pageAnnotations = state[pageIndex];
      if (!pageAnnotations) {
        return state;
      }

      const idx = pageAnnotations.findIndex(annotation => annotation.id === annotationId);
      if (idx === -1) {
        return state;
      }

      const next = [...pageAnnotations];
      next[idx] = { ...next[idx], text };
      return { ...state, [pageIndex]: next };
    });
  }

  protected startResizing(pageIndex: number, annotationId: string, event: PointerEvent): void {
    if (event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    this.teardownResize();
    this.teardownCreate();

    const frame = (event.currentTarget as HTMLElement).closest('.doc__page-frame');
    if (!frame) {
      return;
    }

    const annotation = this.annotations()[pageIndex]?.find(item => item.id === annotationId);
    if (!annotation) {
      return;
    }

    this.resizeContext = {
      pageIndex,
      annotationId,
      frame: frame as HTMLElement,
      origin: annotation.rect,
    };

    window.addEventListener('pointermove', this.handleResizeMove, { passive: false });
    window.addEventListener('pointerup', this.handleResizeEnd, { passive: true });
  }

  ngOnInit(): void {
    this.saveSub = this.save.emitted.subscribe(() => {
      this.handleSave();
    });
  }

  ngOnDestroy(): void {
    this.saveSub?.unsubscribe();
    this.teardownCreate();
    this.teardownResize();
  }

  private computePosition(event: PointerEvent, element: HTMLElement): RelPosition | null {
    return calcRelativePos(event, element);
  }

  private handleCreateMove = (event: PointerEvent): void => {
    if (!this.createContext) {
      return;
    }

    event.preventDefault();

    const { pageIndex, frame, start } = this.createContext;
    const currentPos = this.computePosition(event, frame);

    if (!currentPos) {
      return;
    }

    const rect = calcRect(start, currentPos);
    this.createContext = { ...this.createContext, lastPosition: currentPos };
    this.selections.update(current => ({ ...current, [pageIndex]: rect }));
  };

  private handleCreateEnd = (event: PointerEvent): void => {
    if (!this.createContext) {
      return;
    }

    const { pageIndex, frame, start, lastPosition } = this.createContext;
    const end = this.computePosition(event, frame) ?? lastPosition;
    const rect = calcRect(start, end);
    const id = uuidv4();

    this.annotations.update(current => {
      const existing = current[pageIndex] ?? [];
      return { ...current, [pageIndex]: [...existing, { id, rect, text: '' }] };
    });

    this.selections.update(current => {
      const next = { ...current };
      delete next[pageIndex];
      return next;
    });

    this.teardownCreate();
  };

  private teardownCreate(): void {
    if (!this.createContext) {
      return;
    }

    const pageIndex = this.createContext.pageIndex;
    this.selections.update(current => {
      const next = { ...current };
      delete next[pageIndex];
      return next;
    });

    this.createContext = null;
    window.removeEventListener('pointermove', this.handleCreateMove);
    window.removeEventListener('pointerup', this.handleCreateEnd);
  }

  private handleResizeMove = (event: PointerEvent): void => {
    if (!this.resizeContext) {
      return;
    }

    event.preventDefault();
    const { pageIndex, annotationId, frame, origin } = this.resizeContext;
    const pos = this.computePosition(event, frame);

    if (!pos) {
      return;
    }

    const width = Math.min(clamp(pos.relativeX - origin.relativeX, 0.02), 1 - origin.relativeX);
    const height = Math.min(clamp(pos.relativeY - origin.relativeY, 0.02), 1 - origin.relativeY);

    this.annotations.update(state => {
      const pageAnnotations = state[pageIndex];
      if (!pageAnnotations) {
        return state;
      }
      const idx = pageAnnotations.findIndex(annotation => annotation.id === annotationId);
      if (idx === -1) {
        return state;
      }

      const next = [...pageAnnotations];
      next[idx] = {
        ...next[idx],
        rect: {
          ...origin,
          relativeWidth: width,
          relativeHeight: height,
        },
      };

      return { ...state, [pageIndex]: next };
    });
  };

  private handleResizeEnd = (): void => {
    this.teardownResize();
  };

  private teardownResize(): void {
    if (!this.resizeContext) {
      return;
    }

    this.resizeContext = null;
    window.removeEventListener('pointermove', this.handleResizeMove);
    window.removeEventListener('pointerup', this.handleResizeEnd);
  }

  private handleSave(): void {
    const doc = this.document();

    if (!doc) {
      return;
    }

    const payload = {
      documentId: doc.id,
      pages: doc.pages.map(page => ({
        number: page.number,
        annotations: (this.annotations()[page.number] ?? []).map(annotation => ({
          id: annotation.id,
          rect: annotation.rect,
          text: annotation.text,
        })),
      })),
      savedAt: new Date().toISOString(),
    };

    console.log('Document saved', payload);
  }
}
