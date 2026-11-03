import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { z } from 'zod';

const updateSellerSchema = z.object({
  sellerId: z.string(),
  status: z.enum(['pending', 'approved', 'suspended']),
});

export async function GET() {
  try {
    const sellers = await repository.getSellers();
    return NextResponse.json({ success: true, data: sellers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateSellerSchema.parse(body);

    const updated = await repository.updateSellerStatus(validated.sellerId, validated.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Seller not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
