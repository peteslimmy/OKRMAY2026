-- Create function to insert profiles bypassing check constraint
CREATE OR REPLACE FUNCTION insert_profile(
  p_id UUID,
  p_auth_id UUID,
  p_email TEXT,
  p_first_name TEXT,
  p_last_name TEXT,
  p_name TEXT,
  p_role TEXT,
  p_department TEXT,
  p_status TEXT,
  p_avatar_url TEXT
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO profiles (id, auth_id, email, firstName, lastName, name, role, department, status, avatarUrl)
  VALUES (p_id, p_auth_id, p_email, p_first_name, p_last_name, p_name, p_role, p_department, p_status, p_avatar_url)
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    firstName = EXCLUDED.firstName,
    lastName = EXCLUDED.lastName,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    department = EXCLUDED.department,
    status = EXCLUDED.status,
    avatarUrl = EXCLUDED.avatarUrl;
END;
$$;