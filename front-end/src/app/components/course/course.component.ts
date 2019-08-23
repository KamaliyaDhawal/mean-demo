import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CourseService } from '../../services/course/course.service';

declare var $ :any;
declare var notification:any;

@Component({
  selector: 'app-course',
  templateUrl: './course.component.html',
  styleUrls: ['./course.component.css']
})
export class CourseComponent implements OnInit {
  added: boolean = false;
  courses: any;
  courseDetails;
  admin = JSON.parse(localStorage.getItem('admin'));

  constructor(
              private commonService: CommonService,
              private formBuilder: FormBuilder,
              private courseService: CourseService
             ) { }

  ngOnInit() {
    this.commonService.changeSlidename('Course')
    this.commonService.setPageId(1);
    this.getCourses();
  }

  newCourse = this.formBuilder.group({
    id: [],
    name: [, Validators.required]
  });

  addCourse() {
    
    if(this.newCourse.valid){

      this.added = true;
      this.courseService.addCourse(this.newCourse.value)
      .subscribe(
        data => {
          notification.showNotification('bottom','right', "success", "Course Save", "verified_user");
          this.getCourses();
          this.newCourse.reset();
        },
        error => {
          notification.showNotification('bottom','right', "danger", "Error While Saving Course", "error");
        }
      )
      this.added = false;
    }
  }

  getCourses() {
    this.courseService.getCourses('course')
    .subscribe(
      data => {
        this.courses = data;
      },
      error => {
        notification.showNotification('bottom','right', "danger", "Error While Fetch Courses", "error");
      } 
    )
  }

  editCourse(course) {
    debugger;
    this.name.setValue(course.name);
    this.id.setValue(course.id);
  }

  deleteCourse(){
    this.courseService.deleteCourse(this.courseDetails)
    .subscribe(
      data => {
        if(data) {
          this.getCourses();
          notification.showNotification('bottom','right', "success", "Course Deleted", "delete");
        }
      },
      error => {
        notification.showNotification('bottom','right', "danger", "Error While Detele Course", "error");
      }
    )
  }

  getCourseDetails(course) {
    this.courseDetails = course;
  }

  get id () {
    return this.newCourse.get('id');
  }

  get name() {
    return this.newCourse.get('name');
  }

  get getUser() {
    return this.newCourse.get('user');
  }

  set setUser(user) {
    this.getUser.setValue(user);
  }
}
