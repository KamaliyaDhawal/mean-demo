import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CommonService {
	
	private slideName = new BehaviorSubject('Course');
	private courseChild = new BehaviorSubject('Course List');
  private roundId:any =  new BehaviorSubject(0);
  private pageId = new BehaviorSubject(0);
  private fullCourse = new BehaviorSubject(0);
  private student = new BehaviorSubject(0);
  private studentList = new BehaviorSubject(0);

  constructor() { }

  currentSlide = this.slideName.asObservable();
  curretntCourseChild = this.courseChild.asObservable();
  currentRound:any = this.roundId.asObservable();
  currentPageId = this.pageId.asObservable();
  updatedFullCourses = this.fullCourse.asObservable();
  studentData = this.student.asObservable();
  studentListData = this.studentList.asObservable();

  setPageId(pageId) {
    this.pageId.next(pageId);    
  }

  changeSlidename(slideName: string){
    this.slideName.next(slideName);
  }

  changeCourseChild(courseChild: string){
    this.courseChild.next(courseChild);
  }

  changeRound(round) {
    this.roundId.next(round);
  }

  updateFullcourses(count) {
    this.fullCourse.next(count);
  }

  updateStudent(student) {
    this.student.next(student);
  }
  updateStudentList(email){ 
    
      this.studentList.next(email);
    
  }
}
