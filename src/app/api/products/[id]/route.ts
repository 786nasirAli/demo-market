import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const product = await repository.getProductById(id);

    if (!product) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error retrieving product' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const existing = await repository.getProductById(id);
    if (!existing) {
      return NextResponse.json(
        { success: false, error: 'Product not found' },
        { status: 404 }
      );
    }

    // Preserve variation groups or ensure defaults so product customizer is never broken
    const defaultVariations = [
      {
        id: `grp-${Date.now()}-1`,
        productId: id,
        name: 'Colour',
        type: 'swatch' as const,
        isRequired: true,
        displayOrder: 1,
        options: [
          { id: `opt-col-1`, groupId: `grp-${Date.now()}-1`, label: 'Cream Naples', value: 'cream-naples', swatchHex: '#F5F2EB', extraPrice: 0, isDefault: true, displayOrder: 1 },
          { id: `opt-col-2`, groupId: `grp-${Date.now()}-1`, label: 'Seal Grey Naples', value: 'seal-grey', swatchHex: '#7D8184', extraPrice: 0, isDefault: false, displayOrder: 2 },
          { id: `opt-col-3`, groupId: `grp-${Date.now()}-1`, label: 'Black Naples', value: 'black-naples', swatchHex: '#1C1C1E', extraPrice: 0, isDefault: false, displayOrder: 3 },
          { id: `opt-col-4`, groupId: `grp-${Date.now()}-1`, label: 'Silver Plush', value: 'silver-plush', swatchHex: '#C2C4CC', extraPrice: 0, isDefault: false, displayOrder: 4 },
          { id: `opt-col-5`, groupId: `grp-${Date.now()}-1`, label: 'Coniston Blue', value: 'coniston-blue', swatchHex: '#2A455E', extraPrice: 0, isDefault: false, displayOrder: 5 },
        ],
      },
      {
        id: `grp-${Date.now()}-2`,
        productId: id,
        name: 'Size',
        type: 'radio' as const,
        isRequired: true,
        displayOrder: 2,
        options: [
          { id: `opt-sz-1`, groupId: `grp-${Date.now()}-2`, label: 'Small Single 2FT6', value: 'small-single-2ft6', extraPrice: 90, isDefault: true, displayOrder: 1 },
          { id: `opt-sz-2`, groupId: `grp-${Date.now()}-2`, label: 'Single 3FT', value: 'single-3ft', extraPrice: 95, isDefault: false, displayOrder: 2 },
          { id: `opt-sz-3`, groupId: `grp-${Date.now()}-2`, label: 'Small Double 4FT', value: 'small-double-4ft', extraPrice: 100, isDefault: false, displayOrder: 3 },
          { id: `opt-sz-4`, groupId: `grp-${Date.now()}-2`, label: 'Double 4FT6', value: 'double-4ft6', extraPrice: 110, isDefault: false, displayOrder: 4 },
          { id: `opt-sz-5`, groupId: `grp-${Date.now()}-2`, label: 'King 5FT', value: 'king-5ft', extraPrice: 125, isDefault: false, displayOrder: 5 },
          { id: `opt-sz-6`, groupId: `grp-${Date.now()}-2`, label: 'Super King 6FT', value: 'super-king-6ft', extraPrice: 150, isDefault: false, displayOrder: 6 },
        ],
      },
    ];

    const updated = await repository.saveProduct({
      ...existing,
      ...body,
      variationGroups:
        existing.variationGroups && existing.variationGroups.length > 0
          ? existing.variationGroups
          : defaultVariations,
      id,
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Error updating product' },
      { status: 500 }
    );
  }
}
