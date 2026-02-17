-- Confirm the admin user's email
UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'admin@studyplus.com';
-- Also confirm existing users
UPDATE auth.users SET email_confirmed_at = now() WHERE email_confirmed_at IS NULL;