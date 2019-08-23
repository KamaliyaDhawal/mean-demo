import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
  HttpResponse,
  HttpErrorResponse,
  HttpEvent
} from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { tap } from 'rxjs/operators';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private router: Router
  ) {}
  intercept(request: HttpRequest<any>, next: HttpHandler){
    let token = localStorage.getItem('JWTtoken');
    request = request.clone({
      setHeaders: {
        Authorization: `bearer ${token}`
      }
    });

    return next.handle(request).pipe(
       tap((event: HttpEvent<any>) => {
         if (event instanceof HttpResponse) {
         }
       }, (err: any) => {
         if (err instanceof HttpErrorResponse) {
           if (err.status === 403) {
             this.router.navigate(['admin']);
           }
         }
       })
   );

  }
}