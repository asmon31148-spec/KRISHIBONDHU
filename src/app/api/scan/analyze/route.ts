import { NextRequest, NextResponse } from 'next/server';
import { aiGateway } from '@/lib/ai/gateway';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// Server-side magic number file signature validation
function validateFileSignature(buffer: Buffer): 'image/jpeg' | 'image/png' | 'image/webp' | null {
  if (buffer.length < 12) return null;

  // JPEG: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  // PNG: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47 &&
    buffer[4] === 0x0d &&
    buffer[5] === 0x0a &&
    buffer[6] === 0x1a &&
    buffer[7] === 0x0a
  ) {
    return 'image/png';
  }

  // WebP: RIFF ... WEBP
  const riff = buffer.toString('ascii', 0, 4);
  const webp = buffer.toString('ascii', 8, 12);
  if (riff === 'RIFF' && webp === 'WEBP') {
    return 'image/webp';
  }

  return null;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('image') as File | null;
    const language = (formData.get('language') as 'en' | 'bn' | 'hi') || 'en';
    const guestToken = formData.get('guest_token') as string | null;
    const locationContext = formData.get('location') as string | null;

    if (!file) {
      return NextResponse.json({ error: 'No crop image provided.' }, { status: 400 });
    }

    // 1. Validate file size (Maximum 8 MB)
    const MAX_SIZE = 8 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 8 MB limit. Please compress image before upload.' },
        { status: 400 }
      );
    }

    // 2. Validate file signature (Magic Numbers)
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const validatedMime = validateFileSignature(buffer);

    if (!validatedMime) {
      return NextResponse.json(
        { error: 'Invalid file signature. Only authentic JPEG, PNG, or WebP images are permitted.' },
        { status: 400 }
      );
    }

    const base64Data = buffer.toString('base64');

    // 3. Invoke Multimodal AI Gateway
    const { result, providerUsed } = await aiGateway.analyzeCropImage({
      imageBase64: base64Data,
      mimeType: validatedMime,
      language,
      farmerLocation: locationContext || undefined,
    });

    // 4. Record scan in database if Supabase is active
    let scanRecordId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        // Convert image to data URL or upload to bucket
        const dataUrl = `data:${validatedMime};base64,${base64Data}`;

        const { data: inserted, error: insertError } = await supabase
          .from('crop_scans')
          .insert({
            user_id: user?.id || null,
            guest_token: user ? null : guestToken,
            crop_name: result.crop_name,
            crop_confidence: result.crop_confidence,
            is_healthy: result.is_healthy,
            disease_name: result.disease_name,
            disease_confidence: result.disease_confidence,
            severity: result.severity,
            is_uncertain: result.is_uncertain,
            image_url: dataUrl,
            symptoms: result.symptoms,
            affected_parts: result.affected_parts,
            ai_explanation: result.ai_explanation,
            treatment_chemical: result.treatment_chemical,
            treatment_organic: result.treatment_organic,
            prevention_advice: result.prevention_advice,
            expert_advice: result.expert_advice,
            weather_context: { provider: providerUsed, scanned_at: new Date().toISOString() },
          })
          .select('id')
          .single();

        if (!insertError && inserted) {
          scanRecordId = inserted.id;
        }
      }
    } catch (dbErr) {
      console.warn('Scan DB logging skipped:', dbErr);
    }

    return NextResponse.json({
      success: true,
      scanId: scanRecordId,
      result,
      provider: providerUsed,
      imagePreview: `data:${validatedMime};base64,${base64Data}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Crop analysis failed.';
    console.error('Scan API error:', err);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
