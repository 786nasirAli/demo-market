import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { z } from 'zod';

const createOrderSchema = z.object({
  buyerId: z.string(),
  buyerEmail: z.string().email(),
  buyerName: z.string().min(2),
  shippingAddress: z.object({
    fullName: z.string().min(2),
    addressLine1: z.string().min(3),
    addressLine2: z.string().optional(),
    city: z.string().min(2),
    postcode: z.string().min(3),
    phone: z.string().min(5),
  }),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      selectedOptions: z.record(
        z.string(),
        z.object({
          groupId: z.string(),
          optionId: z.string(),
        })
      ),
    })
  ).min(1),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const buyerId = searchParams.get('buyerId');
    const sellerId = searchParams.get('sellerId');
    const role = searchParams.get('role');

    if (sellerId) {
      const sellerItems = await repository.getOrdersForSeller(sellerId);
      return NextResponse.json({ success: true, data: sellerItems });
    }

    if (buyerId) {
      const buyerOrders = await repository.getOrdersForBuyer(buyerId);
      return NextResponse.json({ success: true, data: buyerOrders });
    }

    if (role === 'admin') {
      const allOrders = await repository.getAllOrders();
      return NextResponse.json({ success: true, data: allOrders });
    }

    const orders = await repository.getAllOrders();
    return NextResponse.json({ success: true, data: orders });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createOrderSchema.parse(body);

    // Call the server-verified order engine
    const order = await repository.createVerifiedOrder({
      buyerId: validated.buyerId,
      buyerEmail: validated.buyerEmail,
      buyerName: validated.buyerName,
      shippingAddress: validated.shippingAddress,
      items: validated.items,
    });

    return NextResponse.json({ success: true, data: order }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || 'Order creation failed' },
      { status: 400 }
    );
  }
}
