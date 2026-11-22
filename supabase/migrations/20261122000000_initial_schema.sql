-- ==============================================================================
-- KRISHIBONDHU - Complete PostgreSQL Database Schema with Row-Level Security
-- Production Grade Migration for Supabase
-- ==============================================================================

-- 1. Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles Table (Linked to Supabase Auth)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    phone TEXT,
    state TEXT DEFAULT 'West Bengal',
    district TEXT,
    village TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    farm_area NUMERIC DEFAULT 0,
    farm_area_unit TEXT DEFAULT 'acres',
    preferred_language TEXT DEFAULT 'en' CHECK (preferred_language IN ('en', 'bn', 'hi')),
    primary_crops TEXT[] DEFAULT '{}',
    soil_type TEXT,
    onboarding_completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trigger to auto-create profile on Supabase auth.user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, preferred_language)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'preferred_language', 'en')
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Farms Table
CREATE TABLE IF NOT EXISTS public.farms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    area NUMERIC NOT NULL CHECK (area > 0),
    area_unit TEXT NOT NULL DEFAULT 'acres' CHECK (area_unit IN ('acres', 'bigha', 'katha', 'hectares')),
    soil_type TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Soil Records Table (Real manual soil test logs - never simulated from GPS)
CREATE TABLE IF NOT EXISTS public.soil_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    nitrogen NUMERIC NOT NULL CHECK (nitrogen >= 0),
    phosphorus NUMERIC NOT NULL CHECK (phosphorus >= 0),
    potassium NUMERIC NOT NULL CHECK (potassium >= 0),
    ph NUMERIC CHECK (ph >= 0 AND ph <= 14),
    organic_carbon NUMERIC CHECK (organic_carbon >= 0),
    moisture_percentage NUMERIC CHECK (moisture_percentage >= 0 AND moisture_percentage <= 100),
    test_date DATE NOT NULL DEFAULT CURRENT_DATE,
    tested_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Crops Table
CREATE TABLE IF NOT EXISTS public.crops (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    variety TEXT,
    category TEXT,
    area NUMERIC NOT NULL CHECK (area > 0),
    area_unit TEXT NOT NULL DEFAULT 'acres' CHECK (area_unit IN ('acres', 'bigha', 'katha', 'hectares')),
    planting_date DATE NOT NULL,
    expected_harvest_date DATE,
    soil_type TEXT,
    irrigation_type TEXT,
    health_status TEXT DEFAULT 'healthy' CHECK (health_status IN ('healthy', 'needs_attention', 'diseased')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Crop Scans Table (Multimodal AI Disease Detection logs)
CREATE TABLE IF NOT EXISTS public.crop_scans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    guest_token TEXT,
    crop_name TEXT NOT NULL,
    crop_confidence NUMERIC NOT NULL CHECK (crop_confidence >= 0 AND crop_confidence <= 100),
    is_healthy BOOLEAN NOT NULL,
    disease_name TEXT,
    disease_confidence NUMERIC CHECK (disease_confidence >= 0 AND disease_confidence <= 100),
    severity TEXT NOT NULL CHECK (severity IN ('healthy', 'mild', 'moderate', 'severe', 'uncertain')),
    is_uncertain BOOLEAN DEFAULT FALSE,
    image_url TEXT NOT NULL,
    symptoms TEXT[] DEFAULT '{}',
    affected_parts TEXT[] DEFAULT '{}',
    ai_explanation TEXT,
    treatment_chemical TEXT,
    treatment_organic TEXT,
    prevention_advice TEXT,
    expert_advice TEXT,
    weather_context JSONB,
    user_feedback_flag BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Chat Conversations & Messages
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    language TEXT DEFAULT 'en' CHECK (language IN ('en', 'bn', 'hi')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.chat_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Yield Predictions Table
CREATE TABLE IF NOT EXISTS public.yield_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
    crop_name TEXT NOT NULL,
    variety TEXT,
    area NUMERIC NOT NULL,
    area_unit TEXT NOT NULL,
    estimated_yield_per_acre NUMERIC NOT NULL,
    total_expected_production_tons NUMERIC NOT NULL,
    confidence_score NUMERIC NOT NULL,
    yield_range_min NUMERIC NOT NULL,
    yield_range_max NUMERIC NOT NULL,
    factors JSONB DEFAULT '{}',
    recommendations TEXT[] DEFAULT '{}',
    actual_harvest_yield_tons NUMERIC,
    prediction_date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Notifications Table (Real weather & disease-backed alerts only)
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('weather', 'disease_risk', 'irrigation', 'harvest', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    action_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. Sensor Devices & Readings (IoT Ready)
CREATE TABLE IF NOT EXISTS public.sensor_devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    farm_id UUID REFERENCES public.farms(id) ON DELETE SET NULL,
    device_name TEXT NOT NULL,
    device_api_key TEXT NOT NULL UNIQUE,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'maintenance')),
    last_ping TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sensor_readings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_id UUID NOT NULL REFERENCES public.sensor_devices(id) ON DELETE CASCADE,
    soil_moisture NUMERIC,
    temperature NUMERIC,
    humidity NUMERIC,
    soil_ph NUMERIC,
    npk_n NUMERIC,
    npk_p NUMERIC,
    npk_k NUMERIC,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. News Bookmarks
CREATE TABLE IF NOT EXISTS public.news_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    article_url TEXT NOT NULL,
    title TEXT NOT NULL,
    source TEXT,
    published_at TIMESTAMPTZ,
    image_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, article_url)
);

-- 12. AI Usage Logs & Rate Limiting Tracker
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    ip_address TEXT,
    provider TEXT NOT NULL,
    model TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('crop_scan', 'chat', 'yield_analysis')),
    status TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. Weather Cache Table
CREATE TABLE IF NOT EXISTS public.weather_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    lat_round NUMERIC(5,2) NOT NULL,
    lon_round NUMERIC(5,2) NOT NULL,
    data JSONB NOT NULL,
    fetched_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(lat_round, lon_round)
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- Mandatory: User A can NEVER access or mutate User B's data
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.soil_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_scans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.yield_predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sensor_readings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.news_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can read own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Farms Policies
CREATE POLICY "Users can manage own farms" ON public.farms
    FOR ALL USING (auth.uid() = user_id);

-- Soil Records Policies
CREATE POLICY "Users can manage own soil records" ON public.soil_records
    FOR ALL USING (auth.uid() = user_id);

-- Crops Policies
CREATE POLICY "Users can manage own crops" ON public.crops
    FOR ALL USING (auth.uid() = user_id);

-- Crop Scans Policies (Signed-in users can view/manage own scans)
CREATE POLICY "Users can read own scans" ON public.crop_scans
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own scans" ON public.crop_scans
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);
CREATE POLICY "Users can update own scans" ON public.crop_scans
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own scans" ON public.crop_scans
    FOR DELETE USING (auth.uid() = user_id);

-- Chat Conversations & Messages Policies
CREATE POLICY "Users can manage own chat conversations" ON public.chat_conversations
    FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own chat messages" ON public.chat_messages
    FOR ALL USING (auth.uid() = user_id);

-- Yield Predictions Policies
CREATE POLICY "Users can manage own yield predictions" ON public.yield_predictions
    FOR ALL USING (auth.uid() = user_id);

-- Notifications Policies
CREATE POLICY "Users can manage own notifications" ON public.notifications
    FOR ALL USING (auth.uid() = user_id);

-- Sensor Devices Policies
CREATE POLICY "Users can manage own sensor devices" ON public.sensor_devices
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can read own sensor readings" ON public.sensor_readings
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.sensor_devices d
            WHERE d.id = sensor_readings.device_id AND d.user_id = auth.uid()
        )
    );

-- News Bookmarks Policies
CREATE POLICY "Users can manage own bookmarks" ON public.news_bookmarks
    FOR ALL USING (auth.uid() = user_id);

-- Indexes for performance & quick foreign-key lookups
CREATE INDEX IF NOT EXISTS idx_farms_user_id ON public.farms(user_id);
CREATE INDEX IF NOT EXISTS idx_crops_user_id ON public.crops(user_id);
CREATE INDEX IF NOT EXISTS idx_soil_records_user_id ON public.soil_records(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_user_id ON public.crop_scans(user_id);
CREATE INDEX IF NOT EXISTS idx_crop_scans_guest_token ON public.crop_scans(guest_token);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON public.chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_read ON public.notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_weather_cache_coords ON public.weather_cache(lat_round, lon_round);
