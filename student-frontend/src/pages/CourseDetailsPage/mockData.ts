import type { 
  Course,
  CourseModule,
  CourseTopic,
  CourseVideo,
  CourseDocument,
  StudentCourseProgress,
  VideoUploadStatus
} from '@shared/types';

/**
 * Interface for course details with related data
 */
export interface CourseDetailsData extends Course {
  modules: Array<CourseModule & {
    topics: Array<CourseTopic & {
      videos: CourseVideo[];
      documents: CourseDocument[];
    }>;
  }>;
  progress?: StudentCourseProgress;
  instructor?: {
    name: string;
    avatar?: string;
    bio?: string;
  };
  enrollment?: {
    enrolledAt: string;
    totalStudents: number;
    rating: number;
    reviewCount: number;
  };
}

/**
 * Mock course details data for UI demonstration and development
 */
export const mockCourseDetailsData: Record<number, CourseDetailsData> = {
  1: {
    // Base course data
    course_id: 1,
    course_name: 'Computer Science Fundamentals',
    course_description: 'Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a. Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.Lorem ipsum dolor sit amet consectetur. Condimentum dignissim metus faucibus dui a.',
    main_thumbnail_url: null,
    course_status: 'PUBLIC',
    course_total_hours: 15.5,
    specialization_id: 1,
    course_type: 'PAID',
    course_price: 99.99,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-01-15').toISOString(),
    updated_at: new Date('2024-06-01').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    // Extended data
    instructor: {
      name: 'Dr. Chris Evans',
      avatar: '/images/instructors/chris-evans.jpg',
      bio: 'Professor of Computer Science with 15+ years of teaching experience. Expert in algorithms, data structures, and software engineering practices.'
    },
    
    enrollment: {
      enrolledAt: '2024-02-01T10:00:00Z',
      totalStudents: 2847,
      rating: 4.8,
      reviewCount: 423
    },
    
    progress: {
      student_course_progress_id: 1,
      student_id: 1,
      course_id: 1,
      overall_progress_percentage: 75,
      modules_completed: 3,
      videos_completed: 12,
      quizzes_completed: 2,
      assignments_completed: 1,
      total_time_spent_minutes: 680,
      last_accessed_at: new Date().toISOString(),
      is_course_completed: false,
      completion_date: null,
      tenant_id: 1,
      is_active: true,
      is_deleted: false,
      created_at: new Date('2024-02-01').toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_ip: '127.0.0.1',
      updated_ip: '127.0.0.1'
    },
    
    modules: [
      {
        course_module_id: 1,
        course_id: 1,
        course_module_name: 'Introduction to Programming',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date('2024-01-15').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 1,
            course_topic_name: 'What is Programming?',
            module_id: 1,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date('2024-01-15').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 1,
                course_id: 1,
                course_topic_id: 1,
                bunny_video_id: 'vid_001',
                video_name: 'Introduction to Programming Concepts',
                video_url: 'https://stream.bunnycdn.com/playlist.m3u8',
                thumbnail_url: '/images/thumbnails/intro-programming.jpg',
                duration_seconds: 1200,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              },
              {
                course_video_id: 2,
                course_id: 1,
                course_topic_id: 1,
                bunny_video_id: 'vid_002',
                video_name: 'Programming Languages Overview',
                video_url: 'https://stream.bunnycdn.com/playlist2.m3u8',
                thumbnail_url: '/images/thumbnails/languages-overview.jpg',
                duration_seconds: 900,
                position: 2,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 1,
                course_id: 1,
                document_name: 'Programming Basics - Course Notes.pdf',
                document_url: '/documents/programming-basics-notes.pdf',
                course_topic_id: 1,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          },
          {
            course_topic_id: 2,
            course_topic_name: 'Setting Up Development Environment',
            module_id: 1,
            position: 2,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date('2024-01-15').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 3,
                course_id: 1,
                course_topic_id: 2,
                bunny_video_id: 'vid_003',
                video_name: 'Installing Code Editor',
                video_url: 'https://stream.bunnycdn.com/playlist3.m3u8',
                thumbnail_url: '/images/thumbnails/code-editor.jpg',
                duration_seconds: 750,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 2,
                course_id: 1,
                document_name: 'Development Environment Setup Guide.pdf',
                document_url: '/documents/dev-setup-guide.pdf',
                course_topic_id: 2,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      },
      {
        course_module_id: 2,
        course_id: 1,
        course_module_name: 'Data Structures & Algorithms',
        position: 2,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date('2024-01-15').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 3,
            course_topic_name: 'Arrays and Lists',
            module_id: 2,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date('2024-01-15').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 4,
                course_id: 1,
                course_topic_id: 3,
                bunny_video_id: 'vid_004',
                video_name: 'Understanding Arrays',
                video_url: 'https://stream.bunnycdn.com/playlist4.m3u8',
                thumbnail_url: '/images/thumbnails/arrays.jpg',
                duration_seconds: 1350,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              },
              {
                course_video_id: 5,
                course_id: 1,
                course_topic_id: 3,
                bunny_video_id: 'vid_005',
                video_name: 'Dynamic Arrays vs Static Arrays',
                video_url: 'https://stream.bunnycdn.com/playlist5.m3u8',
                thumbnail_url: '/images/thumbnails/dynamic-arrays.jpg',
                duration_seconds: 980,
                position: 2,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: true,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 3,
                course_id: 1,
                document_name: 'Arrays Cheat Sheet.pdf',
                document_url: '/documents/arrays-cheat-sheet.pdf',
                course_topic_id: 3,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      },
      {
        course_module_id: 3,
        course_id: 1,
        course_module_name: 'Object-Oriented Programming',
        position: 3,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-01-15').toISOString(),
        updated_at: new Date('2024-01-15').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 4,
            course_topic_name: 'Classes and Objects',
            module_id: 3,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-01-15').toISOString(),
            updated_at: new Date('2024-01-15').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 6,
                course_id: 1,
                course_topic_id: 4,
                bunny_video_id: 'vid_006',
                video_name: 'Introduction to Classes',
                video_url: 'https://stream.bunnycdn.com/playlist6.m3u8',
                thumbnail_url: '/images/thumbnails/classes.jpg',
                duration_seconds: 1600,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: true,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-15').toISOString(),
                updated_at: new Date('2024-01-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: []
          }
        ]
      }
    ]
  },
  
  2: {
    // Base course data
    course_id: 2,
    course_name: 'Introduction To Python',
    course_description: 'Master Python programming from basics to advanced concepts. Learn data structures, algorithms, and build real-world applications with hands-on projects.',
    main_thumbnail_url: null,
    course_status: 'PUBLIC',
    course_total_hours: 12.5,
    specialization_id: 2,
    course_type: 'FREE',
    course_price: 0,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2025-05-01').toISOString(),
    updated_at: new Date('2025-07-01').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    instructor: {
      name: 'Chris Evans',
      avatar: '/images/instructors/chris-evans.jpg',
      bio: 'Senior Python Developer and Data Scientist with 10+ years of experience. Expert in machine learning, web development, and automation.'
    },
    
    enrollment: {
      enrolledAt: '2025-05-15T10:00:00Z',
      totalStudents: 3247,
      rating: 4.8,
      reviewCount: 542
    },
    
    progress: {
      student_course_progress_id: 2,
      student_id: 1,
      course_id: 2,
      overall_progress_percentage: 40,
      modules_completed: 2,
      videos_completed: 8,
      quizzes_completed: 1,
      assignments_completed: 1,
      total_time_spent_minutes: 485,
      last_accessed_at: new Date().toISOString(),
      is_course_completed: false,
      completion_date: null,
      tenant_id: 1,
      is_active: true,
      is_deleted: false,
      created_at: new Date('2025-05-15').toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_ip: '127.0.0.1',
      updated_ip: '127.0.0.1'
    },
    
    modules: [
      {
        course_module_id: 4,
        course_id: 2,
        course_module_name: 'React Fundamentals',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-02-01').toISOString(),
        updated_at: new Date('2024-02-01').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 5,
            course_topic_name: 'Getting Started with React',
            module_id: 4,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-02-01').toISOString(),
            updated_at: new Date('2024-02-01').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 7,
                course_id: 2,
                course_topic_id: 5,
                bunny_video_id: 'vid_007',
                video_name: 'What is React?',
                video_url: 'https://stream.bunnycdn.com/react1.m3u8',
                thumbnail_url: '/images/thumbnails/what-is-react.jpg',
                duration_seconds: 720,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-02-01').toISOString(),
                updated_at: new Date('2024-02-01').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 4,
                course_id: 2,
                document_name: 'React Quick Reference.pdf',
                document_url: '/documents/react-quick-reference.pdf',
                course_topic_id: 5,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-02-01').toISOString(),
                updated_at: new Date('2024-02-01').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      }
    ]
  },
  
  3: {
    // Advanced JavaScript Course
    course_id: 3,
    course_name: 'Advanced JavaScript',
    course_description: 'Master advanced JavaScript concepts including ES6+, async programming, and design patterns. Take your JavaScript skills to the next level.',
    main_thumbnail_url: '/images/courses/advanced-js.jpg',
    course_status: 'PUBLIC',
    course_total_hours: 12.0,
    specialization_id: 1,
    course_type: 'PAID',
    course_price: 149.99,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-01-20').toISOString(),
    updated_at: new Date('2024-06-10').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    instructor: {
      name: 'Michael Chen',
      avatar: '/images/instructors/michael-chen.jpg',
      bio: 'Senior JavaScript Developer with expertise in modern frameworks and advanced language features.'
    },
    
    enrollment: {
      enrolledAt: '2024-04-01T09:15:00Z',
      totalStudents: 1234,
      rating: 4.7,
      reviewCount: 187
    },
    
    progress: {
      student_course_progress_id: 3,
      student_id: 1,
      course_id: 3,
      overall_progress_percentage: 20,
      modules_completed: 0,
      videos_completed: 2,
      quizzes_completed: 0,
      assignments_completed: 0,
      total_time_spent_minutes: 85,
      last_accessed_at: new Date().toISOString(),
      is_course_completed: false,
      completion_date: null,
      tenant_id: 1,
      is_active: true,
      is_deleted: false,
      created_at: new Date('2024-04-01').toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_ip: '127.0.0.1',
      updated_ip: '127.0.0.1'
    },
    
    modules: [
      {
        course_module_id: 5,
        course_id: 3,
        course_module_name: 'ES6+ Features',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-01-20').toISOString(),
        updated_at: new Date('2024-01-20').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 6,
            course_topic_name: 'Arrow Functions and Template Literals',
            module_id: 5,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-01-20').toISOString(),
            updated_at: new Date('2024-01-20').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 8,
                course_id: 3,
                course_topic_id: 6,
                bunny_video_id: 'vid_008',
                video_name: 'Modern Function Syntax',
                video_url: 'https://stream.bunnycdn.com/js1.m3u8',
                thumbnail_url: '/images/thumbnails/arrow-functions.jpg',
                duration_seconds: 1080,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-20').toISOString(),
                updated_at: new Date('2024-01-20').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 5,
                course_id: 3,
                document_name: 'ES6 Reference Guide.pdf',
                document_url: '/documents/es6-reference.pdf',
                course_topic_id: 6,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-01-20').toISOString(),
                updated_at: new Date('2024-01-20').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      }
    ]
  },
  
  4: {
    // Database Design Course
    course_id: 4,
    course_name: 'Database Design',
    course_description: 'Learn relational database design principles and SQL optimization. Master database architecture and performance tuning.',
    main_thumbnail_url: '/images/courses/database-design.jpg',
    course_status: 'PUBLIC',
    course_total_hours: 6.75,
    specialization_id: 2,
    course_type: 'PAID',
    course_price: 79.99,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-02-15').toISOString(),
    updated_at: new Date('2024-06-20').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    instructor: {
      name: 'Emily Rodriguez',
      avatar: '/images/instructors/emily-rodriguez.jpg',
      bio: 'Database Architect with 12+ years experience in enterprise database design and optimization.'
    },
    
    enrollment: {
      enrolledAt: '2024-05-10T11:20:00Z',
      totalStudents: 892,
      rating: 4.6,
      reviewCount: 143
    },
    
    modules: [
      {
        course_module_id: 6,
        course_id: 4,
        course_module_name: 'Database Fundamentals',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-02-15').toISOString(),
        updated_at: new Date('2024-02-15').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 7,
            course_topic_name: 'Relational Database Concepts',
            module_id: 6,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-02-15').toISOString(),
            updated_at: new Date('2024-02-15').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 9,
                course_id: 4,
                course_topic_id: 7,
                bunny_video_id: 'vid_009',
                video_name: 'Introduction to Databases',
                video_url: 'https://stream.bunnycdn.com/db1.m3u8',
                thumbnail_url: '/images/thumbnails/database-intro.jpg',
                duration_seconds: 900,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-02-15').toISOString(),
                updated_at: new Date('2024-02-15').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: []
          }
        ]
      }
    ]
  },
  
  5: {
    // UI/UX Design Course
    course_id: 5,
    course_name: 'UI/UX Design Fundamentals',
    course_description: 'Master the principles of user interface and user experience design. Learn design thinking, prototyping, and user research methods.',
    main_thumbnail_url: '/images/courses/uiux-design.jpg',
    course_status: 'PUBLIC',
    course_total_hours: 10.5,
    specialization_id: 3,
    course_type: 'PAID',
    course_price: 129.99,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-03-01').toISOString(),
    updated_at: new Date('2024-06-25').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    instructor: {
      name: 'David Kim',
      avatar: '/images/instructors/david-kim.jpg',
      bio: 'Senior UX Designer at leading tech companies. Specializes in user-centered design and design systems.'
    },
    
    enrollment: {
      enrolledAt: '2024-06-01T13:45:00Z',
      totalStudents: 1567,
      rating: 4.9,
      reviewCount: 298
    },
    
    progress: {
      student_course_progress_id: 4,
      student_id: 1,
      course_id: 5,
      overall_progress_percentage: 60,
      modules_completed: 2,
      videos_completed: 7,
      quizzes_completed: 1,
      assignments_completed: 1,
      total_time_spent_minutes: 420,
      last_accessed_at: new Date().toISOString(),
      is_course_completed: false,
      completion_date: null,
      tenant_id: 1,
      is_active: true,
      is_deleted: false,
      created_at: new Date('2024-06-01').toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_ip: '127.0.0.1',
      updated_ip: '127.0.0.1'
    },
    
    modules: [
      {
        course_module_id: 7,
        course_id: 5,
        course_module_name: 'Design Thinking',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-03-01').toISOString(),
        updated_at: new Date('2024-03-01').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 8,
            course_topic_name: 'User Research Methods',
            module_id: 7,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-03-01').toISOString(),
            updated_at: new Date('2024-03-01').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 10,
                course_id: 5,
                course_topic_id: 8,
                bunny_video_id: 'vid_010',
                video_name: 'Understanding Your Users',
                video_url: 'https://stream.bunnycdn.com/ux1.m3u8',
                thumbnail_url: '/images/thumbnails/user-research.jpg',
                duration_seconds: 1200,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-03-01').toISOString(),
                updated_at: new Date('2024-03-01').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 6,
                course_id: 5,
                document_name: 'UX Research Template.pdf',
                document_url: '/documents/ux-research-template.pdf',
                course_topic_id: 8,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-03-01').toISOString(),
                updated_at: new Date('2024-03-01').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      }
    ]
  },
  
  6: {
    // Digital Marketing Course
    course_id: 6,
    course_name: 'Digital Marketing Strategy',
    course_description: 'Comprehensive guide to modern digital marketing techniques and tools. Learn SEO, social media marketing, content strategy, and analytics.',
    main_thumbnail_url: '/images/courses/digital-marketing.jpg',
    course_status: 'PUBLIC',
    course_total_hours: 4.5,
    specialization_id: 4,
    course_type: 'FREE',
    course_price: 0,
    tenant_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date('2024-03-10').toISOString(),
    updated_at: new Date('2024-07-01').toISOString(),
    created_by: 1,
    updated_by: 1,
    created_ip: '127.0.0.1',
    updated_ip: '127.0.0.1',
    
    instructor: {
      name: 'Lisa Thompson',
      avatar: '/images/instructors/lisa-thompson.jpg',
      bio: 'Digital Marketing Director with 10+ years experience in B2B and B2C marketing.'
    },
    
    enrollment: {
      enrolledAt: '2024-07-01T16:30:00Z',
      totalStudents: 3456,
      rating: 4.8,
      reviewCount: 672
    },
    
    progress: {
      student_course_progress_id: 5,
      student_id: 1,
      course_id: 6,
      overall_progress_percentage: 100,
      modules_completed: 3,
      videos_completed: 12,
      quizzes_completed: 3,
      assignments_completed: 2,
      total_time_spent_minutes: 270,
      last_accessed_at: new Date().toISOString(),
      is_course_completed: true,
      completion_date: new Date('2024-07-15').toISOString(),
      tenant_id: 1,
      is_active: true,
      is_deleted: false,
      created_at: new Date('2024-07-01').toISOString(),
      updated_at: new Date().toISOString(),
      created_by: 1,
      updated_by: 1,
      created_ip: '127.0.0.1',
      updated_ip: '127.0.0.1'
    },
    
    modules: [
      {
        course_module_id: 8,
        course_id: 6,
        course_module_name: 'Digital Marketing Foundations',
        position: 1,
        tenant_id: 1,
        is_active: true,
        is_deleted: false,
        created_at: new Date('2024-03-10').toISOString(),
        updated_at: new Date('2024-03-10').toISOString(),
        created_by: 1,
        updated_by: 1,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
        
        topics: [
          {
            course_topic_id: 9,
            course_topic_name: 'Marketing Strategy & Planning',
            module_id: 8,
            position: 1,
            tenant_id: 1,
            is_active: true,
            is_deleted: false,
            created_at: new Date('2024-03-10').toISOString(),
            updated_at: new Date('2024-03-10').toISOString(),
            created_by: 1,
            updated_by: 1,
            created_ip: '127.0.0.1',
            updated_ip: '127.0.0.1',
            
            videos: [
              {
                course_video_id: 11,
                course_id: 6,
                course_topic_id: 9,
                bunny_video_id: 'vid_011',
                video_name: 'Creating a Marketing Strategy',
                video_url: 'https://stream.bunnycdn.com/marketing1.m3u8',
                thumbnail_url: '/images/thumbnails/marketing-strategy.jpg',
                duration_seconds: 800,
                position: 1,
                upload_status: 'COMPLETED' as VideoUploadStatus,
                is_locked: false,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-03-10').toISOString(),
                updated_at: new Date('2024-03-10').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ],
            
            documents: [
              {
                course_document_id: 7,
                course_id: 6,
                document_name: 'Marketing Strategy Worksheet.pdf',
                document_url: '/documents/marketing-strategy-worksheet.pdf',
                course_topic_id: 9,
                tenant_id: 1,
                is_active: true,
                is_deleted: false,
                created_at: new Date('2024-03-10').toISOString(),
                updated_at: new Date('2024-03-10').toISOString(),
                created_by: 1,
                updated_by: 1,
                created_ip: '127.0.0.1',
                updated_ip: '127.0.0.1'
              }
            ]
          }
        ]
      }
    ]
  }
};

/**
 * Get mock course details data by course ID
 * @param courseId - The course ID to fetch details for
 * @returns CourseDetailsData or null if not found
 */
export const getMockCourseDetails = (courseId: number): CourseDetailsData | null => {
  return mockCourseDetailsData[courseId] || null;
};
