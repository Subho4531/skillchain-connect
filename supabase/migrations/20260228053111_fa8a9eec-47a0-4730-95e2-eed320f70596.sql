
-- Users table (wallet-based auth, no email/password)
CREATE TABLE public.users (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  wallet_address TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('admin', 'student')),
  display_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read users" ON public.users FOR SELECT USING (true);
CREATE POLICY "Users can insert themselves" ON public.users FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own record" ON public.users FOR UPDATE USING (wallet_address = wallet_address);

-- Campaigns table
CREATE TABLE public.campaigns (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  creator_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  skill_tags TEXT[] DEFAULT '{}',
  enrollment_fee BIGINT NOT NULL DEFAULT 0,
  bounty_pool BIGINT NOT NULL DEFAULT 0,
  bounty_per_student BIGINT NOT NULL DEFAULT 0,
  max_students INTEGER NOT NULL DEFAULT 50,
  app_id BIGINT,
  asset_id BIGINT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'completed', 'cancelled')),
  deadline TIMESTAMP WITH TIME ZONE,
  tx_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read campaigns" ON public.campaigns FOR SELECT USING (true);
CREATE POLICY "Anyone can create campaigns" ON public.campaigns FOR INSERT WITH CHECK (true);
CREATE POLICY "Creator can update campaigns" ON public.campaigns FOR UPDATE USING (true);

-- Enrollments table
CREATE TABLE public.enrollments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  student_wallet TEXT NOT NULL,
  tx_hash TEXT,
  enrolled_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(campaign_id, student_wallet)
);

ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read enrollments" ON public.enrollments FOR SELECT USING (true);
CREATE POLICY "Anyone can enroll" ON public.enrollments FOR INSERT WITH CHECK (true);

-- Submissions table
CREATE TABLE public.submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  student_wallet TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  ipfs_hash TEXT,
  ipfs_url TEXT,
  ai_score INTEGER,
  ai_feedback TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'ai_reviewed', 'approved', 'rejected')),
  reward_claimed BOOLEAN NOT NULL DEFAULT false,
  reward_tx_hash TEXT,
  submitted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  reviewed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read submissions" ON public.submissions FOR SELECT USING (true);
CREATE POLICY "Anyone can submit" ON public.submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update submissions" ON public.submissions FOR UPDATE USING (true);

-- Certificates table
CREATE TABLE public.certificates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
  campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
  student_wallet TEXT NOT NULL,
  nft_asset_id BIGINT,
  tx_hash TEXT,
  ipfs_metadata_hash TEXT,
  minted_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.certificates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read certificates" ON public.certificates FOR SELECT USING (true);
CREATE POLICY "Anyone can mint certificates" ON public.certificates FOR INSERT WITH CHECK (true);
