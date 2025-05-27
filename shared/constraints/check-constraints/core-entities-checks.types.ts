/**
 * @file core-entities-checks.types.ts
 * @description Check constraint definitions for core entities following PostgreSQL best practices.
 */

import { CheckConstraint } from '../base-constraint.types';

/**
 * Check constraints for core entities with consistent naming conventions
 */
export const CORE_ENTITIES_CHECK_CONSTRAINTS: Record<string, CheckConstraint> = {
  // Tenant validations
  TENANT_NAME_LENGTH_CHECK: {
    table: 'tenants',
    constraintName: 'chk_tenant_name_length',
    condition: 'LENGTH(TRIM(tenant_name)) >= 2 AND LENGTH(TRIM(tenant_name)) <= 100',
    description: 'Tenant name must be between 2-100 characters (trimmed)'
  },

  TENANT_STATUS_VALID_CHECK: {
    table: 'tenants',
    constraintName: 'chk_tenant_status_range',
    condition: 'tenant_status BETWEEN 1 AND 5',
    description: 'Tenant status must be within valid enum range (1-5)'
  },

  TENANT_URL_FORMAT_CHECK: {
    table: 'tenants',
    constraintName: 'chk_tenant_url_format',
    condition: `(logo_url_light IS NULL OR logo_url_light ~* '^https?://[^\\s/$.?#].[^\\s]*$') AND
                (logo_url_dark IS NULL OR logo_url_dark ~* '^https?://[^\\s/$.?#].[^\\s]*$') AND
                (favicon_url IS NULL OR favicon_url ~* '^https?://[^\\s/$.?#].[^\\s]*$')`,
    description: 'All URL fields must be valid HTTP/HTTPS URLs when provided'
  },

  TENANT_THEME_JSON_CHECK: {
    table: 'tenants',
    constraintName: 'chk_tenant_theme_json',
    condition: 'theme IS NULL OR JSON_VALID(theme)',
    description: 'Theme configuration must be valid JSON when provided'
  },

  // Client validations
  CLIENT_NAME_LENGTH_CHECK: {
    table: 'clients',
    constraintName: 'chk_client_name_length',
    condition: 'LENGTH(TRIM(full_name)) >= 2 AND LENGTH(TRIM(full_name)) <= 255',
    description: 'Client full name must be between 2-255 characters (trimmed)'
  },

  CLIENT_STATUS_VALID_CHECK: {
    table: 'clients',
    constraintName: 'chk_client_status_range',
    condition: 'client_status BETWEEN 1 AND 4',
    description: 'Client status must be within valid enum range (1-4)'
  },

  CLIENT_ADDRESS_LENGTH_CHECK: {
    table: 'clients',
    constraintName: 'chk_client_address_length',
    condition: 'address IS NULL OR LENGTH(TRIM(address)) <= 500',
    description: 'Address must not exceed 500 characters when provided'
  },

  // Contact type validations
  CONTACT_TYPE_VALID_CHECK: {
    table: 'tenant_phone_numbers,tenant_email_addresses',
    constraintName: 'chk_contact_type_range',
    condition: 'contact_type BETWEEN 1 AND 4',
    description: 'Contact type must be within valid enum range (1-4)'
  },

  // Communication validations with improved patterns
  EMAIL_FORMAT_CHECK: {
    table: '*',
    constraintName: 'chk_email_format',
    condition: "email_address ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$'",
    description: 'Email address must follow standard RFC 5322 format'
  },

  PHONE_NUMBER_FORMAT_CHECK: {
    table: '*',
    constraintName: 'chk_phone_format',
    condition: "phone_number ~ '^[0-9+\\-\\s\\(\\)]{7,20}$'",
    description: 'Phone number must be 7-20 characters with valid international characters'
  },

  DIAL_CODE_FORMAT_CHECK: {
    table: '*',
    constraintName: 'chk_dial_code_format',
    condition: "dial_code IS NULL OR dial_code ~ '^\\+[1-9][0-9]{0,3}$'",
    description: 'Dial code must be valid international format (+1 to +9999)'
  },

  ISO_COUNTRY_CODE_CHECK: {
    table: 'tenant_phone_numbers',
    constraintName: 'chk_iso_country_code',
    condition: "iso_country_code IS NULL OR iso_country_code ~ '^[A-Z]{2}$'",
    description: 'ISO country code must be exactly 2 uppercase letters'
  },

  // Business rule validations
  PRIMARY_CONTACT_CONSISTENCY_CHECK: {
    table: 'tenant_phone_numbers,tenant_email_addresses',
    constraintName: 'chk_primary_contact_boolean',
    condition: 'is_primary IN (true, false)',
    description: 'Primary contact flag must be explicitly boolean'
  },

  // Role and permission validations
  ROLE_NAME_LENGTH_CHECK: {
    table: 'roles',
    constraintName: 'role_name_length_valid',
    condition: 'LENGTH(role_name) >= 3 AND LENGTH(role_name) <= 100',
    description: 'Role name must be between 3 and 100 characters'
  },

  SCREEN_NAME_LENGTH_CHECK: {
    table: 'screens',
    constraintName: 'screen_name_length_valid',
    condition: 'LENGTH(screen_name) >= 3 AND LENGTH(screen_name) <= 100',
    description: 'Screen name must be between 3 and 100 characters'
  },

  ROUTE_PATH_FORMAT_CHECK: {
    table: 'screens',
    constraintName: 'route_path_format_valid',
    condition: "route_path IS NULL OR route_path ~ '^/[a-zA-Z0-9\\-_/]*$'",
    description: 'Route path must start with / and contain valid URL characters'
  },

  // Geographic validations
  COUNTRY_NAME_LENGTH_CHECK: {
    table: 'countries',
    constraintName: 'country_name_length_valid',
    condition: 'LENGTH(name) >= 2 AND LENGTH(name) <= 100',
    description: 'Country name must be between 2 and 100 characters'
  },

  ISO_CODE_2_FORMAT_CHECK: {
    table: 'countries',
    constraintName: 'iso_code_2_format_valid',
    condition: "iso_code_2 IS NULL OR iso_code_2 ~ '^[A-Z]{2}$'",
    description: 'ISO code 2 must be 2 uppercase letters'
  },

  ISO_CODE_3_FORMAT_CHECK: {
    table: 'countries',
    constraintName: 'iso_code_3_format_valid',
    condition: "iso_code_3 IS NULL OR iso_code_3 ~ '^[A-Z]{3}$'",
    description: 'ISO code 3 must be 3 uppercase letters'
  },

  STATE_NAME_LENGTH_CHECK: {
    table: 'states',
    constraintName: 'state_name_length_valid',
    condition: 'LENGTH(name) >= 2 AND LENGTH(name) <= 100',
    description: 'State name must be between 2 and 100 characters'
  },

  CITY_NAME_LENGTH_CHECK: {
    table: 'cities',
    constraintName: 'city_name_length_valid',
    condition: 'LENGTH(name) >= 2 AND LENGTH(name) <= 100',
    description: 'City name must be between 2 and 100 characters'
  },

  // Institute validations
  INSTITUTE_NAME_LENGTH_CHECK: {
    table: 'institutes',
    constraintName: 'institute_name_length_valid',
    condition: 'LENGTH(institute_name) >= 2 AND LENGTH(institute_name) <= 255',
    description: 'Institute name must be between 2 and 255 characters'
  },

  // System user validations
  SYSTEM_USER_USERNAME_LENGTH_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_username_length',
    condition: 'LENGTH(TRIM(username)) >= 3 AND LENGTH(TRIM(username)) <= 50',
    description: 'System user username must be between 3-50 characters (trimmed)'
  },

  SYSTEM_USER_FULLNAME_LENGTH_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_fullname_length',
    condition: 'LENGTH(TRIM(full_name)) >= 2 AND LENGTH(TRIM(full_name)) <= 255',
    description: 'System user full name must be between 2-255 characters (trimmed)'
  },

  SYSTEM_USER_STATUS_VALID_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_status_range',
    condition: 'system_user_status BETWEEN 1 AND 4',
    description: 'System user status must be within valid enum range (1-4)'
  },

  SYSTEM_USER_ROLE_VALID_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_role_range',
    condition: 'role_id BETWEEN 1 AND 2',
    description: 'System user role must be within valid enum range (1-2)'
  },

  SYSTEM_USER_LOGIN_ATTEMPTS_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_login_attempts',
    condition: 'login_attempts IS NULL OR (login_attempts >= 0 AND login_attempts <= 10)',
    description: 'Login attempts must be between 0 and 10 when provided'
  },

  // SuperAdmin validation - updated constraint name to match unique constraint
  SYSTEM_USER_SUPERADMIN_LOGIC_CHECK: {
    table: 'system_users',
    constraintName: 'chk_system_user_superadmin_logic',
    condition: '(tenant_id IS NULL AND role_id = 1) OR (tenant_id IS NOT NULL AND role_id != 1)',
    description: 'SuperAdmin role (role_id=1) must have NULL tenant_id, other roles must have tenant_id'
  },

  // Common audit validations
  AUDIT_DATE_CONSISTENCY_CHECK: {
    table: '*',
    constraintName: 'chk_audit_date_consistency',
    condition: 'created_at <= COALESCE(updated_at, CURRENT_TIMESTAMP)',
    description: 'Created timestamp must be before or equal to updated timestamp'
  },

  AUDIT_USER_CONSISTENCY_CHECK: {
    table: '*',
    constraintName: 'chk_audit_user_consistency',
    condition: 'created_by IS NOT NULL AND (updated_at IS NULL OR updated_by IS NOT NULL)',
    description: 'Updated timestamp requires updated_by user when present'
  },

  // Tenant validations - updated to reflect self-reference nature
  TENANT_SELF_REFERENCE_CHECK: {
    table: 'tenants',
    constraintName: 'chk_tenant_self_reference',
    condition: 'tenant_id IS NOT NULL',
    description: 'Tenant must have valid tenant_id for audit trail consistency'
  },

  // Client tenant reference validation - ensure client belongs to same tenant as association
  CLIENT_TENANT_CONSISTENCY_CHECK: {
    table: 'client_tenants',
    constraintName: 'chk_client_tenant_consistency',
    condition: 'client_id IS NOT NULL AND tenant_id IS NOT NULL',
    description: 'Client-tenant association must reference valid client and tenant'
  },

  // Contact information consistency checks
  TENANT_CONTACT_TENANT_CONSISTENCY_CHECK: {
    table: 'tenant_phone_numbers,tenant_email_addresses',
    constraintName: 'chk_tenant_contact_consistency',
    condition: 'tenant_id IS NOT NULL',
    description: 'Tenant contact information must reference valid tenant'
  },
};
