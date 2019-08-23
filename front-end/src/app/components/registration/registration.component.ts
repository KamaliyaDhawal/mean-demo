import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators, FormControl, FormArray, FormGroup } from '@angular/forms';

import { RegistrationService } from '../../services/registration/registration.service';
import { CourseService } from '../../services/course/course.service';
import { Student } from './student';
import { StudentService } from '../../services/student/student.service';

import { Router, Event, NavigationEnd, ActivatedRoute } from '@angular/router';

declare var $: any;
declare var notification: any;

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent implements OnInit {
  courses; showDateError: any = null; showCourseError: any = null; secondChoiceError: any = null; firstChoiceError: any = null;
  showFirstChoice = false; showError = false;
  newStudent: FormGroup; showRefFlag: boolean = false; submited = false;
  studentUID = null; oldStudent;
  schoolInfo = [];
  schoolData = { id: null, name: '' };
  canGetSchoolInfo = true;
  results = [
    { id: 1, name: 'Leaving Certificate' },
    { id: 2, name: 'Junior Examination Results: Certificate' },
    { id: 3, name: 'Other' }
  ];
  courseReferences = [
    { id: 1, value: 'Your School' },
    { id: 2, value: 'Guidance Counsellor' },
    { id: 3, value: 'Promotion by CDETB' },
    { id: 4, value: 'Liberties student' },
    { id: 5, value: 'Parent / Friend' },
    { id: 6, value: 'Social Media' },
    { id: 7, value: 'Radio' },
  ];
  studentStatusData = [
    { id: 1, value: 'Attending school' },
    { id: 2, value: 'Left School' },
    { id: 3, value: 'Training / SOLAS' },
    { id: 4, value: 'Further Education' },
    { id: 5, value: 'Third Level' },
    { id: 6, value: 'Working' },
  ];
  nationalityStatuses = [
    { id: 1, value: 'Irish' },
    { id: 2, value: 'EU National' },
    { id: 3, value: 'Non-EU National' },
    { id: 4, value: 'Accorded refugee status' },
  ];
  disabilityConditions = [
    { id: 1, value: 'Walking Difficulty' },
    { id: 2, value: 'Wheelchair user' },
    { id: 3, value: 'Impaired hearing' },
    { id: 4, value: 'Impaired vision' },
    { id: 5, value: 'Impaired speech' },
    { id: 6, value: 'Other' },
  ];
  disabilitySupports = [
    { id: 1, value: 'Laptop' },
    { id: 2, value: 'Reader / Scribe' },
    { id: 3, value: 'Other' },
  ];
  awardData = [
    { id: 1, value: 'Junior Certificate' },
    { id: 2, value: 'Leaving Certificate' },
    { id: 3, value: 'Level 5 QQI' },
    { id: 4, value: 'Level 6 QQI' },
    { id: 5, value: 'Degree or above' }
  ]
  rowShow: number = 1; otherRows = null;

  resultControls = this.results.map(result => new FormControl(false));
  constructor(private formBuilder: FormBuilder,
    private registrationService: RegistrationService,
    private courseService: CourseService,
    private studentService: StudentService,
    private router: Router,
    private activatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {
    let self = this;
    this.getRegisterCourse();
    $('#birthdate').bootstrapMaterialDatePicker({ weekStart: 0, time: false })
      .on('change', function (e) {
        self.setBirthdate = $('#birthdate').val();
        let age = self.calculateAge($('#birthdate').val());
        self.setAge = age;
        if ($('#birthdate').val() == '') {
          self.showDateError = 'error';
        }
      });

    setTimeout(() => {
      $('#secondChoice').multiselect({
        onChange: (option) => {
          if ($('#secondChoice').val() == null) {
            self.secondChoiceError = 'error';
          } else {
            self.secondChoiceError = null;
          }

          var valuesSecondChoice = [];
          $('#secondChoice option').each(function () {
            if ($(this).val() !== option.val()) {
              valuesSecondChoice.push($(this).val());
            }
          });
          $('#secondChoice').multiselect('deselect', valuesSecondChoice);

          this.setSecondChoice = $('#secondChoice').val();
        },
        maxHeight: 200
      })
    }, 200
    );



    // Create form
    this.newStudent = this.formBuilder.group({

      course: [],
      firstChoice: [, Validators.required],
      secondChoice: [],

      personalDetails: this.formBuilder.group({
        fullName: [],
        firstName: [, Validators.required],
        lastName: [, Validators.required],
        email: [, [Validators.required, Validators.email]],
        mobile: [, [Validators.required, Validators.pattern('^[0-9]*$')]],
        homeTelNumber: [, Validators.pattern('^[0-9]*$')],
        birthdate: ['', Validators.required],
        age: [],
        gender: [, Validators.required],
        homeAddress: [, Validators.required],
        postcode: [],
        PPSnumber: [, [Validators.required, Validators.pattern('^[a-zA-Z0-9]{0,10}$')]],
        studentInfo: []
      }),

      guardianName: [],
      guardianPhone: [, Validators.pattern('^[0-9]*$')],

      hseMedicalCardStatus: [, Validators.required],


      nationalityStatus: [, Validators.required],
      nationalityInfo: [],

      educationDetails: this.formBuilder.group({
        studentStatus: [],
        highestAward: [],
        schoolName: [],
        schoolNumber: [, Validators.pattern('^[a-zA-Z0-9]{0,10}$')],
        schoolLeavingYear: [, Validators.pattern('^[0-9]{4}$')],
        schoolAddress: []
      }),

      leavingCertificateDetails: this.formBuilder.group({
        schoolId: [],
        schoolName: [],
        schoolNumber: [, Validators.pattern('^[a-zA-Z0-9]{0,10}$')],
        schoolLeavingYear: [, Validators.pattern('^[0-9]{4}$')],
        schoolAddress: [],
        modeStatus: [],
        modeInfo: [],
        exminationResults: new FormArray(this.resultControls),
        exminationResultsStatus: [],
        subjectWiseResults: new FormArray([this.createSubject()]),
        extraCertificate: [],
        otherExamination: [],
        workExperience: [],
      }),

      workExperience: [],

      disabilityCondition: [],
      disabilitySupport: [],
      disabilityInfo: [],
      courseReference: [],

      writtenReferenceStatus: [, Validators.requiredTrue],
      firstWrittenReferenceName: [],
      firstWrittenReferenceNumber: [, Validators.pattern('^[0-9]*$')],
      secondWrittenReferenceName: [],
      secondWrittenReferenceNumber: [, Validators.pattern('^[0-9]*$')],
      cdetbConfirmation: [, Validators.requiredTrue],
      subscriberStatus: [],
      signature: [, Validators.requiredTrue]
    });

    if (this.activatedRoute.snapshot.paramMap.get('id')) {
      this.setStudentData();
    }
    this.getSchoolInfo();
  }

  setStudentData() {
    let studentId = atob(this.activatedRoute.snapshot.paramMap.get('id'));
    let id = studentId.replace('@#$33FVCvfrt&*(FG', '');
    this.studentUID = id;
    this.fillStudentData(id);
  }

  saveWrittenReferenceStatus() {
    if (this.getWrittenReferenceStatus.value === true) {
      this.getWrittenReferenceStatus.clearValidators();
      this.setWrittenReferenceStatus = 1;
    } else if (this.getWrittenReferenceStatus.value === false) {
      this.setWrittenReferenceStatus = null;
      this.getWrittenReferenceStatus.setValidators([Validators.requiredTrue]);
    }
    this.getWrittenReferenceStatus.updateValueAndValidity();
  }

  saveCDETBStatus() {
    if (this.getCDETbConfirmation.value === true) {
      this.getCDETbConfirmation.clearValidators();
      this.setCDETbConfirmation = 1;
    } else if (this.getCDETbConfirmation.value === false) {
      this.setCDETbConfirmation = null;
      this.getCDETbConfirmation.setValidators([Validators.requiredTrue]);
    }
    this.getCDETbConfirmation.updateValueAndValidity();
  }

  saveSubStatus() {
    if (this.getSubscriberStatus.value === true) {
      this.setSubscriberStatus = 1;
    } else if (this.getSubscriberStatus.value === false) {
      this.setSubscriberStatus = 0;
    }
  }

  saveSignature() {
    if (this.getSignature.value === true) {
      this.getSignature.clearValidators();
      this.setSignature = 1;
    } else if (this.getSignature.value === false) {
      this.setSignature = null;
      this.getSignature.setValidators([Validators.requiredTrue]);
    }
    this.getSignature.updateValueAndValidity();
  }

  saveStudent() {
    this.submited = true;

    if (this.studentUID) {
      if (this.getFirstChoice.value && this.getSecondChoice.value) {
        this.setCourse = this.getFirstChoice.value + ', ' + this.getSecondChoice.value;
        this.setFirstChoice = parseInt($('#firstChoice').val()[0]);
        this.setSecondChoice = parseInt($('#secondChoice').val()[0]);
      } else {
        this.setCourse = this.getFirstChoice.value;
      }
    } else {
      if (this.getFirstChoice.value) {
        if (this.getFirstChoice.value && this.getSecondChoice.value) {
          this.setCourse = this.getFirstChoice.value.join() + ', ' + this.getSecondChoice.value.join();
        } else {
          this.setCourse = this.getFirstChoice.value.join();
        }
      }
    }

    if (this.getFirstName.value) {
      if (this.getLastName.value) {
        let fullname = this.getFirstName.value + ' ' + this.getLastName.value;
        this.setFullName = fullname;
      }
    }

    if ($('#firstChoice').val() == null || $('#firstChoice').val() == '' || $('#firstChoice').val().length == 0) {
      this.firstChoiceError = 'error';
    }

    if ($('#secondChoice').val() == null || $('#secondChoice').val() == '' || $('#secondChoice').val().length == 0) {
      this.secondChoiceError = 'error';
    }

    if (this.getMobile.value == '') {
      this.setMobile = null;
    }
    if (this.getSignature.value == '' || this.getSignature.value == null) {
      this.getSignature.setValidators([Validators.required]);
      this.getSignature.updateValueAndValidity();
    }

    let signature;
    if (this.getSignature.value == true) {
      signature = 1;
    } else if (this.getSignature.value == false) {
      signature = 0;
    }

    let writtenReferenceStatus;
    if (this.getWrittenReferenceStatus.value == true) {
      writtenReferenceStatus = 1;
    } else if (this.getWrittenReferenceStatus.value == false) {
      writtenReferenceStatus = 0;
    }

    let CDETbConfirmation;
    if (this.getCDETbConfirmation.value == true) {
      CDETbConfirmation = 1;
    } else if (this.getCDETbConfirmation.value == false) {
      CDETbConfirmation = 0;
    }


    if (this.newStudent.valid) {

      this.submited = true;
      this.showError = true;
      /* Create Student Instance */
      let student = new Student(this.getCourse.value,
        this.getFirstChoice.value,
        this.getSecondChoice.value,
        this.getFullName.value,
        this.getEmail.value,
        this.getMobile.value,
        this.getHomeTelNumber.value,
        this.getBirthdate.value,
        this.getAge.value,
        this.getGender.value,
        this.getHomeAddress.value,
        this.getPostcode.value,
        this.getGuardianName.value,
        this.getGuardianPhone.value,
        this.getPPSNumber.value,
        this.getStudentStatus.value,
        this.getHighestAward.value,
        this.getNationalityStatus.value,
        this.getNationalityInfo.value,
        this.getHSEMedicalCardStatus.value,
        this.getEducationSchoolName.value,
        this.getEducationSchoolNumber.value,
        this.getEducationSchoolLeavingYear.value,
        this.getEducationSchoolAddress.value,
        this.getLeavingCertificateSchoolId.value,
        this.getLeavingCertificateSchoolName.value,
        this.getLeavingCertificateSchoolNumber.value,
        this.getLeavingCertificateSchoolLeavingYear.value,
        this.getLeavingCertificateSchoolAddress.value,
        this.getLeavingCertificateWorkExperience.value,
        this.getModeStatus.value,
        this.getModeInfo.value,
        this.getExminationResultsStatus.value,
        this.getExtraCertificate.value,
        this.getOtherExamination.value,
        this.getWorkExperience.value,
        this.getDisabilityCondition.value,
        this.getDisabilitySupport.value,
        this.getDisabilityInfo.value,
        this.getCourseReference.value,
        this.getFirstWrittenReferenceName.value,
        this.getFirstWrittenReferenceNumber.value,
        this.getSecondWrittenReferenceName.value,
        this.getSecondWrittenReferenceNumber.value,
        this.getFirstName.value,
        this.getLastName.value,
        signature,
        writtenReferenceStatus,
        CDETbConfirmation,
        this.getSubscriberStatus.value
      );

      if (this.studentUID == null) {
        this.studentService.saveStudent(student, this.getSubjectWiseResults.value).subscribe(
          (data) => {
            if (data['status'] === true) {
              this.submited = true;
              this.showError = false;
              this.newStudent.reset();

              this.setFirstChoice = $('#firstChoice').val('');
              $('#firstChoice option:not(:selected)').attr('disabled', null);
              $('#firstChoice').multiselect('refresh');

              localStorage.setItem('studentData', JSON.stringify(data['data']));
              this.router.navigate(['/registration-success']);

              notification.showNotification('bottom', 'right', "success", "Registration Successfull", "verified_user");
            } else {
              this.submited = false;
              this.showError = true;
              notification.showNotification('bottom', 'right', "danger", data['data'], "error");
            }
          },
          (error) => {
            this.showError = true;
            this.submited = false;
            console.log(error);
            notification.showNotification('bottom', 'right', "danger", "Database Error While Registration", "error");
          }
        );
      } else {
        student['id'] = this.studentUID;
        this.studentService.editStudent(student, this.oldStudent)
          .subscribe(
            (data) => {
              if (data['status'] == 1) {
                this.showError = true;
                this.submited = false;
                this.setStudentData();
                notification.showNotification('bottom', 'right', "success", data['msg'], "verified_user");
              } else {
                this.showError = true;
                this.submited = false;
                notification.showNotification('bottom', 'right', "danger", data['msg'], "error");
              }
            },
            (err) => {
              this.showError = true;
              this.submited = false;
              notification.showNotification('bottom', 'right', "danger", "Database Error While Update Userdata", "error");
            }
          )
      }
    } else {
      this.showError = true;
      this.submited = false;
      notification.showNotification('bottom', 'right', "danger", "Please Enter Valid Data", "error");
    }
  }


  createSubject() {
    return this.formBuilder.group({
      name: [],
      level: [],
      grade: [],
      year: [, Validators.pattern('^[0-9]{4}$')]
    });
  }

  showRef(value) {
    if (value == true) {
      this.showRefFlag = true;
    } else {
      this.showRefFlag = false;
    }
  }

  checkEmail() {
    if (this.getEmail.valid) {
      this.getMobile.clearValidators();
      this.getMobile.setValidators([Validators.pattern('^[0-9]*$')]);
    } else {
      this.getMobile.setValidators([Validators.required, Validators.pattern('^[0-9]*$')]);
    }
    this.getMobile.updateValueAndValidity();
  }

  checkMobile() {
    if (this.getMobile.valid) {
      this.getEmail.clearValidators();
      this.getEmail.setValidators([Validators.email]);
    } else {
      this.getEmail.setValidators([Validators.required, Validators.email]);
    }
    this.getEmail.updateValueAndValidity();
  }

  /* Calculate Age */
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

  /* Get Courses */
  getRegisterCourse() {
    this.courseService.getRegisterCourse()
      .subscribe(
        data => {
          this.courses = data;
          var courseAvl = false;
          if (data) {
            courseAvl = true;
          }
          setTimeout(() => {
            let self = this;
            $('#firstChoice').multiselect({
              buttonText: function (options, select) {
                if (options.length === 0) {
                  if (courseAvl) {
                    return 'Please select up to two courses';
                  } else {
                    return 'No future rounds or courses in round';
                  }
                } else if (options.length === 1) {
                  return options.length + ' Course Selected';
                } else {
                  return options.length + ' Courses Selected';
                }
              },
              onChange: function (option, checked) {
                self.showCourseError = true;

                if ($('#firstChoice').val != null) {
                  self.firstChoiceError = null;
                }

                let secondChoice = $('#secondChoice').val();

                var values = [];
                $('#firstChoice option').each(function () {
                  if ($(this).val() !== option.val()) {
                    values.push($(this).val());
                  }
                });

                $('#firstChoice').multiselect('deselect', values);
                self.setFirstChoice = $('#firstChoice').val();

                // create Second Choice
                let secondChoiceOption = [];
                let currentCourses = JSON.parse("[" + $('#firstChoice').val() + "]");
                self.courses.forEach((course) => {
                  if ($.inArray(course.id, currentCourses) == -1) {
                    if (secondChoice && secondChoice == course.id) {
                      secondChoiceOption.push({ label: course.name, title: course.name, value: course.id, selected: true })
                    } else {
                      secondChoiceOption.push({ label: course.name, title: course.name, value: course.id })
                    }
                  }
                });

                $('#secondChoice').multiselect('dataprovider', secondChoiceOption);

                let secondChoiceValue = self.getSecondChoice.value;

                let firstChoice = $('#firstChoice').val();

                if (firstChoice[0] && secondChoiceValue && parseInt(firstChoice[0]) == parseInt(secondChoiceValue[0])) {
                  self.setSecondChoice = null;
                }

              },
              maxHeight: 200

            });
          }, 100);
        },
        err => {
          notification.showNotification('bottom', 'right', "danger", "Error While Fetching Courses", "error");
        }
      )
  }

  /* Assign Round To Student */
  uploadStudent() {
    this.registrationService.registerUser()
      .subscribe(
        (data: any) => {
          if (data.status == 1) {
            notification.showNotification('bottom', 'right', "success", data.info, "verified_user");
          } else {
            notification.showNotification('bottom', 'right', "danger", data.info, "error");
          }
        },
        err => {
          notification.showNotification('bottom', 'right', "danger", "Error While Student Register", "error");
        }
      )
  }

  updateNameValidation(i) {
    this.otherRows = true;
    if (i != undefined) {
      i = i.toString();
      if (this.getSubjectWiseResults.get(i).get('level').value == null && this.getSubjectWiseResults.get(i).get('grade').value == null && this.getSubjectWiseResults.get(i).get('year').value == null) {
        this.getSubjectWiseResults.get(i).get('name').clearValidators();
        this.getSubjectWiseResults.get(i).get('name').updateValueAndValidity();
      } else {
        this.getSubjectWiseResults.get(i).get('name').setValidators([Validators.required]);
        this.getSubjectWiseResults.get(i).get('name').updateValueAndValidity();
      }
    }
  }

  updateResult(i) {
    let selectedResult = this.getExminationResults.value.map((v, i) => v ? this.results[i].id : null)
      .filter(v => v !== null);
    this.setExminationResultsStatus = selectedResult.join();
  }


  addRow(i) {
    const control = <FormArray>this.getSubjectWiseResults;
    control.push(this.createSubject());
    this.updateNameValidation(i);
    this.rowShow++;
  }

  getDate(fullDate) {
    let date = new Date(fullDate);
    let y = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let hours = date.getHours();
    let minute = date.getMinutes();
    let second = date.getSeconds();

    let m = month.toString();
    let d = day.toString();
    let h = hours.toString();
    let mn = minute.toString();
    let s = second.toString();

    if (m.length < 2) m = '0' + m;
    if (d.length < 2) d = '0' + d;
    if (h.length < 2) h = '0' + h;
    if (mn.length < 2) mn = '0' + mn;
    if (s.length < 2) s = '0' + s;

    let dFull = y + '-' + m + '-' + d + ' ' + h + ':' + mn + ':' + s;
    let dDate = y + '-' + m + '-' + d;

    return dDate;
  }


  /* Set Student Data */
  fillStudentData(studentId) {
    let self = this;
    this.studentService.getStudentById(studentId)
      .subscribe(
        (data) => {
          if (data['status'] == 1) {
            let student = data['info'][0];
            this.oldStudent = student;

            $('#firstChoice').val(student.firstchoice);
            // create Second Choice
            let secondChoice = student.secondchoice;
            let secondChoiceOption = [];
            let currentCourses = JSON.parse("[" + $('#firstChoice').val() + "]");
            self.courses.forEach((course) => {
              if ($.inArray(course.id, currentCourses) == -1) {
                if (secondChoice && secondChoice == course.id) {
                  secondChoiceOption.push({ label: course.name, title: course.name, value: course.id, selected: true })
                } else {
                  secondChoiceOption.push({ label: course.name, title: course.name, value: course.id })
                }
              }
            });

            $('#secondChoice').multiselect({
              onChange: function (option, checked) {
                var values = [];
                $('#secondChoice option').each(function () {
                  if ($(this).val() !== option.val()) {
                    values.push($(this).val());
                  }
                });
                $('#secondChoice').multiselect('deselect', values);
                self.setSecondChoice = $('#secondChoice').val();
              },
              maxHeight: 200
            });
            $('#secondChoice').multiselect('dataprovider', secondChoiceOption);

            let hseMedicalStatus = false;
            self.setEmail = student.email;
            self.setFirstChoice = student.firstchoice;
            self.setSecondChoice = student.secondchoice;
            self.setPPSNumber = student.pps_number;
            self.setBirthdate = self.getDate(student.birthdate);
            self.setAge = student.age;
            self.setGender = student.gender;
            self.setMobile = student.mobile;
            self.setHomeTelNumber = student.home_tel_number;
            self.setHomeAddress = student.home_address;
            self.setPostcode = student.postcode;
            self.setGuardianName = student.guardin_name;
            self.setGuardianPhone = student.guardin_number;
            self.setNationalityStatus = student.nationality_status;
            self.setNationalityInfo = student.nationality_info;
            self.setHSEMedicalCardStatus = student.hse_medical_status;
            self.setStudentStatus = student.student_status;
            self.setHighestAward = student.highest_award;
            self.setEducationSchoolName = student.school_name;
            self.setEducationSchoolNumber = student.school_number;
            self.setEducationSchoolLeavingYear = student.school_leaving_year;
            self.setEducationSchoolAddress = student.school_address;
            self.setLeavingCertificateSchoolName = student.leaving_certificate_school_name;
            self.setLeavingCertificateSchoolNumber = student.leaving_certificate_school_number;
            self.setLeavingCertificateSchoolLeavingYear = student.leaving_certificate_school_year
            self.setLeavingCertificateSchoolAddress = student.leaving_certificate_school_address;
            self.setModeStatus = student.mode_status;
            self.setModeInfo = student.mode_info;
            self.setExtraCertificate = student.other_certificate;
            self.setOtherExamination = student.other_examination;
            self.setLeavingCertificateWorkExperience = student.leaving_certificate_work_experience;
            self.setWorkExperience = student.work_experience;
            self.setDisabilityInfo = student.disability_info;
            self.setCourseReference = student.course_reference;
            self.setFirstWrittenReferenceName = student.first_ref_name;
            self.setFirstWrittenReferenceNumber = student.first_ref_number;
            self.setSecondWrittenReferenceName = student.second_ref_name;
            self.setSecondWrittenReferenceNumber = student.second_ref_number;
            self.setExminationResultsStatus = student.result_status;

            if (student.written_reference_status == 1) {
              self.setWrittenReferenceStatus = true;
            } else {
              self.setWrittenReferenceStatus = false;
            }

            if (student.cdetb_confirmation == 1) {
              self.setCDETbConfirmation = true;
            } else {
              self.setCDETbConfirmation = false;
            }

            if (student.signature == 1) {
              self.setSignature = true;
            } else {
              self.setSignature = false;
            }

            self.setSubscriberStatus = student.subscriber_status;
            self.setDisabilityCondition = student.disability_condition;
            self.setDisabilitySupport = student.disability_support;
            self.setFullName = student.fullname;
            self.setFirstName = student.firstname;
            self.setLastName = student.surname;
          } else {
            notification.showNotification('bottom', 'right', "danger", "Database Error While Filling Student Data", "error");
          }
        },
        (err) => {
          notification.showNotification('bottom', 'right', "danger", "Error While Filling Student Data", "error");
        }
      )
  }

  getSchoolInfo() {
    this.newStudent.get('leavingCertificateDetails').get('schoolName').valueChanges.subscribe(val => {
      // console.log(val.length);
      if (val && val.length >= 1) {
        this.registrationService.getSchoolInfo(val).subscribe((data: any) => {

          this.schoolInfo = data.data;

        }, err => {
          this.schoolInfo = [];

        })
      }
    })
  }

  onSelectSchool(schoolName) {
    this.schoolData = this.schoolInfo.find(school => {
      return school.name == schoolName;
    });
    if (!this.schoolData) {

      this.newStudent.get('leavingCertificateDetails').get('schoolName').reset();
      this.schoolData = { id: null, name: '' };

    }
    
    this.setLeavingCertificateSchoolName = this.schoolData.name;
    this.setLeavingCertificateSchoolId = this.schoolData.id;

  }

  /* Getter And Setter */
  get getModeInfo() {
    return this.newStudent.get('leavingCertificateDetails').get('modeInfo');
  }

  set setModeInfo(info) {
    this.getModeInfo.setValue(info);
  }

  get getNationalityInfo() {
    return this.newStudent.get('nationalityInfo');
  }

  set setNationalityInfo(info) {
    this.getNationalityInfo.setValue(info);
  }

  get getStudentInfo() {
    return this.newStudent.get('personalDetails').get('studentInfo');
  }

  get getCourse() {
    return this.newStudent.get('course');
  }
  set setCourse(course) {
    this.getCourse.setValue(course);
  }

  get getFirstChoice() {
    return this.newStudent.get('firstChoice');
  }
  set setFirstChoice(firstChoice) {
    this.getFirstChoice.setValue(firstChoice);
  }

  get getSecondChoice() {
    return this.newStudent.get('secondChoice');
  }
  set setSecondChoice(secondChoice) {
    this.getSecondChoice.setValue(secondChoice);
  }

  get getFullName() {
    return this.newStudent.get('personalDetails').get('fullName');
  }
  set setFullName(fullName) {
    this.getFullName.setValue(fullName);
  }

  get getMotherName() {
    return this.newStudent.get('personalDetails').get('motherName');
  }

  get getEmail() {
    return this.newStudent.get('personalDetails').get('email')
  }

  set setEmail(email) {
    this.getEmail.setValue(email);
  }

  get getMobile() {
    return this.newStudent.get('personalDetails').get('mobile');
  }
  set setMobile(mobile) {
    this.getMobile.setValue(mobile);
  }


  get getHomeTelNumber() {
    return this.newStudent.get('personalDetails').get('homeTelNumber');
  }

  set setHomeTelNumber(number) {
    this.getHomeTelNumber.setValue(number);
  }

  get getBirthdate() {
    return this.newStudent.get('personalDetails').get('birthdate');
  }
  set setBirthdate(birthdate) {
    this.getBirthdate.setValue(birthdate);
  }

  get getAge() {
    return this.newStudent.get('personalDetails').get('age');
  }
  set setAge(age) {
    this.getAge.setValue(age);
  }

  get getGender() {
    return this.newStudent.get('personalDetails').get('gender');
  }

  set setGender(gender) {
    this.getGender.setValue(gender);
  }

  get getHomeAddress() {
    return this.newStudent.get('personalDetails').get('homeAddress');
  }

  set setHomeAddress(address) {
    this.getHomeAddress.setValue(address);
  }

  get getPostcode() {
    return this.newStudent.get('personalDetails').get('postcode');
  }

  set setPostcode(postcode) {
    this.getPostcode.setValue(postcode);
  }

  get getGuardianName() {
    return this.newStudent.get('guardianName');
  }

  set setGuardianName(name) {
    this.getGuardianName.setValue(name);
  }

  get getGuardianPhone() {
    return this.newStudent.get('guardianPhone');
  }

  set setGuardianPhone(number) {
    this.getGuardianPhone.setValue(number);
  }

  get getPPSNumber() {
    return this.newStudent.get('personalDetails').get('PPSnumber');
  }

  set setPPSNumber(ppsNumber) {
    this.getPPSNumber.setValue(ppsNumber);
  }

  get getStudentStatus() {
    return this.newStudent.get('educationDetails').get('studentStatus');
  }

  set setStudentStatus(status) {
    this.getStudentStatus.setValue(status);
  }

  get getHighestAward() {
    return this.newStudent.get('educationDetails').get('highestAward');
  }

  set setHighestAward(value) {
    this.getHighestAward.setValue(value);
  }

  get getNationalityStatus() {
    return this.newStudent.get('nationalityStatus');
  }

  set setNationalityStatus(status) {
    this.getNationalityStatus.setValue(status);
  }

  get getEducationSchoolName() {
    return this.newStudent.get('educationDetails').get('schoolName');
  }

  set setEducationSchoolName(name) {
    this.getEducationSchoolName.setValue(name);
  }

  get getEducationSchoolNumber() {
    return this.newStudent.get('educationDetails').get('schoolNumber');
  }

  set setEducationSchoolNumber(number) {
    this.getEducationSchoolNumber.setValue(number);
  }

  get getEducationSchoolLeavingYear() {
    return this.newStudent.get('educationDetails').get('schoolLeavingYear');
  }

  set setEducationSchoolLeavingYear(year) {
    this.getEducationSchoolLeavingYear.setValue(year);
  }

  get getEducationSchoolAddress() {
    return this.newStudent.get('educationDetails').get('schoolAddress');
  }

  set setEducationSchoolAddress(address) {
    this.getEducationSchoolAddress.setValue(address)
  }

  get getModeStatus() {
    return this.newStudent.get('leavingCertificateDetails').get('modeStatus');
  }

  set setModeStatus(status) {
    this.getModeStatus.setValue(status);
  }

  set setExminationResults(results) {
    this.getExminationResults.setValue(results);
  }

  get getExminationResultsStatus() {
    return this.newStudent.get('leavingCertificateDetails').get('exminationResultsStatus');
  }
  set setExminationResultsStatus(status) {
    this.getExminationResultsStatus.setValue(status);
  }

  get getExtraCertificate() {
    return this.newStudent.get('leavingCertificateDetails').get('extraCertificate');
  }

  set setExtraCertificate(value) {
    this.getExtraCertificate.setValue(value);
  }

  get getOtherExamination() {
    return this.newStudent.get('leavingCertificateDetails').get('otherExamination');
  }

  set setOtherExamination(value) {
    this.getOtherExamination.setValue(value);
  }

  get getLeavingCertificateWorkExperience() {
    return this.newStudent.get('leavingCertificateDetails').get('workExperience');
  }

  set setLeavingCertificateWorkExperience(value) {
    this.getLeavingCertificateWorkExperience.setValue(value);
  }

  get getWorkExperience() {
    return this.newStudent.get('workExperience');
  }

  set setWorkExperience(value) {
    this.getWorkExperience.setValue(value);
  }

  get getDisabilityCondition() {
    return this.newStudent.get('disabilityCondition');
  }

  set setDisabilityCondition(disabilityCondition) {
    this.getDisabilityCondition.setValue(disabilityCondition);
  }

  get getDisabilitySupport() {
    return this.newStudent.get('disabilitySupport');
  }

  set setDisabilitySupport(disabilitySupport) {
    this.getDisabilitySupport.setValue(disabilitySupport);
  }

  get getCourseReference() {
    return this.newStudent.get('courseReference');
  }

  set setCourseReference(value) {
    this.getCourseReference.setValue(value);
  }

  get getWrittenReferenceStatus() {
    return this.newStudent.get('writtenReferenceStatus');
  }

  set setWrittenReferenceStatus(writtenReferenceStatus) {
    this.getWrittenReferenceStatus.setValue(writtenReferenceStatus);
  }

  get getFirstWrittenReferenceName() {
    return this.newStudent.get('firstWrittenReferenceName');
  }

  set setFirstWrittenReferenceName(name) {
    this.getFirstWrittenReferenceName.setValue(name);
  }

  get getFirstWrittenReferenceNumber() {
    return this.newStudent.get('firstWrittenReferenceNumber');
  }

  set setFirstWrittenReferenceNumber(number) {
    this.getFirstWrittenReferenceNumber.setValue(number);
  }

  get getSecondWrittenReferenceName() {
    return this.newStudent.get('secondWrittenReferenceName');
  }

  set setSecondWrittenReferenceName(name) {
    this.getSecondWrittenReferenceName.setValue(name);
  }

  get getSecondWrittenReferenceNumber() {
    return this.newStudent.get('secondWrittenReferenceNumber');
  }

  set setSecondWrittenReferenceNumber(number) {
    this.getSecondWrittenReferenceNumber.setValue(number);
  }

  get getFirstName() {
    return this.newStudent.get('personalDetails').get('firstName');
  }

  set setFirstName(name) {
    this.getFirstName.setValue(name);
  }

  get getLastName() {
    return this.newStudent.get('personalDetails').get('lastName');
  }

  set setLastName(name) {
    this.getLastName.setValue(name);
  }

  get getSignature() {
    return this.newStudent.get('signature');
  }
  set setSignature(signature) {
    this.getSignature.setValue(signature);
  }

  get getSubjectWiseResults() {
    return this.newStudent.get('leavingCertificateDetails').get('subjectWiseResults');
  }

  get getExminationResults() {
    return this.newStudent.get('leavingCertificateDetails').get('exminationResults');
  }

  get getHSEMedicalCardStatus() {
    return this.newStudent.get('hseMedicalCardStatus');
  }

  set setHSEMedicalCardStatus(status) {
    this.getHSEMedicalCardStatus.setValue(status);
  }

  get getCDETbConfirmation() {
    return this.newStudent.get('cdetbConfirmation');
  }

  set setCDETbConfirmation(CDETbConfirmation) {
    this.getCDETbConfirmation.setValue(CDETbConfirmation);
  }

  get getLeavingCertificateSchoolName() {
    // return this.schoolData.name;
    return this.newStudent.get('leavingCertificateDetails').get('schoolName');
  }
  set setLeavingCertificateSchoolId(id) {
    this.getLeavingCertificateSchoolId.setValue(id);
  }

  get getLeavingCertificateSchoolId() {
    return this.newStudent.get('leavingCertificateDetails').get('schoolId');
  }

  set setLeavingCertificateSchoolName(name) {
    this.getLeavingCertificateSchoolName.setValue(name);
  }

  get getLeavingCertificateSchoolNumber() {
    return this.newStudent.get('leavingCertificateDetails').get('schoolNumber');
  }

  set setLeavingCertificateSchoolNumber(number) {
    this.getLeavingCertificateSchoolNumber.setValue(number);
  }

  get getLeavingCertificateSchoolLeavingYear() {
    return this.newStudent.get('leavingCertificateDetails').get('schoolLeavingYear');
  }

  set setLeavingCertificateSchoolLeavingYear(year) {
    this.getLeavingCertificateSchoolLeavingYear.setValue(year);
  }

  get getLeavingCertificateSchoolAddress() {
    return this.newStudent.get('leavingCertificateDetails').get('schoolAddress');
  }

  set setLeavingCertificateSchoolAddress(address) {
    this.getLeavingCertificateSchoolAddress.setValue(address);
  }

  get getDisabilityInfo() {
    return this.newStudent.get('disabilityInfo');
  }

  set setDisabilityInfo(info) {
    this.getDisabilityInfo.setValue(info);
  }

  get getSubscriberStatus() {
    return this.newStudent.get('subscriberStatus');
  }

  set setSubscriberStatus(subStatus) {
    this.getSubscriberStatus.setValue(subStatus);
  }
}
