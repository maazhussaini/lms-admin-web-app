-- Tenants
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

-- Clients
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

-- Tenant Phone Numbers
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

-- Tenant Email Addresses
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

-- Client Tenants
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

-- Roles
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

-- Screens
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

-- System Users
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

-- User Screens
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

-- Role Screens
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

-- Countries
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

-- States
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

-- Cities
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

-- Academic Programs
INSERT INTO programs (
    tenant_id, program_name, program_thumbnail_url, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'Computer Science', NULL, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.1.1', '10.1.1.2'),
(2, 'Business Administration', NULL, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.1.3', '10.1.1.4'),
(3, 'Environmental Science', NULL, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.1.1.5', '10.1.1.6'),
(4, 'Mechanical Engineering', NULL, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.1.1.7', '10.1.1.8'),
(5, 'Psychology', NULL, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.1.1.9', '10.1.2.0');

-- Academic Specializations
INSERT INTO specializations (
    tenant_id, program_id, specialization_name, specialization_thumbnail_url, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'Software Engineering', NULL, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.2.1', '10.1.2.2'),
(1, 1, 'Data Science', NULL, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.2.3', '10.1.2.4'),
(2, 2, 'Marketing', NULL, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.2.5', '10.1.2.6'),
(2, 2, 'Finance', NULL, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.2.7', '10.1.2.8'),
(3, 3, 'Renewable Energy', NULL, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.1.2.9', '10.1.3.0'),
(5, 5, 'Clinical Psychology', NULL, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.1.3.1', '10.1.3.2');

-- Specialization-Program Join Table (Many-to-Many)
INSERT INTO specialization_programs (
    specialization_id, program_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.2.1', '10.1.2.2'),
(2, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.2.3', '10.1.2.4'),
(3, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.2.5', '10.1.2.6'),
(4, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.2.7', '10.1.2.8'),
(5, 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.1.2.9', '10.1.3.0'),
(6, 5, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.1.3.1', '10.1.3.2'),
(1, 4, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.1.3.3', '10.1.3.4'),
(2, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.3.5', '10.1.3.6'),
(3, 5, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.1.3.7', '10.1.3.8'),
(4, 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.1.3.9', '10.1.4.0'),
(5, 4, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.1.4.1', '10.1.4.2'),
(6, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.4.3', '10.1.4.4');

-- Academic Institutes
INSERT INTO institutes (
    tenant_id, institute_name, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'School of Engineering', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.1.3.3', '10.1.3.4'),
(2, 'School of Business', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.1.3.5', '10.1.3.6'),
(3, 'Institute of Environmental Studies', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.1.3.7', '10.1.3.8'),
(4, 'College of Arts and Sciences', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.1.3.9', '10.1.4.0'),
(5, 'School of Health Sciences', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.1.4.1', '10.1.4.2');

-- Student-Institute Assignments (Many-to-Many)
INSERT INTO student_institutes (
    tenant_id, student_id, institute_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.34.1.1', '10.34.1.2'), -- Sarah Johnson: School of Engineering
(2, 2, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.34.1.3', '10.34.1.4'), -- Alex Smith: School of Business
(3, 3, 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.34.1.5', '10.34.1.6'), -- Emma Müller: Institute of Environmental Studies
(4, 4, 4, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.34.1.7', '10.34.1.8'), -- Matthew Chen: College of Arts and Sciences
(5, 5, 5, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.34.1.9', '10.34.2.0'), -- Alina Patel: School of Health Sciences
-- Add a few cross-institute assignments for realism
(1, 1, 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.34.2.1', '10.34.2.2'), -- Sarah Johnson: School of Business (joint program)
(2, 2, 1, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.34.2.3', '10.34.2.4'); -- Alex Smith: School of Engineering (elective)

-- Students
INSERT INTO students (
    tenant_id, full_name, first_name, middle_name, last_name, country_id, state_id, city_id, address, date_of_birth, profile_picture_url, zip_code, age, gender, username, password_hash, last_login_at, student_status, referral_type, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'Sarah Johnson', 'Sarah', NULL, 'Johnson', 1, 1, 1, '123 Main St, Los Angeles, CA', '2002-05-14', NULL, '90001', 22, 'FEMALE', 'sarah.j', 'hashed_pw_11', NOW(), 'ACTIVE', NULL, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.30.1.1', '10.30.1.2'),
(2, 'Alex Smith', 'Alex', NULL, 'Smith', 2, 3, 4, '45 Park Lane, London', '2001-09-22', NULL, 'W1K 1PN', 23, 'MALE', 'alex.s', 'hashed_pw_12', NOW(), 'ACTIVE', NULL, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.30.1.3', '10.30.1.4'),
(3, 'Emma Müller', 'Emma', NULL, 'Müller', 5, 5, 7, 'Bavaria, Munich', '2003-03-10', NULL, '80331', 21, 'FEMALE', 'emma.m', 'hashed_pw_13', NOW(), 'ACTIVE', NULL, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.30.1.5', '10.30.1.6'),
(4, 'Matthew Chen', 'Matthew', NULL, 'Chen', 4, 6, 8, 'Sydney, Australia', '2000-12-01', NULL, '2000', 24, 'MALE', 'matthew.c', 'hashed_pw_14', NOW(), 'ACTIVE', NULL, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.30.1.7', '10.30.1.8'),
(5, 'Alina Patel', 'Alina', NULL, 'Patel', 6, 8, 10, 'Mumbai, India', '2002-07-19', NULL, '400001', 22, 'FEMALE', 'alina.p', 'hashed_pw_15', NOW(), 'ACTIVE', NULL, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.30.1.9', '10.30.2.0');

-- Student Email Addresses
INSERT INTO student_email_addresses (
    tenant_id, student_id, email_address, is_primary, priority, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'sarah.johnson@alpha-academy.edu', true, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.31.1.1', '10.31.1.2'),
(2, 2, 'alex.smith@beta-school.edu', true, 1, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.31.1.3', '10.31.1.4'),
(3, 3, 'emma.muller@gamma-learning.edu', true, 1, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.31.1.5', '10.31.1.6'),
(4, 4, 'matthew.chen@delta-institute.edu', true, 1, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.31.1.7', '10.31.1.8'),
(5, 5, 'alina.patel@epsilon-univ.edu', true, 1, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.31.1.9', '10.31.2.0');

-- Student Phone Numbers
INSERT INTO student_phone_numbers (
    tenant_id, student_id, dial_code, phone_number, iso_country_code, is_primary, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, '+1', '2025550185', 'US', true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.32.1.1', '10.32.1.2'),
(2, 2, '+44', '2079460958', 'GB', true, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.32.1.3', '10.32.1.4'),
(3, 3, '+49', '8923456789', 'DE', true, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.32.1.5', '10.32.1.6'),
(4, 4, '+61', '412345678', 'AU', true, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.32.1.7', '10.32.1.8'),
(5, 5, '+91', '9876543210', 'IN', true, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.32.1.9', '10.32.2.0');

-- Student Devices
INSERT INTO student_devices (
    tenant_id, student_id, device_type, device_identifier, device_ip, mac_address, is_primary, last_active_at, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'LAPTOP', 'LAPTOP-ALPHA-001', '192.168.10.11', '00:1A:2B:3C:4D:5E', true, NOW(), true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.33.1.1', '10.33.1.2'),
(2, 2, 'SMARTPHONE', 'PHONE-BETA-002', '192.168.10.12', '00:1A:2B:3C:4D:5F', true, NOW(), true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.33.1.3', '10.33.1.4'),
(3, 3, 'TABLET', 'TABLET-GAMMA-003', '192.168.10.13', '00:1A:2B:3C:4D:60', true, NOW(), true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.33.1.5', '10.33.1.6'),
(4, 4, 'DESKTOP', 'DESKTOP-DELTA-004', '192.168.10.14', '00:1A:2B:3C:4D:61', true, NOW(), true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.33.1.7', '10.33.1.8'),
(5, 5, 'LAPTOP', 'LAPTOP-EPSILON-005', '192.168.10.15', '00:1A:2B:3C:4D:62', true, NOW(), true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.33.1.9', '10.33.2.0');

-- Teachers
INSERT INTO teachers (
    tenant_id, full_name, first_name, middle_name, last_name, country_id, state_id, city_id, address, date_of_birth, profile_picture_url, zip_code, age, gender, username, password_hash, last_login_at, teacher_status, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 'Dr. John Williams', 'John', NULL, 'Williams', 1, 1, 1, '456 University Ave, Los Angeles, CA', '1975-04-12', NULL, '90001', 50, 'MALE', 'john.w', 'hashed_pw_21', NOW(), 'ACTIVE', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.40.1.1', '10.40.1.2'),
(2, 'Prof. Emily Clark', 'Emily', NULL, 'Clark', 2, 3, 4, '78 Queen St, London', '1980-09-30', NULL, 'W1K 2QD', 45, 'FEMALE', 'emily.c', 'hashed_pw_22', NOW(), 'ACTIVE', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.40.1.3', '10.40.1.4'),
(3, 'Dr. Markus Schmidt', 'Markus', NULL, 'Schmidt', 5, 5, 7, 'Universitätsstraße 12, Munich', '1972-06-18', NULL, '80331', 53, 'MALE', 'markus.s', 'hashed_pw_23', NOW(), 'ACTIVE', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.40.1.5', '10.40.1.6'),
(4, 'Dr. Priya Nair', 'Priya', NULL, 'Nair', 6, 8, 10, 'Bandra, Mumbai', '1985-11-22', NULL, '400050', 39, 'FEMALE', 'priya.n', 'hashed_pw_24', NOW(), 'ACTIVE', true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.40.1.7', '10.40.1.8'),
(5, 'Prof. Matthew Evans', 'Matthew', NULL, 'Evans', 4, 6, 8, '123 George St, Sydney', '1978-02-05', NULL, '2000', 47, 'MALE', 'matthew.e', 'hashed_pw_25', NOW(), 'ACTIVE', true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.40.1.9', '10.40.2.0');

-- Teacher Email Addresses
INSERT INTO teacher_email_addresses (
    tenant_id, teacher_id, email_address, is_primary, priority, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'john.williams@alpha-academy.edu', true, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.41.1.1', '10.41.1.2'),
(2, 2, 'emily.clark@beta-school.edu', true, 1, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.41.1.3', '10.41.1.4'),
(3, 3, 'markus.schmidt@gamma-learning.edu', true, 1, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.41.1.5', '10.41.1.6'),
(4, 4, 'priya.nair@epsilon-univ.edu', true, 1, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.41.1.7', '10.41.1.8'),
(5, 5, 'matthew.evans@delta-institute.edu', true, 1, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.41.1.9', '10.41.2.0');

-- Teacher Phone Numbers
INSERT INTO teacher_phone_numbers (
    tenant_id, teacher_id, dial_code, phone_number, iso_country_code, is_primary, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, '+1', '2135550199', 'US', true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '10.42.1.1', '10.42.1.2'),
(2, 2, '+44', '2079460999', 'GB', true, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '10.42.1.3', '10.42.1.4'),
(3, 3, '+49', '8923456799', 'DE', true, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '10.42.1.5', '10.42.1.6'),
(4, 4, '+91', '9812345679', 'IN', true, true, false, NOW(), NOW(), 4, NULL, NULL, NULL, '10.42.1.7', '10.42.1.8'),
(5, 5, '+61', '412345679', 'AU', true, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '10.42.1.9', '10.42.2.0');

-- Courses
INSERT INTO courses (
    tenant_id, program_id, specialization_id, course_name, course_description, main_thumbnail_url, course_status, course_type, course_price, course_total_hours, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 'Introduction to Programming', 'Learn the basics of programming using Python.', 'https://cdn.example.com/thumbnails/cs101.png', 'PUBLIC', 'PAID', 49.99, 24.0, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.1.1.1', '11.1.1.2'),
(2, 2, 3, 'Principles of Marketing', 'Fundamentals of marketing in a digital world.', 'https://cdn.example.com/thumbnails/ba201.png', 'PUBLIC', 'FREE', NULL, 18.0, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '11.1.1.3', '11.1.1.4'),
(3, 3, 5, 'Renewable Energy Systems', 'Overview of renewable energy technologies.', 'https://cdn.example.com/thumbnails/en301.png', 'DRAFT', 'PAID', 79.99, 30.0, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.1.1.5', '11.1.1.6'),
(1, 1, 2, 'Data Science Fundamentals', 'Introduction to data science concepts and tools.', 'https://cdn.example.com/thumbnails/cs202.png', 'PUBLIC', 'PAID', 59.99, 28.0, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.1.1.7', '11.1.1.8'),
(5, 5, 6, 'Introduction to Clinical Psychology', 'Basics of clinical psychology and mental health.', 'https://cdn.example.com/thumbnails/psy101.png', 'PUBLIC', 'FREE', NULL, 20.0, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '11.1.1.9', '11.1.2.0');

-- CourseSpecialization (junction table for Course <-> Specialization)
INSERT INTO course_specializations (
    course_id, specialization_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.1.2.1', '11.1.2.2'),
(1, 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.1.2.3', '11.1.2.4'),
(2, 3, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '11.1.2.5', '11.1.2.6'),
(3, 5, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.1.2.7', '11.1.2.8'),
(4, 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.1.2.9', '11.1.3.0'),
(5, 6, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '11.1.3.1', '11.1.3.2');

-- Course Modules
INSERT INTO course_modules (
    tenant_id, course_id, course_module_name, position, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'Getting Started with Python', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.2.1.1', '11.2.1.2'),
(1, 1, 'Control Structures', 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.2.1.3', '11.2.1.4'),
(1, 2, 'Marketing Basics', 1, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '11.2.1.5', '11.2.1.6'),
(1, 3, 'Solar Power', 1, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.2.1.7', '11.2.1.8'),
(1, 4, 'Data Analysis Tools', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.2.1.9', '11.2.2.0'),
(1, 5, 'Foundations of Clinical Psychology', 1, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '11.2.2.1', '11.2.2.2');

-- Course Topics
INSERT INTO course_topics (
    tenant_id, module_id, course_topic_name, position, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'Python Syntax', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.3.1.1', '11.3.1.2'),
(1, 1, 'Variables and Data Types', 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.3.1.3', '11.3.1.4'),
(1, 2, 'If Statements', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.3.1.5', '11.3.1.6'),
(1, 3, 'Solar Panel Types', 1, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.3.1.7', '11.3.1.8'),
(1, 4, 'Jupyter Notebooks', 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.3.1.9', '11.3.2.0'),
(1, 5, 'History of Clinical Psychology', 1, true, false, NOW(), NOW(), 5, NULL, NULL, NULL, '11.3.2.1', '11.3.2.2');

-- Course Videos
INSERT INTO course_videos (
    tenant_id, course_id, course_topic_id, bunny_video_id, video_name, video_url, thumbnail_url, duration_seconds, position, upload_status, "IsLocked", is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 'bunny-vid-001', 'Python Syntax Overview', 'https://videos.example.com/python-syntax.mp4', NULL, 600, 1, 'COMPLETED', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.4.1.1', '11.4.1.2'),
(1, 1, 2, 'bunny-vid-002', 'Variables Explained', 'https://videos.example.com/variables.mp4', NULL, 540, 2, 'COMPLETED', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.4.1.3', '11.4.1.4'),
(1, 2, 3, 'bunny-vid-003', 'If Statements in Action', 'https://videos.example.com/if-statements.mp4', NULL, 480, 1, 'COMPLETED', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.4.1.5', '11.4.1.6'),
(1, 3, 4, 'bunny-vid-004', 'Solar Panel Types', 'https://videos.example.com/solar-panels.mp4', NULL, 720, 1, 'COMPLETED', false, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.4.1.7', '11.4.1.8'),
(1, 4, 5, 'bunny-vid-005', 'Jupyter Notebooks Demo', 'https://videos.example.com/jupyter-notebooks.mp4', NULL, 900, 1, 'COMPLETED', false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.4.1.9', '11.4.2.0');

-- Course Documents
INSERT INTO course_documents (
    tenant_id, course_id, course_topic_id, document_name, document_url, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 'Python Syntax Cheat Sheet', 'https://docs.example.com/python-syntax.pdf', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.5.1.1', '11.5.1.2'),
(1, 1, 2, 'Variables Guide', 'https://docs.example.com/variables.pdf', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.5.1.3', '11.5.1.4'),
(1, 2, 3, 'If Statements Reference', 'https://docs.example.com/if-statements.pdf', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.5.1.5', '11.5.1.6'),
(1, 3, 4, 'Solar Panel Types PDF', 'https://docs.example.com/solar-panels.pdf', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '11.5.1.7', '11.5.1.8'),
(1, 4, 5, 'Jupyter Notebooks Manual', 'https://docs.example.com/jupyter-notebooks.pdf', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '11.5.1.9', '11.5.2.0');

-- Enrollments
INSERT INTO enrollments (
    tenant_id, course_id, student_id, institute_id, teacher_id, specialization_program_id, course_enrollment_type, enrollment_status, enrolled_at, expected_completion_date, actual_completion_date, status_changed_at, status_changed_by, status_change_reason, grade, final_score, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
 (1, 1, 1, 1, 1, 1, 'PAID_COURSE', 'ACTIVE', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', NULL, NOW() - INTERVAL '60 days', 1, NULL, 'A', 95.00, true, false, NOW() - INTERVAL '60 days', 1, '10.50.1.1', NOW() - INTERVAL '30 days', 1, '10.50.1.2', NULL, NULL),
 (1, 2, 2, 2, 2, 3, 'FREE_COURSE', 'COMPLETED', NOW() - INTERVAL '120 days', NOW() - INTERVAL '30 days', NOW() - INTERVAL '10 days', NOW() - INTERVAL '10 days', 2, 'Completed successfully', 'B+', 88.50, true, false, NOW() - INTERVAL '120 days', 2, '10.50.1.3', NOW() - INTERVAL '10 days', 2, '10.50.1.4', NULL, NULL),
 (1, 3, 3, 3, 3, 5, 'PAID_COURSE', 'PENDING', NOW() - INTERVAL '10 days', NOW() + INTERVAL '50 days', NULL, NULL, NULL, NULL, NULL, NULL, true, false, NOW() - INTERVAL '10 days', 3, '10.50.1.5', NULL, NULL, NULL, NULL, NULL),
 (1, 4, 4, 4, 4, 2, 'PAID_COURSE', 'ACTIVE', NOW() - INTERVAL '20 days', NOW() + INTERVAL '40 days', NULL, NOW() - INTERVAL '20 days', 4, NULL, NULL, NULL, true, false, NOW() - INTERVAL '20 days', 4, '10.50.1.6', NULL, NULL, NULL, NULL, NULL),
 (1, 5, 5, 5, 5, 6, 'FREE_COURSE', 'DROPPED', NOW() - INTERVAL '90 days', NOW() - INTERVAL '60 days', NOW() - INTERVAL '70 days', NOW() - INTERVAL '70 days', 5, 'Withdrew due to personal reasons', NULL, NULL, true, false, NOW() - INTERVAL '90 days', 5, '10.50.1.7', NOW() - INTERVAL '70 days', 5, '10.50.1.8', NULL, NULL);

-- Enrollment Status Histories
INSERT INTO enrollment_status_histories (
    tenant_id, enrollment_id, previous_status, new_status, status_changed_at, changed_by, change_reason, notes, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
 (1, 1, 'PENDING', 'ACTIVE', NOW() - INTERVAL '60 days', 1, 'Initial activation', 'Enrolled by admin', true, false, NOW() - INTERVAL '60 days', 1, '10.51.1.1', NULL, NULL, NULL, NULL, NULL),
 (1, 2, 'PENDING', 'ACTIVE', NOW() - INTERVAL '120 days', 2, 'Activated by admin', NULL, true, false, NOW() - INTERVAL '120 days', 2, '10.51.1.2', NULL, NULL, NULL, NULL, NULL),
 (1, 2, 'ACTIVE', 'COMPLETED', NOW() - INTERVAL '10 days', 2, 'Course completed', 'Final grade B+', true, false, NOW() - INTERVAL '10 days', 2, '10.51.1.3', NULL, NULL, NULL, NULL, NULL),
 (1, 4, 'PENDING', 'ACTIVE', NOW() - INTERVAL '20 days', 4, 'Activated by admin', NULL, true, false, NOW() - INTERVAL '20 days', 4, '10.51.1.4', NULL, NULL, NULL, NULL, NULL),
 (1, 5, 'PENDING', 'ACTIVE', NOW() - INTERVAL '90 days', 5, 'Activated by admin', NULL, true, false, NOW() - INTERVAL '90 days', 5, '10.51.1.5', NULL, NULL, NULL, NULL, NULL),
 (1, 5, 'ACTIVE', 'DROPPED', NOW() - INTERVAL '70 days', 5, 'Withdrew due to personal reasons', 'Student requested withdrawal', true, false, NOW() - INTERVAL '70 days', 5, '10.51.1.6', NULL, NULL, NULL, NULL, NULL);

-- Student Course Progress
INSERT INTO student_course_progresses (
    tenant_id, student_id, course_id, overall_progress_percentage, modules_completed, videos_completed, quizzes_completed, assignments_completed, total_time_spent_minutes, last_accessed_at, is_course_completed, completion_date, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
-- Sarah Johnson (student 1) in Introduction to Programming (course 1)
(1, 1, 1, 100, 5, 10, 2, 3, 1200, NOW() - INTERVAL '1 days', true, NOW() - INTERVAL '1 days', true, false, NOW() - INTERVAL '60 days', 1, '10.52.1.1', NOW() - INTERVAL '1 days', 1, '10.52.1.2', NULL, NULL),
-- Alex Smith (student 2) in Principles of Marketing (course 2)
(1, 2, 2, 100, 4, 8, 1, 2, 900, NOW() - INTERVAL '10 days', true, NOW() - INTERVAL '10 days', true, false, NOW() - INTERVAL '120 days', 2, '10.52.1.3', NOW() - INTERVAL '10 days', 2, '10.52.1.4', NULL, NULL),
-- Emma Müller (student 3) in Renewable Energy Systems (course 3)
(1, 3, 3, 20, 1, 2, 0, 0, 120, NOW() - INTERVAL '2 days', false, NULL, true, false, NOW() - INTERVAL '10 days', 3, '10.52.1.5', NOW() - INTERVAL '2 days', 3, '10.52.1.6', NULL, NULL),
-- Matthew Chen (student 4) in Data Science Fundamentals (course 4)
(1, 4, 4, 60, 2, 5, 1, 1, 400, NOW() - INTERVAL '3 days', false, NULL, true, false, NOW() - INTERVAL '20 days', 4, '10.52.1.7', NOW() - INTERVAL '3 days', 4, '10.52.1.8', NULL, NULL),
-- Alina Patel (student 5) in Introduction to Clinical Psychology (course 5)
(1, 5, 5, 0, 0, 0, 0, 0, 0, NOW() - INTERVAL '60 days', false, NULL, true, false, NOW() - INTERVAL '90 days', 5, '10.52.1.9', NOW() - INTERVAL '60 days', 5, '10.52.2.0', NULL, NULL);

-- Teacher Courses
INSERT INTO teacher_courses (
    tenant_id, course_id, teacher_id, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
-- Dr. John Williams (teacher 1) teaches Introduction to Programming (course 1)
(1, 1, 1, true, false, NOW() - INTERVAL '60 days', 1, '10.53.1.1', NOW() - INTERVAL '1 days', 1, '10.53.1.2', NULL, NULL),
-- Prof. Emily Clark (teacher 2) teaches Principles of Marketing (course 2)
(1, 2, 2, true, false, NOW() - INTERVAL '120 days', 2, '10.53.1.3', NOW() - INTERVAL '10 days', 2, '10.53.1.4', NULL, NULL),
-- Dr. Markus Schmidt (teacher 3) teaches Renewable Energy Systems (course 3)
(1, 3, 3, true, false, NOW() - INTERVAL '10 days', 3, '10.53.1.5', NOW() - INTERVAL '2 days', 3, '10.53.1.6', NULL, NULL),
-- Dr. Priya Nair (teacher 4) teaches Data Science Fundamentals (course 4)
(1, 4, 4, true, false, NOW() - INTERVAL '20 days', 4, '10.53.1.7', NOW() - INTERVAL '3 days', 4, '10.53.1.8', NULL, NULL),
-- Prof. Matthew Evans (teacher 5) teaches Introduction to Clinical Psychology (course 5)
(1, 5, 5, true, false, NOW() - INTERVAL '90 days', 5, '10.53.1.9', NOW() - INTERVAL '60 days', 5, '10.53.2.0', NULL, NULL);

-- Course Sessions
INSERT INTO course_sessions (
    tenant_id, teacher_id, course_id, course_session_status, session_name, session_description, start_date, end_date, max_students, enrollment_deadline, session_timezone, session_code, auto_expire_enabled, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
 (1, 1, 1, 'PUBLIC', 'Spring 2025 - Python Basics', 'Introductory Python programming session for Spring 2025.', NOW() - INTERVAL '90 days', NOW() - INTERVAL '30 days', 30, NOW() - INTERVAL '100 days', 'America/Los_Angeles', 'PY-SPR25', true, true, false, NOW() - INTERVAL '100 days', 1, '10.60.1.1', NOW() - INTERVAL '30 days', 1, '10.60.1.2', NULL, NULL),
 (1, 2, 2, 'EXPIRED', 'Winter 2025 - Digital Marketing', 'Digital marketing session for Winter 2025.', NOW() - INTERVAL '180 days', NOW() - INTERVAL '120 days', 25, NOW() - INTERVAL '190 days', 'Europe/London', 'MK-WIN25', true, true, false, NOW() - INTERVAL '190 days', 2, '10.60.1.3', NOW() - INTERVAL '120 days', 2, '10.60.1.4', NULL, NULL),
 (1, 3, 3, 'DRAFT', 'Summer 2025 - Solar Energy', 'Solar energy systems session for Summer 2025.', NOW() + INTERVAL '10 days', NOW() + INTERVAL '70 days', 20, NOW(), 'Europe/Berlin', 'EN-SUM25', true, true, false, NOW(), 3, '10.60.1.5', NULL, NULL, NULL, NULL),
 (1, 4, 4, 'PUBLIC', 'Spring 2025 - Data Science', 'Data science session for Spring 2025.', NOW() - INTERVAL '60 days', NOW() + INTERVAL '30 days', 35, NOW() - INTERVAL '70 days', 'Asia/Kolkata', 'DS-SPR25', true, true, false, NOW() - INTERVAL '70 days', 4, '10.60.1.6', NOW() + INTERVAL '30 days', 4, '10.60.1.7', NULL, NULL),
 (1, 5, 5, 'EXPIRED', 'Fall 2024 - Clinical Psychology', 'Clinical psychology session for Fall 2024.', NOW() - INTERVAL '300 days', NOW() - INTERVAL '250 days', 15, NOW() - INTERVAL '310 days', 'Australia/Sydney', 'PSY-FALL24', true, true, false, NOW() - INTERVAL '310 days', 5, '10.60.1.8', NOW() - INTERVAL '250 days', 5, '10.60.1.9', NULL, NULL);

-- Course Session Enrollments
INSERT INTO course_session_enrollments (
    tenant_id, course_session_id, student_id, enrollment_id, enrolled_at, dropped_at, enrollment_status, completion_percentage, final_grade, completion_date, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
 (1, 1, 1, 1, NOW() - INTERVAL '95 days', NULL, 'ENROLLED', 100, 95, NOW() - INTERVAL '30 days', true, false, NOW() - INTERVAL '95 days', 1, '10.61.1.1', NOW() - INTERVAL '30 days', 1, '10.61.1.2', NULL, NULL),
 (1, 2, 2, 2, NOW() - INTERVAL '185 days', NULL, 'COMPLETED', 100, 88, NOW() - INTERVAL '120 days', true, false, NOW() - INTERVAL '185 days', 2, '10.61.1.3', NOW() - INTERVAL '120 days', 2, '10.61.1.4', NULL, NULL),
 (1, 3, 3, 3, NOW() + INTERVAL '5 days', NULL, 'PENDING', 0, NULL, NULL, true, false, NOW() + INTERVAL '5 days', 3, '10.61.1.5', NULL, NULL, NULL, NULL),
 (1, 4, 4, 4, NOW() - INTERVAL '65 days', NULL, 'ENROLLED', 60, NULL, NULL, true, false, NOW() - INTERVAL '65 days', 4, '10.61.1.6', NOW() + INTERVAL '30 days', 4, '10.61.1.7', NULL, NULL),
 (1, 5, 5, 5, NOW() - INTERVAL '305 days', NOW() - INTERVAL '260 days', 'DROPPED', 0, NULL, NULL, false, true, NOW() - INTERVAL '305 days', 5, '10.61.1.8', NOW() - INTERVAL '260 days', 5, '10.61.1.9', NULL, NULL);

-- Course Session Settings
INSERT INTO course_session_settings (
    tenant_id, course_session_id, allow_late_enrollment, require_approval_for_enrollment, allow_student_discussions, send_reminder_emails, reminder_days_before_expiry, grading_scale, attendance_tracking_enabled, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
-- Settings for Python Basics session (session 1)
(1, 1, true, false, true, true, 7, '{"A":90,"B":80,"C":70,"D":60,"F":0}', true, true, false, NOW() - INTERVAL '100 days', 1, '10.62.1.1', NOW() - INTERVAL '30 days', 1, '10.62.1.2', NULL, NULL),
-- Settings for Digital Marketing session (session 2)
(1, 2, false, true, true, true, 5, '{"A":85,"B":75,"C":65,"D":55,"F":0}', false, true, false, NOW() - INTERVAL '190 days', 2, '10.62.1.3', NOW() - INTERVAL '120 days', 2, '10.62.1.4', NULL, NULL),
-- Settings for Solar Energy session (session 3)
(1, 3, true, false, true, false, 10, '{"A":92,"B":82,"C":72,"D":62,"F":0}', true, true, false, NOW(), 3, '10.62.1.5', NULL, NULL, NULL, NULL),
-- Settings for Data Science session (session 4)
(1, 4, false, false, true, true, 7, '{"A":88,"B":78,"C":68,"D":58,"F":0}', true, true, false, NOW() - INTERVAL '70 days', 4, '10.62.1.6', NOW() + INTERVAL '30 days', 4, '10.62.1.7', NULL, NULL),
-- Settings for Clinical Psychology session (session 5)
(1, 5, false, true, false, false, 3, '{"A":90,"B":80,"C":70,"D":60,"F":0}', false, false, true, NOW() - INTERVAL '310 days', 5, '10.62.1.8', NOW() - INTERVAL '250 days', 5, '10.62.1.9', NULL, NULL);

-- Video Progresses
INSERT INTO video_progresses (
    tenant_id, student_id, course_video_id, watch_duration_seconds, completion_percentage, last_watched_at, is_completed, is_active, is_deleted, created_at, created_by, created_ip, updated_at, updated_by, updated_ip, deleted_at, deleted_by
) VALUES
(1, 1, 1, 600, 100, NOW() - INTERVAL '1 days', true, true, false, NOW() - INTERVAL '1 days', 1, '10.63.1.1', NOW() - INTERVAL '1 days', 1, '10.63.1.2', NULL, NULL),
(1, 2, 2, 540, 100, NOW() - INTERVAL '10 days', true, true, false, NOW() - INTERVAL '10 days', 2, '10.63.1.3', NOW() - INTERVAL '10 days', 2, '10.63.1.4', NULL, NULL),
(1, 3, 3, 60, 12, NOW() - INTERVAL '2 days', false, true, false, NOW() - INTERVAL '2 days', 3, '10.63.1.5', NOW() - INTERVAL '2 days', 3, '10.63.1.6', NULL, NULL),
(1, 4, 5, 400, 44, NOW() - INTERVAL '3 days', false, true, false, NOW() - INTERVAL '3 days', 4, '10.63.1.7', NOW() - INTERVAL '3 days', 4, '10.63.1.8', NULL, NULL),
(1, 5, 4, 0, 0, NOW() - INTERVAL '60 days', false, true, false, NOW() - INTERVAL '60 days', 5, '10.63.1.9', NOW() - INTERVAL '60 days', 5, '10.63.2.0', NULL, NULL);

-- Quizzes
INSERT INTO quizzes (
    tenant_id, course_id, teacher_id, quiz_name, quiz_description, total_marks, passing_marks, time_limit_minutes, max_attempts, allow_retake, randomize_questions, due_date, status, instructions, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 'Python Basics Quiz', 'Quiz on Python basics and syntax.', 20.00, 12.00, 30, 2, true, true, NOW() + INTERVAL '7 days', 'PUBLISHED', 'Answer all questions. Passing is 60%.', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.1.1.1', '12.1.1.2'),
(1, 2, 2, 'Marketing Fundamentals Quiz', 'Quiz on marketing principles.', 15.00, 9.00, 20, 1, false, true, NOW() + INTERVAL '10 days', 'PUBLISHED', 'No negative marking.', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.1.1.3', '12.1.1.4'),
(1, 3, 3, 'Renewable Energy Quiz', 'Quiz on renewable energy systems.', 18.00, 10.00, 25, 2, true, false, NOW() + INTERVAL '15 days', 'DRAFT', 'Attempt all questions.', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.1.1.5', '12.1.1.6');

-- Quiz Mappings (map quizzes to course, module, topic)
INSERT INTO quiz_mappings (
    tenant_id, quiz_id, reference_table_type, reference_id, teacher_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 'COURSE', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.2.1.1', '12.2.1.2'),
(1, 1, 'COURSE_MODULE', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.2.1.3', '12.2.1.4'),
(1, 1, 'COURSE_TOPIC', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.2.1.5', '12.2.1.6'),
(1, 2, 'COURSE', 2, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.2.1.7', '12.2.1.8'),
(1, 3, 'COURSE', 3, 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.2.1.9', '12.2.2.0');

-- Quiz Questions
INSERT INTO quiz_questions (
    tenant_id, quiz_id, teacher_id, question_text, question_type, question_marks, position, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 'What is the correct file extension for Python files?', 'MULTIPLE_CHOICE_SINGLE_ANSWER', 2.00, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.3.1.1', '12.3.1.2'),
(1, 1, 1, 'Which of the following is a valid variable name in Python?', 'MULTIPLE_CHOICE_SINGLE_ANSWER', 2.00, 2, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.3.1.3', '12.3.1.4'),
(1, 1, 1, 'Python is a case-sensitive language.', 'TRUE_FALSE', 1.00, 3, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.3.1.5', '12.3.1.6'),
(1, 2, 2, 'Which of the following is NOT a marketing principle?', 'MULTIPLE_CHOICE_SINGLE_ANSWER', 3.00, 1, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.3.1.7', '12.3.1.8'),
(1, 2, 2, 'Marketing is only about selling products.', 'TRUE_FALSE', 2.00, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.3.1.9', '12.3.2.0'),
(1, 3, 3, 'Which energy source is renewable?', 'MULTIPLE_CHOICE_SINGLE_ANSWER', 2.00, 1, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.3.2.1', '12.3.2.2');

-- Quiz Question Options
INSERT INTO quiz_question_options (
    tenant_id, quiz_question_id, option_text, position, is_correct, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Q1: Python file extension
(1, 1, '.py', 1, true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.1.1', '12.4.1.2'),
(1, 1, '.python', 2, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.1.3', '12.4.1.4'),
(1, 1, '.pt', 3, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.1.5', '12.4.1.6'),
-- Q2: Valid variable name
(1, 2, 'my_var', 1, true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.1.7', '12.4.1.8'),
(1, 2, '2var', 2, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.1.9', '12.4.2.0'),
(1, 2, 'var-2', 3, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.2.1', '12.4.2.2'),
-- Q3: Python is case-sensitive (True/False)
(1, 3, 'True', 1, true, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.2.3', '12.4.2.4'),
(1, 3, 'False', 2, false, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '12.4.2.5', '12.4.2.6'),
-- Q4: NOT a marketing principle
(1, 4, 'Product', 1, false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.2.7', '12.4.2.8'),
(1, 4, 'Price', 2, false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.2.9', '12.4.3.0'),
(1, 4, 'Promotion', 3, false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.3.1', '12.4.3.2'),
(1, 4, 'Procrastination', 4, true, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.3.3', '12.4.3.4'),
-- Q5: Marketing is only about selling products (True/False)
(1, 5, 'True', 1, false, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.3.5', '12.4.3.6'),
(1, 5, 'False', 2, true, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '12.4.3.7', '12.4.3.8'),
-- Q6: Renewable energy source
(1, 6, 'Solar', 1, true, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.4.3.9', '12.4.4.0'),
(1, 6, 'Coal', 2, false, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.4.4.1', '12.4.4.2'),
(1, 6, 'Oil', 3, false, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '12.4.4.3', '12.4.4.4');

-- Quiz Question Answers (correct answer for each question)
INSERT INTO quiz_question_answers (
    tenant_id, quiz_question_id, answer_text, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, '.py', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '13.1.1.1', '13.1.1.2'),
(1, 2, 'my_var', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '13.1.1.3', '13.1.1.4'),
(1, 3, 'True', true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '13.1.1.5', '13.1.1.6'),
(1, 4, 'Procrastination', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '13.1.1.7', '13.1.1.8'),
(1, 5, 'False', true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '13.1.1.9', '13.1.2.0'),
(1, 6, 'Solar', true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '13.1.2.1', '13.1.2.2');

-- Quiz Attempts (one per student per quiz)
INSERT INTO quiz_attempts (
    tenant_id, quiz_id, student_id, attempt_number, started_at, submitted_at, score, percentage, status, time_taken_minutes, graded_by, graded_at, teacher_notes, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
(1, 1, 1, 1, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days' + INTERVAL '30 minutes', 18.00, 90.00, 'GRADED', 30, 1, NOW() - INTERVAL '1 days', 'Excellent work!', true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', 1, 1, NULL, NULL, '13.2.1.1', '13.2.1.2'),
(1, 2, 2, 1, NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days' + INTERVAL '20 minutes', 13.00, 86.67, 'GRADED', 20, 2, NOW() - INTERVAL '4 days', 'Good understanding.', true, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 2, 2, NULL, NULL, '13.2.1.3', '13.2.1.4'),
(1, 3, 3, 1, NOW() - INTERVAL '1 days', NULL, NULL, NULL, 'IN_PROGRESS', 10, NULL, NULL, NULL, true, false, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days', 3, NULL, NULL, NULL, '13.2.1.5', '13.2.1.6');

-- Quiz Attempt Answers (answers for each attempt, referencing options and correctness)
INSERT INTO quiz_attempt_answers (
    tenant_id, quiz_attempt_id, quiz_question_id, quiz_question_option_id, answer_text, is_correct, marks_obtained, reviewed_by_teacher_id, teacher_comment, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Sarah Johnson (attempt 1, quiz 1)
(1, 1, 1, 1, NULL, true, 2.00, 1, 'Correct answer.', true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', 1, 1, NULL, NULL, '13.3.1.1', '13.3.1.2'),
(1, 1, 2, 4, NULL, true, 2.00, 1, 'Correct answer.', true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', 1, 1, NULL, NULL, '13.3.1.3', '13.3.1.4'),
(1, 1, 3, 7, NULL, true, 1.00, 1, 'Correct answer.', true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '1 days', 1, 1, NULL, NULL, '13.3.1.5', '13.3.1.6'),
-- Alex Smith (attempt 2, quiz 2)
(1, 2, 4, 14, NULL, true, 3.00, 2, 'Correct answer.', true, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 2, 2, NULL, NULL, '13.3.1.7', '13.3.1.8'),
(1, 2, 5, 12, NULL, true, 2.00, 2, 'Correct answer.', true, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 2, 2, NULL, NULL, '13.3.1.9', '13.3.2.0'),
-- Emma Müller (attempt 3, quiz 3, in progress, only one question answered)
(1, 3, 6, 16, NULL, true, 2.00, 3, 'Correct answer.', true, false, NOW() - INTERVAL '1 days', NOW() - INTERVAL '1 days', 3, 3, NULL, NULL, '13.3.2.1', '13.3.2.2');

-- Assignments
INSERT INTO assignments (
    tenant_id, course_id, teacher_id, assignment_name, assignment_description, assignment_type, total_marks, passing_marks, due_date, allow_late_submissions, max_file_size_mb, allowed_file_types, max_attempts, status, instructions, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Python Programming Assignment (Course 1, Dr. John Williams)
(1, 1, 1, 'Python Project: Data Analysis', 'Analyze a dataset using Python and submit a Jupyter notebook with your findings.', 'FILE_UPLOAD', 20.00, 12.00, NOW() + INTERVAL '10 days', true, 10, 'pdf,ipynb,py', 2, 'PUBLISHED', 'Submit a well-documented notebook and a PDF report.', true, false, NOW(), NOW(), 1, 1, NULL, NULL, '14.1.1.1', '14.1.1.2'),
-- Marketing Case Study (Course 2, Prof. Emily Clark)
(2, 2, 2, 'Case Study: Digital Marketing Campaign', 'Prepare a case study on a recent digital marketing campaign and analyze its effectiveness.', 'FILE_UPLOAD', 15.00, 9.00, NOW() + INTERVAL '7 days', false, 5, 'pdf,docx', 1, 'PUBLISHED', 'Include campaign metrics and your recommendations.', true, false, NOW(), NOW(), 2, 2, NULL, NULL, '14.1.1.3', '14.1.1.4'),
-- Renewable Energy Lab Report (Course 3, Dr. Markus Schmidt)
(3, 3, 3, 'Lab Report: Solar Panel Efficiency', 'Conduct an experiment to measure the efficiency of different solar panels and submit your findings.', 'FILE_UPLOAD', 18.00, 10.00, NOW() + INTERVAL '15 days', true, 8, 'pdf,docx', 2, 'DRAFT', 'Attach photos of your setup and data tables.', true, false, NOW(), NOW(), 3, 3, NULL, NULL, '14.1.1.5', '14.1.1.6'),
-- Data Science Research Paper (Course 4, Dr. Priya Nair)
(1, 4, 4, 'Research Paper: Machine Learning Trends', 'Write a research paper on recent trends in machine learning and their applications.', 'FILE_UPLOAD', 25.00, 15.00, NOW() + INTERVAL '20 days', false, 12, 'pdf,docx', 1, 'PUBLISHED', 'Cite at least 5 recent research papers.', true, false, NOW(), NOW(), 4, 4, NULL, NULL, '14.1.1.7', '14.1.1.8'),
-- Clinical Psychology Reflection (Course 5, Prof. Matthew Evans)
(5, 5, 5, 'Reflection: Case Study in Clinical Psychology', 'Reflect on a clinical case and discuss the psychological assessment and intervention.', 'FILE_UPLOAD', 10.00, 6.00, NOW() + INTERVAL '5 days', true, 5, 'pdf,docx', 2, 'DRAFT', 'Use pseudonyms for all clients discussed.', true, false, NOW(), NOW(), 5, 5, NULL, NULL, '14.1.1.9', '14.1.2.0');

-- AssignmentMappings (map assignments to course, module, topic)
INSERT INTO assignment_mappings (
    tenant_id, assignment_id, reference_table_type, reference_id, teacher_id, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Assignment 1 mapped to Course 1 (Introduction to Programming)
(1, 1, 'COURSE', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '14.1.1.1', '14.1.1.2'),
-- Assignment 2 mapped to Course Module 1 (Getting Started with Python)
(1, 2, 'COURSE_MODULE', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '14.1.1.3', '14.1.1.4'),
-- Assignment 3 mapped to Course Topic 1 (Python Syntax)
(1, 3, 'COURSE_TOPIC', 1, 1, true, false, NOW(), NOW(), 1, NULL, NULL, NULL, '14.1.1.5', '14.1.1.6'),
-- Assignment 4 mapped to Course 2 (Principles of Marketing)
(1, 4, 'COURSE', 2, 2, true, false, NOW(), NOW(), 2, NULL, NULL, NULL, '14.1.1.7', '14.1.1.8'),
-- Assignment 5 mapped to Course Module 3 (Solar Power)
(1, 5, 'COURSE_MODULE', 3, 3, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '14.1.1.9', '14.1.2.0');

-- StudentAssignments (student submissions for assignments)
INSERT INTO student_assignments (
    tenant_id, assignment_id, student_id, attempt_number, submission_date, submission_status, grade, percentage, feedback, graded_by, graded_at, teacher_notes, is_late_submission, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Sarah Johnson (student 1) submitted Assignment 1, graded
(1, 1, 1, 1, NOW() - INTERVAL '5 days', 'GRADED', 95.00, 95.00, 'Great job!', 1, NOW() - INTERVAL '4 days', 'Well done.', false, true, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 1, 1, NULL, NULL, '15.1.1.1', '15.1.1.2'),
-- Alex Smith (student 2) submitted Assignment 2, pending grading
(1, 2, 2, 1, NOW() - INTERVAL '2 days', 'SUBMITTED', NULL, NULL, NULL, NULL, NULL, NULL, false, true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 2, NULL, NULL, NULL, '15.1.1.3', '15.1.1.4'),
-- Emma Müller (student 3) not yet submitted Assignment 3
(1, 3, 3, 1, NULL, 'NOT_SUBMITTED', NULL, NULL, NULL, NULL, NULL, NULL, false, true, false, NOW(), NOW(), 3, NULL, NULL, NULL, '15.1.1.5', '15.1.1.6'),
-- Matthew Chen (student 4) submitted Assignment 4 late, graded
(1, 4, 4, 1, NOW() - INTERVAL '1 days', 'GRADED', 88.00, 88.00, 'Late but good.', 2, NOW(), 'Check late penalty.', true, true, false, NOW() - INTERVAL '1 days', NOW(), 4, 2, NULL, NULL, '15.1.1.7', '15.1.1.8'),
-- Alina Patel (student 5) submitted Assignment 5, pending grading
(1, 5, 5, 1, NOW() - INTERVAL '3 days', 'SUBMITTED', NULL, NULL, NULL, NULL, NULL, NULL, false, true, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 5, NULL, NULL, NULL, '15.1.1.9', '15.1.2.0');

-- AssignmentSubmissionFiles (files submitted for student assignments)
INSERT INTO assignment_submission_files (
    tenant_id, student_assignment_id, original_file_name, file_url, file_size_bytes, mime_type, upload_status, uploaded_at, is_active, is_deleted, created_at, updated_at, created_by, updated_by, deleted_at, deleted_by, created_ip, updated_ip
) VALUES
-- Sarah Johnson (student 1) - Assignment 1 - completed upload
(1, 1, 'sarah_johnson_assignment1.pdf', 'https://cdn.example.com/assignments/sarah_johnson_assignment1.pdf', 204800, 'application/pdf', 'COMPLETED', NOW() - INTERVAL '5 days', true, false, NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days', 1, 1, NULL, NULL, '16.1.1.1', '16.1.1.2'),
-- Alex Smith (student 2) - Assignment 2 - pending upload
(1, 2, 'alex_smith_assignment2.docx', 'https://cdn.example.com/assignments/alex_smith_assignment2.docx', 102400, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'PENDING', NULL, true, false, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', 2, NULL, NULL, NULL, '16.1.1.3', '16.1.1.4'),
-- Matthew Chen (student 4) - Assignment 4 - completed upload
(1, 4, 'matthew_chen_assignment4.pdf', 'https://cdn.example.com/assignments/matthew_chen_assignment4.pdf', 307200, 'application/pdf', 'COMPLETED', NOW() - INTERVAL '1 days', true, false, NOW() - INTERVAL '1 days', NOW(), 4, 2, NULL, NULL, '16.1.1.5', '16.1.1.6'),
-- Alina Patel (student 5) - Assignment 5 - uploading
(1, 5, 'alina_patel_assignment5.docx', 'https://cdn.example.com/assignments/alina_patel_assignment5.docx', 51200, 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'UPLOADING', NOW() - INTERVAL '3 days', true, false, NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', 5, NULL, NULL, NULL, '16.1.1.7', '16.1.1.8');

