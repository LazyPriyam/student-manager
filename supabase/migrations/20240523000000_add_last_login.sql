-- Add last_login_date to profiles table
ALTER TABLE profiles ADD COLUMN last_login_date text;

-- Policy is already open for update by user, so no new policy needed if we use the existing one.
