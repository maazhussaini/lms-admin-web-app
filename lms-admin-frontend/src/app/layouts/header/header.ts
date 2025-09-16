import { Component, Input } from '@angular/core';

export interface User {
  full_name: string;
  email: string;
  role?: { role_name: string };
  user_type?: string;
}

@Component({
  selector: 'app-header',
  imports: [],
  standalone: true,
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  @Input() pageTitle: string = 'Dashboard';
  @Input() currentUser: User | null = null;

  toggleNotifications(): void {
    console.log('Toggle notifications');
    // Add notification functionality here
  }

  toggleUserMenu(): void {
    console.log('Toggle user menu');
    // Add user menu functionality here
  }

  getUserInitials(): string {
    if (!this.currentUser?.full_name) {
      return 'U';
    }
    const names = this.currentUser.full_name.split(' ');
    return names.length > 1 
      ? (names[0][0] + names[1][0]).toUpperCase()
      : names[0][0].toUpperCase();
  }
}
