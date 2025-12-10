import { Component, input, output } from '@angular/core';
import { TuiElasticContainer } from '@taiga-ui/kit';

@Component({
  selector: 'app-annotation',
  standalone: true,
  imports: [
    TuiElasticContainer
  ],
  templateUrl: './annotation.html',
  styleUrl: './annotation.less',
})
export class Annotation {
  annotationId = input.required<string>();
  value: string = '';
  remove = output<string>();

  delete(event: Event): void {
    event.stopPropagation();
    this.remove.emit(this.annotationId());
  }
}
