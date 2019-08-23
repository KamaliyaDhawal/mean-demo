import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  apiUrl = environment.apiUrl;
  
  _loginUrl = this.apiUrl + 'login';
  _checkLoginIrl = this.apiUrl + 'checkLogin';
  _logutUrl = this.apiUrl + 'logout';
  sendVerifyCodeRoute = this.apiUrl + 'sendVerifyCode';
  verifyCodeRoute = this.apiUrl + 'verifyCode';

  constructor(private http: HttpClient) { }

  login(data) {
    return this.http.post(this._loginUrl, data);
  }
  logut() {
    return this.http.get(this._logutUrl);
  }

  checkLogin() {
    return this.http.get(this._checkLoginIrl);
  }

  verifyUser(data, type) {
    if (type == 'send') {
      return this.http.post(this.sendVerifyCodeRoute, { data });
    } else if (type == 'verify') {
      return this.http.post(this.verifyCodeRoute, { data });
    }
  }
  getUserRole() {
    let role = localStorage.getItem('role');
    if (role != undefined) {
      return role;
    }
    return -1
  }
}
