// This file contains the JavaScript code to fix the CRUD menu issues
// It ensures menus are attached to the correct row on scroll and properly positioned
document.addEventListener('DOMContentLoaded', function() {
  // Select all CRUD menu triggers
  const menuTriggers = document.querySelectorAll('.crud-menu-trigger');
  
  // Handle click on menu triggers
  menuTriggers.forEach(trigger => {
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      
      // Get the container and the dropdown
      const container = this.closest('.crud-menu-container');
      const dropdown = container.querySelector('.crud-menu-dropdown');
      
      // Toggle the dropdown
      if (dropdown.classList.contains('show')) {
        dropdown.classList.remove('show');
      } else {
        // First close all other dropdowns
        document.querySelectorAll('.crud-menu-dropdown.show').forEach(menu => {
          menu.classList.remove('show');
        });
        
        // Now show this dropdown
        dropdown.classList.add('show');
      }
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.crud-menu-container')) {
      document.querySelectorAll('.crud-menu-dropdown.show').forEach(menu => {
        menu.classList.remove('show');
      });
    }
  });
});