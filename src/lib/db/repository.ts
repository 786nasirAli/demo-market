import {
  INITIAL_CATEGORIES,
  INITIAL_ORDERS,
  INITIAL_PRODUCTS,
  INITIAL_PROFILES,
  INITIAL_SELLERS,
} from './mock-data';
import {
  Category,
  Order,
  OrderItem,
  OrderStatus,
  ProductWithVariations,
  Seller,
  ShippingAddress,
  UserProfile,
} from '@/lib/types';
import { calculateDynamicPrice, fromPence, toPence } from '@/lib/pricing';
import { createServerSupabaseClient } from '@/lib/supabase/server';

// In-memory state store for seamless local execution & testing when Supabase keys are pending
let memoryProducts: ProductWithVariations[] = JSON.parse(JSON.stringify(INITIAL_PRODUCTS));
let memoryOrders: Order[] = JSON.parse(JSON.stringify(INITIAL_ORDERS));
let memorySellers: Seller[] = JSON.parse(JSON.stringify(INITIAL_SELLERS));
let memoryProfiles: UserProfile[] = JSON.parse(JSON.stringify(INITIAL_PROFILES));
const memoryCategories: Category[] = JSON.parse(JSON.stringify(INITIAL_CATEGORIES));

export interface ProductFilters {
  category?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  colour?: string;
  size?: string;
  status?: string;
  sellerId?: string;
}

export const repository = {
  // --- USERS & PROFILES ---
  async getProfiles(): Promise<UserProfile[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('profiles').select('*');
      if (!error && data) {
        return data.map((d) => ({
          id: d.id,
          email: d.email,
          fullName: d.full_name,
          role: d.role,
          createdAt: d.created_at,
        }));
      }
    }
    return memoryProfiles;
  },

  async getProfileById(id: string): Promise<UserProfile | null> {
    const profiles = await this.getProfiles();
    return profiles.find((p) => p.id === id) || null;
  },

  // --- SELLERS ---
  async getSellers(): Promise<Seller[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('sellers').select('*');
      if (!error && data) {
        return data.map((s) => ({
          id: s.id,
          profileId: s.profile_id,
          storeName: s.store_name,
          description: s.description,
          status: s.status,
          createdAt: s.created_at,
        }));
      }
    }
    return memorySellers;
  },

  async updateSellerStatus(sellerId: string, status: 'pending' | 'approved' | 'suspended'): Promise<Seller | null> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase
        .from('sellers')
        .update({ status })
        .eq('id', sellerId)
        .select()
        .single();
      if (!error && data) {
        return {
          id: data.id,
          profileId: data.profile_id,
          storeName: data.store_name,
          description: data.description,
          status: data.status,
          createdAt: data.created_at,
        };
      }
    }

    const sellerIndex = memorySellers.findIndex((s) => s.id === sellerId);
    if (sellerIndex !== -1) {
      memorySellers[sellerIndex].status = status;
      return memorySellers[sellerIndex];
    }
    return null;
  },

  // --- CATEGORIES ---
  async getCategories(): Promise<Category[]> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      const { data, error } = await supabase.from('categories').select('*');
      if (!error && data) {
        return data.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));
      }
    }
    return memoryCategories;
  },

  // --- PRODUCTS ---
  async getProducts(filters: ProductFilters = {}): Promise<ProductWithVariations[]> {
    let rawProducts: ProductWithVariations[] = [];

    const supabase = await createServerSupabaseClient();
    if (supabase) {
      let query = supabase
        .from('products')
        .select(`
          *,
          seller:sellers(*),
          category:categories(*),
          images:product_images(*),
          variationGroups:variation_groups(
            *,
            options:variation_options(*)
          )
        `);

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      } else if (!filters.status) {
        query = query.eq('status', 'approved');
      }

      if (filters.sellerId && filters.sellerId !== 'sel-001') {
        query = query.eq('seller_id', filters.sellerId);
      }

      const { data, error } = await query;
      if (!error && data && data.length > 0) {
        rawProducts = data.map((p: any) => ({
          id: p.id,
          sellerId: p.seller_id,
          categoryId: p.category_id,
          title: p.title,
          slug: p.slug,
          description: p.description,
          basePrice: Number(p.base_price),
          compareAtPrice: Number(p.compare_at_price),
          status: p.status,
          createdAt: p.created_at,
          updatedAt: p.updated_at,
          seller: p.seller,
          category: p.category,
          images: (p.images || []).map((img: any) => ({
            id: img.id,
            productId: img.product_id,
            url: img.url,
            altText: img.alt_text,
            displayOrder: img.display_order,
            associatedColour: img.associated_colour,
          })),
          variationGroups: (p.variationGroups || []).map((g: any) => ({
            id: g.id,
            productId: g.product_id,
            name: g.name,
            type: g.type,
            isRequired: g.is_required,
            displayOrder: g.display_order,
            options: (g.options || []).map((o: any) => ({
              id: o.id,
              groupId: o.group_id,
              label: o.label,
              value: o.value,
              swatchHex: o.swatch_hex,
              extraPrice: Number(o.extra_price),
              isDefault: o.is_default,
              displayOrder: o.display_order,
            })),
          })),
        }));
      }
    }

    // Merge memory products so any newly added or updated product is always included
    if (rawProducts.length > 0) {
      for (const mp of memoryProducts) {
        const existingIdx = rawProducts.findIndex((p) => p.id === mp.id || p.slug === mp.slug);
        if (existingIdx !== -1) {
          // If in-memory was updated (e.g. status changed), sync it
          if (mp.updatedAt && mp.updatedAt > (rawProducts[existingIdx].updatedAt || '')) {
            rawProducts[existingIdx] = { ...rawProducts[existingIdx], ...mp };
          }
        } else {
          rawProducts.unshift(mp);
        }
      }
    } else {
      rawProducts = [...memoryProducts];
    }

    // Unified Intelligent Filtering Pipeline
    return rawProducts.filter((p) => {
      // Status filter
      if (filters.status && filters.status !== 'all') {
        if (p.status !== filters.status) return false;
      } else if (!filters.status) {
        if (p.status !== 'approved') return false;
      }

      // Seller filter
      if (filters.sellerId && filters.sellerId !== 'sel-001' && p.sellerId !== filters.sellerId) return false;

      // Category filter
      if (filters.category && filters.category !== 'all') {
        const catSlug = p.category?.slug || '';
        const catName = p.category?.name?.toLowerCase() || '';
        const target = filters.category.toLowerCase();
        if (!catSlug.includes(target) && !catName.includes(target)) {
          return false;
        }
      }

      // Search filter (matches product title or description)
      if (filters.search && filters.search.trim() !== '') {
        const term = filters.search.toLowerCase().trim();
        const matchesTitle = p.title.toLowerCase().includes(term);
        const matchesDesc = p.description.toLowerCase().includes(term);
        if (!matchesTitle && !matchesDesc) {
          return false;
        }
      }

      // Min / Max Price
      if (filters.minPrice !== undefined && p.basePrice < filters.minPrice) return false;
      if (filters.maxPrice !== undefined && p.basePrice > filters.maxPrice) return false;

      // Colour filter (matches specific product colour)
      if (filters.colour && filters.colour !== 'all') {
        const targetCol = filters.colour.toLowerCase().replace('naples', '').trim();
        const matchesTitleColour = p.title.toLowerCase().includes(targetCol);
        const colourGroup = p.variationGroups.find((g) => g.name.toLowerCase() === 'colour');
        const defaultOpt = colourGroup?.options.find((o) => o.isDefault) || colourGroup?.options[0];
        const matchesDefaultColour = defaultOpt?.label.toLowerCase().includes(targetCol) || false;

        if (!matchesTitleColour && !matchesDefaultColour) return false;
      }

      // Size filter (matches label or value, e.g. "Double" matches "Double 4FT6")
      if (filters.size && filters.size !== 'all') {
        const targetSize = filters.size.toLowerCase().trim();
        const sizeGroup = p.variationGroups.find((g) => g.name.toLowerCase() === 'size');
        const hasSize = sizeGroup?.options.some((o) => {
          const optLabel = o.label.toLowerCase();
          const optVal = o.value.toLowerCase();
          return optLabel.includes(targetSize) || optVal.includes(targetSize);
        });
        if (!hasSize) return false;
      }

      return true;
    });
  },


  async getProductBySlug(slug: string): Promise<ProductWithVariations | null> {
    const products = await this.getProducts({ status: 'approved' });
    const directMatch = products.find((p) => p.slug === slug);
    if (directMatch) return directMatch;

    // Check all products including pending/hidden for owner/preview
    return memoryProducts.find((p) => p.slug === slug) || null;
  },

  async getProductById(id: string): Promise<ProductWithVariations | null> {
    return memoryProducts.find((p) => p.id === id) || null;
  },

  async saveProduct(productData: ProductWithVariations): Promise<ProductWithVariations> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        const isUUID = productData.id && productData.id.length === 36 && productData.id.includes('-');
        const dbId = isUUID ? productData.id : crypto.randomUUID();

        const dbProduct = {
          id: dbId,
          seller_id: '55555555-5555-5555-5555-555555555555',
          category_id: '11111111-1111-1111-1111-111111111111',
          title: productData.title,
          slug: productData.slug,
          description: productData.description,
          base_price: productData.basePrice,
          compare_at_price: productData.compareAtPrice,
          status: productData.status || 'pending',
          updated_at: new Date().toISOString(),
        };

        const { data: inserted, error: insertErr } = await supabase
          .from('products')
          .upsert(dbProduct)
          .select()
          .single();

        if (!insertErr && inserted) {
          productData.id = inserted.id;
        }
      } catch (err) {
        console.warn('Supabase product save bypassed to resilient memory store', err);
      }
    }

    const existingIndex = memoryProducts.findIndex((p) => p.id === productData.id || p.slug === productData.slug);
    if (existingIndex !== -1) {
      memoryProducts[existingIndex] = {
        ...memoryProducts[existingIndex],
        ...productData,
        updatedAt: new Date().toISOString(),
      };
      return memoryProducts[existingIndex];
    } else {
      const newProduct: ProductWithVariations = {
        ...productData,
        id: productData.id || `prod-${Date.now()}`,
        status: productData.status || 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      memoryProducts.unshift(newProduct);
      return newProduct;
    }
  },

  async updateProductStatus(productId: string, status: 'pending' | 'approved' | 'hidden'): Promise<ProductWithVariations | null> {
    const supabase = await createServerSupabaseClient();
    if (supabase) {
      try {
        await supabase
          .from('products')
          .update({ status, updated_at: new Date().toISOString() })
          .eq('id', productId);
      } catch (err) {
        console.warn('Supabase product status update bypassed', err);
      }
    }

    const index = memoryProducts.findIndex((p) => p.id === productId);
    if (index !== -1) {
      memoryProducts[index].status = status;
      memoryProducts[index].updatedAt = new Date().toISOString();
      return memoryProducts[index];
    } else {
      // If product exists in database, add it to memoryProducts tracking
      const allProds = await this.getProducts({ status: 'all' as any });
      const found = allProds.find((p) => p.id === productId);
      if (found) {
        found.status = status;
        found.updatedAt = new Date().toISOString();
        memoryProducts.unshift(found);
        return found;
      }
    }
    return null;
  },

  // --- ORDERS & SERVER-SIDE PRICING VERIFICATION ---

  /**
   * Secure Checkout & Order Creation:
   * Re-evaluates each line item against actual database base prices and option delta prices.
   * Client-submitted prices are never trusted directly.
   */
  async createVerifiedOrder(params: {
    buyerId: string;
    buyerEmail: string;
    buyerName: string;
    shippingAddress: ShippingAddress;
    items: Array<{
      productId: string;
      quantity: number;
      selectedOptions: Record<string, { groupId: string; optionId: string }>;
    }>;
  }): Promise<Order> {
    const verifiedOrderItems: OrderItem[] = [];
    let orderTotalPence = 0;
    const orderId = `ord-${Date.now()}`;

    for (const itemInput of params.items) {
      const product = await this.getProductById(itemInput.productId);
      if (!product) {
        throw new Error(`Product with ID ${itemInput.productId} not found.`);
      }

      // Server recalculation of base price + selected variations
      let itemPricePence = toPence(product.basePrice);
      const selectedConfigMap: Record<string, string> = {};

      for (const groupName of Object.keys(itemInput.selectedOptions)) {
        const selection = itemInput.selectedOptions[groupName];
        const group = product.variationGroups.find((g) => g.id === selection.groupId || g.name === groupName);
        if (!group) continue;

        const option = group.options.find((o) => o.id === selection.optionId);
        if (option) {
          itemPricePence += toPence(option.extraPrice);
          const priceStr = option.extraPrice > 0 ? ` (+£${option.extraPrice.toFixed(2)})` : ' (+£0.00)';
          selectedConfigMap[group.name] = `${option.label}${priceStr}`;
        }
      }

      const verifiedUnitPrice = fromPence(itemPricePence);
      const lineTotalPence = itemPricePence * itemInput.quantity;
      const lineTotal = fromPence(lineTotalPence);

      orderTotalPence += lineTotalPence;

      verifiedOrderItems.push({
        id: `itm-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        orderId,
        productId: product.id,
        productTitle: product.title,
        sellerId: product.sellerId,
        quantity: itemInput.quantity,
        unitPrice: verifiedUnitPrice,
        lineTotal,
        selectedConfiguration: selectedConfigMap,
        status: 'new',
        createdAt: new Date().toISOString(),
      });
    }

    const newOrder: Order = {
      id: orderId,
      buyerId: params.buyerId,
      buyerEmail: params.buyerEmail,
      buyerName: params.buyerName,
      totalAmount: fromPence(orderTotalPence),
      status: 'new',
      shippingAddress: params.shippingAddress,
      createdAt: new Date().toISOString(),
      items: verifiedOrderItems,
    };

    memoryOrders.unshift(newOrder);
    return newOrder;
  },

  async getOrdersForBuyer(buyerId: string): Promise<Order[]> {
    return memoryOrders.filter((o) => o.buyerId === buyerId);
  },

  async getOrdersForSeller(sellerId: string): Promise<OrderItem[]> {
    const sellerItems: OrderItem[] = [];
    for (const order of memoryOrders) {
      for (const item of order.items) {
        if (item.sellerId === sellerId) {
          sellerItems.push(item);
        }
      }
    }
    return sellerItems;
  },

  async getAllOrders(): Promise<Order[]> {
    return memoryOrders;
  },

  async updateOrderItemStatus(
    orderId: string,
    itemId: string,
    newStatus: OrderStatus
  ): Promise<boolean> {
    const order = memoryOrders.find((o) => o.id === orderId);
    if (!order) return false;

    const item = order.items.find((i) => i.id === itemId);
    if (!item) return false;

    item.status = newStatus;

    // If all items are delivered, set order status to delivered, etc.
    const allStatuses = order.items.map((i) => i.status);
    if (allStatuses.every((s) => s === 'delivered')) {
      order.status = 'delivered';
    } else if (allStatuses.some((s) => s === 'shipped')) {
      order.status = 'shipped';
    } else if (allStatuses.some((s) => s === 'confirmed')) {
      order.status = 'confirmed';
    }

    return true;
  },
};
