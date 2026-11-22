-- ==============================================================================
-- KRISHIBONDHU - Supabase Storage Buckets Setup & Security Policies
-- ==============================================================================

-- Create private bucket for crop scans (if not already existing)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'crop-scans',
    'crop-scans',
    true, -- public URLs for image display or signed URLs
    8388608, -- 8 MB maximum
    ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
    file_size_limit = 8388608,
    allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- Storage RLS: Users can upload to crop-scans bucket
CREATE POLICY "Public and users can upload scans" ON storage.objects
    FOR INSERT WITH CHECK (bucket_id = 'crop-scans');

-- Storage RLS: Anyone can view crop scans with the URL
CREATE POLICY "Public can view scan photos" ON storage.objects
    FOR SELECT USING (bucket_id = 'crop-scans');
