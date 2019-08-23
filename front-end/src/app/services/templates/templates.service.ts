import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TemplatesService {
	apiUrl:string = environment.apiUrl;
	saveTemplateRoute:string = this.apiUrl+'saveTemplate';
	getTemplateRoute:string = this.apiUrl+'getTemplate';
  deleteTemplatesRoute:string = this.apiUrl+'deleteTemplate';

  constructor(
  	private http: HttpClient,
  ) { }

  saveTemplate(data) {
  	return this.http.post(this.saveTemplateRoute, data);
  }

  getTemplates() {
  	return this.http.get(this.getTemplateRoute);
  }
  deleteTemplates(data) {
   return this.http.patch(this.deleteTemplatesRoute, data); 
  }
}
