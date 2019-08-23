import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SlotService {
	apiUrl = environment.apiUrl;
	_get = this.apiUrl + 'getSlot';
	_save = this.apiUrl + 'saveSlot';
  _countData = this.apiUrl + 'countData';
  constructor(private http: HttpClient) { }

  admin = JSON.parse(localStorage.getItem('admin'));

  getSlot(round, course) {
  	return this.http.get(this._get+`/${round}/${course}`);
  }

  saveSlot(slot) {
    slot.userId = this.admin.id;
  	return this.http.patch(this._save, slot);
  }

  findCountData(round, course) {
    return this.http.get(this._countData+`/${round}/${course}`);
  }
}
