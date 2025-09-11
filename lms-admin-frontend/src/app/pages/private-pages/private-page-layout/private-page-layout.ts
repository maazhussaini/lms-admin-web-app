import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-private-page-layout',
  standalone:false,
  templateUrl: './private-page-layout.html',
  styleUrl: './private-page-layout.scss'
})
export class PrivatePageLayout implements OnInit {
  pageTitle: string = '';
  currentUser: any = null;

  constructor(private router: Router, private activatedRoute: ActivatedRoute) {}

  ngOnInit() {
    // Set initial page title
    this.updatePageTitle();
    
    // Listen to route changes to update page title
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updatePageTitle();
    });

    // Set current user (you can get this from your auth service)
    this.setCurrentUser();
  }

  private updatePageTitle() {
    // Extract page title from route
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    // Get the page title from route data or URL
    const url = this.router.url;
    if (url.includes('tenant')) {
      this.pageTitle = 'Tenant';
    } else if (url.includes('student')) {
      this.pageTitle = 'Student';
    } else if (url.includes('teacher')) {
      this.pageTitle = 'Teacher';
    } else if (url.includes('course')) {
      this.pageTitle = 'Course';
    } else {
      this.pageTitle = 'Dashboard';
    }
  }

  private setCurrentUser() {
    // This should come from your authentication service
    // For now, setting a mock user
    this.currentUser = {
      name: 'Tenant Admin',
      avatar: 'assets/images/avatar.jpg',
      email: 'admin@tenant.com'
    };
  }
}
