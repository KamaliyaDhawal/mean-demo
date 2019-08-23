import { Component, OnInit } from '@angular/core';
import { CommonService } from '../../services/common/common.service';
import { AuthenticationService} from '../../services/auth/authentication.service';
import { Router, Event, NavigationEnd } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {
  pageID;
  role;
  constructor(private _router: Router,
    private commonService: CommonService,
    private authService: AuthenticationService
  ) { }
  ngOnInit() {
    this.commonService.currentPageId.subscribe(data => this.pageID = data);
    this.role = this.authService.getUserRole();
    if(!this.role){
      this._router.navigate(['/admin']);
    }
  }

  

}
