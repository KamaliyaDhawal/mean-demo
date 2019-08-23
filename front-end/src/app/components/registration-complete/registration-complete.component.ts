import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-registration-complete',
  templateUrl: './registration-complete.component.html',
  styleUrls: ['./registration-complete.component.css']
})
export class RegistrationCompleteComponent implements OnInit {
	studentData:any;
  constructor() { }

  ngOnInit() {
  	this.studentData = JSON.parse(localStorage.getItem('studentData'));
  	console.log(this.studentData);
  }

}
