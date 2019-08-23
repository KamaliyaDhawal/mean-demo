import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
@Injectable({
  providedIn: 'root'
})
export class GuidanceUserService {

  apiUrl = environment.apiUrl;
  _getGuidanceUserDetails = this.apiUrl + 'getGuidanceUserDetails';
  constructor(private http: HttpClient) { }

  getUserInfo(email){
    // let admin = JSON.parse(localStorage.getItem('admin'));
    
    let data = {email : email};
    
    return this.http.post(this._getGuidanceUserDetails, data);
  }
}
