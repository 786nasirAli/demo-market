import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { z } from 'zod';

const updateListingSchema = z.object({
  productId: z.string(),
  status: z.enum(['pending', 'approved', 'hidden']),
});

export async function GET() {
  try {
    // Admin gets all products regardless of status
    const allProducts = await repository.getProducts({ status: 'all' as any });
    return NextResponse.json({ success: true, data: allProducts });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = updateListingSchema.parse(body);

    const updated = await repository.updateProductStatus(validated.productId, validated.status);
    if (!updated) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}
