import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Zoom {
  value$ = new BehaviorSubject<number>(1);

  get value(): number {
    return this.value$.getValue();
  }

  zoomOut(): void {
    if (this.value > 0.1) {
      this.value$.next(this.value - 0.1);
    }
  }

  zoomIn(): void {
    if (this.value < 2) {
      this.value$.next(this.value + 0.1);
    }
  }
}
