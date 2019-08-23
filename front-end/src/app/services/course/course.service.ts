import { Injectable } from '@angular/core';

import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class CourseService {
	apiUrl = environment.apiUrl;
	_addCourse = this.apiUrl + 'addCourse';
	_getCourses = this.apiUrl + 'getCourses';
	_changeCourseStatus = this.apiUrl + 'changeCourseStatus';
	_deleteCourse = this.apiUrl + 'deleteCourse';
  _getCoursesForSlots = this.apiUrl + 'getCoursesForSlots';
  _getCourseStatus = this.apiUrl + 'getCourseStatus';
  _getCourseById = this.apiUrl + 'getCourseById';
  _getCourseForReports = this.apiUrl + 'getCourseForReports';
  _getRegisterCourse = this.apiUrl + 'getRegisterCourse';

  constructor(private http: HttpClient) { }

  admin = JSON.parse(localStorage.getItem('admin'));
  addCourse(course: any) {
    course.userId = this.admin.id;
  	return this.http.post(this._addCourse, course)
  }

  getCourses(from) {
  	return this.http.get(this._getCourses+`/${from}`);
  }

  getRegisterCourse() {
    return this.http.get(this._getRegisterCourse);
  }

  changeCourseStatus(course) {
    course.userId = this.admin.id;
  	return this.http.patch(this._changeCourseStatus, course);
  }

  deleteCourse(course) {
    course.userId = this.admin.id;
  	return this.http.patch(this._deleteCourse, course);
  }

  getCoursesForSlots(courses) {
    return this.http.get(this._getCoursesForSlots+`/${courses}`);
  }

  getCourseStatus() {
    return this.http.get(this._getCourseStatus);
  }

  getCoursesByRound(round) {
    return this.http.get(this._getCourseById+`/${round}`);
  }

  getCoursesForReports(round) {
    return this.http.get(this._getCourseForReports+`/${round}`);
  }
}
