
CREATE TABLE IF NOT EXISTS otp_codes (
  id uuid PRIMARY KEY DEFAULT extensions.uuid_generate_v4(),
  email text NOT NULL,
  code text NOT NULL,
  name text NOT NULL DEFAULT '',
  salon_name text NOT NULL DEFAULT '',
  password_temp text NOT NULL DEFAULT '',
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '10 minutes'),
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX otp_codes_email_idx ON otp_codes (email);

ALTER TABLE otp_codes ENABLE ROW LEVEL SECURITY;

-- Only service role can access this table (no public policies)
