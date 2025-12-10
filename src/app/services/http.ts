import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

type HttpHeadersInit = HttpHeaders | Record<string, string | string[]>;
type HttpParamsInit =
  | HttpParams
  | Record<string, string | number | boolean | readonly (string | number | boolean)[]>;

interface RequestOptions {
  headers?: HttpHeadersInit;
  params?: HttpParamsInit;
  withCredentials?: boolean;
}

@Injectable({ providedIn: 'root' })
export class Http {
  private readonly apiBase = '/api';

  constructor(private readonly http: HttpClient) {}

  get<T>(path: string, options: RequestOptions = {}): Observable<T> {
    return this.http.get<T>(this.buildUrl(path), options);
  }

  private buildUrl(path: string): string {
    if (/^https?:\/\//i.test(path)) {
      return path;
    }

    return `${this.apiBase}/${path.replace(/^\//, '')}`;
  }
}
