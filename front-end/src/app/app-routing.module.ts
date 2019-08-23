import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { CourseComponent } from './components/course/course.component';
import { RoundComponent } from './components/round/round.component';
import { SlotComponent } from './components/slot/slot.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { RegistrationCompleteComponent } from './components/registration-complete/registration-complete.component';
import { PageNotFoundComponent } from './components/page-not-found/page-not-found.component';
import { StudentsComponent } from './components/students/students.component';
import { ReportsComponent } from './components/reports/reports.component';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { TemplateComponent } from './components/templates/templates.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { CreateUserComponentComponent } from './components/create-user-component/create-user-component.component';
import { GuidanceUserComponent } from './components/guidance-user/guidance-user.component';

import { AuthGuardService } from './services/guards/auth-guard.service';
const routes: Routes = [
	{ path: '', redirectTo: 'registration', pathMatch: 'full'},
	{ path: 'apply', redirectTo: 'registration', pathMatch: 'full'},
	{ path: 'admin', component: LoginComponent, pathMatch:'full'},
	{
		path: '', 
		component: HomeComponent,
		children: [
			{ path: '', redirectTo: 'dashboard', pathMatch: 'full'},
			{ path: 'dashboard', component: DashboardComponent, pathMatch:'full', canActivate: [AuthGuardService],data: {role: [1,2]}},
			{ path: 'course', component: CourseComponent, pathMatch:'full',canActivate: [AuthGuardService],data: {role: [1]} },
			{ path: 'round', component: RoundComponent, pathMatch: 'full', canActivate: [AuthGuardService],data: {role: [1]}},
			{ path: 'slot', component: SlotComponent, pathMatch: 'full'},
			// { path: 'students', component:StudentsComponent, pathMatch: 'full' },
			{ path: 'student-details', component:StudentDetailsComponent, pathMatch: 'full' },
			{ path: 'students', component:ReportsComponent	, pathMatch: 'full',canActivate: [AuthGuardService],data: {role: [1]} },
			{ path: 'templates', component:TemplateComponent	, pathMatch: 'full',canActivate: [AuthGuardService],data: {role: [1]} },
			{ path: 'create-user', component:CreateUserComponentComponent, pathMatch: 'full',canActivate: [AuthGuardService],data: {role: [1]} },
			{path : 'guidance-user', component: GuidanceUserComponent, pathMatch: 'full', canActivate: [AuthGuardService], data: {role: [3]}}

		],
	},
	{ path: 'registration', component:RegistrationComponent, pathMatch: 'full' },
	{ path: 'update-student/:id', component:RegistrationComponent },
	{ path: 'registration-success', component:RegistrationCompleteComponent, pathMatch: 'full' },
	{ path: '**', component:PageNotFoundComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule],
  providers: [AuthGuardService]
})

export class AppRoutingModule { }
export const RoutingComponent = [
									LoginComponent, 
									HomeComponent, 
									CourseComponent, 
									RoundComponent, 
									SlotComponent,
									RegistrationComponent,
									RegistrationCompleteComponent,
									StudentsComponent,
									ReportsComponent,
									StudentDetailsComponent,
									TemplateComponent,
									DashboardComponent,
									PageNotFoundComponent
								 ]
