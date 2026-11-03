// Core Domain Types for ESOLS Mini Marketplace

export type UserRole = 'buyer' | 'seller' | 'admin';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
}

export interface Seller {
  id: string;
  profileId: string;
  storeName: string;
  description?: string;
  status: 'pending' | 'approved' | 'suspended';
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  altText: string;
  displayOrder: number;
  associatedColour?: string;
}

export type VariationGroupType = 'swatch' | 'radio' | 'checkbox';

export interface VariationOption {
  id: string;
  groupId: string;
  label: string;
  value: string;
  swatchHex?: string;
  extraPrice: number; // Always numeric float in £ (e.g., 90.00)
  isDefault: boolean;
  displayOrder: number;
}

export interface VariationGroup {
  id: string;
  productId: string;
  name: string; // e.g. "Colour", "Size", "Storage", "Headboard", "Base", "Assembly"
  type: VariationGroupType;
  isRequired: boolean;
  displayOrder: number;
  options: VariationOption[];
}

export interface Product {
  id: string;
  sellerId: string;
  categoryId: string;
  title: string;
  slug: string;
  description: string;
  basePrice: number;
  compareAtPrice: number;
  status: 'pending' | 'approved' | 'hidden';
  createdAt: string;
  updatedAt?: string;
}

export interface ProductWithVariations extends Product {
  seller?: Seller;
  category?: Category;
  images: ProductImage[];
  variationGroups: VariationGroup[];
}

export interface SelectedOptionDetail {
  groupId: string;
  groupName: string;
  optionId: string;
  label: string;
  extraPrice: number;
  swatchHex?: string;
}

export interface CartItem {
  id: string; // Unique hash based on productId + configuration
  productId: string;
  productTitle: string;
  productImage: string;
  basePrice: number;
  selectedOptions: Record<string, SelectedOptionDetail>; // Keyed by group name (e.g. "Colour", "Size", etc.)
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export type OrderStatus = 'new' | 'confirmed' | 'shipped' | 'delivered';

export interface ShippingAddress {
  fullName: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  postcode: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  productTitle: string;
  sellerId: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  selectedConfiguration: Record<string, string>; // e.g. { "Colour": "Cream Naples", "Size": "King 5FT (+£125.00)" }
  status: OrderStatus;
  createdAt: string;
}

export interface Order {
  id: string;
  buyerId: string;
  buyerEmail: string;
  buyerName: string;
  totalAmount: number;
  status: OrderStatus;
  shippingAddress: ShippingAddress;
  createdAt: string;
  items: OrderItem[];
}
