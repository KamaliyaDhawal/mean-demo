import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RegistrationService {
	apiUrl = environment.apiUrl;
  _register = this.apiUrl + 'registerUser';
	_schoolInfo = this.apiUrl + 'getSchoolInfo';
  
	

  constructor(private http : HttpClient) { }

  registerUser() {
  	return this.http.post(this._register, []);
  }
  getSchoolInfo(data){
    return this.http.post(this._schoolInfo,{searchTearm : data});
  }
}
