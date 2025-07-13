INSERT INTO tenants (
    tenant_name, logo_url_light, logo_url_dark, favicon_url, theme, tenant_status,
    is_active, is_deleted, created_at, updated_at, created_by, updated_by,
    deleted_at, deleted_by, created_ip, updated_ip
) VALUES
('Alpha Academy', 'https://example.com/logo_light1.png', 'https://example.com/logo_dark1.png', 'https://example.com/favicon1.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '192.168.1.1', '192.168.1.2'),
('Beta School', 'https://example.com/logo_light2.png', 'https://example.com/logo_dark2.png', 'https://example.com/favicon2.ico', '{}'::jsonb, 'TRIAL', true, false, NOW(), NOW(), 2, 3, NULL, NULL, '192.168.1.3', '192.168.1.4'),
('Gamma Learning', 'https://example.com/logo_light3.png', 'https://example.com/logo_dark3.png', 'https://example.com/favicon3.ico', '{}'::jsonb, 'SUSPENDED', true, false, NOW(), NOW(), 3, 4, NULL, NULL, '192.168.1.5', '192.168.1.6'),
('Delta Institute', 'https://example.com/logo_light4.png', 'https://example.com/logo_dark4.png', 'https://example.com/favicon4.ico', '{}'::jsonb, 'EXPIRED', true, false, NOW(), NOW(), 4, 5, NULL, NULL, '192.168.1.7', '192.168.1.8'),
('Epsilon University', 'https://example.com/logo_light5.png', 'https://example.com/logo_dark5.png', 'https://example.com/favicon5.ico', '{}'::jsonb, 'CANCELLED', false, true, NOW(), NOW(), 5, 6, NOW(), 6, '192.168.1.9', '192.168.2.0'),
('Zeta College', 'https://example.com/logo_light6.png', 'https://example.com/logo_dark6.png', 'https://example.com/favicon6.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '192.168.2.1', '192.168.2.2'),
('Eta Academy', 'https://example.com/logo_light7.png', 'https://example.com/logo_dark7.png', 'https://example.com/favicon7.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.2.3', '192.168.2.4'),
('Theta School', 'https://example.com/logo_light8.png', 'https://example.com/logo_dark8.png', 'https://example.com/favicon8.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '192.168.2.5', '192.168.2.6'),
('Iota Learning', 'https://example.com/logo_light9.png', 'https://example.com/logo_dark9.png', 'https://example.com/favicon9.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '192.168.2.7', '192.168.2.8'),
('Kappa Institute', 'https://example.com/logo_light10.png', 'https://example.com/logo_dark10.png', 'https://example.com/favicon10.ico', '{}'::jsonb, 'ACTIVE', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '192.168.2.9', '192.168.3.0');



INSERT INTO clients (
    full_name, email_address, dial_code, phone_number, address, client_status,
    tenant_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by,
    deleted_at, deleted_by, created_ip, updated_ip
) VALUES
('John Smith', 'john.smith@example.com', '1', '1234567890', '123 Main St, New York, NY', 'ACTIVE', 1, true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.0.0.1', '10.0.0.2'),
('Emily Davis', 'emily.davis@example.com', '44', '7700123456', '45 Park Lane, London', 'INACTIVE', 2, false, true, NOW(), NOW(), 2, 3, NOW(), 3, '10.0.0.3', '10.0.0.4'),
('Ahmed Khan', 'ahmed.khan@example.com', '92', '3012345678', 'House 12, Street 5, Lahore', 'SUSPENDED', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.0.5', '10.0.0.6'),
('Linda Nguyen', 'linda.nguyen@example.com', '61', '412345678', '22 George St, Sydney', 'ACTIVE', 3, true, false, NOW(), NOW(), 3, 1, NULL, NULL, '10.0.0.7', '10.0.0.8'),
('Carlos Ruiz', 'carlos.ruiz@example.com', '34', '612345678', 'Calle Mayor, Madrid', 'TERMINATED', 2, false, true, NOW(), NOW(), 2, 1, NOW(), 1, '10.0.0.9', '10.0.0.10'),
('Zara Ali', 'zara.ali@example.com', '91', '9812345678', 'Sector 5, Mumbai', 'ACTIVE', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.0.11', '10.0.0.12'),
('Tom Becker', 'tom.becker@example.com', '49', '15123456789', 'Berlin Mitte', 'SUSPENDED', 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.0.0.13', '10.0.0.14'),
('Naomi Tanaka', 'naomi.tanaka@example.com', '81', '9012345678', 'Shibuya, Tokyo', 'ACTIVE', 4, true, false, NOW(), NOW(), 4, 2, NULL, NULL, '10.0.0.15', '10.0.0.16'),
('Mohammed Salah', 'salah.m@example.com', '20', '1001234567', 'Cairo, Egypt', 'INACTIVE', 2, false, true, NOW(), NOW(), 2, 1, NOW(), 1, '10.0.0.17', '10.0.0.18'),
('Olivia Brown', 'olivia.b@example.com', '1', '9876543210', 'San Francisco, CA', 'ACTIVE', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.0.19', '10.0.0.20');



INSERT INTO tenant_phone_numbers (
    tenant_id, dial_code, phone_number, iso_country_code, is_primary, contact_type,
    is_active, is_deleted, created_at, updated_at, created_by, updated_by,
    deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, '1', '1234567890', 'US', true, 'PRIMARY', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.10.1.1', '10.10.1.2'),
(1, '1', '1234567891', 'US', false, 'SECONDARY', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.10.1.3', '10.10.1.4'),
(2, '44', '7700123456', 'GB', true, 'PRIMARY', true, false, NOW(), NOW(), 2, 3, NULL, NULL, '10.10.1.5', '10.10.1.6'),
(2, '44', '7700123457', 'GB', false, 'EMERGENCY', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.10.1.7', '10.10.1.8'),
(3, '92', '3001234567', 'PK', true, 'PRIMARY', true, false, NOW(), NOW(), 3, 1, NULL, NULL, '10.10.1.9', '10.10.2.0'),
(3, '92', '3012345678', 'PK', false, 'BILLING', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.10.2.1', '10.10.2.2'),
(4, '61', '412345678', 'AU', true, 'PRIMARY', true, false, NOW(), NOW(), 4, 2, NULL, NULL, '10.10.2.3', '10.10.2.4'),
(5, '34', '612345678', 'ES', true, 'PRIMARY', true, false, NOW(), NOW(), 5, 1, NULL, NULL, '10.10.2.5', '10.10.2.6'),
(5, '34', '612345679', 'ES', false, 'SECONDARY', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.10.2.7', '10.10.2.8'),
(6, '91', '9812345678', 'IN', true, 'EMERGENCY', true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '10.10.2.9', '10.10.3.0');



INSERT INTO tenant_email_addresses (
    tenant_id, email_address, is_primary, contact_type,
    is_active, is_deleted, created_at, updated_at, created_by, updated_by,
    deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'primary@alpha-academy.com', true, 'PRIMARY', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.20.0.1', '10.20.0.2'),
(1, 'billing@alpha-academy.com', false, 'BILLING', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.20.0.3', '10.20.0.4'),
(2, 'admin@beta-school.org', true, 'PRIMARY', true, false, NOW(), NOW(), 2, 3, NULL, NULL, '10.20.0.5', '10.20.0.6'),
(2, 'support@beta-school.org', false, 'SECONDARY', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.20.0.7', '10.20.0.8'),
(3, 'emergency@gamma-learning.edu', false, 'EMERGENCY', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.20.0.9', '10.20.1.0'),
(3, 'contact@gamma-learning.edu', true, 'PRIMARY', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.20.1.1', '10.20.1.2'),
(4, 'info@delta-institute.com', true, 'PRIMARY', true, false, NOW(), NOW(), 4, 2, NULL, NULL, '10.20.1.3', '10.20.1.4'),
(5, 'billing@epsilon-univ.net', false, 'BILLING', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.20.1.5', '10.20.1.6'),
(5, 'admin@epsilon-univ.net', true, 'PRIMARY', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.20.1.7', '10.20.1.8'),
(6, 'help@zeta-college.org', true, 'PRIMARY', true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '10.20.1.9', '10.20.2.0');


INSERT INTO client_tenants (
    client_id, tenant_id, is_active, is_deleted,
    created_at, updated_at, created_by, updated_by,
    deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, true, false, NOW(), NOW(), 1, 2, NULL, NULL, '172.16.0.1', '172.16.0.2'),
(1, 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '172.16.0.3', '172.16.0.4'),
(2, 1, false, true, NOW(), NOW(), 2, 1, NOW(), 1, '172.16.0.5', '172.16.0.6'),
(2, 3, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '172.16.0.7', '172.16.0.8'),
(3, 2, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '172.16.0.9', '172.16.1.0'),
(3, 3, true, false, NOW(), NOW(), 3, 2, NULL, NULL, '172.16.1.1', '172.16.1.2'),
(4, 4, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '172.16.1.3', '172.16.1.4'),
(5, 5, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '172.16.1.5', '172.16.1.6'),
(4, 2, true, false, NOW(), NOW(), 4, 1, NULL, NULL, '172.16.1.7', '172.16.1.8'),
(5, 1, true, false, NOW(), NOW(), 5, 2, NULL, NULL, '172.16.1.9', '172.16.2.0');


INSERT INTO roles (
    role_type, role_name, role_description, is_system_role,
    is_active, is_deleted, created_at, updated_at, created_by,
    updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
('STUDENT', 'Basic Student', 'Default role for enrolled students', false, true, false, NOW(), NOW(), 1, 2, NULL, NULL, '192.168.10.1', '192.168.10.2'),
('STUDENT', 'Premium Student', 'Student with premium access to extra materials', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '192.168.10.3', '192.168.10.4'),
('TEACHER', 'Standard Teacher', 'Teacher with access to course content and student grades', false, true, false, NOW(), NOW(), 2, 1, NULL, NULL, '192.168.10.5', '192.168.10.6'),
('TEACHER', 'Lead Instructor', 'Senior teacher responsible for curriculum design', false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.10.7', '192.168.10.8'),
('TENANT_ADMIN', 'Tenant Admin', 'Manages tenant settings and users', true, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '192.168.10.9', '192.168.11.0'),
('TENANT_ADMIN', 'Support Admin', 'Handles client and technical support tasks', false, true, false, NOW(), NOW(), 3, 1, NULL, NULL, '192.168.11.1', '192.168.11.2'),
('SUPER_ADMIN', 'Platform Super Admin', 'Has full system-wide permissions', true, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '192.168.11.3', '192.168.11.4'),
('SUPER_ADMIN', 'Data Auditor', 'Monitors data access and compliance logs', false, true, false, NOW(), NOW(), 4, 2, NULL, NULL, '192.168.11.5', '192.168.11.6'),
('TEACHER', 'Course Reviewer', 'Reviews and approves course content before publishing', false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.11.7', '192.168.11.8'),
('STUDENT', 'Trial Student', 'Temporary access for trial users', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '192.168.11.9', '192.168.12.0');



INSERT INTO screens (
    screen_name, screen_description, route_path, parent_screen_id, sort_order,
    icon_class, is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
('Dashboard', 'Main analytics and summary view', '/dashboard', NULL, 1, 'fas fa-home', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.0.1.1', '10.0.1.2'),
('Users', 'User management section', '/users', NULL, 2, 'fas fa-users', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.1.3', '10.0.1.4'),
('User List', 'View all system users', '/users/list', 2, 1, 'fas fa-list', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.1.5', '10.0.1.6'),
('User Roles', 'Define roles and permissions', '/users/roles', 2, 2, 'fas fa-user-shield', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.1.7', '10.0.1.8'),
('Clients', 'Client account management', '/clients', NULL, 3, 'fas fa-briefcase', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.0.1.9', '10.0.2.0'),
('Tenants', 'Manage tenant organizations', '/tenants', NULL, 4, 'fas fa-building', true, false, NOW(), NOW(), 2, 1, NULL, NULL, '10.0.2.1', '10.0.2.2'),
('Reports', 'Analytics and reporting area', '/reports', NULL, 5, 'fas fa-chart-bar', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.0.2.3', '10.0.2.4'),
('Create Report', 'Wizard to create a new report', '/reports/new', 7, 1, 'fas fa-plus-circle', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.0.2.5', '10.0.2.6'),
('Settings', 'System-wide configuration area', '/settings', NULL, 6, 'fas fa-cogs', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.0.2.7', '10.0.2.8'),
('Audit Logs', 'Track system activity logs', '/settings/audit-logs', 9, 1, 'fas fa-clipboard-list', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.0.2.9', '10.0.3.0');


INSERT INTO system_users (
    tenant_id, role_type, username, full_name, email_address, password_hash,
    last_login_at, login_attempts, system_user_status, is_active, is_deleted,
    created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'TENANT_ADMIN', 'admin_alpha', 'Alice Johnson', 'alice@alpha.com', 'hashed_pw_1', NOW(), 0, 'ACTIVE', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '192.168.100.1', '192.168.100.2'),
(1, 'TENANT_ADMIN', 'beta_support', 'Bob Smith', 'bob@beta.com', 'hashed_pw_2', NULL, 3, 'LOCKED', false, true, NOW(), NOW(), 2, 1, NOW(), 1, '192.168.100.3', '192.168.100.4'),
(2, 'TENANT_ADMIN', 'gamma_admin', 'Carol Ahmed', 'carol@gamma.com', 'hashed_pw_3', NOW(), 1, 'SUSPENDED', false, true, NOW(), NOW(), 3, NULL, NOW(), 2, '192.168.100.5', '192.168.100.6'),
(2, 'SUPER_ADMIN', 'superadmin', 'David Wang', 'david@sys.com', 'hashed_pw_4', NOW(), 0, 'ACTIVE', true, false, NOW(), NOW(), 4, 1, NULL, NULL, '192.168.100.7', '192.168.100.8'),
(NULL, 'SUPER_ADMIN', 'sys_op1', 'Eva Lopez', 'eva@sys.com', 'hashed_pw_5', NULL, 2, 'INACTIVE', false, true, NOW(), NOW(), 1, NULL, NOW(), 3, '192.168.100.9', '192.168.101.0'),
(3, 'TENANT_ADMIN', 'delta_admin', 'Frank Müller', 'frank@delta.com', 'hashed_pw_6', NOW(), 0, 'ACTIVE', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.101.1', '192.168.101.2'),
(NULL, 'SUPER_ADMIN', 'root_user', 'Grace Chen', 'grace@root.com', 'hashed_pw_7', NOW(), 0, 'ACTIVE', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '192.168.101.3', '192.168.101.4'),
(3, 'TENANT_ADMIN', 'eps_admin', 'Hassan Ali', 'hassan@eps.com', 'hashed_pw_8', NULL, 0, 'ACTIVE', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '192.168.101.5', '192.168.101.6'),
(NULL, 'SUPER_ADMIN', 'auditor', 'Iris Becker', 'iris@audit.com', 'hashed_pw_9', NOW(), 1, 'SUSPENDED', false, true, NOW(), NOW(), 1, NULL, NOW(), 2, '192.168.101.7', '192.168.101.8'),
(4, 'TENANT_ADMIN', 'zeta_ops', 'John Lee', 'john@zeta.com', 'hashed_pw_10', NOW(), 0, 'ACTIVE', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.101.9', '192.168.102.0');

INSERT INTO user_screens (
    tenant_id, system_user_id, screen_id,
    can_view, can_create, can_edit, can_delete, can_export,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
(1, 1, 1, true, false, false, false, false, true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.10.10.1', '10.10.10.2'),
(1, 1, 2, true, true, true, false, true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.10.10.3', '10.10.10.4'),
(1, 2, 3, true, false, false, false, false, true, false, NOW(), NOW(), 2, 1, NULL, NULL, '10.10.10.5', '10.10.10.6'),
(2, 3, 4, true, true, true, true, false, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.10.10.7', '10.10.10.8'),
(2, 4, 5, true, false, false, false, false, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.10.10.9', '10.10.11.0'),
(3, 5, 6, true, true, false, false, true, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.10.11.1', '10.10.11.2'),
(3, 6, 7, true, true, true, false, false, true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '10.10.11.3', '10.10.11.4'),
(4, 7, 8, true, true, true, true, true, true, false, NOW(), NOW(), 7, NULL, NULL, NULL, '10.10.11.5', '10.10.11.6'),
(4, 8, 9, true, false, false, false, false, true, false, NOW(), NOW(), 8, NULL, NULL, NULL, '10.10.11.7', '10.10.11.8'),
(4, 9, 10, true, true, false, true, false, true, false, NOW(), NOW(), 9, NULL, NULL, NULL, '10.10.11.9', '10.10.12.0');


INSERT INTO role_screens (
    tenant_id, role_type, screen_id,
    can_view, can_create, can_edit, can_delete, can_export,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
(1, 'STUDENT', 1, true, false, false, false, false, true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.20.0.1', '10.20.0.2'),
(1, 'STUDENT', 2, true, false, false, false, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.20.0.3', '10.20.0.4'),
(1, 'TEACHER', 3, true, true, true, false, true, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.20.0.5', '10.20.0.6'),
(2, 'TEACHER', 4, true, true, true, true, false, true, false, NOW(), NOW(), 2, 1, NULL, NULL, '10.20.0.7', '10.20.0.8'),
(2, 'TENANT_ADMIN', 5, true, true, true, false, true, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.20.0.9', '10.20.1.0'),
(3, 'TENANT_ADMIN', 6, true, false, false, false, false, true, false, NOW(), NOW(), 3, 1, NULL, NULL, '10.20.1.1', '10.20.1.2'),
(3, 'SUPER_ADMIN', 7, true, true, true, true, true, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.20.1.3', '10.20.1.4'),
(4, 'SUPER_ADMIN', 8, true, true, false, false, false, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.20.1.5', '10.20.1.6'),
(4, 'TEACHER', 9, true, false, false, false, false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.20.1.7', '10.20.1.8'),
(4, 'STUDENT', 10, true, false, false, false, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.20.1.9', '10.20.2.0');

INSERT INTO countries (
    name, iso_code_2, iso_code_3, dial_code,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
('United States', 'US', 'USA', '+1', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '172.20.1.1', '172.20.1.2'),
('Canada', 'CA', 'CAN', '+1', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '172.20.1.3', '172.20.1.4'),
('United Kingdom', 'GB', 'GBR', '+44', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '172.20.1.5', '172.20.1.6'),
('Australia', 'AU', 'AUS', '+61', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '172.20.1.7', '172.20.1.8'),
('Germany', 'DE', 'DEU', '+49', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '172.20.1.9', '172.20.2.0'),
('India', 'IN', 'IND', '+91', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '172.20.2.1', '172.20.2.2'),
('Pakistan', 'PK', 'PAK', '+92', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '172.20.2.3', '172.20.2.4'),
('France', 'FR', 'FRA', '+33', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '172.20.2.5', '172.20.2.6'),
('UAE', 'AE', 'ARE', '+971', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '172.20.2.7', '172.20.2.8'),
('Japan', 'JP', 'JPN', '+81', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '172.20.2.9', '172.20.3.0');


INSERT INTO states (
    country_id, name, state_code,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
(1, 'California', 'CA', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '192.168.0.1', '192.168.0.2'),
(1, 'Texas', 'TX', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '192.168.0.3', '192.168.0.4'),
(2, 'Ontario', 'ON', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.0.5', '192.168.0.6'),
(2, 'British Columbia', 'BC', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.0.7', '192.168.0.8'),
(3, 'England', 'ENG', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '192.168.0.9', '192.168.1.0'),
(4, 'New South Wales', 'NSW', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '192.168.1.1', '192.168.1.2'),
(5, 'Bavaria', 'BY', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '192.168.1.3', '192.168.1.4'),
(6, 'Maharashtra', 'MH', true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '192.168.1.5', '192.168.1.6'),
(7, 'Punjab', 'PB', true, false, NOW(), NOW(), 7, NULL, NULL, NULL, '192.168.1.7', '192.168.1.8'),
(8, 'Île-de-France', 'IDF', true, false, NOW(), NOW(), 8, NULL, NULL, NULL, '192.168.1.9', '192.168.2.0');


INSERT INTO states (
    country_id, name, state_code,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
(1, 'California', 'CA', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '192.168.0.1', '192.168.0.2'),
(1, 'Texas', 'TX', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '192.168.0.3', '192.168.0.4'),
(2, 'Ontario', 'ON', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.0.5', '192.168.0.6'),
(2, 'British Columbia', 'BC', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '192.168.0.7', '192.168.0.8'),
(3, 'England', 'ENG', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '192.168.0.9', '192.168.1.0'),
(4, 'New South Wales', 'NSW', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '192.168.1.1', '192.168.1.2'),
(5, 'Bavaria', 'BY', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '192.168.1.3', '192.168.1.4'),
(6, 'Maharashtra', 'MH', true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '192.168.1.5', '192.168.1.6'),
(7, 'Punjab', 'PB', true, false, NOW(), NOW(), 7, NULL, NULL, NULL, '192.168.1.7', '192.168.1.8'),
(8, 'Île-de-France', 'IDF', true, false, NOW(), NOW(), 8, NULL, NULL, NULL, '192.168.1.9', '192.168.2.0');


INSERT INTO cities (
    state_id, name,
    is_active, is_deleted, created_at, updated_at,
    created_by, updated_by, deleted_at, deleted_by,
    created_ip, updated_ip
) VALUES
(1, 'Los Angeles', true, false, NOW(), NOW(), 1, 2, NULL, NULL, '10.0.0.1', '10.0.0.2'),
(1, 'San Francisco', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.0.0.3', '10.0.0.4'),
(2, 'Houston', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.0.0.5', '10.0.0.6'),
(3, 'Toronto', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.0.0.7', '10.0.0.8'),
(3, 'Ottawa', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.0.0.9', '10.0.1.0'),
(4, 'Vancouver', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.0.1.1', '10.0.1.2'),
(5, 'London', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.0.1.3', '10.0.1.4'),
(6, 'Sydney', true, false, NOW(), NOW(), 6, NULL, NULL, NULL, '10.0.1.5', '10.0.1.6'),
(7, 'Munich', true, false, NOW(), NOW(), 7, NULL, NULL, NULL, '10.0.1.7', '10.0.1.8'),
(8, 'Mumbai', true, false, NOW(), NOW(), 8, NULL, NULL, NULL, '10.0.1.9', '10.0.2.0');



