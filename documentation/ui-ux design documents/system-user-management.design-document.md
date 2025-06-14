# System User Management Feature - UI/UX Design Document

## Overview

This document provides comprehensive design specifications for the System User Management feature in the Learning Management System (LMS). The feature enables administrators to manage system-level users with role-based access control and tenant isolation.

## Design Requirements

### Target Users
- **SUPER_ADMIN**: Global system administrators with access across all tenants
- **TENANT_ADMIN**: Tenant-specific administrators with limited scope

### Design Principles
- **Role-based Interface**: Dynamic UI based on user permissions
- **Tenant Isolation**: Clear visual separation for tenant-scoped operations
- **Security First**: Visual indicators for sensitive operations
- **Hierarchical Navigation**: Clear system access management structure

## Feature Scope

### Core Functionalities
1. System User Management (CRUD operations)
2. Role Assignment and Management
3. Permission Configuration
4. User Status Management
5. Authentication & Security Controls

## Page Structure & Navigation

### 1. System Users List Page (`/system-users`)

#### Layout Components
- **Header Section**
  - Page title: "System User Management"
  - Breadcrumb: `Dashboard > System Users`
  - Action button: "Create User" (role-based visibility)

- **Filter & Search Section**
  - Search input: placeholder "Search users..."
  - Role filter dropdown: All, SUPER_ADMIN, TENANT_ADMIN
  - Status filter dropdown: All, Active, Inactive, Suspended, Locked
  - Tenant filter (SUPER_ADMIN only)

- **Data Table**
  - Columns: Avatar, Name, Username, Email, Role, Tenant, Status, Last Login, Actions
  - Row actions: View, Edit, Reset Password, Delete (role-based visibility)
  - Pagination controls

#### Design Specifications

**Search & Filter Bar**
```
┌─────────────────────────────────────────────────────────────────┐
│ 🔍 Search users...      [Role ▼] [Status ▼] [Tenant ▼]        │
│                                            [🔄 Refresh] [+ User]│
└─────────────────────────────────────────────────────────────────┘
```

**Data Table Layout**
```
┌────┬──────────────┬─────────────┬──────────────┬──────────┬──────────┬──────────┬─────────────┬─────────┐
│ 👤 │ Full Name    │ Username    │ Email        │ Role     │ Tenant   │ Status   │ Last Login  │ Actions │
├────┼──────────────┼─────────────┼──────────────┼──────────┼──────────┼──────────┼─────────────┼─────────┤
│[AS]│ Admin Smith  │ admin_smith │ admin@co.com │🔴 SUPER  │ Global   │🟢 Active │ 2h ago      │ ⋯ ✏️ 🗑️ │
│[JD]│ John Doe     │ john_doe    │ john@uni.edu │🔵 TENANT │ Univ A   │🟢 Active │ 5m ago      │ ⋯ ✏️    │
│[MJ]│ Mary Johnson │ mary_j      │ mary@co.edu  │🔵 TENANT │ Coll B   │🟡 Locked │ 2d ago      │ ⋯ 🔓    │
└────┴──────────────┴─────────────┴──────────────┴──────────┴──────────┴──────────┴─────────────┴─────────┘
```

#### Interactive Elements
- **Role Badge Colors**:
  - SUPER_ADMIN: Red (#EF4444)
  - TENANT_ADMIN: Blue (#3B82F6)

- **Status Badge Colors**:
  - Active: Green (#10B981)
  - Inactive: Gray (#6B7280)
  - Suspended: Orange (#F59E0B)
  - Locked: Red (#EF4444)

- **Avatar Display**: Initials with color-coded background based on role

### 2. User Detail Page (`/system-users/:id`)

#### Tab Navigation
1. **Profile** - Basic user information and credentials
2. **Permissions** - Screen-level permissions and role overrides
3. **Activity** - Login history and audit logs
4. **Security** - Password policies and security settings

#### Tab 1: Profile

**Form Layout**
```
┌─────────────────────────────────────────────────────────────────┐
│ User Information                                                │
├─────────────────────────────────────────────────────────────────┤
│ ┌─────────┐   Username *     [admin_smith               ]       │
│ │   [AS]  │   Full Name *    [Administrator Smith        ]       │
│ │  120px  │   Email *        [admin@company.com          ]       │
│ │  120px  │   Role *         [SUPER_ADMIN               ▼]      │
│ └─────────┘   Tenant         [Global (No Tenant)        ]       │
│              Status *        [Active                    ▼]      │
│                                                                 │
│ Account Details                                                 │
│ ├─────────────────────────────────────────────────────────────┤
│ │ Created         2024-01-15 10:30 AM by John Admin           │
│ │ Last Updated    2024-01-20 03:45 PM by Jane Manager         │
│ │ Last Login      2024-01-22 09:15 AM from 192.168.1.100     │
│ │ Login Attempts  0 failed attempts                           │
│ └─────────────────────────────────────────────────────────────┘
│                                                                 │
│ Password Management                                             │
│ ├─────────────────────────────────────────────────────────────┤
│ │ [Reset Password] [Force Change on Next Login]              │
│ └─────────────────────────────────────────────────────────────┘
│                                                                 │
│                                    [Cancel] [Save Changes]     │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 2: Permissions

**Permission Matrix**
```
┌─────────────────────────────────────────────────────────────────┐
│ Screen Permissions                    [🔍 Search screens...]     │
├─────────────────────────────────────────────────────────────────┤
│ Role: TENANT_ADMIN                    [Override Individual ☐]   │
│                                                                 │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ Screen/Module        View Create Edit Delete Export Status  │ │
│ ├─────────────────────────────────────────────────────────────┤ │
│ │ 📊 Dashboard          ✅    ❌    ❌    ❌     ✅   Default │ │
│ │ 👥 Tenant Mgmt        ✅    ❌    ✅    ❌     ✅   Default │ │
│ │ 🏢 Client Mgmt        ✅    ✅    ✅    ✅     ✅   Default │ │
│ │ 📚 Course Mgmt        ✅    ✅    ✅    ❌     ✅   Custom  │ │
│ │ 👨‍🎓 Student Mgmt       ✅    ✅    ✅    ✅     ✅   Default │ │
│ │ 👨‍🏫 Teacher Mgmt       ✅    ✅    ✅    ❌     ✅   Custom  │ │
│ │ ⚙️  System Settings    ❌    ❌    ❌    ❌     ❌   Default │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ Legend: ✅ Allowed  ❌ Denied  🔒 Role Default  ⚡ Override    │
│                                                                 │
│                                              [Apply Changes]   │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 3: Activity

**Activity Log**
```
┌─────────────────────────────────────────────────────────────────┐
│ User Activity Log                     [📅 Date Range] [Export]  │
├─────────────────────────────────────────────────────────────────┤
│ ⏰ Login History                                               │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 2024-01-22 09:15:AM  ✅ Successful Login                   │ │
│ │ IP: 192.168.1.100    Browser: Chrome 120                   │ │
│ │                                                             │ │
│ │ 2024-01-21 14:30:PM  ✅ Successful Login                   │ │
│ │ IP: 10.0.0.55        Browser: Firefox 121                  │ │
│ │                                                             │ │
│ │ 2024-01-20 11:45:AM  ❌ Failed Login (Invalid Password)    │ │
│ │ IP: 192.168.1.100    Browser: Chrome 120                   │ │
│ └─────────────────────────────────────────────────────────────┘ │
│                                                                 │
│ 📝 Audit Trail                                                │
│ ┌─────────────────────────────────────────────────────────────┐ │
│ │ 2024-01-20 15:45:PM  Profile Updated by Jane Manager       │ │
│ │ 2024-01-15 10:30:AM  User Created by Super Admin           │ │
│ └─────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

#### Tab 4: Security

**Security Settings**
```
┌─────────────────────────────────────────────────────────────────┐
│ Security Configuration                                          │
├─────────────────────────────────────────────────────────────────┤
│ 🔐 Password Policy                                             │
│ ├─────────────────────────────────────────────────────────────┤
│ │ ☑️ Enforce strong passwords                                 │
│ │ ☑️ Require password change every 90 days                   │
│ │ ☐ Force change on next login                               │
│ │ ☑️ Lock account after 5 failed attempts                    │
│ └─────────────────────────────────────────────────────────────┘
│                                                                 │
│ 🛡️ Access Control                                             │
│ ├─────────────────────────────────────────────────────────────┤
│ │ ☑️ Two-factor authentication required                       │
│ │ ☑️ IP restriction enabled                                   │
│ │     Allowed IPs: 192.168.1.0/24, 10.0.0.0/8              │
│ │ ☐ Time-based access restrictions                           │
│ └─────────────────────────────────────────────────────────────┘
│                                                                 │
│ 🚨 Security Actions                                            │
│ ├─────────────────────────────────────────────────────────────┤
│ │ [Force Logout All Sessions] [Unlock Account]               │
│ │ [Reset 2FA] [Generate Recovery Codes]                      │
│ └─────────────────────────────────────────────────────────────┘
└─────────────────────────────────────────────────────────────────┘
```

### 3. Create/Edit User Modal

#### Create User Modal
```
┌─────────────────────────────────────────────────────────────────┐
│ Create System User                                       [✕]    │
├─────────────────────────────────────────────────────────────────┤
│ Basic Information                                               │
│                                                                 │
│ Username *        [                                    ]        │
│                   Must be unique within scope                  │
│                                                                 │
│ Full Name *       [                                    ]        │
│ Email Address *   [                                    ]        │
│                   Will be used for login notifications         │
│                                                                 │
│ Role & Access                                                  │
│                                                                 │
│ User Role *       [TENANT_ADMIN                        ▼]      │
│                   ⚠️ SUPER_ADMIN users have global access      │
│                                                                 │
│ Tenant *          [University A                        ▼]      │
│                   💡 Hidden for SUPER_ADMIN role              │
│                                                                 │
│ Status *          [Active                              ▼]      │
│                                                                 │
│ Security                                                        │
│                                                                 │
│ Temporary Password [                                    ]        │
│                   User will be prompted to change              │
│                                                                 │
│ ☑️ Force password change on first login                        │
│ ☐ Send welcome email with login instructions                   │
│                                                                 │
│                                    [Cancel] [Create User]      │
└─────────────────────────────────────────────────────────────────┘
```

### 4. Role Management Interface

#### Role-Based Features Display
```
┌─────────────────────────────────────────────────────────────────┐
│ Available Actions (Based on Current User Role)                 │
├─────────────────────────────────────────────────────────────────┤
│ SUPER_ADMIN View:                                              │
│ ✅ Create/Edit/Delete any user                                 │
│ ✅ Assign SUPER_ADMIN role                                     │
│ ✅ Cross-tenant operations                                     │
│ ✅ Global system settings                                      │
│                                                                 │
│ TENANT_ADMIN View:                                             │
│ ✅ Create/Edit TENANT_ADMIN users (own tenant only)           │
│ ❌ Cannot create SUPER_ADMIN users                            │
│ ❌ Cannot access other tenants                                │
│ ✅ Manage tenant-specific settings                            │
└─────────────────────────────────────────────────────────────────┘
```

## Design Patterns & Components

### 1. Form Components

#### Role Selector with Constraints
```
Role Type *                [TENANT_ADMIN                    ▼]
├── SUPER_ADMIN (⚠️ Global Access)
└── TENANT_ADMIN (🏢 Tenant Specific)

⚠️ Note: Role change affects available permissions
```

#### Status Indicator with Actions
```
Current Status: [🟢 Active]
┌─────────────────────────────────┐
│ Actions Available:              │
│ [🔒 Suspend] [🚫 Deactivate]   │
│ [🔑 Reset Password]             │
└─────────────────────────────────┘
```

#### Permission Toggle Matrix
```
Screen: Course Management    [🔍 Individual Override ☐]
┌─────────────────────────────────────────────────────┐
│ View    Create   Edit    Delete   Export           │
│ [✅]    [❌]     [✅]    [❌]     [✅]              │
│ Role    Custom   Role    Custom   Role              │
└─────────────────────────────────────────────────────┘
```

### 2. Security Components

#### Password Strength Indicator
```
New Password: [************************]
┌─────────────────────────────────┐
│ 🟢🟢🟢🟡⚪ Strong             │
│ ✅ 8+ characters               │
│ ✅ Uppercase & lowercase       │
│ ✅ Numbers                     │
│ ❌ Special characters          │
└─────────────────────────────────┘
```

#### Two-Factor Authentication Setup
```
┌─────────────────────────────────────────────────────────────────┐
│ 📱 Two-Factor Authentication                                   │
├─────────────────────────────────────────────────────────────────┤
│ Status: [🔴 Not Configured]                                    │
│                                                                 │
│ 1. Download authenticator app                                   │
│ 2. Scan QR code                                                │
│ ┌─────────────┐                                                │
│ │ [QR Code]   │ Or enter manually: ABCD-1234-EFGH-5678        │
│ │             │                                                │
│ └─────────────┘                                                │
│ 3. Enter verification code: [      ]                          │
│                                                                 │
│                              [Cancel] [Enable 2FA]            │
└─────────────────────────────────────────────────────────────────┘
```

### 3. Data Display Components

#### User Summary Card
```
┌─────────────────────────────────────────────────────────────────┐
│ [AS] Administrator Smith                           🟢 Active     │
│      admin_smith | admin@company.com                           │
│      🔴 SUPER_ADMIN | Global Access                            │
│      Last login: 2 hours ago from 192.168.1.100               │
│                                           [Edit] [Reset] [⋯]   │
└─────────────────────────────────────────────────────────────────┘
```

#### Tenant Assignment Display
```
┌─────────────────────────────────────────────────────────────────┐
│ Tenant Assignment                                               │
├─────────────────────────────────────────────────────────────────┤
│ Current: University A                    [Change Tenant]        │
│          📊 245 clients | 👥 12 staff                          │
│          Created: Jan 15, 2024                                 │
│                                                                 │
│ ⚠️ Changing tenant will reset user permissions                  │
└─────────────────────────────────────────────────────────────────┘
```

## Responsive Design Specifications

### Mobile Layout (320px - 768px)

#### User List - Mobile
```
┌─────────────────────────────────┐
│ System Users            [+]     │
├─────────────────────────────────┤
│ 🔍 Search...           [⚙️]    │
├─────────────────────────────────┤
│ [AS] Admin Smith          [⋯]   │
│      🔴 SUPER_ADMIN             │
│      admin@company.com          │
│      Last: 2h ago              │
├─────────────────────────────────┤
│ [JD] John Doe             [⋯]   │
│      🔵 TENANT_ADMIN            │
│      john@university.edu        │
│      Last: 5m ago              │
└─────────────────────────────────┘
```

#### User Detail - Mobile (Accordion)
```
┌─────────────────────────────────┐
│ ← Administrator Smith           │
├─────────────────────────────────┤
│ 📝 Profile              [▼]    │
│ 🔐 Permissions          [▶]    │
│ 📊 Activity             [▶]    │
│ 🛡️ Security             [▶]    │
├─────────────────────────────────┤
│ Username                        │
│ [admin_smith              ]     │
│                                 │
│ Full Name                       │
│ [Administrator Smith      ]     │
│                                 │
│            [Save Changes]       │
└─────────────────────────────────┘
```

## Accessibility & Security Requirements

### WCAG 2.1 Compliance
- **Contrast Ratios**: Enhanced ratios for security-critical actions
- **Keyboard Navigation**: Full accessibility for all user management functions
- **Screen Reader Support**: Detailed ARIA labels for role and permission states
- **Focus Management**: Clear focus indicators for security actions

### Security-Specific Accessibility
- **Role Announcements**: Screen readers announce role changes
- **Permission Changes**: Audio feedback for permission modifications
- **Security Actions**: Confirmation dialogs with clear consequences
- **Error States**: Detailed error descriptions for security violations

## Color Palette & Typography

### Role-Based Color System
```
SUPER_ADMIN Theme:
- Primary: #DC2626 (Red 600)
- Secondary: #FEE2E2 (Red 50)
- Accent: #991B1B (Red 800)

TENANT_ADMIN Theme:
- Primary: #2563EB (Blue 600)
- Secondary: #DBEAFE (Blue 50)
- Accent: #1D4ED8 (Blue 700)

Security States:
- Warning: #F59E0B (Amber 500)
- Danger: #EF4444 (Red 500)
- Success: #10B981 (Emerald 500)
- Info: #3B82F6 (Blue 500)
```

### Typography Hierarchy
- **Security Headers**: Inter, 20px/24px, Semi-bold, Red for critical actions
- **Role Badges**: Inter, 12px/16px, Bold, All caps
- **Permission Labels**: Inter, 14px/20px, Medium
- **Status Text**: Inter, 13px/18px, Regular

## User Flow Diagrams

### Primary User Flows

#### 1. SUPER_ADMIN - Create TENANT_ADMIN Flow
```
Login → Dashboard → System Users → Create User → Select Role (TENANT_ADMIN) 
→ Select Tenant → Set Credentials → Configure Permissions → Create → Send Welcome Email
```

#### 2. TENANT_ADMIN - Manage Team Flow
```
Login → System Users (Filtered to Own Tenant) → View User → Edit Permissions 
→ Modify Screen Access → Save Changes → Audit Log Updated
```

#### 3. Password Reset Flow
```
User List → Select User → Security Tab → Reset Password → Generate Temp Password 
→ Set Force Change Flag → Send Reset Email → User Must Change on Next Login
```

## Security Warning System

### Critical Action Confirmations
```
┌─────────────────────────────────────────────────────────────────┐
│ ⚠️ Confirm Role Change                                   [✕]    │
├─────────────────────────────────────────────────────────────────┤
│ You are about to change John Doe's role from TENANT_ADMIN      │
│ to SUPER_ADMIN.                                                │
│                                                                 │
│ This action will:                                              │
│ • Grant global system access                                   │
│ • Remove tenant restrictions                                   │
│ • Reset all current permissions                                │
│ • Require immediate password change                            │
│                                                                 │
│ Type "CONFIRM ROLE CHANGE" to proceed:                         │
│ [                                    ]                         │
│                                                                 │
│                               [Cancel] [Confirm Change]        │
└─────────────────────────────────────────────────────────────────┘
```

## Error States & Validation

### Permission Denied States
```
┌─────────────────────────────────────────────────────────────────┐
│ 🚫 Access Denied                                               │
├─────────────────────────────────────────────────────────────────┤
│ You don't have permission to create SUPER_ADMIN users.         │
│                                                                 │
│ Required permission: SUPER_ADMIN role                          │
│ Your current role: TENANT_ADMIN                               │
│                                                                 │
│ Contact your system administrator for assistance.              │
│                                                                 │
│                                        [Contact Support]       │
└─────────────────────────────────────────────────────────────────┘
```

### Validation Error States
```
┌─────────────────────────────────────────────────────────────────┐
│ ❌ Validation Errors                                           │
├─────────────────────────────────────────────────────────────────┤
│ Please correct the following errors:                           │
│                                                                 │
│ • Username already exists within this tenant                   │
│ • Email address is already registered                          │
│ • Password does not meet security requirements                 │
│ • TENANT_ADMIN role requires tenant assignment                 │
└─────────────────────────────────────────────────────────────────┘
```

## Figma Design System Components

### Component Library Structure
```
🎨 System User Management Design System
├── 📱 Pages
│   ├── User List View
│   ├── User Detail (Tabbed)
│   ├── Create/Edit User
│   └── Permission Management
├── 🧩 Components
│   ├── User Management
│   │   ├── User Card
│   │   ├── Role Selector
│   │   ├── Status Badge
│   │   └── Permission Matrix
│   ├── Security
│   │   ├── Password Strength
│   │   ├── 2FA Setup
│   │   ├── Security Actions
│   │   └── Audit Timeline
│   ├── Forms
│   │   ├── User Form
│   │   ├── Permission Form
│   │   └── Security Settings
│   └── Feedback
│       ├── Security Warnings
│       ├── Role Change Confirmations
│       └── Permission Denied
├── 🎨 Styles
│   ├── Role-Based Colors
│   ├── Security Typography
│   └── Status Indicators
└── 🔐 Security Patterns
    ├── Confirmation Dialogs
    ├── Permission States
    └── Access Control UI
```

## Technical Implementation Notes

### State Management
- Role-based UI rendering
- Real-time permission updates
- Security action confirmations
- Audit trail integration

### API Integration Points
- **GET /api/v1/system-users** - User list with role-based filtering
- **POST /api/v1/system-users** - Create user with validation
- **PATCH /api/v1/system-users/:id** - Update with authorization checks
- **DELETE /api/v1/system-users/:id** - Soft delete with restrictions

### Security Considerations
- Input sanitization for all user fields
- Role-based feature visibility
- Tenant isolation enforcement
- Audit trail for all changes
- Session management for security actions

This comprehensive design document provides all necessary specifications for implementing the System User Management feature with proper security controls and role-based access management.

Similar code found with 6 license types