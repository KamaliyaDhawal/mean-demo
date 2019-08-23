import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CreateUserService {

  apiUrl = environment.apiUrl;
  _createUserUrl = this.apiUrl + 'createUser';
  _getUserListUrl = this.apiUrl + 'getUserList';

  constructor(private http: HttpClient) { }

  createUser(data) {
    let admin = JSON.parse(localStorage.getItem('admin'));
    data.id = admin.id;
    return this.http.post(this._createUserUrl, data);

  }
  getUserList(){
    return this.http.get(this._getUserListUrl);

  }
}
