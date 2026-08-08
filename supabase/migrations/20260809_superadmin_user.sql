-- Migration: create superadmin user admin@salesdaddy.com
-- Password: Pjokjict4
-- Grants both 'admin' (frontend) and 'super_admin' (RLS) roles

-- Enable pgcrypto for password hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Create the auth user (Supabase Auth)
-- The trigger on auth.users will auto-insert into profiles and assign 'customer' role
-- We then upgrade to admin + super_admin
DO $$
DECLARE
  uid uuid;
BEGIN
  -- Check if user already exists
  SELECT id INTO uid FROM auth.users WHERE email = 'admin@salesdaddy.com';

  IF uid IS NULL THEN
    -- Insert new auth user
    uid := gen_random_uuid();
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      created_at,
      updated_at,
      confirmation_token,
      recovery_token,
      raw_app_meta_data,
      raw_user_meta_data
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid,
      'authenticated',
      'authenticated',
      'admin@salesdaddy.com',
      crypt('Pjokjict4', gen_salt('bf')),
      now(),
      now(),
      now(),
      '',
      '',
      '{"provider": "email", "providers": ["email"]}',
      '{"full_name": "Super Admin"}'
    );

    -- Insert identity (required by Supabase Auth)
    INSERT INTO auth.identities (
      id,
      user_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      uid,
      format('{"sub": "%s", "email": "admin@salesdaddy.com"}', uid)::jsonb,
      'email',
      now(),
      now(),
      now()
    );

    -- Insert session info
    INSERT INTO auth.instances (
      id,
      uuid,
      raw_base_config,
      created_at,
      updated_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      uid,
      '{}',
      now(),
      now()
    ) ON CONFLICT DO NOTHING;

    -- Ensure profile exists (the trigger may have already created it)
    INSERT INTO public.profiles (id, email, full_name)
    VALUES (uid, 'admin@salesdaddy.com', 'Super Admin')
    ON CONFLICT (id) DO NOTHING;

    -- Grant admin role (for frontend useAuth hook)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;

    -- Grant super_admin role (for RLS policies)
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'super_admin')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Created superadmin user: admin@salesdaddy.com (id: %)', uid;
  ELSE
    -- User exists, ensure both roles are assigned
    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'admin')
    ON CONFLICT DO NOTHING;

    INSERT INTO public.user_roles (user_id, role)
    VALUES (uid, 'super_admin')
    ON CONFLICT DO NOTHING;

    RAISE NOTICE 'Updated existing user: admin@salesdaddy.com (id: %)', uid;
  END IF;
END $$;
