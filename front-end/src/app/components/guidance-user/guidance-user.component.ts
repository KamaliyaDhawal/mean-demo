import { Component, OnInit, ViewChild } from '@angular/core';
import { CommonService } from '../../services/common/common.service';
import { GuidanceUserService } from 'src/app/services/guidance-user/guidance-user.service';
import { StudentService } from '../../services/student/student.service';
import { UserListComponent } from './user-list/user-list.component';
declare var $: any;

@Component({
  selector: 'app-guidance-user',
  templateUrl: './guidance-user.component.html',
  styleUrls: ['./guidance-user.component.css']
})
export class GuidanceUserComponent implements OnInit {
  schoolName;
  studentsList;
  @ViewChild(UserListComponent) userListComponent : UserListComponent;
  constructor(private commonService: CommonService,
    private guidanceUserService: GuidanceUserService,
    private studentService: StudentService) { }

  ngOnInit() {
    this.commonService.setPageId(9);
    this.commonService.changeSlidename('Guidance Portal');
    this.commonService.studentListData.subscribe(data => {
     
      if (data) {

        this.getGuidanceUserInfo(data);
      } else {
        this.studentsList = [];
      }
    });
  }
  getGuidanceUserInfo(email) {

    this.guidanceUserService.getUserInfo(email).subscribe((data: any) => {
      if (data.status) {
        this.schoolName = data.data;

        this.studentService.getStudentList(this.schoolName).subscribe((stdList: any) => {

          this.studentsList = stdList['data'];

        })
      } else {
        this.schoolName = "ERROR"
      }
    });

  }
  openModelToAddStudent() {
    $(function () {
      $('#addStudent').modal('toggle');
    });
    this.userListComponent.addStudentForm.reset({course1: '-1'});
  }
}
