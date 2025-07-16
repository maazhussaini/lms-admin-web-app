// Specialization-Program Join Table (Many-to-Many)
// Direct relationships from specializations table
// (see development-data-seeding.sql for reference)
export const specializationProgramData = [
  { specialization_id: 1, program_id: 1 }, // Software Engineering <-> Computer Science
  { specialization_id: 2, program_id: 1 }, // Data Science <-> Computer Science
  { specialization_id: 3, program_id: 2 }, // Marketing <-> Business Administration
  { specialization_id: 4, program_id: 2 }, // Finance <-> Business Administration
  { specialization_id: 5, program_id: 3 }, // Renewable Energy <-> Environmental Science
  { specialization_id: 6, program_id: 5 }, // Clinical Psychology <-> Psychology
  // Additional many-to-many relationships for realism
  { specialization_id: 1, program_id: 4 }, // Software Engineering <-> Mechanical Engineering
  { specialization_id: 2, program_id: 2 }, // Data Science <-> Business Administration
  { specialization_id: 3, program_id: 5 }, // Marketing <-> Psychology
  { specialization_id: 4, program_id: 3 }, // Finance <-> Environmental Science
  { specialization_id: 5, program_id: 4 }, // Renewable Energy <-> Mechanical Engineering
  { specialization_id: 6, program_id: 2 }, // Clinical Psychology <-> Business Administration
];
