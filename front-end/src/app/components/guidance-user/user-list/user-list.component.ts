import { Component, OnInit, Input } from '@angular/core';
import { CommonService } from '../../../services/common/common.service';
import { CourseService } from '../../../services/course/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentData } from './studentData';
import { StudentService } from '../../../services/student/student.service';


declare var $: any;
declare var notification: any;
@Component({
  selector: 'app-user-list',
  templateUrl: './user-list.component.html',
  styleUrls: ['./user-list.component.css']
})
export class UserListComponent implements OnInit {

  @Input() schoolName : string;
  courses;
  setAge; showDateError; showError;
  addStudentForm: FormGroup
  constructor(private commonService: CommonService,
    private courseService: CourseService, private formBuilder: FormBuilder,
    private studentService: StudentService) { }

  ngOnInit() {
    this.commonService.setPageId(9);
    this.commonService.changeSlidename('Guidance Portal');
    this.getRegisterCourse();
    let self = this;
    this.showError = false;
    $('#birthdate').bootstrapMaterialDatePicker({ weekStart: 0, time: false })
      .on('change', function (e) {
        self.setBirthdate = $('#birthdate').val();
        let age = self.calculateAge($('#birthdate').val());
        self.setAge = age;
        if ($('#birthdate').val() == '') {
          self.showDateError = 'error';
          self.showError = true;
        }
      });

    this.addStudentForm = this.formBuilder.group({
      fullName: [],
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      dateOfBirth: ['', Validators.required],
      course: [],
      course1: ['-1', Validators.required],
      course2: ['-1']
    })
    this.getRegisterCourse();
    this.setSecondCourseList();
    this.onSelectSecondCourse();

  }
  //getter setter


  get firstName() {
    return this.addStudentForm.get('firstName');
  }
  get lastName() {
    return this.addStudentForm.get('lastName');
  }
  get dateOfBirth() {
    return this.addStudentForm.get('dateOfBirth');
  }
  set setBirthdate(value) {
    this.dateOfBirth.setValue(value);
  }
  get fullName() {
    return this.addStudentForm.get('fullName')
  }
  set setFullName(value) {
    this.fullName.setValue(value);
  }

  get firstChoice() {
    return this.addStudentForm.get('course1');
  }

  get secondChoice() {
    return this.addStudentForm.get('course2');
  }
  set setSecondChoice(secondChoice) {
    this.secondChoice.setValue(secondChoice);
  }

  get course() {
    return this.addStudentForm.get('course');
  }
  set setCourse(course) {
    this.course.setValue(course);
  }

  get createdBy(){
    return JSON.parse(localStorage.getItem('admin')).id;
  }

  get updatedBy(){
    return JSON.parse(localStorage.getItem('admin')).id;
  }

  //services
  getRegisterCourse() {
    this.courseService.getRegisterCourse()
    .subscribe(
      data => {
        this.courses = data;
      }, err => {
        console.log(err);
    })
  }

  calculateAge(birthday) {
    let now = new Date();
    let bDate = birthday.split('-');

    let nowMonth = now.getUTCMonth() + 1; //months from 1-12
    let nowDay = now.getUTCDate();
    let nowYear = now.getUTCFullYear();

    let age = nowYear - parseInt(bDate[0]) - 1;

    if (nowMonth > parseInt(bDate[1])) {
      age++;
    } else if (nowMonth == parseInt(bDate[1]) && nowDay >= parseInt(bDate[2])) {
      age++;
    }

    return age;
  }
  onClose() {
   
    $(function () {
      $('#addStudent').modal('toggle');
    });
    this.addStudentForm.reset({course1 : '-1'});
    $('#course2').find('option').remove().end()
    .append($("<option></option>")
      .attr("value", "-1")
      .text("Select Second Choice"));

  }
  setSecondCourseList() {
    let self = this;
    $('#course1').change(function () {
      let selectedVal = this.value;
      console.log("selectedVal ", selectedVal);

      $('#course2').find('option').remove().end()
        .append($("<option></option>")
          .attr("value", "-1")
          .text("Select Second Choice"));
      $.each(self.courses, function (key, value) {
        if (selectedVal != value.id) {

          $('#course2')
            .append($("<option></option>")
              .attr("value", value.id)
              .text(value.name));
        }
      });
      self.setSecondChoice = null;
    })
  }
  onSelectSecondCourse() {
    let self = this;
    $('#course2').change(function () {
      if (this.value != '-1') {
        self.setSecondChoice = this.value;
      } else {

        self.setSecondChoice = null;
      }
    })
  }
  addUser() {
    this.setFullName = this.firstName.value + ' ' + this.lastName.value
    
    if (this.secondChoice.value) {

      this.setCourse = this.firstChoice.value + ', ' + this.secondChoice.value;
    } else {
      this.setCourse = this.firstChoice.value
    }
    let student = new StudentData(
      this.course.value,
      this.firstChoice.value,
      this.secondChoice.value,
      this.fullName.value,
      this.dateOfBirth.value,
      this.schoolName,
      this.createdBy,
      this.updatedBy

    )
    this.studentService.saveStudentByGuidanceUser(student).subscribe(
      (data) => {
        if (data['status'] === true){
          notification.showNotification('bottom','right', "success", "Registration Successfull", "verified_user");
          let admin = JSON.parse(localStorage.getItem('admin'));  
          if(admin.email){
            this.commonService.updateStudentList(admin.email);
          }
          $('#addStudent').modal('toggle');
        }else{
          notification.showNotification('bottom','right', "danger", data['data'], "error");     

        }
      },
      err => {
        notification.showNotification('bottom','right', "danger", "Database Error While Registration", "error");

      }
    )
  }
}
