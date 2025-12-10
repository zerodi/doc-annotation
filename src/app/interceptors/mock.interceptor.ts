import { HttpInterceptorFn, HttpRequest, HttpResponse } from '@angular/common/http';
import { v4 as uuidv4 } from 'uuid';
import { delay, of } from 'rxjs';
import { MOCK_DOC } from '../types/mock-data';

const mockResponses: Record<string, HttpResponse<unknown>> = {
  'GET /api/documents': new HttpResponse({
    status: 200,
    body: {
      documents: [
        { id: uuidv4(), ...MOCK_DOC },
        { id: uuidv4(), ...MOCK_DOC },
      ],
    },
  }),
};

const buildMockKey = (request: HttpRequest<unknown>): string => {
  const { pathname } = new URL(request.url, 'http://localhost');
  return `${request.method.toUpperCase()} ${pathname}`;
};

const resolveMockResponse = (request: HttpRequest<unknown>): HttpResponse<unknown> | null => {
  const mockKey = buildMockKey(request);
  const response = mockResponses[mockKey];

  if (response) {
    return response;
  }

  const { pathname } = new URL(request.url, 'http://localhost');
  const match = pathname.match(/^\/api\/documents\/(?<id>[a-f0-9-]{6,})$/i);

  if (match?.groups?.['id']) {
    const id = match.groups['id'];
    return new HttpResponse({
      status: 200,
      body: { id, ...MOCK_DOC },
    });
  }

  return null;
};

export const mockInterceptor: HttpInterceptorFn = (request, next) => {
  const response = resolveMockResponse(request);
  if (response) {
    return of(response).pipe(delay(150));
  }

  return of(
    new HttpResponse({
      status: 200,
      body: {
        mocked: true,
        method: request.method,
        url: request.url,
      },
    }),
  ).pipe(delay(120));
};
