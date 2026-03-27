ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance integer NOT NULL DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS welcome_bonus_claimed boolean NOT NULL DEFAULT false;