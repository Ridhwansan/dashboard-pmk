import { NextResponse } from 'next/server';
import { getSugLocations } from '@/lib/db';

export async function GET() {
  try {
    const locations = await getSugLocations();
    return NextResponse.json({ success: true, count: locations.length, data: locations });
  } catch (error) {
    console.error('API GET /api/sug-locations error:', error);
    return NextResponse.json({ error: 'Gagal memuat sebaran lokasi SUG dari database' }, { status: 500 });
  }
}

