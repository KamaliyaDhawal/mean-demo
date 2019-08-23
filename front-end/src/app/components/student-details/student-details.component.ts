import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonService } from '../../services/common/common.service';
import { Location } from '@angular/common';

import * as jsPDF from 'jspdf';


declare var $;
declare var notification;

@Component({
  selector: 'app-student-details',
  templateUrl: './student-details.component.html',
  styleUrls: ['./student-details.component.css']
})
export class StudentDetailsComponent implements OnInit {
	students = [];
  constructor(
      private commonService: CommonService,
  		private route: ActivatedRoute,
      private location: Location
  	) { }

  ngOnInit() {
    this.commonService.changeSlidename('Student Details');
  	if (localStorage.getItem('student')){
      let pageId = parseInt(localStorage.getItem('pageId'));
      this.commonService.setPageId(pageId);
      //this.students = JSON.parse(localStorage.getItem('student'));
      let tempStudents = JSON.parse(localStorage.getItem('student'));

      tempStudents.forEach((student) => {
        let data = {
          fullname:student.fullname,
          mobile:student.mobile,
          birthdate:student.birthdate,
          home_address:student.home_address,
          postcode:student.postcode,
          student_status:student.student_status,
          highest_award:student.highest_award,
          school_name:student.school_name,
          school_number:student.school_number,
          school_address:student.school_address,
          school_leaving_year:student.school_leaving_year,
          mode_status:student.mode_status,
          mode_info:student.mode_info,
          other_examination:student.other_examination,
          other_certificate:student.other_certificate,
          work_experience:student.work_experience,
          disability_condition:student.disability_condition,
          disability_support:student.disability_support,
          roundName:student.roundName,
          roundDate:student.roundDate,
          courseName:student.courseName,
          time:student.time
        }
        this.students.push(data);
      })

  	} else {
      notification.showNotification('bottom','right', "warning", "No Student Available For Detail View", "error");
      this.location.back();
    }
  }

  downloadData() {
    this.opration('download');
  }

  printData() {
    this.opration('print');
  }

  opration(type) {
    let fullDate = new Date();
    let date = fullDate.getDate();
    let doc = new jsPDF('p', 'pt', 'a4');
    let count = $( ".pdf-data" ).find( ".card" );

    for(let i=0; i<count.length; i++) {
      let pdfContent = $(".pdf-"+i).html();
      doc.fromHTML(pdfContent, 100, 100, {
        'width': 500,
      });
      if(i<count.length-1) {
        doc.addPage();
      }
    }
    if (type == 'download') { 
      doc.save('studentlist('+fullDate+').pdf');
    }

    if (type == 'print') {
      doc.autoPrint();
      window.open(doc.output('bloburl'), '_blank');
    }
  }

}
