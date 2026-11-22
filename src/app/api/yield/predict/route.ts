import { NextRequest, NextResponse } from 'next/server';
import { calculateYieldPrediction, YieldPredictionInput } from '@/lib/yield/engine';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const body: YieldPredictionInput = await req.json();

    if (!body.cropKey) {
      return NextResponse.json({ error: 'Crop key is required.' }, { status: 400 });
    }
    if (!body.area || body.area <= 0) {
      return NextResponse.json({ error: 'Valid land area is required.' }, { status: 400 });
    }

    const prediction = calculateYieldPrediction(body);

    let savedId: string | null = null;
    try {
      const supabase = await createServerSupabaseClient();
      if (supabase) {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          const { data, error } = await supabase
            .from('yield_predictions')
            .insert({
              user_id: user.id,
              crop_name: prediction.cropName,
              variety: body.variety || null,
              area: body.area,
              area_unit: body.areaUnit,
              estimated_yield_per_acre: prediction.estimatedYieldPerAcreTons,
              total_expected_production_tons: prediction.totalExpectedProductionTons,
              confidence_score: prediction.confidenceScore,
              yield_range_min: prediction.yieldRangeMinTonsPerAcre,
              yield_range_max: prediction.yieldRangeMaxTonsPerAcre,
              factors: prediction.factors,
              recommendations: prediction.recommendations,
            })
            .select('id')
            .single();

          if (!error && data) {
            savedId = data.id;
          }
        }
      }
    } catch (dbErr) {
      console.warn('Yield prediction DB logging skipped:', dbErr);
    }

    return NextResponse.json({
      success: true,
      predictionId: savedId,
      prediction,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Yield prediction failed.';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
