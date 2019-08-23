import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common/common.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {CreateUserService} from '../../services/create-user/create-user.service';

declare var notification: any;
declare var $: any;


@Component({
  selector: 'app-create-user-component',
  templateUrl: './create-user-component.component.html',
  styleUrls: ['./create-user-component.component.css']
})
export class CreateUserComponentComponent implements OnInit {
  userList;
  createUserForm: FormGroup
  mobnumPattern = "^((\\+91-?)|0)?[0-9]{10}$";
  roles = [
    { id: 1, type: 'Admin', },
    { id: 2, type: 'Basic', },
    { id: 3, type: 'Guidance', }]
  constructor(private commonService: CommonService,
    private formBuilder: FormBuilder, private createUserService : CreateUserService) { }

  ngOnInit() {
    this.commonService.setPageId(8);
    this.commonService.changeSlidename('Create New User');

    this.createUserForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      mobile: ['', [Validators.required, Validators.pattern(this.mobnumPattern)]],
      role: ['1', Validators.required],
      guidanceUserSubForm: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        schoolName: [''],
        schoolPhoneNo: ['', [Validators.required]],
        schoolAddress: ['']
      })
    })
    this.getUserList();
    this.setguidanceUserValidation();
  }

  //Getter Setter
  get email() {
    return this.createUserForm.get('email');
  }

  get mobile() {
    return this.createUserForm.get('mobile');
  }
  get role() {
    return this.createUserForm.get('role');
  }

  get firstName() {

    return this.createUserForm.get('guidanceUserSubForm.firstName');
  }

  get lastName() {
    return this.createUserForm.get('guidanceUserSubForm.lastName');

  }

  get schoolName() {
    return this.createUserForm.get('guidanceUserSubForm.schoolName');

  }

  get schoolPhoneNo() {
    return this.createUserForm.get('guidanceUserSubForm.schoolPhoneNo');

  }

  get schoolAddress() {
    return this.createUserForm.get('guidanceUserSubForm.schoolAddress');

  }

  setguidanceUserValidation() {

    this.createUserForm.get('role').valueChanges.subscribe(role => {

      if (role == 3) {
        Object.keys(this.createUserForm.controls['guidanceUserSubForm'].value).forEach(key => {


          // if (key == 'schoolPhoneNo') {
          //   return this.createUserForm.get('guidanceUserSubForm.' + key).setValidators([Validators.required, Validators.pattern(this.mobnumPattern)]);
          // } else {
          //   return this.createUserForm.get('guidanceUserSubForm.' + key).setValidators([Validators.required]);

          // }


        });

      } else {

        Object.keys(this.createUserForm.controls['guidanceUserSubForm'].value).forEach(key => {

          this.createUserForm.get('guidanceUserSubForm.' + key).clearValidators();
          this.createUserForm.get('guidanceUserSubForm.' + key).updateValueAndValidity();

        });
      }
      console.log(this.createUserForm.controls['guidanceUserSubForm']);
    })
  }
  getUserList(){
    this.createUserService.getUserList().subscribe((data:any)=>{
      this.userList = data.data;
    })
  }
  onCreateUser(){
    if(this.role.value != 3){
      this.createUserForm.value.guidanceUserSubForm = null;
    }
    this.createUserService.createUser(this.createUserForm.value).subscribe((data:any) => {
      if(!data.status){
          notification.showNotification('bottom','right', "danger", data.errMsg, "error");
      }else{
          notification.showNotification('bottom','right', "success", data.msg, "verified_user");
          this.getUserList();
          $('#createUserComponent').modal('toggle');
      }

    });
  }
  openCreateUserModel(){
    let self = this;
    $(function () {
      $('#createUserComponent').modal('toggle');
      self.createUserForm.reset();
    });
  }
}
