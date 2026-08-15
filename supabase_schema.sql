-- ==============================================================================
-- HackTrack Database Schema (Supabase / PostgreSQL)
-- Multi-User Hackathon & Competition Tracking with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID generation extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ------------------------------------------------------------------------------
-- 2. Competitions Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    organizer TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed')),
    registration_deadline TIMESTAMP WITH TIME ZONE,
    registration_fee NUMERIC(10, 2) DEFAULT 0.00,
    payment_status TEXT NOT NULL DEFAULT 'Not Required' CHECK (payment_status IN ('Not Required', 'Not Paid', 'Paid', 'Refunded')),
    problem_statement TEXT,
    result TEXT NOT NULL DEFAULT 'Pending' CHECK (result IN ('Pending', 'Winner', 'Runner-up', 'Finalist', 'Shortlisted', 'Participated', 'Lost', 'Disqualified', 'Other')),
    position TEXT,
    prize TEXT,
    result_notes TEXT,
    competition_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

-- Competitions RLS Policies (Strict User Isolation)
CREATE POLICY "Users can view their own competitions"
    ON public.competitions FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own competitions"
    ON public.competitions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own competitions"
    ON public.competitions FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own competitions"
    ON public.competitions FOR DELETE
    USING (auth.uid() = user_id);

-- ------------------------------------------------------------------------------
-- 3. Rounds Table
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rounds (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES public.competitions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    date TIMESTAMP WITH TIME ZONE,
    status TEXT NOT NULL DEFAULT 'Upcoming' CHECK (status IN ('Upcoming', 'Ongoing', 'Completed', 'Eliminated')),
    round_order INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.rounds ENABLE ROW LEVEL SECURITY;

-- Rounds RLS Policies (Through Competition Ownership)
CREATE POLICY "Users can view rounds of their competitions"
    ON public.rounds FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.competitions
            WHERE public.competitions.id = public.rounds.competition_id
            AND public.competitions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create rounds for their competitions"
    ON public.rounds FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.competitions
            WHERE public.competitions.id = public.rounds.competition_id
            AND public.competitions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update rounds of their competitions"
    ON public.rounds FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.competitions
            WHERE public.competitions.id = public.rounds.competition_id
            AND public.competitions.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete rounds of their competitions"
    ON public.rounds FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.competitions
            WHERE public.competitions.id = public.rounds.competition_id
            AND public.competitions.user_id = auth.uid()
        )
    );

-- ------------------------------------------------------------------------------
-- 4. Indexes for Optimal Performance
-- ------------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_competitions_user_id ON public.competitions(user_id);
CREATE INDEX IF NOT EXISTS idx_competitions_status ON public.competitions(status);
CREATE INDEX IF NOT EXISTS idx_competitions_deadline ON public.competitions(registration_deadline);
CREATE INDEX IF NOT EXISTS idx_competitions_created_at ON public.competitions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rounds_competition_id ON public.rounds(competition_id);

-- ------------------------------------------------------------------------------
-- 5. Trigger for updated_at Auto-update
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_competitions_updated_at
    BEFORE UPDATE ON public.competitions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- ------------------------------------------------------------------------------
-- 6. Trigger to create Profile on Signup
-- ------------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        NEW.email
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();
