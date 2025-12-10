import { TuiButton, TuiRoot } from '@taiga-ui/core';
import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TuiAppBar } from "@taiga-ui/layout";
import { Zoom } from "./services/zoom";
import { Save } from './services/save';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, TuiRoot, TuiAppBar, TuiButton],
  templateUrl: './app.html',
  styleUrl: './app.less'
})
export class App {
  public readonly zoom = inject(Zoom);
  public readonly save = inject(Save);

}
