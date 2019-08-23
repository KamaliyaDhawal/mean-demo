import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DataTableModule } from "angular-6-datatable";
import { ChartsModule } from 'ng2-charts';
import { NgCircleProgressModule } from 'ng-circle-progress';

import { AppRoutingModule, RoutingComponent } from './app-routing.module';
import { AppComponent } from './app.component';
import { HeaderComponent } from './components/header/header.component';
import { SidebarComponent } from './components/sidebar/sidebar.component';

import { GrdFilterPipe } from './pipe/grd-filter.pipe';
import { StudentDetailsComponent } from './components/student-details/student-details.component';
import { CKEditorModule } from 'ngx-ckeditor';

import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { TokenInterceptor } from './services/TokenInterceptor/token-interceptor.service';
import { ChangePasswordComponent } from './components/header/change-password/change-password.component';
import { CreateUserComponentComponent } from './components/create-user-component/create-user-component.component';
import { GuidanceUserComponent } from './components/guidance-user/guidance-user.component';
import { UserListComponent } from './components/guidance-user/user-list/user-list.component';

// import 
@NgModule({
  declarations: [
    AppComponent,
    HeaderComponent,
    SidebarComponent,
    RoutingComponent,
    GrdFilterPipe,
    StudentDetailsComponent,
    ChangePasswordComponent,
    CreateUserComponentComponent,
    GuidanceUserComponent,
    UserListComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    ReactiveFormsModule,
    HttpClientModule,
    DataTableModule,
    CKEditorModule,
    ChartsModule,
    NgCircleProgressModule.forRoot({
      "outerStrokeWidth": 10,
      "outerStrokeColor": "#fff",
      "titleColor": "#fff",
      "animateTitle": true,
      "unitsColor": "#fff",
      "clockwise": true,
    })

  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
