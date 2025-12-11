import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';

import { Http } from '../../services/http';
import { MOCK_DOC } from '../../types/mock-data';

export type AnnotationDocument = typeof MOCK_DOC & { id: string };

export const documentResolver: ResolveFn<AnnotationDocument> = route => {
  const http = inject(Http);
  const id = route.paramMap.get('uuid') ?? 'mock-doc';

  return http.get<AnnotationDocument>(`documents/${id}`);
};
