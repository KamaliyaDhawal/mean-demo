import { Component, OnInit } from '@angular/core';
import { NgModule } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';

import { CommonService } from '../../services/common/common.service';
import { CourseService } from '../../services/course/course.service';
import { RoundService } from '../../services/round/round.service';
import { SlotService } from '../../services/slot/slot.service';
import { NgCircleProgressModule } from 'ng-circle-progress';

declare var $: any;
declare var notification: any;
declare var optionIndex:any;

@Component({
  selector: 'app-slot',
  templateUrl: './slot.component.html',
  styleUrls: ['./slot.component.css']
})
export class SlotComponent implements OnInit {
	courses:any = [];coursesData;round;slots;changeCount=false;saved=false;countNumber;currentRoundData;
  courseName;currentSlot;countData;
  admin = JSON.parse(localStorage.getItem('admin'));

  constructor(
  		private commonService: CommonService,
  		private formBuilder: FormBuilder,
  		private courseService: CourseService,
  		private roundService: RoundService,
  		private slotService: SlotService,
      private router: Router
      ) { 
    
  }

  ngOnInit() {
      this.commonService.setPageId(3);
      this.commonService.currentRound.subscribe( data => this.currentRoundData = data);
      if(this.currentRoundData){
        this.commonService.changeSlidename('Slot');
        this.currentRoundData.course_id = this.currentRoundData.course_id.split(",");
        this.currentRoundData.course_id.forEach((course) => {
          this.courses.push(parseInt(course));
        });

        this.getSlots(this.currentRoundData.id, this.courses[0]);
        this.courseService.getCoursesForSlots(this.courses)
        .subscribe(
          data => {
            this.coursesData = data
            this.courseName = this.coursesData[0].name;
          },
          err => {
            notification.showNotification('bottom','right', "danger", "Error While Getting Courses", "error");
          }
        )
      } else {
        notification.showNotification('bottom','right', "warning", "Slots Are Depended On Round.", "warning");
        this.router.navigate(['/round']);
      }
  }


  chnageSlots(roundId, course){
    this.coursesData.forEach((courseData) => {
      if (courseData.id == course ){
        this.courseName = courseData.name
      }
    });
    this.getSlots(roundId, course);
  }

  getSlots(roundId, course) {
    
    this.slotService.getSlot(roundId, course)
    .subscribe(
      data =>{
        this.slots = data;
      },
  		err => {
        notification.showNotification('bottom','right', "danger", "Error While Getting Slots", "error");
      }
  	)

    this.slotService.findCountData(roundId, course)
    .subscribe(
      countData =>{
        this.countData = countData;
        console.log(this.countData);
      },
      err => {
        notification.showNotification('bottom','right', "danger", "Error While Getting Count Data", "error");
      }
    )
  }

  editCount(slot) {
    let startTag = parseInt(slot.start_time.substring(0, 2)) < 12? 'AM':'PM';
    let endTag = parseInt(slot.end_time.substring(0, 2)) < 12? 'AM':'PM';
    let time = slot.start_time.substring(0, 5)+' '+startTag+' -To- '+slot.end_time.substring(0, 5)+' '+endTag;
    console.log(time);
  	this.changeCount = true;
  	this.setCount = slot.count;
  	this.setId = slot.id;
  	this.setTime = time;
    this.setRound = this.currentRoundData.id;
    this.setCourse = $('#getCourse').val();
  }

  saveSlot() {
  	this.saved = true;
  	this.slotService.saveSlot(this.newSlot.value)
  	.subscribe(
  		data => {
  			//this.successMsg = "Slot Saved";
        notification.showNotification('bottom','right', "success", "Slot Saved", "verified_user");

        this.getCount.reset();
        this.getApplyForAll.reset();
  	    this.getSlots(this.currentRoundData.id, $('#getCourse').val());
      },
      error => {
        //this.errMsg = "While Saved Slot",
        notification.showNotification('bottom','right', "danger", "While Saved Slot", "error");

      }
    )
  	this.saved = false;
    this.changeCount = false;
  }

  newSlot = this.formBuilder.group({
    id: [],
    course: [$('#getCourse').val(), ],
  	round: [ , Validators.required],
  	count: [4, [Validators.required, Validators.pattern('^[0-9]*$')]],
    time: [],
  	applyForAll: [],
  })

  get getCourse(){
  	return this.newSlot.get('course');
  }
  set setCourse(course) {
    this.getCourse.setValue(course);
  }
  get getRound(){
  	return this.newSlot.get('round');
  }

  get getCount(){
  	return this.newSlot.get('count');
  }

  get getId(){
  	return this.newSlot.get('id');
  }

  get getTime() {
    return this.newSlot.get('time');
  }

  get getApplyForAll() {
  	return this.newSlot.get('applyForAll');
  }

  set setCount(count) {
  	this.getCount.setValue(count);
  }

  set setId(id) {
  	this.getId.setValue(id);
  }

  set setTime(time) {
    this.getTime.setValue(time);
  }

  set setRound(round) {
    this.getRound.setValue(round);
  }
}
