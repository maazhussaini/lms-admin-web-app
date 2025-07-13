# Geographic Models Table Documentation

## Country
- country_id Int, [PK, autoincrement], not null
- name String, not null
- iso_code_2 String, nullable
- iso_code_3 String, nullable
- dial_code String, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## State
- state_id Int, [PK, autoincrement], not null
- country_id Int, not null
- name String, not null
- state_code String, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## City
- city_id Int, [PK, autoincrement], not null
- state_id Int, not null
- name String, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable
