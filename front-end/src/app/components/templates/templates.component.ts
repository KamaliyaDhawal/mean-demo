import { Component, OnInit } from '@angular/core';

import { CommonService } from '../../services/common/common.service';
import { TemplatesService } from '../../services/templates/templates.service';

import { ActivatedRoute } from '@angular/router';

declare const $: any;
declare const notification: any;

@Component({
  selector: 'app-template',
  templateUrl: './templates.component.html',
  styleUrls: ['./templates.component.css']
})
export class TemplateComponent implements OnInit {
	viewMode:string = 'list';
	heading:string = 'Template Listing'
	body:string = "Dear {{StudentName}}, Thank You For Applying For {{CourseName}}, Your Interview Is Schedule At {{InterviewTime}}.";
	subject:string = "{{StudentName}} Application";
	StudentName:string = "{{StudentName}}";
	CourseName:string = "{{CourseName}}";
	InterviewTime = "{{InterviewTime}}";
	templateType:number = 3;
	error:boolean = false;
	templates;
	name:string;
	currentTemplateId:number = null;
	currentTemplateName:string = '';
	currentTemplateType:number = 0;
	currentTemplateSubject:string = '';
	currentTemplateBody:string = '';
	action:string = null;

  constructor(
      private route: ActivatedRoute,
  		private commonService: CommonService,
  		private templatesService:TemplatesService
  	) { }

  ngOnInit() {
  	this.commonService.changeSlidename('Templates');
  	this.commonService.setPageId(6);
  	this.getTemplates();
    this.route.queryParams
    .subscribe(
      data => {
        if(data['viewMode']) {
          this.viewMode = data['viewMode'];
        }
      }
    );
  }

  changeType(type) {
    if(type == 2) {
      this.currentTemplateBody = this.currentTemplateBody.replace(/<[^>]*>/g, '');
      this.currentTemplateBody = this.currentTemplateBody.replace(/&nbsp;/g, '');
    }
  }

  changeViewMode(mode, heading) {
  	this.viewMode = mode;
  	this.heading = heading;
  	this.currentTemplateId=null;
  }

  resetTemplate() {
  	this.body = "Dear {{StudentName}}, Thank You For Applying For {{CourseName}}, Your Interview Is Schedule At {{InterviewTime}}.";
		this.subject = "{{StudentName}} Application";
  }

  saveTemplate() {
  	let dataError=null;
  	if (this.viewMode == 'new' && (this.subject.length <= 0 || this.body.trim().length <= 0 || this.name.length <= 0)) {
  		dataError = 'newError';
  	} else if (this.viewMode == 'list' && (this.currentTemplateName.length <= 0 || this.currentTemplateSubject.length <= 0 || this.currentTemplateBody.trim().length <= 0)) {
  		dataError = 'updateError';
  	}
  	if(!dataError) {
  		let adminId = JSON.parse(localStorage.getItem('admin'));
  		adminId = adminId.id;
  		let data;
  		if(this.currentTemplateId) {
  			data = {
  				id: this.currentTemplateId,
		  		name: this.currentTemplateName,
		  		subject: this.currentTemplateSubject,
		  		body: this.currentTemplateBody,
		  		type: this.currentTemplateType,
  			}
  		} else {
		  	data = {
		  		name: this.name,
		  		subject: this.subject,
		  		body: this.body,
		  		type: this.templateType
  			}
	  	}
	  	data['created_by'] = data['updated_by'] = adminId;

	  	this.templatesService.saveTemplate(data)
	  	.subscribe(
	  		data => {
	  			if(data['status']) {
	  				this.getTemplates();
	  				if(dataError = 'updateError') {
	  					$('#updateModal').modal('hide');
	  				}
            this.resetTemplate();
          	notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
	  			} else {
	  				this.getTemplates();
	  				console.log(data['msg']);
  					notification.showNotification('bottom','right', "danger", 'Database Error While Save Template', 'error');
	  			}
	  		},
	  		error => {
	  			this.getTemplates();
  				notification.showNotification('bottom','right', "danger", 'Error While Save Template', 'error');
	  		}
	  	)
  	} else {
  		this.error = true;
  		notification.showNotification('bottom','right', "danger", 'Please Enter Valid Data', 'error');
  	}
  }

  getTemplates() {
  	this.templatesService.getTemplates()
  	.subscribe(
  		data => {
  			if(data['status']) {
  				this.templates = data['data'];
  				this.name = 'Template Number: '+parseInt(this.templates.length+1);
  			} else {
  				console.log(data['data']);
  				notification.showNotification('bottom','right', "danger", data['msg'], 'error');
  			}
  		},
  		error => {
  			notification.showNotification('bottom','right', "danger", 'Error While Getting Templates', 'error');
  		}
  	)
  }

  setCurrentTemplate(template, action) {
  	this.action = action;
  	this.currentTemplateId = template.id;
  	this.currentTemplateType = template.type;
		this.currentTemplateName = template.name;
  	this.currentTemplateSubject = template.subject;
		this.currentTemplateBody = template.body;
  }

  deleteTemplate() {
  	let id = this.currentTemplateId;
  	let admin = JSON.parse(localStorage.getItem('admin')).id;
  	let data = { id, admin }
  	this.templatesService.deleteTemplates(data)
  	.subscribe(
  		data => {
  			if(data['status']) {
  				this.getTemplates();
          notification.showNotification('bottom','right', "success", data['msg'], "verified_user");
  			} else {
  				this.getTemplates();
          notification.showNotification('bottom','right', "danger", data['msg'], "error");
  			}
  		},
  		error => {
  			notification.showNotification('bottom','right', "danger", 'Error While Delete Templates', 'error');
  		}
  	);	
  }
}
