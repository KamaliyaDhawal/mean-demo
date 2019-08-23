import { Component, OnInit, ViewChild } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { CourseService } from '../../services/course/course.service';
import { AuthenticationService } from '../../services/auth/authentication.service';
import { Router } from '@angular/router';
import { ChangePasswordComponent } from './change-password/change-password.component';

declare var $: any;
declare var notification: any;

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @ViewChild(ChangePasswordComponent) changePasswordComp: ChangePasswordComponent;
  currentSlide;
  courseStatus;
  oldFullCourseCount;
  role;
  notificationCount = null;
  constructor(
    private commonService: CommonService,
    private _courseService: CourseService,
    private authenticationService: AuthenticationService,
    private router: Router,
    private _commonService: CommonService
  ) { }

  ngOnInit() {
    this.commonService.currentSlide.subscribe(data => this.currentSlide = data);
    this.commonService.updatedFullCourses.subscribe(data => this.oldFullCourseCount = data);
    
    this.role = +localStorage.getItem('role')
    this.setNotificationCount();

  }

  setNotificationCount() {
    this._courseService.getCourseStatus().subscribe(
      data => {

        this.courseStatus = data
        if (this.oldFullCourseCount != this.courseStatus.length) {
          this.notificationCount = this.courseStatus.length - this.oldFullCourseCount;
          this.commonService.updateFullcourses(this.courseStatus.length);
          if (this.notificationCount < 0) {
            this.notificationCount = null;
          }
        } else {
          this.notificationCount = null;
        }
        let totalNotifications = this.notificationCount ? this.notificationCount : 0;
        $("#navbarDropdownMenuLink").attr('title', totalNotifications + ' new notifications');
      },


      (err) => { }
    );
  }
  logout() {
    // localStorage.removeItem('JWTtoken');
    // localStorage.removeItem('admin');
    localStorage.clear();
    this.router.navigate(['/admin']);
  }
  openModel() {
    $(function () {
      $('#changePassword').modal('toggle');
    });
    this.changePasswordComp.changePasswordForm.reset();
  }


}
