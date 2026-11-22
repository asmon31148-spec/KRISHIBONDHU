import { NextResponse } from 'next/server';
import { getServiceStatus } from '@/lib/supabase/status';

export async function GET() {
  const status = getServiceStatus();
  return NextResponse.json(status);
}
