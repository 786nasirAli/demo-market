import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { OrderStatus } from '@/lib/types';
import { z } from 'zod';

const updateStatusSchema = z.object({
  itemId: z.string(),
  status: z.enum(['new', 'confirmed', 'shipped', 'delivered']),
});

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: orderId } = await params;
    const body = await request.json();
    const validated = updateStatusSchema.parse(body);

    const success = await repository.updateOrderItemStatus(
      orderId,
      validated.itemId,
      validated.status as OrderStatus
    );

    if (!success) {
      return NextResponse.json(
        { success: false, error: 'Order or order item not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `Order status updated to ${validated.status}`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Status update failed' },
      { status: 400 }
    );
  }
}
