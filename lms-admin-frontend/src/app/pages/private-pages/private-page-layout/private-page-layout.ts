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
    // Extract page title from route data or URL
    let route = this.activatedRoute;
    while (route.firstChild) {
      route = route.firstChild;
    }
    
    // Get title from route data if available
    if (route.snapshot.data['title']) {
      this.pageTitle = route.snapshot.data['title'];
      return;
    }
    
    // Get the page title from URL
    const url = this.router.url;
    if (url.includes('reports/tenants')) {
      this.pageTitle = 'Tenant Management';
    } else if (url.includes('reports/institutes')) {
      this.pageTitle = 'Institute Management';
    } else if (url.includes('reports/programs')) {
      this.pageTitle = 'Program Management';
    } else if (url.includes('reports/students')) {
      this.pageTitle = 'Student Management';
    } else if (url.includes('reports/teachers')) {
      this.pageTitle = 'Teacher Management';
    } else if (url.includes('tenant')) {
      this.pageTitle = 'Tenant';
    } else if (url.includes('student')) {
      this.pageTitle = 'Student';
    } else if (url.includes('teacher')) {
      this.pageTitle = 'Teacher';
    } else if (url.includes('course')) {
      this.pageTitle = 'Course';
    } else if (url.includes('dashboard')) {
      this.pageTitle = 'Dashboard';
    } else {
      this.pageTitle = 'Reports';
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
