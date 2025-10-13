# Enum Badge Styling Guide

## Overview
Ye file sare database enum values ke liye centralized badge styling provide karti hai. Isko `_enum-badges.scss` mein implement kiya gaya hai aur globally available hai.

## Basic Usage

### HTML Template
```html
<!-- Basic enum badge -->
<span class="enum-badge" [ngClass]="'badge-' + enumValue.toLowerCase()">
  {{ enumValue }}
</span>

<!-- With pipe (recommended for safety) -->
<span class="enum-badge" [ngClass]="'badge-' + (enumValue | lowercase)">
  {{ enumValue }}
</span>

<!-- Underscore handling (if enum has underscores) -->
<span class="enum-badge" [ngClass]="'badge-' + enumValue.toLowerCase().replace('_', '-')">
  {{ enumValue }}
</span>
```

### Examples by Screen

#### Student Management
```html
<!-- Student Status Badge -->
<td class="status-col">
  <span class="enum-badge" [ngClass]="'badge-' + (student.student_status | lowercase)">
    {{ student.student_status }}
  </span>
</td>
```

#### Tenant Management
```html
<!-- Tenant Status Badge -->
<td class="status-col">
  <span class="enum-badge" [ngClass]="'badge-' + tenant.status.toLowerCase()">
    {{ tenant.status }}
  </span>
</td>

<!-- Contact Type Badge (Primary) -->
@if (phone.isPrimary) {
  <span class="enum-badge badge-primary">Primary</span>
}
```

#### Course Management
```html
<!-- Course Status -->
<span class="enum-badge badge-{{ course.status | lowercase }}">
  {{ course.status }}
</span>

<!-- Course Type -->
<span class="enum-badge badge-{{ course.type | lowercase }}">
  {{ course.type }}
</span>
```

## Available Enum Categories

### 1. Status Enums (Semantic Colors)
**Active States (Green)**: `ACTIVE`, `COMPLETED`, `FINISHED`, `SENT`, `DELIVERED`, `ENROLLED`, `PUBLIC`, `PUBLISHED`, `GRADED`

**Inactive States (Gray)**: `INACTIVE`, `DEACTIVATED`, `ARCHIVED`, `CANCELLED`, `DISMISSED`, `NOT_STARTED`

**Warning States (Orange)**: `PENDING`, `SUSPENDED`, `TRIAL`, `UPLOADING`, `PROCESSING`, `IN_PROGRESS`, `GRADING_IN_PROGRESS`, `LATE_SUBMISSION`

**Danger States (Red)**: `TERMINATED`, `FAILED`, `EXPIRED`, `DROPPED`, `EXPELLED`, `DROPOUT`, `BLACKLISTED`, `LOCKED`, `NOT_SUBMITTED`, `EMERGENCY`

**Info States (Blue)**: `DRAFT`, `PRIVATE`, `TRANSFERRED`, `DEFERRED`, `READ`, `SUBMITTED`, `RESUBMITTED`, `ALUMNI`, `SCHEDULED`, `GENERATING`

### 2. Type Enums (Blue Variants)
`FREE`, `PAID`, `PURCHASED`, `COURSE`, `COURSE_MODULE`, `COURSE_TOPIC`, `FILE_UPLOAD`, `STUDENT`, `TEACHER`, `SYSTEM_USER`

### 3. Priority Enums (Gradient: Gray → Orange → Red)
- `LOW` → Gray
- `NORMAL` → Blue  
- `HIGH` → Orange
- `URGENT` → Red

### 4. Contact Type Enums (Color-Coded)
- `PRIMARY` → Purple (Primary color)
- `SECONDARY` → Blue
- `EMERGENCY` → Red
- `BILLING` → Green

### 5. Notification Type Enums
- `ANNOUNCEMENT` → Purple
- `ASSIGNMENT_DUE` → Red
- `DEADLINE_REMINDER` → Red
- `QUIZ_AVAILABLE` → Orange
- `GRADE_POSTED` → Green
- `COURSE_UPDATE` → Blue
- `SYSTEM_ALERT` → Dark Red
- `ENROLLMENT_CONFIRMATION` → Green

### 6. Format Enums (File Type Colors)
- `PDF` → Red
- `EXCEL` → Green
- `CSV` → Blue
- `JSON` → Orange

### 7. Media Quality Enums
**Low Quality (Orange)**: `P240`, `P360`
**Medium Quality (Blue)**: `P480`, `P720`
**High Quality (Purple)**: `P1080`, `P1440`, `P2160`
**Auto Quality (Gray)**: `AUTO`

### 8. Role Enums (Purple Shades)
- `SUPER_ADMIN` → Dark Red (Highest Authority)
- `TENANT_ADMIN` → Purple
- `TEACHER` → Purple
- `STUDENT` → Blue

### 9. Payment/Course Enums
- `FREE` → Blue
- `PAID` → Green
- `PURCHASED` → Purple
- `FREE_COURSE` → Blue
- `PAID_COURSE` → Green
- `COURSE_SESSION` → Purple

### 10. Device Type Enums
- `IOS` → Black
- `ANDROID` → Green
- `WEB` → Blue
- `DESKTOP` → Gray

### 11. Gender Enums
- `MALE` → Blue
- `FEMALE` → Pink

### 12. Question Type Enums
- `MULTIPLE_CHOICE_SINGLE_ANSWER` → Blue
- `MULTIPLE_CHOICE_MULTIPLE_ANSWERS` → Blue
- `TRUE_FALSE` → Green
- `SHORT_ANSWER_ESSAY` → Purple

### 13. CDN/Encoding Enums
**Regions**: `GLOBAL`, `US_EAST`, `US_WEST`, `EUROPE`, `ASIA`, `OCEANIA` → Sky Blue

**DRM Providers**: `WIDEVINE`, `PLAYREADY`, `FAIRPLAY` → Indigo

**Encoding Presets**:
- `FAST` → Green
- `BALANCED` → Blue
- `QUALITY` → Purple
- `CUSTOM` → Gray

### 14. Report Enums
**Report Types**: `COURSE_PERFORMANCE`, `USER_ENGAGEMENT`, `SYSTEM_USAGE`, `ASSESSMENT_SUMMARY`, `VIDEO_ANALYTICS` → Purple

**Time Granularity**: `HOURLY`, `DAILY`, `WEEKLY`, `MONTHLY`, `QUARTERLY`, `YEARLY` → Blue

**Widget Types**: `CHART`, `TABLE`, `METRIC_CARD`, `PROGRESS_BAR`, `MAP`, `TIMELINE` → Purple

## Utility Classes

### Size Variants
```html
<!-- Small Badge -->
<span class="enum-badge enum-badge-sm badge-active">Active</span>

<!-- Regular Badge (default) -->
<span class="enum-badge badge-active">Active</span>

<!-- Large Badge -->
<span class="enum-badge enum-badge-lg badge-active">Active</span>
```

### Style Variants
```html
<!-- Outlined Badge -->
<span class="enum-badge enum-badge-outlined badge-active">Active</span>

<!-- Fully Rounded Badge -->
<span class="enum-badge enum-badge-rounded badge-active">Active</span>

<!-- Square Badge -->
<span class="enum-badge enum-badge-square badge-active">Active</span>
```

### Combined Utilities
```html
<!-- Small + Outlined -->
<span class="enum-badge enum-badge-sm enum-badge-outlined badge-pending">Pending</span>

<!-- Large + Rounded -->
<span class="enum-badge enum-badge-lg enum-badge-rounded badge-urgent">Urgent</span>
```

## Complete Enum Mapping

| Enum Type | Values | Badge Classes |
|-----------|--------|---------------|
| **AssignmentStatus** | DRAFT, PUBLISHED, GRADING_IN_PROGRESS, GRADED, ARCHIVED | `badge-draft`, `badge-published`, `badge-grading-in-progress`, `badge-graded`, `badge-archived` |
| **AssignmentType** | FILE_UPLOAD | `badge-file-upload` |
| **BunnyVideoStatus** | UPLOADING, PROCESSING, FINISHED, FAILED, CANCELLED | `badge-uploading`, `badge-processing`, `badge-finished`, `badge-failed`, `badge-cancelled` |
| **BunnyVideoQuality** | AUTO, P240, P360, P480, P720, P1080, P1440, P2160 | `badge-auto`, `badge-p240`, `badge-p360`, `badge-p480`, `badge-p720`, `badge-p1080`, `badge-p1440`, `badge-p2160` |
| **BunnyEncodingPreset** | FAST, BALANCED, QUALITY, CUSTOM | `badge-fast`, `badge-balanced`, `badge-quality`, `badge-custom` |
| **ClientStatus** | ACTIVE, INACTIVE, SUSPENDED, TERMINATED | `badge-active`, `badge-inactive`, `badge-suspended`, `badge-terminated` |
| **ContactType** | PRIMARY, SECONDARY, EMERGENCY, BILLING | `badge-primary`, `badge-secondary`, `badge-emergency`, `badge-billing` |
| **CourseEnrollmentType** | PAID_COURSE, FREE_COURSE, COURSE_SESSION | `badge-paid-course`, `badge-free-course`, `badge-course-session` |
| **CourseStatus** | DRAFT, PUBLIC, PRIVATE, EXPIRED, ARCHIVED | `badge-draft`, `badge-public`, `badge-private`, `badge-expired`, `badge-archived` |
| **CourseType** | FREE, PAID, PURCHASED | `badge-free`, `badge-paid`, `badge-purchased` |
| **DeliveryChannel** | IN_APP, EMAIL, PUSH, SMS | `badge-in-app`, `badge-email`, `badge-push`, `badge-sms` |
| **DeliveryStatus** | PENDING, DELIVERED, READ, DISMISSED | `badge-pending`, `badge-delivered`, `badge-read`, `badge-dismissed` |
| **DeviceType** | IOS, ANDROID, WEB, DESKTOP | `badge-ios`, `badge-android`, `badge-web`, `badge-desktop` |
| **EmailSendStatus** | PENDING, SENT, FAILED, BOUNCED | `badge-pending`, `badge-sent`, `badge-failed`, `badge-bounced` |
| **EnrollmentStatus** | PENDING, ACTIVE, COMPLETED, DROPPED, EXPELLED, SUSPENDED, TRANSFERRED, DEFERRED | `badge-pending`, `badge-active`, `badge-completed`, `badge-dropped`, `badge-expelled`, `badge-suspended`, `badge-transferred`, `badge-deferred` |
| **ExportFormat** | PDF, EXCEL, CSV, JSON | `badge-pdf`, `badge-excel`, `badge-csv`, `badge-json` |
| **Gender** | MALE, FEMALE | `badge-male`, `badge-female` |
| **NotificationPriority** | LOW, NORMAL, HIGH, URGENT | `badge-low`, `badge-normal`, `badge-high`, `badge-urgent` |
| **NotificationType** | ANNOUNCEMENT, ASSIGNMENT_DUE, QUIZ_AVAILABLE, GRADE_POSTED, COURSE_UPDATE, SYSTEM_ALERT, ENROLLMENT_CONFIRMATION, DEADLINE_REMINDER | `badge-announcement`, `badge-assignment-due`, `badge-quiz-available`, `badge-grade-posted`, `badge-course-update`, `badge-system-alert`, `badge-enrollment-confirmation`, `badge-deadline-reminder` |
| **QuizAttemptStatus** | NOT_STARTED, IN_PROGRESS, SUBMITTED, COMPLETED, GRADED | `badge-not-started`, `badge-in-progress`, `badge-submitted`, `badge-completed`, `badge-graded` |
| **QuizStatus** | DRAFT, PUBLISHED, ARCHIVED | `badge-draft`, `badge-published`, `badge-archived` |
| **ReportStatus** | PENDING, GENERATING, COMPLETED, FAILED, SCHEDULED | `badge-pending`, `badge-generating`, `badge-completed`, `badge-failed`, `badge-scheduled` |
| **StudentStatus** | ACTIVE, INACTIVE, ALUMNI, DROPOUT, SUSPENDED, ACCOUNT_FREEZED, BLACKLISTED, DEACTIVATED | `badge-active`, `badge-inactive`, `badge-alumni`, `badge-dropout`, `badge-suspended`, `badge-account-freezed`, `badge-blacklisted`, `badge-deactivated` |
| **SubmissionStatus** | NOT_SUBMITTED, SUBMITTED, LATE_SUBMISSION, GRADED, RESUBMITTED | `badge-not-submitted`, `badge-submitted`, `badge-late-submission`, `badge-graded`, `badge-resubmitted` |
| **SystemUserRole** | SUPER_ADMIN, TENANT_ADMIN | `badge-super-admin`, `badge-tenant-admin` |
| **SystemUserStatus** | ACTIVE, INACTIVE, LOCKED, SUSPENDED | `badge-active`, `badge-inactive`, `badge-locked`, `badge-suspended` |
| **TenantStatus** | ACTIVE, INACTIVE, TRIAL, SUSPENDED, TERMINATED | `badge-active`, `badge-inactive`, `badge-trial`, `badge-suspended`, `badge-terminated` |

## Styling Specifications

### Base Badge Properties
- **Padding**: `4px 12px`
- **Border Radius**: `12px`
- **Font Size**: `12px`
- **Font Weight**: `600`
- **Text Transform**: `UPPERCASE`
- **Letter Spacing**: `0.5px`
- **Display**: `inline-flex`
- **Align Items**: `center`
- **Hover Effect**: `translateY(-1px)` + shadow

### Color System
All badges use `rgba()` backgrounds with `0.1` opacity for subtle, modern appearance:
- Background: `rgba(R, G, B, 0.1)`
- Text: Solid color matching background

### Hover State
```scss
&:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}
```

## Implementation Notes

### Underscore Handling
Database enums with underscores (e.g., `PAID_COURSE`) should be converted to hyphens:
```typescript
// In component
getBadgeClass(enumValue: string): string {
  return 'badge-' + enumValue.toLowerCase().replace(/_/g, '-');
}
```

```html
<!-- In template -->
<span class="enum-badge" [ngClass]="getBadgeClass(course.enrollmentType)">
  {{ course.enrollmentType }}
</span>
```

### Null/Undefined Safety
```html
<!-- Safe navigation with default -->
<span class="enum-badge" [ngClass]="'badge-' + (status || 'unknown' | lowercase)">
  {{ status || 'Unknown' }}
</span>
```

### Dynamic Badge Lists
```html
<!-- For arrays of statuses -->
@for (status of statuses; track status) {
  <span class="enum-badge" [ngClass]="'badge-' + status.toLowerCase()">
    {{ status }}
  </span>
}
```

## Best Practices

1. **Always use lowercase conversion** for badge classes to ensure consistency
2. **Use Angular pipes** (`| lowercase`) for safer transformations
3. **Replace underscores** with hyphens in enum values with multiple words
4. **Keep base class** `enum-badge` for consistent styling
5. **Use utility classes** for size/style variants instead of custom CSS
6. **Test with actual data** to verify badge appearance matches design
7. **Document custom enums** if adding new badge types

## Maintenance

### Adding New Enum Badges
1. Open `_enum-badges.scss`
2. Find the appropriate category section
3. Add new badge class following existing pattern:
```scss
.badge-new-enum-value {
  background: rgba(R, G, B, 0.1);
  color: #RRGGBB;
}
```
4. Update this documentation file
5. Test in relevant screens

### Color Consistency
Use these color codes for consistency:
- **Success/Green**: `rgba(5, 150, 105, 0.1)` / `#059669`
- **Info/Blue**: `rgba(59, 130, 246, 0.1)` / `#3B82F6`
- **Warning/Orange**: `rgba(245, 158, 11, 0.1)` / `#F59E0B`
- **Danger/Red**: `rgba(239, 68, 68, 0.1)` / `#EF4444`
- **Primary/Purple**: `rgba(139, 92, 246, 0.1)` / `#8B5CF6`
- **Gray/Neutral**: `rgba(107, 114, 128, 0.1)` / `#6B7280`

## Migration from Old Badge System

### Before (Old System)
```html
<!-- Old custom badge classes -->
<span class="student-status" [ngClass]="getStatusClass(student.status)">
  {{ student.status }}
</span>

<span class="tenant-status active">Active</span>
```

```typescript
// Component method needed
getStatusClass(status: string): string {
  switch(status) {
    case 'ACTIVE': return 'status-active';
    case 'INACTIVE': return 'status-inactive';
    // ... many more cases
  }
}
```

### After (New System)
```html
<!-- New enum badge system -->
<span class="enum-badge" [ngClass]="'badge-' + (student.status | lowercase)">
  {{ student.status }}
</span>

<span class="enum-badge badge-active">Active</span>
```

**Benefits**:
- ✅ No component logic needed
- ✅ Consistent across all screens
- ✅ Automatic color mapping
- ✅ Easy to maintain
- ✅ Globally available

## Troubleshooting

### Badge not showing color
**Problem**: Badge shows but has no background color
**Solution**: Check if badge class is correctly spelled and lowercase:
```html
<!-- Wrong -->
<span class="enum-badge badge-ACTIVE">...</span>

<!-- Correct -->
<span class="enum-badge badge-active">...</span>
```

### Underscore in enum value
**Problem**: `badge-paid_course` class doesn't exist
**Solution**: Replace underscores with hyphens:
```html
<!-- Wrong -->
<span class="enum-badge badge-paid_course">...</span>

<!-- Correct -->
<span class="enum-badge badge-paid-course">...</span>
```

### Badge too small/large
**Problem**: Default size doesn't fit design
**Solution**: Use size utility classes:
```html
<span class="enum-badge enum-badge-sm badge-active">Active</span>
<span class="enum-badge enum-badge-lg badge-urgent">Urgent</span>
```

### Need outlined style
**Problem**: Want transparent background with border
**Solution**: Add `enum-badge-outlined` class:
```html
<span class="enum-badge enum-badge-outlined badge-pending">Pending</span>
```

---

**Last Updated**: January 2025  
**Maintained By**: Frontend Team  
**Related Files**: `_enum-badges.scss`, `main.scss`
