import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { StudentService } from '../../services/student/student.service';
import { RoundService } from '../../services/round/round.service';
import { CourseService } from '../../services/course/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ExportService } from '../../services/export/export.service';

import { Router } from '@angular/router';

import { DatePipe } from '@angular/common';

declare var $: any;
declare var notification: any;

@Component({
  selector: 'app-students',
  templateUrl: './students.component.html',
  styleUrls: ['./students.component.css']
})

export class StudentsComponent implements OnInit {
	students;
  rounds;
  currentDate = this.formatDate(new Date());
  currentRound;
  currentRoundCourses;
  currentCourses;
  courses;
  currentDecision="*";
  currentReference="*";
  noData;
  print=false;
  searchText;

  customMail = "Dear {{StudentName}}, Thank You For Applying For {{CourseName}}.";
  customSMS = "Dear {{StudentName}}, Thank You For Applying For {{CourseName}}.";
  customMailSubject = "{{StudentName}} Application";

  StudentName = "{{StudentName}}"
  CourseName = "{{CourseName}}";

  showLoader = false;

  currentData: FormGroup;
  
  decisions = [
    {id:'*', value:'All'},
    {id:0, value:'Applied'},
    {id:1, value:'Accepted'},
    {id:2, value:'Rejected'},
    {id:3, value:'Deposit Paid'},
    {id:4, value:'Fully Paid'}
  ];

  references = [
    {id:'*', value:'All'},
    {id:0, value:'None'},
    {id:1, value:'One'},
    {id:2, value:'Two'}
  ];

  roundRefe: FormGroup;

  pipe = new DatePipe('en-US');

  constructor(
  		private commonService: CommonService,
  		private studentService: StudentService,
      private roundService: RoundService,
      private courseService: CourseService,
      private formBuilder: FormBuilder,
      private exportService: ExportService,
      private router: Router
  	) { }

  ngOnInit() {
    
  this.currentData = this.formBuilder.group({
    round: [],
    course: [],
    decision: ['*', ],
    reference: ['*', ]
  });

  this.roundService.getAllRound().subscribe(
    (data) => {
      this.rounds = data;
      this.rounds.forEach((round) => {
        round.schedule_dt = this.formatDate(round.schedule_dt);
        if(this.currentDate == round.schedule_dt) {
          this.currentRound=round;
          this.setRound = this.currentRound.id;
          this.currentRoundCourses="("+round.course_id+")";

          this.courses = round.course_id.split(",");
          this.setCourse = '*';
          this.setDecision = '*';
          this.setReference = '*';
          this.getCourses(this.currentRoundCourses);
          this.getStudent();
        }
      })
    },
    (err) => {
      notification.showNotification('bottom','right', "danger", "Error While Fetching Rounds Data", "error");
    }
  )
  this.commonService.changeSlidename('Students');
  this.commonService.setPageId(4);
  }

  sendCustomData(type) {
    this.showLoader = true;
    let students = this.students;
    let data = {}
    if ( type == 'email' ) {
      let emailBody = this.customMail;
      let emailSubject = this.customMailSubject;
      data = { emailSubject, emailBody };
    } else if( type == 'sms' ){
      data = this.customSMS;
    }

    this.studentService.sendCustomData(type, students, data)
    .subscribe(
      (data) => {
        this.showLoader = false;
        debugger;
        if(data['status'] == 1) {
          notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
          this.getStudent();
        } else {
          notification.showNotification('bottom','right', "warning", data['msg'], "error");
          this.getStudent();
        }
      },
      (err) => {
        this.showLoader = false;  
        notification.showNotification('bottom','right', "error", 'Error While Sending '+type, "error");
        this.getStudent();
      }
    )
  }

  studentsDetails() {
    localStorage.setItem('student', JSON.stringify(this.students));
    localStorage.setItem('pageId', '4');
    this.router.navigate(['/student-details']);
  }

  editStudent(student) {
    let id = btoa('@#$33FVCvfrt&*(FG'+student);
    let url = '/#/update-student/'+id;
    window.open(url);
  }

  getStudent() {
  	let data = {
  		round : this.getRound.value,
  		course : this.getCourse.value,
  		decision : this.getDecision.value,
  		reference: this.getReference.value
  	}

    this.studentService.getStudents(data)
    .subscribe(
      (data) => {
        if(data['status'] === 1){
          this.students = data['msg'];
        } else {
          notification.showNotification('bottom','right', "danger", data['msg'], "error");
        }
      },
      (err) => {
        notification.showNotification('bottom','right', "danger", "Error While Fetching Student Data", "error");
      }
    )
  }

  getCourses(round) {
    this.courseService.getCoursesByRound(round)
    .subscribe(
      (data) => {
        this.currentCourses = data['msg'];
      },
      (err) => {
        notification.showNotification('bottom','right', "danger", "Error While Fetching Course Data", "error");
      }
    )
  }

  formatDate(date) {
    var d = new Date(date),
        month = '' + (d.getMonth() + 1),
        day = '' + d.getDate(),
        year = d.getFullYear();

    if (month.length < 2) month = '0' + month;
    if (day.length < 2) day = '0' + day;

    return [year, month, day].join('-');
  }

  changeCourse(selectedCourse) {
    this.setCourse = selectedCourse;
    this.getStudent();
  }

  updateStudent(type, student, value){
    let round = student.round;
    let course = student.course;
    let studentId = student.student_id;
    let data = {type, round, course, studentId, value}
    this.studentService.updateStudents(data)
    .subscribe(
       (data) => {
         if(data['status'] == 1) {
           notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
           this.getStudent();
         } else {
           notification.showNotification('bottom','right', "danger", data['msg'], "error");  
         }
       },
       (err) => {
         notification.showNotification('bottom','right', "danger", 'Error While Update Data', "error");
       }
    )
  }

  exportFile() {
    this.getData('null', (data) => {
      this.exportService.exportAsExcelFile(data, 'StudentData('+this.pipe.transform(new Date(), 'short')+')');
    });
  }

  sendMail() {
    this.getData('full', (data) => {
      this.studentService.sendMail(data)
      .subscribe(
        (data) => {
          if(data['status'] == 1) {
           notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
           this.getStudent();
          } else {
            notification.showNotification('bottom','right', "warning", data['msg'], "verified_user");
            this.getStudent();
          }
        },
        (err) => {
          notification.showNotification('bottom','right', "danger", "Error While Sending Mails", "error"); 
        }
      )
    })
  }

  sendSMS() {

    this.getData('full', (data) => {
      this.studentService.sendSMS(data)
      .subscribe(
        (data) => {
          if(data['status'] == 1) {
           notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
           this.getStudent();
          } else {
            notification.showNotification('bottom','right', "warning", data['msg'], "verified_user");
            this.getStudent();
          }
        },
        (err) => {
          notification.showNotification('bottom','right', "danger", "Error While Sending SMS", "error"); 
        }
      )
    });
  }

  printReports() {
    this.print = true;
    setTimeout(()=> {
      window.print();
      this.print = false;
    }, 50)
  }

  getData(type, cb) {
    let data:{[k: string]: any} = {};
    let dataArray = [];
    let fullDataArray = [];
    let i = 0;

    this.students.forEach((tempData)=> {

      if(tempData.fullname != null || tempData.fullname != "") {
        data.Name = tempData.fullname;
      } else if(tempData.firstname != null || tempData.firstname != ""){
        data.Name = tempData.firstName;
      } else {
        data.Name = "N/A";
      }

      if(tempData.email != null || tempData.email != "") {
        data.Email = tempData.email;
      } else {
        data.Email = "N/A";
      }

      if(tempData.student_id != null || tempData.student_id != "") {
        data.StudentId = tempData.student_id;
      } else {
        data.StudentId = "N/A";
      }      

      if(tempData.mobile != null || tempData.mobile != "") {
        data.Mobile = tempData.mobile;
      } else {
        data.Mobile = "N/A";
      }

      if(tempData.birthdate != null || tempData.birthdate != "") {
        data.birthdate = this.pipe.transform(tempData.birthdate, 'short');
      } else {
        data.birthdate = "N/A";
      }

      if(tempData.gender != null || tempData.gender != "") {
        if(tempData.gender == 1) {
          data.gender = 'Male';
        } else if(tempData.gender == 2) {
          data.gender = 'Female';
        } else {
          data.gender = 'Other';
        }
      } else {
        data.gender = "N/A";
      }

      if(tempData.time != null || tempData.time != "") {
        data.Time = tempData.time;
        //const now = Date.now();
        
      } else {
        data.Time = "N/A";
      }

      this.decisions.forEach((decision) => {
        if(decision.id == tempData.decision) {
          data.Decision = decision.value;
        }
      });

      this.references.forEach((reference) => {
        if(reference.id == tempData.reference) {
          data.Reference = reference.value;
        }
      })

      if(tempData.roundName != null || tempData.roundName != "") {
        data.roundName = tempData.roundName;
      }

      if(tempData.roundDate != null || tempData.roundDate != "") {
        data.roundDate = this.pipe.transform(tempData.roundDate, 'short');
      }

      if(tempData.courseName != null || tempData.courseName != "") {
        data.courseName = tempData.courseName;
      }

      if(tempData.decision == 1 || tempData.decision == 3 || tempData.decision == 4) {
        data.status = 'Accepted';
      } else if(tempData.decision == 0){
        data.status = 'Applied';
      } else {
        data.status = 'Rejected';
      }

      if(tempData.home_tel_number != null || tempData.home_tel_number != "") {
        data.home_tel_number = tempData.home_tel_number;
      } else {
        data.home_tel_number = "N/A";
      }

      if(tempData.home_address != null || tempData.home_address != "") {
        data.home_address = tempData.home_address;
      } else {
        data.home_address = "N/A";
      }

      if(tempData.postcode != null || tempData.postcode != "") {
        data.postcode = tempData.postcode;
      } else {
        data.postcode = "N/A";
      }

      if(tempData.guardin_name != null || tempData.guardin_name != "") {
        data.guardin_name = tempData.guardin_name;
      } else {
        data.guardin_name = "N/A";
      }

      if(tempData.guardin_number != null || tempData.guardin_number != "") {
        data.guardin_number = tempData.guardin_number;
      } else {
        data.guardin_number = "N/A";
      }

      if(tempData.nationality_status != null || tempData.nationality_status != "") {
        if(tempData.nationality_status == 1){
          data.nationality_status = 'Irish';
        } else if(tempData.nationality_status == 2){
          data.nationality_status = 'EU National';
        } else if(tempData.nationality_status == 3){
          data.nationality_status = 'Non-EU National';
        } else {
          data.nationality_status = 'Accorded refugee status';
        }
      } else {
        data.nationality_status = "N/A";
      }

      if(tempData.nationality_info != null || tempData.nationality_info != "") {
        data.nationality_info = tempData.nationality_info;
      } else {
        data.nationality_info = "N/A";
      }

      if(tempData.hse_medical_status != null || tempData.hse_medical_status != "") {
        if (tempData.hse_medical_status == 0) {
          data.hse_medical_status = false;
        } else {
          data.hse_medical_status = true;
        }
      } else {
        data.hse_medical_status = "N/A";
      }

      if(tempData.student_status != null || tempData.student_status != "") {
        if(tempData.student_status == 1){
          data.student_status = 'Attending school';
        } else if(tempData.student_status == 2){
          data.student_status = 'Left School';
        } else if(tempData.student_status == 3){
          data.student_status = 'Training / SOLAS';
        } else if(tempData.student_status == 4){
          data.student_status = 'Further Education';
        } else if(tempData.student_status == 5){
          data.student_status = 'Third Level';
        } else if(tempData.student_status == 6){
          data.student_status = 'Working';
        }
      } else {
        data.student_status = "N/A";
      }

      if(tempData.highest_award != null || tempData.highest_award != "") {
        if(tempData.highest_award == 1){
          data.highest_award = 'Junior Certificate';
        } else if(tempData.highest_award == 2){
          data.highest_award = 'Leaving Certificate';
        } else if(tempData.highest_award == 3){
          data.highest_award = 'Level 5 QQI';
        } else if(tempData.highest_award == 4){
          data.highest_award = 'Level 6 QQI';
        } else if(tempData.highest_award == 5){
          data.highest_award = 'Degree or above';
        } 
      } else {
        data.highest_award = "N/A";
      }

      if(tempData.school_name != null || tempData.school_name != "") {
        data.school_name = tempData.school_name;
      } else {
        data.school_name = "N/A";
      }

      if(tempData.school_number != null || tempData.school_number != "") {
        data.school_number = tempData.school_number;
      } else {
        data.school_number = "N/A";
      }

      if(tempData.school_address != null || tempData.school_address != "") {
        data.school_address = tempData.school_address;
      } else {
        data.school_address = "N/A";
      }

      if(tempData.school_leaving_year != null || tempData.school_leaving_year != "") {
        data.school_leaving_year = tempData.school_leaving_year;
      } else {
        data.school_leaving_year = "N/A";
      }

      if(tempData.mode_status != null || tempData.mode_status != "") {
        if (tempData.mode_status == 1) {
          data.mode_status = 'Traditional';
        } else if (tempData.mode_status == 2) {
          data.mode_status = 'LCVP';
        } else if (tempData.mode_status == 3) {
          data.mode_status = 'LCA';
        } else if (tempData.mode_status == 4) {
          data.mode_status = 'Other';
        }
      } else {
        data.mode_status = "N/A";
      }

      if(tempData.other_examination != null || tempData.other_examination != "") {
        data.other_examination = tempData.other_examination;
      } else {
        data.other_examination = "N/A";
      }

      if(tempData.other_certificate != null || tempData.other_certificate != "") {
        data.other_certificate = tempData.other_certificate;
      } else {
        data.other_certificate = "N/A";
      }

      if(tempData.work_experience != null || tempData.work_experience != "") {
        data.work_experience = tempData.work_experience;
      } else {
        data.work_experience = "N/A";
      }

      if(tempData.disability_condition != null || tempData.disability_condition != "") {
        if (tempData.disability_condition == 1) {
          data.disability_condition = 'Walking Difficulty';
        } else if (tempData.disability_condition == 2) {
          data.disability_condition = 'Wheelchair user';
        } else if (tempData.disability_condition == 3) {
          data.disability_condition = 'Impaired hearing';
        } else if (tempData.disability_condition == 4) {
          data.disability_condition = 'Impaired vision';
        } else if (tempData.disability_condition == 5) {
          data.disability_condition = 'Impaired speech';
        } else if (tempData.disability_condition == 6) {
          data.disability_condition = 'Other';
        }
      } else {
        data.disability_condition = "N/A";
      }

      if(tempData.disability_support != null || tempData.disability_support != "") {
        if (tempData.disability_support == 1) {
          data.disability_support = 'Laptop';
        } else if (tempData.disability_support == 2) {
          data.disability_support = 'Reader / Scribe';
        } else if (tempData.disability_support == 3) {
          data.disability_support = 'Other';
        }
      } else {
        data.disability_support = "N/A";
      }

      if(tempData.disability_info != null || tempData.disability_info != "") {
        data.disability_info = tempData.disability_info;
      } else {
        data.disability_info = "N/A";
      }

      if(tempData.course_reference != null || tempData.course_reference != "") {
        if (tempData.course_reference == 1) {
          data.course_reference = 'Your School';
        } else if (tempData.course_reference == 2) {
          data.course_reference = 'Guidance Counsellor';
        } else if (tempData.course_reference == 3) {
          data.course_reference = 'Promotion by CDETB';
        } else if (tempData.course_reference == 4) {
          data.course_reference = 'Liberties student';
        } else if (tempData.course_reference == 5) {
          data.course_reference = 'Parent / Friend';
        } else if (tempData.course_reference == 6) {
          data.course_reference = 'Social Media';
        } else if (tempData.course_reference == 7) {
          data.course_reference = 'Radio';
        }
      } else {
        data.course_reference = "N/A";
      }

      if(tempData.first_ref_name != null || tempData.first_ref_name != "") {
        data.first_ref_name = tempData.first_ref_name;
      } else {
        data.first_ref_name = "N/A";
      }

      if(tempData.first_ref_number != null || tempData.first_ref_number != "") {
        data.first_ref_number = tempData.first_ref_number;
      } else {
        data.first_ref_number = "N/A";
      }

      if(tempData.second_ref_name != null || tempData.second_ref_name != "") {
        data.second_ref_name = tempData.second_ref_name;
      } else {
        data.second_ref_name = "N/A";
      }

      if(tempData.second_ref_number != null || tempData.second_ref_number != "") {
        data.second_ref_number = tempData.second_ref_number;
      } else {
        data.second_ref_number = "N/A";
      }

      if(tempData.written_reference_status != null || tempData.written_reference_status != "") {
        data.written_reference_status = tempData.written_reference_status;
      } else {
        data.written_reference_status = "N/A";
      }

      if(tempData.cdetb_confirmation != null || tempData.cdetb_confirmation != "") {
        data.cdetb_confirmation = tempData.cdetb_confirmation;
      } else {
        data.cdetb_confirmation = "N/A";
      }

      if(tempData.subscriber_status != null || tempData.subscriber_status != "") {
        data.subscriber_status = tempData.subscriber_status;
      } else {
        data.subscriber_status = "N/A";
      }

      if(tempData.signature != null || tempData.signature != "") {
        data.signature = tempData.signature;
      } else {
        data.signature = "N/A";
      }


      dataArray.push(
          {
            'Student_Name': data.Name,
            'Student_Id': data.StudentId,
            'Email':data.Email, 
            'Mobile':data.Mobile, 
            'Birth Date':data.birthdate, 
            'Gender':data.gender, 
            'Home Tel Number': data.home_tel_number, 
            'Home Address': data.home_address, 
            'Postcode': data.postcode, 
            'Guardian Name': data.guardin_name, 
            'Guardian Number': data.guardin_number,
            'Nationality Status': data.nationality_status,
            'Countruy' : data.nationality_info,
            'Hse Medical Status': data.hse_medical_status,
            'Student Current Status': data.student_status,
            'Highest Award' : data.highest_award,
            'School Name': data.school_name,
            'School Number': data.school_number,
            'School Address': data.school_address,
            'School Leaving Year': data.school_leaving_year,
            'Mode Status': data.mode_status,
            'Other Examination': data.other_examination,
            'Other Certificate': data.other_certificate,
            'Work Experience': data.work_experience,
            'Disability Condition': data.disability_condition,
            'Disability Support': data.disability_support,
            'Disability Info': data.disability_info,
            'Course Reference': data.course_reference,
            'First Ref Name' : data.first_ref_name,
            'First Ref Nunber' : data.first_ref_number,
            'Second Ref Name' : data.second_ref_name,
            'Second Ref Nunber' : data.second_ref_number,
            'Round Name': data.roundName, 
            'Round_Date': data.roundDate, 
            'Course_Name': data.courseName, 
            'Slot_Time': data.Time, 
            'Decision':data.Decision,
            'Reference Status': data.written_reference_status,
            'CDETB Status': data.cdetb_confirmation,
            'Subscriber Status': data.subscriber_status,
            'Signature': data.signature,
            'Reference': data.Reference, 
            'mail_sent': tempData.mail_sent, 
            'status': data.status, 
            'sms_sent': tempData.sms_sent
          });

      fullDataArray.push(
        {
          'student_Id':tempData.studentId,
          'Student_Id': data.StudentId,
          'Student_Name': data.Name, 
          'Email':data.Email, 
          'Mobile':data.Mobile , 
          'Birth Date':data.birthdate, 
          'Gender':data.gender, 
          'Home Tel Number': data.home_tel_number, 
          'Home Address': data.home_address, 
          'Postcode': data.postcode, 
          'Guardian Name': data.guardin_name, 
          'Guardian Number': data.guardin_number,
          'Nationality Status': data.nationality_status,
          'Countruy' : data.nationality_info,
          'hse Medical Status': data.hse_medical_status,
          'Student Current Status': data.student_status,
          'Highest Award' : data.highest_award,
          'School Name': data.school_name,
          'School Number': data.school_number,
          'School Address': data.school_address,
          'School Leaving Year': data.school_leaving_year,
          'Mode Status': data.mode_status, 
          'Other Examination': data.other_examination,
          'Other Certificate': data.other_certificate,
          'Work Experience': data.work_experience,
          'Disability Condition': data.disability_condition,
          'Disability Support': data.disability_support,
          'Disability Info': data.disability_info,
          'Course Reference': data.course_reference,
          'First Ref Name' : data.first_ref_name,
          'First Ref Number' : data.first_ref_number,
          'Second Ref Name' : data.second_ref_name,
          'Second Ref Number' : data.second_ref_number,
          'Round':tempData.round, 
          'Round_Name': data.roundName, 
          'Round_Date': data.roundDate, 
          'Course':tempData.course, 
          'Course_Name': data.courseName, 
          'Slot_Time': data.Time, 
          'Decision':data.Decision,
          'Reference Status': data.written_reference_status,
          'CDETB Statua': data.cdetb_confirmation,
          'Subscriber Status': data.subscriber_status,
          'Signature': data.signature,
          'Reference': data.Reference,
          'mail_sent': tempData.mail_sent, 
          'status': data.status, 
          'sms_sent': tempData.sms_sent
        });
   
    });

    if (type == "full") {
      cb(fullDataArray);
    } else {
      cb(dataArray);
    }
  }

  // findStudentByStatus(type, value) {
  //   let round = this.getRound.value;
  //   let course = this.getCourse.value;
    
  //   if (type == 'decision') {
  //     this.currentDecision = value;
  //   } else if (type == 'reference') {
  //     this.currentReference = value;
  //   }

  //   let data = { round, course, decision:this.currentDecision , reference:this.currentReference }

  //   this.studentService.findStudentByStatus(data)
  //   .subscribe(
  //     (data) => {
  //       if(data['status'] == 1) {
  //         this.students = data['msg'];
  //         if(data['msg'].length > 0) {
  //           this.noData = false;
  //         }
  //       } else {
  //         notification.showNotification('bottom','right', 'danger', 'Database Error While Fetching Data By Status', 'error');
  //       }
  //     },
  //     (err) => {
  //       notification.showNotification('bottom','right', 'danger', 'Error While Fetching Data By Status', 'error');
  //     }
  //   )
  // }

  search(value) {
    this.searchText = value;
  }

  get getRound() {
    return this.currentData.get('round');
  }

  set setRound(round) {
    this.getRound.setValue(round);
  }

  get getCourse() {
    return this.currentData.get('course');
  }

  set setCourse(course) {
    this.getCourse.setValue(course);
  }

  get getDecision() {
    return this.currentData.get('decision');
  }

  set setDecision(decision) {
    this.getCourse.setValue(decision);
  }

  get getReference() {
    return this.currentData.get('reference');
  }

  set setReference(reference) {
    this.getReference.setValue(reference);
  }

}
