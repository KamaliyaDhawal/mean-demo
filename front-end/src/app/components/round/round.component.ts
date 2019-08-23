import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { FormBuilder, Validators } from '@angular/forms';
import { CourseService } from '../../services/course/course.service';
import { RoundService } from '../../services/round/round.service';
import { Router } from '@angular/router';

declare var $: any;
declare var notification: any;

@Component({
  selector: 'app-round',
  templateUrl: './round.component.html',
  styleUrls: ['./round.component.css']
})
export class RoundComponent implements OnInit {
	courses;
	saved: boolean = false;
	rounds;
  roundDetails;
  currentCourses:any;
  createNewRound = true;
  editCourses;
  admin = JSON.parse(localStorage.getItem('admin'));
  constructor(
  						private commonService: CommonService,
  						private formBuilder: FormBuilder,
  						private courseService: CourseService,
  						private roundService: RoundService,
              private router : Router
  					) { }

  ngOnInit() {
  	this.commonService.changeSlidename('Round');
    this.commonService.setPageId(2);
    this.getAllRound();
    this.findCourse();

    // Initilize datepicker;
    let self = this;
    $('#date').bootstrapMaterialDatePicker({ weekStart : 0, time: false, minDate : new Date() })
    .on('change', function(e) {
      self.setDate = $(this).val();
    });
  }

  newRound = this.formBuilder.group({
  	id: [],
  	name: ['', Validators.required],
  	course: [''],
    date: ['', Validators.required]
  });

findCourse() {
  let self = this;
  this.courseService.getCourses('other')
  .subscribe(
    data =>  {
      this.courses = data;
      setTimeout(() => {
        $('#courseSelector').multiselect({
          numberDisplayed: 1,
          includeSelectAllOption: true,
          onSelectAll: function() {
            //self.setCourse = $('#courseSelector').val().join();
            if(self.createNewRound){
              self.setCourse = $('#courseSelector').val().join();
            } else { 
              self.editCourses = $('#courseSelector').val().join();
              if(self.currentCourses === ''){
                self.setCourse = self.editCourses;
              } else {
                self.setCourse = self.currentCourses+ ',' +self.editCourses;
              }
            }
          },
          onDeselectAll: function() {
            //self.setCourse = $('#courseSelector').val().join();
            if(self.createNewRound){
              self.setCourse = $('#courseSelector').val().join();
            } else { 
              self.editCourses = $('#courseSelector').val().join();
              if(self.currentCourses === ''){
                self.setCourse = self.editCourses;
              } else {
                self.setCourse = self.currentCourses+ ',' +self.editCourses;
              }
            }
          },
          maxHeight: 200,
          allSelectedText: 'No option left ...',
          onChange: function(option, checked, select) {
            if(self.createNewRound){
              self.setCourse = $('#courseSelector').val().join();
            } else { 
              self.editCourses = $('#courseSelector').val().join();
              if(self.currentCourses === ''){
                self.setCourse = self.editCourses;
              } else {
                self.setCourse = self.currentCourses+ ',' +self.editCourses;
              }
            }
          },         
        })
      },100);
    },
    error => {
      notification.showNotification('bottom','right', "danger", "Error While Fetching Courses", "error");
    }
  )
}

saveRound() {
  this.saved = true;
  this.roundService.saveRound(this.newRound.value)
  .subscribe(
    data => {
      if(data){
        this.getAllRound();
        this.getName.reset();
        this.getDate.reset();
        this.getId.reset();
        $('#courseSelector').val('');
        $('#courseSelector').multiselect('refresh');
        if(data['status'] === 'error') {
          notification.showNotification('bottom','right', "danger", data['msg'], "error");
        } else {
          notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
        }
      }
    },
    error => {
      notification.showNotification('bottom','right', "danger", "Error While Save Round", "error");
    }
  );
  this.saved = false;
}

getAllRound() {
  this.roundService.getAllRound()
  .subscribe(
    data => {
      this.rounds = data;
    },
    error => {
      notification.showNotification('bottom','right', "danger", "Error While Fetching Round", "error");
    }
  )
}

editRound(round) {
    this.createNewRound = false;
    
    $('#courseSelector').multiselect('refresh');
    this.setId = round.id;
    this.setName = round.name;
    this.setDate = this.fetchDate(round.schedule_dt);
    this.setCourse = round.course_id;

    let option: any = [];
    let currentCourses = JSON.parse("[" + round.course_id + "]");
    this.courses.forEach((course) => {
      if($.inArray(course.id, currentCourses) !== -1 ){
        option.push({label: course.name, title: course.name, value: course.id, disabled: true, selected:true},)
      } else {
        option.push({label: course.name, title: course.name, value: course.id},)
      }

    });

    $('#courseSelector').multiselect('dataprovider', option);
    this.currentCourses = round.course_id;
    
}

getRoundDetails(round) {
  this.roundDetails = round;
}

deleteRound() {
  this.roundService.deleteRound(this.roundDetails).
  subscribe(
    data => {
      this.getAllRound();
      notification.showNotification('bottom','right', "success", "Round Deleted", "delete");
    },
    err => {
      notification.showNotification('bottom','right', "danger", "Error While Delete Round", "error");
    }
  )
}

goToSlot(round) {
  this.commonService.changeRound(round);
  this.router.navigate(['./slot']);
}

/*Getter and setter start*/
  get getName() {
  	return this.newRound.get('name');
  }

  get getCourse() {
  	return this.newRound.get('course');
  }

  get getDate() {
    return this.newRound.get('date');
  }

  set setName(name) {
  	this.newRound.get('name').setValue(name);
  }

  set setCourse(course) {
  	this.newRound.get('course').setValue(course);
  }

  set setId(id) {
  	this.newRound.get('id').setValue(id);
  }

  set setDate(date) {
    this.getDate.setValue(date);
  }

  get getId() {
    return this.newRound.get('id');
  }
/*Getter and setter end*/

  fetchDate(oldDate) {
    let newDate = new Date(oldDate);
    var y = newDate.getFullYear();
    
    var m = newDate.getMonth()+1;
    
    
    var d = newDate.getDate();

    return y+'-'+m+'-'+d;
    
  }
}
