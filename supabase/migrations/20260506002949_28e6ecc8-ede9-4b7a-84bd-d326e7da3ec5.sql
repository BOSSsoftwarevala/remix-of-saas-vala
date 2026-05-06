
-- Create 6 role-specific accounts for super admin to use
DO $$
DECLARE
  accounts text[][] := ARRAY[
    ARRAY['product_manager@saasvala.app','A9#Lm2!Qx7@Wp4$Tr8&Yu6*As1!CdEf'],
    ARRAY['server_manager@saasvala.app','M7@Tx1!Qp9#Lm4$Zy8&Vu6*Ws2!EfGh'],
    ARRAY['user_dashboard@saasvala.app','X8!vQ2#Lm7@Tz8$Pq4&Rs6*Uy1!AbCd'],
    ARRAY['reseller_manager@saasvala.app','Z6#Lp2!Qx7@Wm4$Tr9&Yu8*As1!CdEf'],
    ARRAY['reseller_user@saasvala.app','R5@Tx1!Qp9#Lm4$Zy8&Vu7*Ws2!EfGh'],
    ARRAY['seo_lead_manager@saasvala.app','P4#Lm2!Qx7@Wp8$Tr9&Yu6*As1!CdEf']
  ];
  acc text[];
  new_id uuid;
BEGIN
  FOREACH acc SLICE 1 IN ARRAY accounts LOOP
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = acc[1]) THEN
      new_id := gen_random_uuid();
      INSERT INTO auth.users (
        instance_id, id, aud, role, email, encrypted_password,
        email_confirmed_at, created_at, updated_at,
        raw_app_meta_data, raw_user_meta_data, is_super_admin
      ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_id, 'authenticated', 'authenticated', acc[1],
        crypt(acc[2], gen_salt('bf')),
        now(), now(), now(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('full_name', split_part(acc[1],'@',1)),
        false
      );
      INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, last_sign_in_at, created_at, updated_at)
      VALUES (gen_random_uuid(), new_id,
        jsonb_build_object('sub', new_id::text, 'email', acc[1]),
        'email', acc[1], now(), now(), now());
    ELSE
      UPDATE auth.users
        SET encrypted_password = crypt(acc[2], gen_salt('bf')),
            email_confirmed_at = COALESCE(email_confirmed_at, now()),
            updated_at = now()
        WHERE email = acc[1];
    END IF;
  END LOOP;
END $$;
