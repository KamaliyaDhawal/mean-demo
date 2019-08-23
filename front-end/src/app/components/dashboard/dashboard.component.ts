import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { RoundService } from '../../services/round/round.service';
import { CourseService } from '../../services/course/course.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StudentService } from '../../services/student/student.service';

import { ChartOptions, ChartType, ChartDataSets } from 'chart.js';
import { Label } from 'ng2-charts';

declare const $: any;
declare const notification: any;

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  rounds;
  s1Courses;
  s1StudentsTotal;
  s1Applied=0;
  s1Offered=0;
  s1Awaiting=0;
  s1Accepted=0;
  s1Data;
  s2Courses;
  s2StudentsTotal;
  s2Applied=0;
  s2Offered=0;
  s2Awaiting=0;
  s2Accepted=0;
  s2Data;
  selection1Data: FormGroup;
  selection2Data: FormGroup;

  showChart = false;

  barChartColors: Array<any> = [
    { // first color
      backgroundColor: '#66bb6a',
      borderColor: '#66bb6a',
      pointBackgroundColor: '#66bb6a',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#66bb6a'
    },
    { // second color
      backgroundColor: '#26c6da',
      borderColor: '#26c6da',
      pointBackgroundColor: '#26c6da',
      pointBorderColor: '#fff',
      pointHoverBackgroundColor: '#fff',
      pointHoverBorderColor: '#26c6da'
    }];

  barChartOptions: ChartOptions = {
    responsive: true,
  };

  barChartLabels: Label[] = ['No Shows/Applied', 'Offered', 'Awaiting Refs', 'Accepted'];
  barChartType: ChartType = 'bar';
  barChartLegend = true;
  barChartPlugins = [];

  barChartData: ChartDataSets[];

  constructor(
  	private commonService:CommonService,
    private roundService: RoundService,
    private courseService: CourseService,
    private formBuilder: FormBuilder,
    private studentService: StudentService
  ) { }

  ngOnInit() {
  	this.commonService.setPageId(7);
  	this.commonService.changeSlidename('Dashboard');

    this.selection1Data = this.formBuilder.group({
      round: [],
      course: []
    });

    this.selection2Data = this.formBuilder.group({
      round: [],
      course: []
    });

    this.getRounds();
    this.getCount('*','*','S1');
    this.getCount('*','*','S2');
    this.setS1Course = '*';
    this.setS2Course = '*';
    this.setS1Round = '*';
    this.setS2Round = '*';
  }

  getRounds() {
    this.roundService.getAllRound().subscribe(
      (data) => {
        this.rounds = data;
        this.getCourses('*', '*');
      },
      (err) => {
        notification.showNotification('bottom','right', "danger", "Error While Fetching Rounds Data", "error");
      }
    )
  }

  getCourses(round, selection) {
    this.courseService.getCoursesForReports(round)
    .subscribe(
      (data) => {
        if(selection == 'S1') {
          this.s1Courses = data['msg'];
          this.getCount(this.getS1Round.value, '*', 'S1');
        } else if(selection == 'S2'){
          this.s2Courses = data['msg'];
          this.getCount(this.getS2Round.value, '*', 'S2');
        } else if(selection == '*'){
          this.s1Courses = data['msg'];
          this.s2Courses = data['msg'];
          this.getCount(this.getS1Round.value, '*', 'S1');
          this.getCount(this.getS2Round.value, '*', 'S2');
        }
      },
      (err) => {
        notification.showNotification('bottom','right', "danger", "Error While Fetching Course Data", "error");
      }
    )
  }

  changeRound(value, selection) {
    if(selection == 'S1') { 
      this.setS1Round = value;
      this.getCourses(value, 'S1');
    } else if(selection == 'S2') {
      this.setS2Round = value;
      this.getCourses(value, 'S2');
    }
  }

  changeCourse(value, selection) {
    if(selection == 'S1') { 
      this.setS1Course = value;
      this.getCount(this.getS1Round.value, this.getS1Course.value, 'S1');
    } else if(selection == 'S2') {
      this.setS2Course = value;
      this.getCount(this.getS2Round.value, this.getS2Course.value, 'S2');
    }
  }

  getCount(round, course, selection) {
    let data = {
      round : round,
      course : course,
      decision : '*',
      reference: '*'
    }
    this.getStudent(data, (students) => {
      if(selection == 'S1') {
        this.s1StudentsTotal = students.length;
        let s1AppliedArray = students.filter(student => student.decision == 0);
        this.s1Applied = s1AppliedArray.length;
        let s1OfferedArray = students.filter(student => (student.decision > 2 || (student.decision == 1 && student.reference > 0)));
        this.s1Offered = s1OfferedArray.length;
        let s1AwaitingArray = students.filter(student => (student.decision == 1 && student.reference == 0));
        this.s1Awaiting = s1AwaitingArray.length;
        let s1AcceptedArray = students.filter(student => (student.decision > 2));
        this.s1Accepted = s1AcceptedArray.length;

        //this.s1Data = [this.s1Applied, this.s1Offered, this.s1Awaiting, this.s1Accepted]

        //this.barChartData.push({ data: this.s1Data, label: 'Selection 1' });
        if(students > 0) {
          //this.noData = false;
        }
      } else if(selection == 'S2') {
        this.s2StudentsTotal = students.length;
        let s2AppliedArray = students.filter(student => student.decision == 0);
        this.s2Applied = s2AppliedArray.length;
        let s2OfferedArray = students.filter(student => (student.decision > 2 || (student.decision == 1 && student.reference > 0)));
        this.s2Offered = s2OfferedArray.length;
        let s2AwaitingArray = students.filter(student => (student.decision == 1 && student.reference == 0));
        this.s2Awaiting = s2AwaitingArray.length;
        let s2AcceptedArray = students.filter(student => (student.decision > 2));
        this.s2Accepted = s2AcceptedArray.length;
        this.s2Data = [this.s2Applied, this.s2Offered, this.s2Awaiting, this.s2Accepted]
        
        if(students > 0) {
          //this.noData = false;
        }
      }
      this.barChartData = [
        { data: [this.s1Applied, this.s1Offered, this.s1Awaiting, this.s1Accepted], label: 'Selection 1' },
        { data: [this.s2Applied, this.s2Offered, this.s2Awaiting, this.s2Accepted], label: 'Selection 2' }
      ];
      this.showChart = true;
    });
  }

  getStudent(data, cb) {
    this.studentService.getStudents(data)
    .subscribe(
      (data) => {
        if(data['status'] === 1){
          cb(data['msg'])
        } else {
          notification.showNotification('bottom','right', "danger", data['msg'], "error");
        }
      },
      (err) => {
        notification.showNotification('bottom','right', "danger", "Error While Fetching Student Data", "error");
      }
    )
  }

  get getS1Round() {
    return this.selection1Data.get('round');
  }

  set setS1Round(round) {
    this.getS1Round.setValue(round);
  }

  get getS1Course() {
    return this.selection1Data.get('course');
  }

  set setS1Course(course) {
    this.getS1Course.setValue(course);
  }

  get getS2Round() {
    return this.selection2Data.get('round');
  }

  set setS2Round(round) {
    this.getS2Round.setValue(round);
  }

  get getS2Course() {
    return this.selection2Data.get('course');
  }

  set setS2Course(course) {
    this.getS2Course.setValue(course);
  }
}
