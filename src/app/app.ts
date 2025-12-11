import { TuiButton, TuiRoot } from '@taiga-ui/core';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiAppBar } from "@taiga-ui/layout";
import { Zoom } from "./services/zoom";
import { Save } from './services/save';
import { DecimalPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiAppBar, TuiButton, DecimalPipe],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  public readonly zoom = inject(Zoom);
  public readonly save = inject(Save);

  protected readonly zoomValue = toSignal(this.zoom.value$, { initialValue: 1 });

}
