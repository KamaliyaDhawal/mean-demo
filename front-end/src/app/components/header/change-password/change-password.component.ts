import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ChangePasswordService } from '../../../services/changePassword/change-password.service';

declare var $: any;
declare var notification: any;
@Component({
  selector: 'app-change-password',
  templateUrl: './change-password.component.html',
  styleUrls: ['./change-password.component.css']
})
export class ChangePasswordComponent implements OnInit {
  changePasswordForm : FormGroup
  constructor(private formBuilder: FormBuilder,
              private _changePasswordService : ChangePasswordService) { }

  ngOnInit() {
    let regexPwd = "^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,10}$";
    console.log(regexPwd)
    this.changePasswordForm = this.formBuilder.group({
      oldPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.pattern(regexPwd)]],
      confirmPassword: ['', Validators.required]
  
    }, {validator: this.checkPasswords });
    this.changePasswordForm.reset();
  }


  checkPasswords(group: FormGroup) { // here we have the 'passwords' group
    let pass = group.controls.newPassword.value;
    let confirmPass = group.controls.confirmPassword.value;

    return pass === confirmPass ? false : { notSame: true }     
  }


  get f() {return this.changePasswordForm.controls}

  changePassword(){

    this._changePasswordService.changePassword(this.changePasswordForm.value)
      .subscribe((data:any) => {
        if(!data.status){

            notification.showNotification('bottom','right', "danger", data.errMsg, "error");
        }else{
            notification.showNotification('bottom','right', "success", data.msg, "verified_user");
            $('#changePassword').modal('toggle');
            
        }

      });
    this.changePasswordForm.reset();

  }
  onClose(){
    $(function () {
        $('#changePassword').modal('toggle');
    });
    this.changePasswordForm.reset();

  }
}
