import { NextRequest, NextResponse } from 'next/server';
import { repository } from '@/lib/db/repository';
import { z } from 'zod';

const createProductSchema = z.object({
  title: z.string().min(3),
  categoryId: z.string(),
  description: z.string().min(10),
  basePrice: z.number().positive(),
  compareAtPrice: z.number().positive(),
  sellerId: z.string(),
  images: z.array(
    z.object({
      url: z.string().min(1),
      altText: z.string().optional(),
      displayOrder: z.number().default(0),
      associatedColour: z.string().optional(),
    })
  ).min(1),
  variationGroups: z.array(
    z.object({
      name: z.string(),
      type: z.enum(['swatch', 'radio', 'checkbox']),
      isRequired: z.boolean().default(true),
      displayOrder: z.number().default(0),
      options: z.array(
        z.object({
          label: z.string(),
          value: z.string(),
          swatchHex: z.string().optional(),
          extraPrice: z.number().min(0).default(0),
          isDefault: z.boolean().default(false),
          displayOrder: z.number().default(0),
        })
      ),
    })
  ),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;
    const search = searchParams.get('search') || undefined;
    const minPrice = searchParams.get('minPrice') ? Number(searchParams.get('minPrice')) : undefined;
    const maxPrice = searchParams.get('maxPrice') ? Number(searchParams.get('maxPrice')) : undefined;
    const colour = searchParams.get('colour') || undefined;
    const size = searchParams.get('size') || undefined;
    const status = searchParams.get('status') || 'approved';
    const sellerId = searchParams.get('sellerId') || undefined;

    const products = await repository.getProducts({
      category,
      search,
      minPrice,
      maxPrice,
      colour,
      size,
      status,
      sellerId,
    });

    return NextResponse.json({ success: true, data: products });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = createProductSchema.parse(body);

    const slug = validated.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '');

    const newProduct = await repository.saveProduct({
      id: `prod-${Date.now()}`,
      sellerId: validated.sellerId,
      categoryId: validated.categoryId,
      title: validated.title,
      slug,
      description: validated.description,
      basePrice: validated.basePrice,
      compareAtPrice: validated.compareAtPrice,
      status: 'pending', // Requires admin approval unless auto-approved
      createdAt: new Date().toISOString(),
      images: validated.images.map((img, i) => ({
        id: `img-${Date.now()}-${i}`,
        productId: '',
        url: img.url,
        altText: img.altText || validated.title,
        displayOrder: img.displayOrder || i + 1,
        associatedColour: img.associatedColour,
      })),
      variationGroups: validated.variationGroups.map((grp, gi) => {
        const groupId = `grp-${Date.now()}-${gi}`;
        return {
          id: groupId,
          productId: '',
          name: grp.name,
          type: grp.type,
          isRequired: grp.isRequired,
          displayOrder: grp.displayOrder || gi + 1,
          options: grp.options.map((opt, oi) => ({
            id: `opt-${Date.now()}-${gi}-${oi}`,
            groupId,
            label: opt.label,
            value: opt.value,
            swatchHex: opt.swatchHex,
            extraPrice: opt.extraPrice,
            isDefault: opt.isDefault,
            displayOrder: opt.displayOrder || oi + 1,
          })),
        };
      }),
    });

    return NextResponse.json({ success: true, data: newProduct }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.errors || error.message || 'Validation failed' },
      { status: 400 }
    );
  }
}
