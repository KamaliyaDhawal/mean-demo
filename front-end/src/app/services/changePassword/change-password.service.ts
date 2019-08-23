import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ChangePasswordService {
	apiUrl = environment.apiUrl;
	_changePasswordUrl = this.apiUrl+'changePassword';
  	constructor(private http: HttpClient) { }

  	changePassword(data){
        let admin = JSON.parse(localStorage.getItem('admin'));
  		data.email = admin.email;
  		data.id = admin.id;
  		
	  	return this.http.post(this._changePasswordUrl, data);

  	}
}
