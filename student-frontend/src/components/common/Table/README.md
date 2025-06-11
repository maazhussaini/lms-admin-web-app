# Table Component with Sorting and Pagination

This directory contains components for displaying tabular data with sorting, pagination, and record count features.

## Components

### Table

A flexible table component that displays data in rows and columns with support for:

- Sorting (click column headers)
- Loading skeleton states
- Empty state handling
- Row hover effects
- Striped rows
- Custom cell rendering

### TableToolbar

A toolbar component that works with the Table component to provide:

- Sort dropdown selection
- Page size selector
- Record count display
- Custom actions (e.g., "Add" button)

### TableToolbarEnhanced

An enhanced version of the TableToolbar component with improved UI/UX, accessibility, and responsive design:

- **Enhanced UI/UX**:
  - Modern design with improved visuals
  - Dark mode support that automatically detects system preferences
  - Tooltips for better context and usability
  - Animation effects using Framer Motion for smooth transitions
  - Shimmer loading effect instead of basic placeholders

- **Improved Accessibility**:
  - Keyboard navigation for all interactive elements
  - ARIA attributes to enhance screen reader support
  - Focus indicators for keyboard users
  - Color contrast that meets WCAG standards

- **Responsive Design**:
  - Mobile-optimized view with collapsible filter section
  - Adaptive layouts for different screen sizes
  - Touch-friendly interactive elements

- **Additional Functionality**:
  - Search functionality with a custom SearchInput component
  - User preference persistence with localStorage
  - Custom Dropdown component replacing native select elements

## Usage Example

### With Original TableToolbar

```tsx
import React, { useState } from 'react';
import { Table, TableToolbar } from '@/components/common/Table';
```

### With Enhanced TableToolbar

```tsx
import React, { useState } from 'react';
import { Table, TableToolbarEnhanced } from '@/components/common/Table';
```

You can see a demo comparison of both components at route `/demos/table-toolbar`.
import { IUser } from '@shared/types';

const UserList: React.FC = () => {
  // Pagination state
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
  });
  
  // Sorting state
  const [sort, setSort] = useState({
    column: 'fullName',
    direction: 'asc' as 'asc' | 'desc',
  });
  
  // Fetch data with the current pagination and sort parameters
  const { data, isLoading } = useQuery({
    queryKey: ['users', pagination, sort],
    queryFn: () => fetchUsers({
      ...pagination,
      sortBy: sort.column,
      sortDirection: sort.direction,
    }),
  });
  
  // Define sort options for the dropdown
  const sortOptions = [
    { label: 'Name (A-Z)', value: 'fullName', direction: 'asc' as const },
    { label: 'Name (Z-A)', value: 'fullName', direction: 'desc' as const },
    // Add more sort options as needed
  ];
  
  // Define columns with sortable property
  const columns = [
    {
      header: 'Name',
      accessor: 'fullName',
      id: 'fullName',
      sortable: true,
    },
    // Add more columns as needed
  ];
  
  return (
    <div className="space-y-4">
      {/* Table Toolbar */}
      <TableToolbar
        totalRecords={data?.totalItems}
        sortOptions={sortOptions}
        currentSort={sortOptions.find(
          option => option.value === sort.column && option.direction === sort.direction
        )}
        onSortChange={(sortOption) => {
          setSort({
            column: sortOption.value,
            direction: sortOption.direction,
          });
        }}
        pageSizeOptions={[
          { label: '10 per page', value: 10 },
          { label: '25 per page', value: 25 },
          { label: '50 per page', value: 50 },
        ]}
        currentPageSize={pagination.limit}
        onPageSizeChange={(pageSize) => {
          setPagination(prev => ({ ...prev, limit: pageSize, page: 1 }));
        }}
        isLoading={isLoading}
        actions={<Button>Add New</Button>}
      />
      
      {/* Table Component */}
      <Table<IUser>
        data={data?.items || []}
        columns={columns}
        keyExtractor={(item) => item._id}
        isLoading={isLoading}
        sortColumn={sort.column}
        sortDirection={sort.direction}
        onSort={(columnId, direction) => {
          setSort({ column: columnId, direction });
        }}
      />
      
      {/* Add Pagination component here */}
    </div>
  );
};
```

## Props

### Table Props

| Prop            | Type                                    | Description                             |
|-----------------|----------------------------------------|-----------------------------------------|
| data            | `T[]`                                   | Array of data to display                |
| columns         | `Column<T>[]`                          | Column definitions                      |
| keyExtractor    | `(item: T) => string`                  | Function to extract unique key for rows |
| isLoading       | `boolean`                              | Loading state                           |
| skeletonRowCount| `number`                               | Number of skeleton rows when loading    |
| className       | `string`                               | Additional CSS class for container      |
| tableClassName  | `string`                               | Additional CSS class for table element  |
| hoverEffect     | `boolean`                              | Whether to show hover effect on rows    |
| striped         | `boolean`                              | Whether to show striped rows            |
| sortColumn      | `string`                               | Current sort column ID                  |
| sortDirection   | `'asc' \| 'desc'`                      | Current sort direction                  |
| onSort          | `(columnId: string, direction: 'asc' \| 'desc') => void` | Sort handler         |

### Column Props

| Prop            | Type                                    | Description                             |
|-----------------|----------------------------------------|-----------------------------------------|
| header          | `string`                               | Column header text                       |
| accessor        | `keyof T \| ((row: T) => ReactNode)`   | Property key or render function         |
| className       | `string`                               | Additional CSS class for column         |
| sortable        | `boolean`                              | Whether column is sortable              |
| id              | `string`                               | Unique identifier for column            |

### TableToolbar Props

| Prop            | Type                                    | Description                             |
|-----------------|----------------------------------------|-----------------------------------------|
| totalRecords    | `number`                               | Total record count                      |
| sortOptions     | `SortOption<T>[]`                      | Available sort options                  |
| currentSort     | `SortOption<T>`                        | Currently selected sort option          |
| onSortChange    | `(sortOption: SortOption<T>) => void`  | Sort change handler                     |
| pageSizeOptions | `PageSizeOption[]`                     | Available page size options             |
| currentPageSize | `number`                               | Current page size                       |
| onPageSizeChange| `(pageSize: number) => void`           | Page size change handler                |
| isLoading       | `boolean`                              | Loading state                           |
| className       | `string`                               | Additional CSS class                    |
| actions         | `ReactNode`                            | Custom action buttons/elements          |

## Best Practices

1. Keep column definitions consistent across your application
2. Define sensible default sort options
3. Reset to page 1 when changing sort or filtering
4. Handle empty states appropriately
5. Add meaningful aria attributes for accessibility
