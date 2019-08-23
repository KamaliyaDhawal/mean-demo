import { AuthenticationService } from '../auth/authentication.service';
import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router, Route } from '@angular/router';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private _authService: AuthenticationService,
    private _router: Router) { }

    canActivate(next: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
      let userRole = this._authService.getUserRole();
      
      if (next.data.role.includes(+userRole)) {
          return true;
      }
      // navigate to current page
      // if(+userRole < 3){
        
      //   this._router.navigate(['/dashboard']);
      // }else{
      //   this._router.navigate(['/gu']);

      // }

        this._router.navigate(['/admin']);

      return false;
  }
}
