# orb-Ed Theme System - Components Documentation

## 🎨 Complete Button & Input System

Your orb-Ed theme now includes a comprehensive button and input component system that supports multiple sizes, variants, and theme switching.

---

## 📝 **Form Input Components**

### **Input Sizes**
```html
<!-- Small Input -->
<input type="text" class="input-sm border border-border" placeholder="Small input">

<!-- Medium Input (Default) -->
<input type="text" class="input-md border border-border" placeholder="Medium input">

<!-- Large Input -->
<input type="text" class="input-lg border border-border" placeholder="Large input">
```

### **Input Validation States**
```html
<!-- Success State -->
<input type="text" class="input-md input-success" placeholder="Success state">

<!-- Warning State -->
<input type="text" class="input-md input-warning" placeholder="Warning state">

<!-- Error State -->
<input type="text" class="input-md input-error" placeholder="Error state">
```

### **Input Specifications**
| Class | Padding | Font Size | Border Radius | Use Case |
|-------|---------|-----------|---------------|----------|
| `input-sm` | 0.5rem 0.75rem | 0.875rem (14px) | 0.375rem | Compact forms, filters |
| `input-md` | 0.75rem 1rem | 1rem (16px) | 0.5rem | Standard forms |
| `input-lg` | 1rem 1.25rem | 1.125rem (18px) | 0.75rem | Prominent inputs, sign-in |

---

## 🔘 **Button Components**

### **Button Sizes**
```html
<!-- Small Button -->
<button class="btn btn-primary btn-sm">Small Button</button>

<!-- Medium Button (Default) -->
<button class="btn btn-primary btn-md">Medium Button</button>

<!-- Large Button -->
<button class="btn btn-primary btn-lg">Large Button</button>

<!-- Extra Large Button -->
<button class="btn btn-primary btn-xl">Extra Large Button</button>
```

### **Solid Button Variants**
```html
<button class="btn btn-primary">Primary</button>
<button class="btn btn-secondary">Secondary</button>
<button class="btn btn-success">Success</button>
<button class="btn btn-warning">Warning</button>
<button class="btn btn-error">Error</button>
```

### **Outlined Button Variants**
```html
<button class="btn btn-outline-primary">Primary Outlined</button>
<button class="btn btn-outline-secondary">Secondary Outlined</button>
<button class="btn btn-outline-success">Success Outlined</button>
<button class="btn btn-outline-warning">Warning Outlined</button>
<button class="btn btn-outline-error">Error Outlined</button>
```

### **Button Specifications**
| Class | Padding | Font Size | Border Radius | Min Height | Use Case |
|-------|---------|-----------|---------------|------------|----------|
| `btn-sm` | 0.5rem 1rem | 0.875rem (14px) | 0.375rem | 2rem | Secondary actions, tags |
| `btn-md` | 0.75rem 1.5rem | 1rem (16px) | 0.5rem | 2.5rem | Standard buttons |
| `btn-lg` | 1rem 2rem | 1.125rem (18px) | 0.75rem | 3rem | Primary actions, CTA |
| `btn-xl` | 1.25rem 2.5rem | 1.25rem (20px) | 1rem | 3.5rem | Hero sections, landing |

---

## 🎯 **Real-World Usage Examples**

### **Sign-In Form (Current Implementation)**
```html
<form class="space-y-6">
  <!-- Email Input -->
  <div>
    <label class="block text-base font-medium text-gray-700 mb-2.5">Email</label>
    <input type="email" class="input-lg w-full border border-border bg-white" 
           placeholder="Enter Your Email">
  </div>
  
  <!-- Password Input -->
  <div>
    <label class="block text-base font-medium text-gray-700 mb-2.5">Password</label>
    <input type="password" class="input-lg w-full border border-border bg-white" 
           placeholder="Enter Your Password">
  </div>
  
  <!-- Submit Button -->
  <button type="submit" class="btn btn-primary btn-lg w-full">
    Sign In
  </button>
</form>
```

### **Action Button Groups**
```html
<!-- Admin Actions -->
<div class="flex gap-2">
  <button class="btn btn-success btn-sm">✓ Approve</button>
  <button class="btn btn-outline-warning btn-sm">⚠ Review</button>
  <button class="btn btn-outline-error btn-sm">✕ Reject</button>
</div>

<!-- Form Actions -->
<div class="flex gap-3">
  <button class="btn btn-primary btn-md">Save Changes</button>
  <button class="btn btn-outline-secondary btn-md">Cancel</button>
  <button class="btn btn-outline-error btn-md">Delete</button>
</div>
```

### **Card with Mixed Components**
```html
<div class="card p-6">
  <h3 class="text-lg font-semibold mb-4">User Settings</h3>
  
  <!-- Form Inputs -->
  <div class="space-y-4 mb-6">
    <input type="text" class="input-md w-full border border-border" 
           placeholder="Full Name">
    <input type="email" class="input-md input-success w-full" 
           placeholder="Email Address" value="user@example.com">
    <input type="tel" class="input-sm w-full border border-border" 
           placeholder="Phone (Optional)">
  </div>
  
  <!-- Action Buttons -->
  <div class="flex justify-between">
    <button class="btn btn-outline-error btn-sm">Delete Account</button>
    <div class="flex gap-2">
      <button class="btn btn-outline-secondary btn-md">Cancel</button>
      <button class="btn btn-primary btn-md">Save Profile</button>
    </div>
  </div>
</div>
```

---

## 🌓 **Theme Switching Support**

All components automatically adapt to light and dark themes:

```javascript
// Toggle theme
function toggleTheme() {
  const currentTheme = document.body.getAttribute('data-theme') || 'light';
  const newTheme = currentTheme === 'light' ? 'dark' : 'light';
  document.body.setAttribute('data-theme', newTheme);
}
```

```html
<!-- Light theme (default) -->
<body data-theme="light">

<!-- Dark theme -->
<body data-theme="dark">
```

---

## 🎨 **Color Mappings**

### **Light Theme Colors**
- **Primary**: #4C1D95 (Deep purple)
- **Secondary**: #6B7280 (Gray)
- **Success**: #10B981 (Green)
- **Warning**: #F59E0B (Amber)
- **Error**: #EF4444 (Red)

### **Dark Theme Colors**
- **Primary**: #8B5CF6 (Light purple)
- **Secondary**: #9CA3AF (Light gray)
- **Success**: #059669 (Dark green)
- **Warning**: #D97706 (Dark amber)
- **Error**: #DC2626 (Dark red)

---

## 📱 **Responsive Behavior**

All components include responsive design considerations:

```html
<!-- Responsive button groups -->
<div class="flex flex-col sm:flex-row gap-2">
  <button class="btn btn-primary btn-md w-full sm:w-auto">Primary Action</button>
  <button class="btn btn-outline-secondary btn-md w-full sm:w-auto">Secondary</button>
</div>

<!-- Responsive input grid -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  <input type="text" class="input-md border border-border" placeholder="Field 1">
  <input type="text" class="input-md border border-border" placeholder="Field 2">
  <input type="text" class="input-md border border-border" placeholder="Field 3">
</div>
```

---

## ✨ **Special Features**

### **Hover Effects**
- All buttons include smooth hover animations
- Outlined buttons fill with their theme color on hover
- Inputs have focus ring effects with theme colors

### **Disabled States**
```html
<button class="btn btn-primary" disabled>Disabled Button</button>
<input type="text" class="input-md border border-border" disabled placeholder="Disabled Input">
```

### **Loading States**
```html
<button class="btn btn-primary" disabled>
  <span class="spinner mr-2"></span>
  Loading...
</button>
```

---

## 🚀 **Implementation Benefits**

1. **Consistent Design**: All components follow the same design language
2. **Theme Compatible**: Automatic light/dark theme support
3. **Responsive**: Mobile-first responsive design
4. **Accessible**: Proper focus states and semantic HTML
5. **Maintainable**: Centralized styling system
6. **Performant**: Optimized CSS with utility classes
7. **Developer Friendly**: Intuitive class names and clear hierarchy

---

Your sign-in component is now the perfect example of this system in action! 🎉
