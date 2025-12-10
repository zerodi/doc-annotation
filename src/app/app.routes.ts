import { Routes } from '@angular/router';
import { documentResolver } from './modules/document/document-resolver';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./modules/document/document').then(m => m.Document),
    resolve: { document: documentResolver },
  },
  {
    path: ':uuid',
    loadComponent: () => import('./modules/document/document').then(m => m.Document),
    resolve: { document: documentResolver },
  },
];
