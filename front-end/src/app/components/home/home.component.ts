import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';

import { ActivatedRoute, Router } from '@angular/router';
import { CommonService } from '../../services/common/common.service';
import { AuthenticationService } from '../../services/auth/authentication.service';
import { GuidanceUserComponent } from '../guidance-user/guidance-user.component';

declare var $: any;
declare var notification: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],

})
export class HomeComponent implements OnInit {

  currentSlide;
  error;
  isAuthenticate = false;
  courseStatus;

  constructor(private _commonService: CommonService,
    private _authenticationService: AuthenticationService,
    private _router: Router) { }

  ngOnInit() {

    this._commonService.currentSlide.subscribe(data => this.currentSlide = data);

    this._authenticationService.checkLogin()
      .subscribe(
        (data) => {
          if (data['status'] === true) {
            this.isAuthenticate = true;
            

            localStorage.setItem('role', JSON.parse(data['data']).role);
            localStorage.setItem('admin', data['data']);
            if(JSON.parse(data['data']).role == 3){
              if(JSON.parse(data['data']).email){
                // console.log("admin email ", JSON.parse(data['data']).email);
                this._commonService.updateStudentList(JSON.parse(data['data']).email);
              }
            }

          } else {
            this._router.navigate(['/admin']);
            notification.showNotification('bottom', 'right', "danger", "Please Login To Proceed", "error");
          }
        },
        (error) => {
          this._router.navigate(['/admin']);
          notification.showNotification('bottom', 'right', "danger", "Please Login To Proceed", "error");
        }
      );
  }
}
