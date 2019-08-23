import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class RoundService {
	apiUrl = environment.apiUrl;
	_save = this.apiUrl + 'saveRound';
	_get = this.apiUrl + 'getRound';
  _delete = this.apiUrl + 'deleteRound';
  _allRound = this.apiUrl + 'allRound';

  constructor(private http: HttpClient) { }

  admin = JSON.parse(localStorage.getItem('admin'));

  getAllRound() {
    return this.http.get(this._allRound);
  }

  saveRound(round){
    round.userId = this.admin.id;
  	return this.http.post(this._save, round); 
  }

  getRound(round){
    round.userId = this.admin.id;
    return this.http.get(this._get+`/${round}`);
  }

  deleteRound(round) {
    round.userId = this.admin.id;
    return this.http.patch(this._delete, round);
  }

}
