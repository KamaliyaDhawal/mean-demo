import { Component, OnInit } from '@angular/core';

import { FormBuilder, Validators } from '@angular/forms';

import { AuthenticationService } from '../../services/auth/authentication.service';
import { Router } from '@angular/router';

declare var $: any;
declare var notification: any;
@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  message;
  submitted: boolean = false;
  verifySubmitted: boolean = false;
  validationFail: boolean = false;
  showVerify: boolean = false;
  step: number = 1;
  token: any = null;
  role: any = null;
  showMobile: '****';
  mobile;

  loadView: any = false;
  constructor(private formBuilder: FormBuilder,
            private _authenticationService: AuthenticationService,
            private router: Router) { }

  ngOnInit() {
    this._authenticationService.checkLogin()
     .subscribe(
       (data) => {
         if(data['status'] === true){
           this.role = JSON.parse(data['data']).role;
           localStorage.setItem('role', this.role);
           if(this.role == "3") {
             this.router.navigate(['/guidance-user']);
           } else {
             this.router.navigate(['/dashboard']);
           }
         } else {
           this.loadView = true;
         }
       },
       (error) => {
         this.router.navigate(['/admin']);
       }
     );
  }

  loginForm = this.formBuilder.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  verificationForm = this.formBuilder.group({
    verificationCode: ['', Validators.required]
  });

  get email(){
    return this.loginForm.get('email');
  }

  get password() {
    return this.loginForm.get('password');
  }

  get getVerificationCode() {
    return this.verificationForm.get('verificationCode');
  }

  login() {
    if(this.loginForm.valid) {
      this.validationFail = false;
      this.submitted = true;
      this._authenticationService.login(this.loginForm.value)
      .subscribe(
        (data: any) => { 
          if(data.status) {
            if(data.JWTtoken) this.token = data.JWTtoken;
            if(data.role) this.role = data.role;
            this.showMobile = data.showMobile;
            this.mobile = data.mobile;
            this._authenticationService.verifyUser(this.mobile, 'send')
            .subscribe(
              data => {
                if(data['status']) {
                  this.showVerify = true;
                  this.step = 2;
                } else {
                  notification.showNotification('bottom','right', "danger", "We Can Not Send You An OTP", "error");
                }
              },
              err => {
                notification.showNotification('bottom','right', "danger", "We Can Not Send You An OTP", "error");
              }
            );
          } else {
            notification.showNotification('bottom','right', "danger", data.errMsg, "error");
            this.message = data.errMsg;
          }
          this.submitted = false;
        },
        (error) => {
          notification.showNotification('bottom','right', error.errMsg);
          this.message = error.errMsg;
          this.submitted = false;
        }
      )

    } else {
      this.submitted = false;
      this.validationFail = true;
    }
  }

  verify() {
    console.log(this.getVerificationCode.value);
    let info = {
      code: this.getVerificationCode.value,
      mobile: this.mobile
    }
    this._authenticationService.verifyUser(info, 'verify')
    .subscribe(
      data => {
        if(data['status']) {
          localStorage.setItem('JWTtoken', this.token);
          localStorage.setItem('role', this.role);
          if(this.role == "3") {
             this.router.navigate(['/guidance-user']);
           } else {
             this.router.navigate(['/dashboard']);
           }
        } else {
          notification.showNotification('bottom','right', "danger", "Your Liberties Admission Login Code Is Invalid", "error");
        }
      },
      err => {
        notification.showNotification('bottom','right', "danger", "Your Liberties Admission Login Code Is Invalid", "error");
      }
    );
  }

}
