import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class StudentService {
	apiUrl = environment.apiUrl;
	_save = this.apiUrl+'saveStudent';
  _edit = this.apiUrl+'editStudent';
	getStudent = this.apiUrl+'getStudent';
  updateStudent = this.apiUrl+'updateStudent';
  exportFile = this.apiUrl+'exportFile';
  sendMails = this.apiUrl+'sendMail';
  sendSMSes = this.apiUrl+'sendSMS';
  findStudentByStatuses = this.apiUrl+'findStudentByStatus';
  findStudentByReferences = this.apiUrl+'findStudentByReference';
  _getStudentById = this.apiUrl+'getStudentById';
  _reAssignSlot = this.apiUrl+'reAssignSlot';
  _sendCustomData = this.apiUrl+'sendCustomData';
  modifiedCourseRoute = this.apiUrl+'modifiedCourse';
  deleteStudentRoute = this.apiUrl+'deleteStudent';
  getStudentListBySchool = this.apiUrl+'getStudentList';
  _saveStudentByGuidanceUser = this.apiUrl+'saveStudentByGuidanceUser';

  constructor(private http: HttpClient) { }
  
  saveStudent(student, results) {
  	return this.http.post(this._save, {student, results});
  }

  getStudents(data) {
    data = JSON.stringify(data);
  	return this.http.get(this.getStudent+`/${data}`);
  }

  updateStudents(data){
    data.admin = JSON.parse(localStorage.getItem('admin')).id;
    return this.http.post(this.updateStudent, data);
  }

  sendMail (data) {
    return this.http.post(this.sendMails, { students: data }); 
  }

  sendSMS(data) {
   return this.http.post(this.sendSMSes, { students: data });  
  }

  findStudentByStatus(data) {
    return this.http.get(this.findStudentByStatuses+`/${data.round}/${data.course}/${data.decision}/${data.reference}`);  
  }

  getStudentById(studentId) {
    return this.http.get(this._getStudentById+`/${studentId}`);
  }

  editStudent(student, oldStudent) {
    let admin = JSON.parse(localStorage.getItem('admin'));
    student.update_by = admin.id;
    return this.http.post(this._edit, {student, oldStudent});
  }

  reAssignSlot(student) {
    let admin = JSON.parse(localStorage.getItem('admin'));
    student.update_by = admin.id;
    return this.http.post(this._reAssignSlot, student);
  }

  sendCustomData(type, studentsData, content) {
    return this.http.post(this._sendCustomData, {type, studentsData, content});
  }

  modifiedCourse(data) {
    return this.http.patch(this.modifiedCourseRoute, data);
  }

  deleteStudent(student) {
    let slot = JSON.parse(student.slots_id);
    let secondchoice = (student.course == student.firstchoice)? ((student.secondchoice != null)? student.secondchoice:'remove_firstchoice'):null;
    
    let data = {
      student_id: student.student_id,
      round_id: student.round,
      course_id: student.course,
      secondchoice,
      admin: JSON.parse(localStorage.getItem('admin')).id
    }

    return this.http.patch(this.deleteStudentRoute, data);
  }
  getStudentList(data){
  	return this.http.get(this.getStudentListBySchool+`/${data}`);
  }
  saveStudentByGuidanceUser(student){
    console.log(student);
    let admin = JSON.parse(localStorage.getItem('admin'));    
    let email = admin.email;
  	return this.http.post(this._saveStudentByGuidanceUser, {student,email});

  }
}
