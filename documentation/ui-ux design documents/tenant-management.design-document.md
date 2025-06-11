# Tenant Management Feature - UI/UX Design Document

## Overview

This document provides comprehensive design specifications for the Tenant Management feature in the Learning Management System (LMS). The feature enables administrators to manage tenants, their branding, and contact information within a multi-tenant architecture.

## Design Requirements

### Target Users
- **SUPER_ADMIN**: Full system access across all tenants
- **TENANT_ADMIN**: Limited access to their own tenant only

### Design Principles
- **Multi-tenant Isolation**: Clear visual separation between tenant-specific and global operations
- **Role-based Access**: Contextual UI based on user permissions
- **Data Integrity**: Visual cues for required fields and validation states
- **Responsive Design**: Mobile-first approach with desktop optimization

## Feature Scope

### Core Functionalities
1. Tenant Management (CRUD operations)
2. Contact Information Management (Phone & Email)
3. Branding Configuration (Logos, Themes)
4. Client Association Overview
5. Status Management

## Page Structure & Navigation

### 1. Tenant List Page (`/tenants`)

#### Layout Components
- **Header Section**
  - Page title: "Tenant Management"
  - Breadcrumb: `Dashboard > Tenant Management`
  - Action button: "Create Tenant" (SUPER_ADMIN only)

- **Filter & Search Section**
  - Search input: placeholder "Search tenants..."
  - Status filter dropdown: All, Active, Suspended, Trial, Expired, Cancelled
  - Sort options: Name, Status, Created Date

- **Data Table**
  - Columns: Logo, Tenant Name, Status, Clients Count, Created Date, Actions
  - Row actions: View, Edit, Delete (role-based visibility)
  - Pagination controls

#### Design Specifications

**Search & Filter Bar**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Search tenants...                    [Status ▼] [Sort ▼]    │
└─────────────────────────────────────────────────────────────────┘
```

**Data Table Layout**
```
┌──────┬────────────────┬──────────┬────────┬─────────────┬─────────┐
│ Logo │ Tenant Name    │ Status   │ Clients│ Created     │ Actions │
├──────┼────────────────┼──────────┼────────┼─────────────┼─────────┤
│ [🏢] │ University A   │ 🟢 Active│   245  │ 2024-01-15  │ ⋯ ✏️ 🗑️ │
│ [🎓] │ College B      │ 🟡 Trial │    89  │ 2024-01-20  │ ⋯ ✏️    │
└──────┴────────────────┴──────────┴────────┴─────────────┴─────────┘
```

#### Interactive Elements
- **Status Badge Colors**:
  - Active: Green (#10B981)
  - Suspended: Red (#EF4444)
  - Trial: Yellow (#F59E0B)
  - Expired: Gray (#6B7280)
  - Cancelled: Dark Gray (#374151)

- **Action Menu**: Dropdown with contextual options
- **Logo Display**: Thumbnail with fallback to initials

### 2. Tenant Detail Page (`/tenants/:id`)

#### Tab Navigation
1. **Overview** - Basic tenant information
2. **Contact Info** - Phone numbers and email addresses
3. **Branding** - Logos and theme configuration
4. **Clients** - Associated clients (read-only)

#### Tab 1: Overview

**Form Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ Tenant Information                                              │
├─────────────────────────────────────────────────────────────────┤
│ Tenant Name *     [University of Excellence              ]     │
│                                                                 │
│ Status *          [Active                          ▼]          │
│                                                                 │
│ Created Date      2024-01-15 10:30 AM                         │
│ Last Updated      2024-01-20 03:45 PM                         │
│                                                                 │
│                                    [Cancel] [Save Changes]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 2: Contact Information

**Dual Section Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ Phone Numbers                               [+ Add Phone]       │
├─────────────────────────────────────────────────────────────────┤
│ [🔗] +1 555-123-4567    Primary    Business    [✏️] [🗑️]      │
│ [🔗] +1 555-987-6543    Secondary  Emergency   [✏️] [🗑️]      │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│ Email Addresses                            [+ Add Email]        │
├─────────────────────────────────────────────────────────────────┤
│ [📧] admin@university.edu    Primary    Business  [✏️] [🗑️]    │
│ [📧] billing@university.edu  Secondary  Billing   [✏️] [🗑️]    │
└─────────────────────────────────────────────────────────────────┘
```

**Add Contact Modal**
```
┌─────────────────────────────────────────────────────────────────┐
│ Add Phone Number                                         [✕]    │
├─────────────────────────────────────────────────────────────────┤
│ Country         [🇺🇸 United States (+1)              ▼]        │
│ Phone Number *  [555-123-4567                          ]        │
│ Contact Type *  [Primary                              ▼]        │
│ □ Set as primary contact                                        │
│                                                                 │
│                                    [Cancel] [Add Phone Number]  │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 3: Branding

**Logo Upload Section**
```
┌─────────────────────────────────────────────────────────────────┐
│ Brand Assets                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Light Theme Logo                                                │
│ ┌─────────────┐  [Change Logo] [Remove]                        │
│ │ [🏢 Logo]   │                                                │
│ │             │  Recommended: 200x60px, PNG/SVG               │
│ └─────────────┘                                                │
│                                                                 │
│ Dark Theme Logo                                                 │
│ ┌─────────────┐  [Upload Logo] [Remove]                        │
│ │ [Upload     │                                                │
│ │  Area]      │  Recommended: 200x60px, PNG/SVG               │
│ └─────────────┘                                                │
│                                                                 │
│ Favicon                                                         │
│ ┌─────┐       [Upload Favicon] [Remove]                        │
│ │ [🌐]│       Recommended: 32x32px, ICO/PNG                   │
│ └─────┘                                                         │
└─────────────────────────────────────────────────────────────────┘
```

**Theme Configuration**
```
┌─────────────────────────────────────────────────────────────────┐
│ Theme Colors                                                    │
├─────────────────────────────────────────────────────────────────┤
│ Primary Color     [🎨 #1976d2] [                    ]          │
│ Secondary Color   [🎨 #424242] [                    ]          │
│ Background Color  [🎨 #ffffff] [                    ]          │
│                                                                 │
│ Preview                                                         │
│ ┌─────────────────────────────────────────────────┐            │
│ │ [Primary Button] [Secondary Button]             │            │
│ │ This is how your theme will appear to users     │            │
│ └─────────────────────────────────────────────────┘            │
│                                                                 │
│                        [Reset to Default] [Apply Theme]        │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 4: Clients (Read-only)

**Client List with Search**
```
┌─────────────────────────────────────────────────────────────────┐
│ Associated Clients (245)              🔍 Search clients...      │
├─────────────────────────────────────────────────────────────────┤
│ [👤] John Smith                    john.smith@university.edu    │
│      +1 555-111-2222              Active                       │
│                                                                 │
│ [👤] Sarah Johnson                 sarah.j@university.edu      │
│      +1 555-333-4444              Active                       │
│                                                                 │
│                              [View All Clients] [1][2][3]...   │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Create/Edit Tenant Modal

#### Create Tenant Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Create New Tenant                                        [✕]    │
├─────────────────────────────────────────────────────────────────┤
│ Basic Information                                               │
│                                                                 │
│ Tenant Name *     [                                    ]        │
│                   Must be unique across the system             │
│                                                                 │
│ Initial Status *  [Active                              ▼]      │
│                                                                 │
│ Branding (Optional)                                            │
│                                                                 │
│ Light Logo URL    [https://                           ]        │
│ Dark Logo URL     [https://                           ]        │
│ Favicon URL       [https://                           ]        │
│                                                                 │
│                                    [Cancel] [Create Tenant]    │
└─────────────────────────────────────────────────────────────────┘
```

## Design Patterns & Components

### 1. Form Components

#### Input Field with Validation
```
Label *                    [Input Value                    ]
                          ✅ Valid input / ❌ Error message
```

#### Status Dropdown
```
[Active                                               ▼]
├── Active
├── Suspended  
├── Trial
├── Expired
└── Cancelled
```

#### Contact Type Badges
- **Primary**: Blue background (#3B82F6)
- **Secondary**: Gray background (#6B7280)
- **Emergency**: Red background (#EF4444)
- **Billing**: Green background (#10B981)

### 2. Data Display Components

#### Logo Display
```
┌─────────────┐
│ [🏢 Logo]   │  → For uploaded logos
│             │
└─────────────┘

┌─────────────┐
│     UA      │  → Fallback with initials
│             │
└─────────────┘
```

#### Contact Information Card
```
┌─────────────────────────────────────────────────────────────────┐
│ [📞] +1 555-123-4567                              [Primary]     │
│      Business Contact                             [✏️] [🗑️]    │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Interactive Elements

#### Action Menu
```
[⋯] → ┌─────────────┐
      │ View Details│
      │ Edit        │
      │ Delete      │
      └─────────────┘
```

#### Confirmation Dialog
```
┌─────────────────────────────────────────────────────────────────┐
│ Confirm Deletion                                         [✕]    │
├─────────────────────────────────────────────────────────────────┤
│ ⚠️  Are you sure you want to delete "University A"?            │
│                                                                 │
│     This action cannot be undone. All associated data will     │
│     be permanently removed.                                     │
│                                                                 │
│                                       [Cancel] [Delete]        │
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Design Specifications

### Mobile Layout (320px - 768px)

#### Tenant List - Mobile
```
┌─────────────────────────────────┐
│ Tenant Management         [+]   │
├─────────────────────────────────┤
│ 🔍 Search...           [⚙️]    │
├─────────────────────────────────┤
│ [🏢] University A          [⋯] │
│      🟢 Active • 245 clients   │
│      Created: Jan 15, 2024     │
├─────────────────────────────────┤
│ [🎓] College B             [⋯] │
│      🟡 Trial • 89 clients     │
│      Created: Jan 20, 2024     │
└─────────────────────────────────┘
```

#### Tenant Detail - Mobile (Tabbed)
```
┌─────────────────────────────────┐
│ ← University A                  │
├─────────────────────────────────┤
│ [Info][Contact][Brand][Clients] │
├─────────────────────────────────┤
│ Tenant Name                     │
│ [University of Excellence     ] │
│                                 │
│ Status                          │
│ [Active                    ▼]  │
│                                 │
│            [Save Changes]       │
└─────────────────────────────────┘
```

### Tablet Layout (768px - 1024px)

#### Two-column layout with sidebar navigation
- Left sidebar: Tenant list (condensed)
- Right panel: Detail view

### Desktop Layout (1024px+)

#### Full-width layout with data tables
- Enhanced filtering options
- Bulk operations
- Advanced sorting capabilities

## Color Palette & Typography

### Primary Colors
```
Primary Blue:    #1976D2
Secondary Gray:  #424242
Success Green:   #10B981
Warning Yellow:  #F59E0B
Error Red:       #EF4444
Background:      #F8FAFC
Surface White:   #FFFFFF
Text Primary:    #1F2937
Text Secondary:  #6B7280
```

### Typography
- **Headers**: Inter, 24px/28px, Semi-bold
- **Subheaders**: Inter, 18px/22px, Medium
- **Body Text**: Inter, 14px/20px, Regular
- **Labels**: Inter, 12px/16px, Medium
- **Captions**: Inter, 11px/14px, Regular

## Accessibility Requirements

### WCAG 2.1 Compliance
- **Contrast Ratios**: Minimum 4.5:1 for normal text, 3:1 for large text
- **Keyboard Navigation**: Full functionality without mouse
- **Screen Reader Support**: Proper ARIA labels and landmarks
- **Focus Indicators**: Visible focus states for all interactive elements

### Specific Implementations
- **Form Labels**: Associated with inputs using `for` attributes
- **Error Messages**: Linked to form fields with `aria-describedby`
- **Status Indicators**: Use both color and text/icons
- **Loading States**: Clear indication with appropriate ARIA labels

## Loading States & Error Handling

### Loading States
```
┌─────────────────────────────────────────────────────────────────┐
│ Loading Tenants...                                              │
├─────────────────────────────────────────────────────────────────┤
│ [■■■■■■□□□□] 60%                                                │
│                                                                 │
│ Please wait while we fetch your tenant data                     │
└─────────────────────────────────────────────────────────────────┘
```

### Error States
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️  Failed to Load Tenants                                     │
├─────────────────────────────────────────────────────────────────┤
│ We couldn't load the tenant data. Please check your connection │
│ and try again.                                                  │
│                                                                 │
│                              [Try Again] [Contact Support]     │
└─────────────────────────────────────────────────────────────────┘
```

### Empty States
```
┌─────────────────────────────────────────────────────────────────┐
│                          [🏢]                                  │
│                    No Tenants Found                            │
│                                                                 │
│          Get started by creating your first tenant             │
│                                                                 │
│                      [Create Tenant]                           │
└─────────────────────────────────────────────────────────────────┘
```

## Figma Design System Components

### Component Library Structure
```
🎨 Tenant Management Design System
├── 📱 Pages
│   ├── Tenant List
│   ├── Tenant Detail
│   └── Create/Edit Tenant
├── 🧩 Components
│   ├── Forms
│   │   ├── Input Field
│   │   ├── Dropdown
│   │   └── File Upload
│   ├── Data Display
│   │   ├── Data Table
│   │   ├── Contact Card
│   │   └── Status Badge
│   ├── Navigation
│   │   ├── Tab Navigation
│   │   ├── Breadcrumb
│   │   └── Action Menu
│   └── Feedback
│       ├── Loading Spinner
│       ├── Error Message
│       └── Success Toast
├── 🎨 Styles
│   ├── Colors
│   ├── Typography
│   └── Spacing
└── 📋 Templates
    ├── Desktop Layout
    ├── Tablet Layout
    └── Mobile Layout
```

### Figma Layer Organization
```
🖼️ Tenant Management Feature
├── 📱 Frames
│   ├── Desktop (1440px)
│   ├── Tablet (768px)
│   └── Mobile (375px)
├── 🎨 Styles
│   ├── Color Styles
│   ├── Text Styles
│   └── Effect Styles
├── 🧩 Components
│   ├── Local Components
│   └── Instance Overrides
└── 📊 Prototyping
    ├── User Flows
    └── Interaction States
```

## User Flow Diagrams

### Primary User Flows

#### 1. SUPER_ADMIN - Create Tenant Flow
```
Login → Dashboard → Tenants → Create Tenant → Form Fill → Validation → Success → Detail View
```

#### 2. TENANT_ADMIN - Edit Contact Info Flow
```
Login → Dashboard → Tenant Profile → Contact Tab → Add/Edit Contact → Validation → Success
```

#### 3. View Client Association Flow
```
Tenant Detail → Clients Tab → Search/Filter → View Client Details
```

## Technical Specifications for Implementation

### API Integration Points
- **GET /api/v1/tenants** - Tenant list with pagination
- **POST /api/v1/tenants** - Create new tenant
- **GET /api/v1/tenants/:id** - Tenant details
- **PATCH /api/v1/tenants/:id** - Update tenant
- **DELETE /api/v1/tenants/:id** - Soft delete tenant

### State Management Requirements
- Loading states for all async operations
- Form validation state management
- User permission-based UI rendering
- Real-time updates for multi-user scenarios

### Performance Considerations
- Image optimization for logos and favicons
- Lazy loading for large tenant lists
- Debounced search functionality
- Efficient pagination implementation

## Design Deliverables Checklist

### For Development Handoff
- [ ] Complete Figma design file with all components
- [ ] Exported assets (icons, logos, illustrations)
- [ ] Design tokens JSON file
- [ ] Component specifications document
- [ ] Responsive breakpoint definitions
- [ ] Accessibility annotations
- [ ] User flow diagrams
- [ ] Prototype with key interactions
- [ ] Design QA checklist

### Testing Scenarios
- [ ] Role-based access control validation
- [ ] Form validation and error states
- [ ] Responsive design across devices
- [ ] Accessibility compliance testing
- [ ] Cross-browser compatibility
- [ ] Performance benchmarking

This comprehensive design document provides all necessary specifications for implementing the Tenant Management feature. The UI/UX engineer should use this as a foundation for creating detailed Figma designs that align with the technical requirements and user needs.

Similar code found with 6 license types