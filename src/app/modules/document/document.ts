import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { Annotation as AnnotationComponent } from '../../components/annotation/annotation';
import { DragContainer } from '../../directives/drag-container';
import { DragElement } from '../../directives/drag-element';
import { AnnotationDocument } from './document-resolver';
import { Zoom } from '../../services/zoom';
import { Save } from '../../services/save';
import { RelPosition } from '../../types/position';
import { NgOptimizedImage } from '@angular/common';
import { AnnotationPosition } from '../../types/annotation-position';
import { calcRelativePos } from '../../functions/calc';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [AnnotationComponent, DragContainer, DragElement, NgOptimizedImage],
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
  protected readonly document = computed<AnnotationDocument | undefined>(
    () => this.routeData().document as AnnotationDocument | undefined,
  );
  protected readonly droppedPositions = signal<Record<number, RelPosition>>({});
  protected readonly annotations = signal<Record<number, AnnotationPosition[]>>({});
  private saveSub?: Subscription;

  protected handleDrop(index: number, position: RelPosition): void {
    console.log(index, position);
    this.droppedPositions.update((current) => ({ ...current, [index]: position }));
  }

  protected handleAddAnnotation(index: number, event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement & Partial<HTMLImageElement>;
    const position = this.computePosition(event, element);

    this.annotations.update((current) => {
      const existing = current[index] ?? [];
      return { ...current, [index]: [...existing, { id: uuidv4(), position }] };
    });
  }

  protected handleRemoveAnnotation(index: number, annotationId: string): void {
    this.annotations.update((current) => {
      const pageAnnotations = current[index];

      if (!pageAnnotations) {
        return current;
      }

      const updatedAnnotations = pageAnnotations.filter(
        (annotation) => annotation.id !== annotationId,
      );

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

  protected handleAnnotationDrag(
    pageIndex: number,
    annotationId: string,
    position: RelPosition,
  ): void {
    this.annotations.update((current) => {
      const pageAnnotations = current[pageIndex];

      if (!pageAnnotations) {
        return current;
      }

      const index = pageAnnotations.findIndex((annotation) => annotation.id === annotationId);

      if (index === -1) {
        return current;
      }

      const updated = [...pageAnnotations];

      updated[index] = {
        ...updated[index],
        position,
      };

      return { ...current, [pageIndex]: updated };
    });
  }

  ngOnInit(): void {
    this.saveSub = this.save.emitted.subscribe(() => {

    });
  }

  ngOnDestroy(): void {
    this.saveSub?.unsubscribe();
  }

  private computePosition(
    event: MouseEvent,
    element: HTMLElement & Partial<HTMLImageElement>,
  ): RelPosition {
    return calcRelativePos(event, element) ?? { x: 0, y: 0, relativeX: 0, relativeY: 0 };
  }
}
