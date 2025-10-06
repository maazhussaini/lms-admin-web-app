import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private isDarkTheme = new BehaviorSubject<boolean>(false);
  public isDarkTheme$ = this.isDarkTheme.asObservable();

  constructor() {
    this.initializeTheme();
  }

  /**
   * Initialize theme from localStorage only
   * Always defaults to light theme unless user has manually changed it
   */
  private initializeTheme(): void {
    // Check localStorage only, no system preference detection
    const savedTheme = localStorage.getItem('theme') || 'light';
    const isDark = savedTheme === 'dark';
    
    this.isDarkTheme.next(isDark);
    this.applyTheme(savedTheme);
  }

  /**
   * Toggle between light and dark theme
   */
  toggleTheme(): void {
    const currentTheme = this.isDarkTheme.value;
    const newTheme = currentTheme ? 'light' : 'dark';
    
    this.isDarkTheme.next(!currentTheme);
    this.saveTheme(newTheme);
    this.applyTheme(newTheme);
    
    // Dispatch custom event for components that need to react
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: newTheme }));
  }

  /**
   * Set specific theme
   */
  setTheme(theme: 'light' | 'dark'): void {
    const isDark = theme === 'dark';
    this.isDarkTheme.next(isDark);
    this.saveTheme(theme);
    this.applyTheme(theme);
    
    window.dispatchEvent(new CustomEvent('themeChanged', { detail: theme }));
  }

  /**
   * Get current theme
   */
  getCurrentTheme(): 'light' | 'dark' {
    return this.isDarkTheme.value ? 'dark' : 'light';
  }

  /**
   * Check if current theme is dark
   */
  isDark(): boolean {
    return this.isDarkTheme.value;
  }

  /**
   * Apply theme to document
   */
  private applyTheme(theme: string): void {
    document.documentElement.setAttribute('data-theme', theme);
  }

  /**
   * Save theme preference to localStorage
   */
  private saveTheme(theme: string): void {
    localStorage.setItem('theme', theme);
  }
}