// Specialization-Program Join Table (Many-to-Many)
// Direct relationships from specializations table
// (see development-data-seeding.sql for reference)
export const specialization_programs = [
  {
    specialization_id: 1,
    program_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  },
  {
    specialization_id: 2,
    program_id: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  },
  {
    specialization_id: 3,
    program_id: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  },
  {
    specialization_id: 4,
    program_id: 1,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  },
  {
    specialization_id: 5,
    program_id: 3,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  },
  {
    specialization_id: 6,
    program_id: 2,
    is_active: true,
    is_deleted: false,
    created_at: new Date(),
    updated_at: new Date(),
    created_by: 1,
    updated_by: null,
    deleted_at: null,
    deleted_by: null,
    created_ip: "10.1.2.1",
    updated_ip: "10.1.2.2"
  }
];
