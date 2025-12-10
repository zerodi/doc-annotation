import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { toSignal } from '@angular/core/rxjs-interop';
import { Subscription } from 'rxjs';

import { Annotation as AnnotationComponent } from '../../components/annotation/annotation';
import { AnnotationDocument } from './document-resolver';
import { Zoom } from '../../services/zoom';
import { Save } from '../../services/save';

@Component({
  selector: 'app-document',
  standalone: true,
  imports: [AnnotationComponent],
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

  protected readonly annotations = signal<Record<number, AnnotationPlacement[]>>({});
  private saveSub?: Subscription;

  protected handleAddAnnotation(index: number, event: MouseEvent): void {
    const element = event.currentTarget as HTMLElement & Partial<HTMLImageElement>;
    const position = this.computePosition(event, element);

    this.annotations.update((current) => {
      const existing = current[index] ?? [];
      return { ...current, [index]: [...existing, { id: this.createId(), position }] };
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
  ): DropPosition {
    const rect = element.getBoundingClientRect();

    if (!rect.width || !rect.height) {
      return { x: 0, y: 0, relativeX: 0, relativeY: 0 };
    }

    const relativeX = this.clamp((event.clientX - rect.left) / rect.width);
    const relativeY = this.clamp((event.clientY - rect.top) / rect.height);
    const naturalWidth = element.naturalWidth ?? rect.width;
    const naturalHeight = element.naturalHeight ?? rect.height;

    return {
      x: Math.round(relativeX * naturalWidth),
      y: Math.round(relativeY * naturalHeight),
      relativeX,
      relativeY,
    };
  }

  private clamp(value: number): number {
    if (value < 0) return 0;
    if (value > 1) return 1;
    return value;
  }

  private createId(): string {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return crypto.randomUUID();
    }

    return `annotation-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`;
  }
}

interface AnnotationPlacement {
  id: string;
  position: DropPosition;
}
