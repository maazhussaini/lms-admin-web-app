import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-teacher-dashboard',
  templateUrl: './teacher-dashboard.html',
  styleUrls: ['./teacher-dashboard.scss']
})
export class TeacherDashboard implements OnInit {
  
  currentUser: any = null;
  permissions: string[] = [];

  constructor() {}

  ngOnInit(): void {
    // Will be injected later when services are properly available
    this.currentUser = { full_name: 'Teacher User', role: { role_name: 'Teacher' }, email: 'teacher@tenant.com', user_type: 'TEACHER' };
    this.permissions = ['/courses:view', '/students:view'];
  }

  logout(): void {
    console.log('Logout functionality will be added');
  }
}
