import { UploadStatus } from '@prisma/client';

// Seed data for assignment submission files
// All fields mapped from SQL, robust audit fields, type-safe
// Date math uses Date.now() for relative intervals

export const assignmentSubmissionFiles = [
  // Sarah Johnson (student 1) - Assignment 1 - completed upload
  {
    tenant_id: 1,
    student_assignment_id: 1,
    original_file_name: 'sarah_johnson_assignment1.pdf',
    file_url: 'https://cdn.example.com/assignments/sarah_johnson_assignment1.pdf',
    file_size_bytes: 204800,
    mime_type: 'application/pdf',
    upload_status: UploadStatus.COMPLETED,
    uploaded_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
    created_by: 1,
    updated_by: 1,
    deleted_at: null,
    deleted_by: null,
    created_ip: '16.1.1.1',
    updated_ip: '16.1.1.2',
  },
  // Alex Smith (student 2) - Assignment 2 - pending upload
  {
    tenant_id: 1,
    student_assignment_id: 2,
    original_file_name: 'alex_smith_assignment2.docx',
    file_url: 'https://cdn.example.com/assignments/alex_smith_assignment2.docx',
    file_size_bytes: 102400,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upload_status: UploadStatus.PENDING,
    uploaded_at: null,
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    created_by: 2,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '16.1.1.3',
    updated_ip: '16.1.1.4',
  },
  // Matthew Chen (student 4) - Assignment 4 - completed upload
  {
    tenant_id: 1,
    student_assignment_id: 4,
    original_file_name: 'matthew_chen_assignment4.pdf',
    file_url: 'https://cdn.example.com/assignments/matthew_chen_assignment4.pdf',
    file_size_bytes: 307200,
    mime_type: 'application/pdf',
    upload_status: UploadStatus.COMPLETED,
    uploaded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    updated_at: new Date(),
    created_by: 4,
    updated_by: 2,
    deleted_at: null,
    deleted_by: null,
    created_ip: '16.1.1.5',
    updated_ip: '16.1.1.6',
  },
  // Alina Patel (student 5) - Assignment 5 - uploading
  {
    tenant_id: 1,
    student_assignment_id: 5,
    original_file_name: 'alina_patel_assignment5.docx',
    file_url: 'https://cdn.example.com/assignments/alina_patel_assignment5.docx',
    file_size_bytes: 51200,
    mime_type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    upload_status: UploadStatus.UPLOADING,
    uploaded_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    is_active: true,
    is_deleted: false,
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    updated_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    created_by: 5,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: '16.1.1.7',
    updated_ip: '16.1.1.8',
  },
];

export default assignmentSubmissionFiles;
