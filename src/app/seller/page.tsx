'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/auth-context';
import { ProductWithVariations, OrderItem, OrderStatus } from '@/lib/types';
import { formatGBP } from '@/lib/pricing';
import {
  Store,
  Package,
  Plus,
  Sparkles,
  Edit3,
  CheckCircle,
  Truck,
  Clock,
  ShieldCheck,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Upload,
} from 'lucide-react';

export default function SellerDashboardPage() {
  const { user, role } = useAuth();
  const [activeTab, setActiveTab] = useState<'products' | 'orders'>('products');

  const [products, setProducts] = useState<ProductWithVariations[]>([]);
  const [incomingOrders, setIncomingOrders] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal / Form state for Add/Edit Product
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductWithVariations | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [basePrice, setBasePrice] = useState('269.99');
  const [compareAtPrice, setCompareAtPrice] = useState('539.98');
  const [imageSlots, setImageSlots] = useState<string[]>(['', '', '', '', '']);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [bulkUrls, setBulkUrls] = useState('');
  const [showBulkPaste, setShowBulkPaste] = useState(false);

  // AI Feature State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiNote, setAiNote] = useState<string | null>(null);

  // Load seller's products and incoming orders
  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch products for seller (including pending and approved)
      const resProducts = await fetch('/api/products?status=all');
      const prodJson = await resProducts.json();
      let combined = prodJson.success ? prodJson.data : [];

      try {
        const localItems = JSON.parse(localStorage.getItem('demo_local_products') || '[]');
        for (const itm of localItems) {
          const idx = combined.findIndex((p: any) => p.id === itm.id || p.slug === itm.slug);
          if (idx !== -1) {
            combined[idx] = { ...combined[idx], ...itm };
          } else {
            combined.unshift(itm);
          }
        }
      } catch (e) {}

      setProducts(combined);

      // Fetch incoming orders
      const resOrders = await fetch('/api/orders?sellerId=sel-001');
      const ordJson = await resOrders.json();
      if (ordJson.success) {
        setIncomingOrders(ordJson.data);
      }
    } catch (err) {
      console.error('Failed to load seller dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update order status (New -> Confirmed -> Shipped -> Delivered)
  const handleUpdateStatus = async (orderId: string, itemId: string, newStatus: OrderStatus) => {
    try {
      const res = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, status: newStatus }),
      });

      const json = await res.json();
      if (json.success) {
        // Refresh local state
        setIncomingOrders((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, status: newStatus } : item))
        );
      }
    } catch (err) {
      console.error('Failed to update status', err);
    }
  };

  // Open modal for editing or adding
  const handleOpenEdit = (prod?: ProductWithVariations) => {
    if (prod) {
      setEditingProduct(prod);
      setTitle(prod.title);
      setDescription(prod.description);
      setBasePrice(String(prod.basePrice));
      setCompareAtPrice(String(prod.compareAtPrice));
      const urls = (prod.images || []).map((img) => img.url);
      setImageSlots([
        urls[0] || '',
        urls[1] || '',
        urls[2] || '',
        urls[3] || '',
        urls[4] || '',
      ]);
    } else {
      setEditingProduct(null);
      setTitle('');
      setDescription('');
      setBasePrice('269.99');
      setCompareAtPrice('539.98');
      setImageSlots(['', '', '', '', '']);
    }
    setBulkUrls('');
    setShowBulkPaste(false);
    setAiNote(null);
    setIsModalOpen(true);
  };

  const handleSlotUrlChange = (index: number, val: string) => {
    setImageSlots((prev) => {
      const copy = [...prev];
      copy[index] = val;
      return copy;
    });
  };

  const handleClearSlot = (index: number) => {
    setImageSlots((prev) => {
      const copy = [...prev];
      copy[index] = '';
      return copy;
    });
  };

  const handleApplyBulkUrls = () => {
    if (!bulkUrls.trim()) return;
    const parsed = bulkUrls
      .split(/[\n,\s]+/)
      .map((u) => u.trim())
      .filter((u) => u.startsWith('http://') || u.startsWith('https://'));

    if (parsed.length === 0) {
      alert('No valid URLs found. Make sure URLs start with http:// or https://');
      return;
    }

    setImageSlots((prev) => {
      const updated = [...prev];
      for (let i = 0; i < 5; i++) {
        if (parsed[i]) {
          updated[i] = parsed[i];
        }
      }
      return updated;
    });
    setBulkUrls('');
    setShowBulkPaste(false);
  };

  // Local File Upload Handler
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingImage(true);
    try {
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        const json = await res.json();
        if (json.success && json.url) {
          newUrls.push(json.url);
        } else {
          alert('Failed to upload file: ' + (json.error || 'Unknown error'));
        }
      }
      setImageSlots((prev) => {
        const updated = [...prev];
        let urlIdx = 0;
        for (let i = 0; i < 5 && urlIdx < newUrls.length; i++) {
          if (!updated[i]) {
            updated[i] = newUrls[urlIdx++];
          }
        }
        for (let i = 0; i < 5 && urlIdx < newUrls.length; i++) {
          updated[i] = newUrls[urlIdx++];
        }
        return updated;
      });
    } catch (err: any) {
      console.error('Upload error', err);
      alert('Failed to upload image: ' + (err?.message || 'Network error'));
    } finally {
      setUploadingImage(false);
      e.target.value = '';
    }
  };

  // AI Feature: Auto-generate title and rich description
  const handleGenerateAI = async () => {
    setAiLoading(true);
    setAiNote(null);
    try {
      const promptInput = title || 'Prague Divan Bed Naples Fabric';
      const res = await fetch('/api/ai/generate-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          promptOrTitle: promptInput,
          category: 'Furniture > Divan Beds',
          optionsSummary: 'Naples fabric, custom sizes, underbed storage drawers',
        }),
      });

      const json = await res.json();
      if (json.success && json.data) {
        setTitle(json.data.title);
        setDescription(json.data.description);
        if (!json.isLiveAI) {
          setAiNote(json.note || 'AI generated using local template generator (OpenAI key pending).');
        } else {
          setAiNote('✨ Generated via live OpenAI model.');
        }
      }
    } catch (err: any) {
      console.error('AI generation failed', err);
      setAiNote('Failed to connect to AI service.');
    } finally {
      setAiLoading(false);
    }
  };

  // Save Product (Create or Update)
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    const numericBase = parseFloat(basePrice);
    const numericCompare = parseFloat(compareAtPrice);

    if (isNaN(numericBase) || isNaN(numericCompare)) {
      alert('Prices must be valid numbers.');
      return;
    }

    const isBlack = title.toLowerCase().includes('black');
    const isGrey = title.toLowerCase().includes('grey');

    const cleanedUrls = imageSlots.map((u) => u.trim()).filter((u) => u.length > 0);
    const finalImages =
      cleanedUrls.length > 0
        ? cleanedUrls.map((url, i) => ({
            url,
            altText: `${title} - View ${i + 1}`,
            displayOrder: i + 1,
          }))
        : [
            {
              url: isBlack
                ? 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=1200&q=80'
                : 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80',
              altText: title,
              displayOrder: 1,
            },
          ];

    if (editingProduct) {
      // Update existing
      try {
        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title,
            description,
            basePrice: numericBase,
            compareAtPrice: numericCompare,
            images: finalImages,
          }),
        });
        const json = await res.json();
        if (json.success) {
          setIsModalOpen(false);
          loadData();
        }
      } catch (err) {
        console.error('Failed to update product', err);
      }
    } else {
      // Add new product
      try {
        const isBlack = title.toLowerCase().includes('black');
        const isGrey = title.toLowerCase().includes('grey');

        const res = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sellerId: 'sel-001',
            categoryId: 'cat-001',
            title,
            description: description || 'Handcrafted luxury divan bed with plush upholstered finish, deep foam padding, and reinforced solid timber base.',
            basePrice: numericBase,
            compareAtPrice: numericCompare,
            images: finalImages,
            variationGroups: [
              {
                name: 'Colour',
                type: 'swatch',
                isRequired: true,
                options: [
                  { label: isBlack ? 'Black Naples' : isGrey ? 'Seal Grey Naples' : 'Cream Naples', value: isBlack ? 'black-naples' : isGrey ? 'seal-grey' : 'cream-naples', swatchHex: isBlack ? '#1C1C1E' : isGrey ? '#7D8184' : '#F5F2EB', extraPrice: 0, isDefault: true },
                  { label: 'Cream Naples', value: 'cream-naples', swatchHex: '#F5F2EB', extraPrice: 0, isDefault: !isBlack && !isGrey },
                  { label: 'Seal Grey Naples', value: 'seal-grey', swatchHex: '#7D8184', extraPrice: 0, isDefault: false },
                  { label: 'Black Naples', value: 'black-naples', swatchHex: '#1C1C1E', extraPrice: 0, isDefault: false },
                  { label: 'Silver Plush', value: 'silver-plush', swatchHex: '#C2C4CC', extraPrice: 0, isDefault: false },
                  { label: 'Coniston Blue', value: 'coniston-blue', swatchHex: '#2A455E', extraPrice: 0, isDefault: false },
                ],
              },
              {
                name: 'Size',
                type: 'radio',
                isRequired: true,
                options: [
                  { label: 'Small Single 2FT6', value: 'small-single-2ft6', extraPrice: 90, isDefault: true },
                  { label: 'Single 3FT', value: 'single-3ft', extraPrice: 95, isDefault: false },
                  { label: 'Small Double 4FT', value: 'small-double-4ft', extraPrice: 100, isDefault: false },
                  { label: 'Double 4FT6', value: 'double-4ft6', extraPrice: 110, isDefault: false },
                  { label: 'King 5FT', value: 'king-5ft', extraPrice: 125, isDefault: false },
                  { label: 'Super King 6FT', value: 'super-king-6ft', extraPrice: 150, isDefault: false },
                ],
              },
              {
                name: 'Storage',
                type: 'radio',
                isRequired: true,
                options: [
                  { label: 'No Storage', value: 'no-storage', extraPrice: 0, isDefault: true },
                  { label: '2 Drawers Left Side', value: '2-drawers-left', extraPrice: 50, isDefault: false },
                  { label: '2 Drawers Right Side', value: '2-drawers-right', extraPrice: 45, isDefault: false },
                  { label: '4 Drawers', value: '4-drawers', extraPrice: 210, isDefault: false },
                ],
              },
            ],
          }),
        });

        const json = await res.json();
        if (json.success) {
          if (json.data) {
            try {
              const saved = JSON.parse(localStorage.getItem('demo_local_products') || '[]');
              saved.unshift(json.data);
              localStorage.setItem('demo_local_products', JSON.stringify(saved));
            } catch (e) {}
          }
          setIsModalOpen(false);
          alert('✅ Bed listing created successfully!\n\nStatus: ⏳ Pending Admin Approval\n\nAb Admin Dashboard (/admin) par ja kar is listing ko "Approve" karein, to yeh Homepage par live ho jayegi!');
          loadData();
        } else {
          alert('❌ Failed to create product: ' + (json.error || 'Validation error'));
        }
      } catch (err: any) {
        console.error('Failed to create product', err);
        alert('❌ Error creating product: ' + (err?.message || 'Network error'));
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8 px-4 sm:px-6 lg:px-8 text-neutral-900">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-6 border-b border-neutral-200 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight">
                  Seller Portal
                </h1>
                <span className="text-xs font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full">
                  Demo Seller
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-0.5">
                Manage your handcrafted bed catalog, variation pricing, and incoming customer orders.
              </p>
            </div>
          </div>

          <button
            onClick={() => handleOpenEdit()}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors shadow-xs min-h-[44px] cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400" />
            <span>Add New Bed Product</span>
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-2 mb-6 border-b border-neutral-200 pb-2">
          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Product Listings ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold flex items-center gap-2 min-h-[44px] cursor-pointer transition-colors ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white'
                : 'bg-white text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <Truck className="w-4 h-4" />
            <span>Incoming Orders ({incomingOrders.length})</span>
          </button>
        </div>

        {/* Tab 1: Products */}
        {activeTab === 'products' && (
          <div className="space-y-4">
            {products.map((prod) => (
              <div
                key={prod.id}
                className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                    <img
                      src={prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=400&q=80'}
                      alt={prod.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <span
                      className={`text-xs font-bold uppercase px-2 py-0.5 rounded-md inline-block mb-1 ${
                        prod.status === 'approved'
                          ? 'text-emerald-700 bg-emerald-50 border border-emerald-200'
                          : 'text-amber-700 bg-amber-50 border border-amber-200'
                      }`}
                    >
                      {prod.status === 'approved' ? '✓ Live on Storefront' : '⏳ Pending Admin Approval'}
                    </span>
                    <h3 className="font-extrabold text-neutral-900 text-base">{prod.title}</h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Base Price:{' '}
                      <strong className="text-neutral-900">{formatGBP(prod.basePrice)}</strong> | Compare-at:{' '}
                      <span className="line-through">{formatGBP(prod.compareAtPrice)}</span>
                    </p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {prod.variationGroups.map((g) => (
                        <span
                          key={g.id}
                          className="text-[10px] bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-md font-medium"
                        >
                          {g.name}: {g.options.length} options
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => handleOpenEdit(prod)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-bold min-h-[44px] cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Edit Pricing & Copy</span>
                  </button>
                  <Link
                    href={`/products/${prod.slug}`}
                    className="flex items-center gap-1 px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 text-neutral-700 text-xs font-bold min-h-[44px]"
                  >
                    <span>View Live</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab 2: Incoming Orders */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {incomingOrders.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200">
                <Truck className="w-12 h-12 text-neutral-400 mx-auto mb-3" />
                <h3 className="font-bold text-neutral-900 text-lg">No incoming orders yet</h3>
                <p className="text-xs text-neutral-500 mt-1">
                  Orders placed by buyers will show up here for you to fulfill and update their shipping status.
                </p>
              </div>
            ) : (
              incomingOrders.map((item) => (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row justify-between gap-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-neutral-900">
                        Item #{item.id} (Order #{item.orderId})
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        {new Date(item.createdAt).toLocaleDateString('en-GB')}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-base text-neutral-900">
                      {item.productTitle} × {item.quantity}
                    </h4>

                    {/* Snapshot of chosen options */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {Object.entries(item.selectedConfiguration || {}).map(([k, v]) => (
                        <span
                          key={k}
                          className="text-[11px] bg-neutral-50 border border-neutral-200 text-neutral-700 px-2 py-0.5 rounded-md"
                        >
                          <strong>{k}:</strong> {v}
                        </span>
                      ))}
                    </div>

                    <div className="text-xs text-neutral-500 pt-1">
                      Line Total: <strong className="text-neutral-900 text-sm">{formatGBP(item.lineTotal)}</strong>
                    </div>
                  </div>

                  {/* Status Management (New, Confirmed, Shipped, Delivered) */}
                  <div className="flex flex-col sm:items-end justify-center gap-2 border-t md:border-t-0 md:border-l border-neutral-100 pt-3 md:pt-0 md:pl-4">
                    <span className="text-xs text-neutral-400 font-medium">Update Status:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {(['new', 'confirmed', 'shipped', 'delivered'] as OrderStatus[]).map((st) => {
                        const isCurrent = item.status === st;
                        return (
                          <button
                            key={st}
                            onClick={() => handleUpdateStatus(item.orderId, item.id, st)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer transition-colors min-h-[44px] ${
                              isCurrent
                                ? 'bg-emerald-600 text-white shadow-xs'
                                : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                            }`}
                          >
                            {st}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal: Add / Edit Product with AI Assistant */}
        {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 my-8">
              <div className="flex items-center justify-between pb-4 border-b border-neutral-100 mb-4">
                <h2 className="text-xl font-extrabold text-neutral-900">
                  {editingProduct ? 'Edit Product & Pricing' : 'Add New Handcrafted Bed'}
                </h2>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="text-neutral-400 hover:text-neutral-600 p-2 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              {/* AI Assistant Banner */}
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5">
                  <Sparkles className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="text-xs">
                    <span className="font-extrabold text-emerald-900 block">
                      AI Product Copy Assistant
                    </span>
                    <span className="text-emerald-700">
                      Auto-generate optimized e-commerce title, description, and features.
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={aiLoading}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 min-h-[44px] flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{aiLoading ? 'Generating...' : 'Auto-Generate Copy'}</span>
                </button>
              </div>

              {aiNote && (
                <div className="mb-4 p-2.5 bg-neutral-100 rounded-xl text-xs text-neutral-700 border border-neutral-200 font-medium">
                  {aiNote}
                </div>
              )}

              <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Product Title</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Prague Divan Bed – Cream Naples"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Base Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={basePrice}
                      onChange={(e) => setBasePrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-neutral-700 block mb-1">Compare-at Price (£)</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={compareAtPrice}
                      onChange={(e) => setCompareAtPrice(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[44px]"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-neutral-700 block mb-1">Product Description</label>
                  <textarea
                    rows={4}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Detailed craftsmanship and fabric specifications..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                {/* 5-Photo Gallery Manager (Direct 5 Slots + Bulk Paste + Local Upload) */}
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-extrabold text-neutral-900 block text-sm">
                        Product Photos (Up to 5 Images)
                      </label>
                      <span className="text-[11px] text-neutral-500">
                        Slot 1 is your Main Cover photo. Slots 2–5 form the interactive bedroom gallery.
                      </span>
                    </div>
                    <span className="text-xs font-black text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-lg">
                      {imageSlots.filter((u) => u.trim().length > 0).length}/5 Added
                    </span>
                  </div>

                  {/* 5 Visual Preview Slots */}
                  <div className="grid grid-cols-5 gap-2.5">
                    {imageSlots.map((imgUrl, slotIdx) => (
                      <div
                        key={slotIdx}
                        className="relative aspect-square rounded-2xl border-2 border-dashed border-neutral-300 bg-neutral-50 flex items-center justify-center overflow-hidden group shadow-xs transition-all hover:border-neutral-400"
                      >
                        {imgUrl.trim() ? (
                          <>
                            <img
                              src={imgUrl.trim()}
                              alt={`Slot ${slotIdx + 1}`}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLElement).style.opacity = '0.3';
                              }}
                            />
                            <div className="absolute top-1 left-1 bg-black/80 text-white text-[9px] font-black px-1.5 py-0.5 rounded-sm">
                              #{slotIdx + 1} {slotIdx === 0 ? 'Cover' : ''}
                            </div>
                            <button
                              type="button"
                              onClick={() => handleClearSlot(slotIdx)}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold cursor-pointer shadow-xs"
                              title="Clear photo"
                            >
                              ✕
                            </button>
                          </>
                        ) : (
                          <div className="text-center p-1">
                            <span className="block text-[11px] font-black text-neutral-400">
                              #{slotIdx + 1}
                            </span>
                            <span className="text-[9px] font-semibold text-neutral-400 block">
                              {slotIdx === 0 ? 'Main Cover' : 'Gallery Angle'}
                            </span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Action Bar: Upload File OR Bulk Paste Toggle */}
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs cursor-pointer min-h-[42px] transition-colors shadow-xs">
                      <Upload className="w-4 h-4 text-emerald-400" />
                      <span>{uploadingImage ? 'Uploading Photos...' : '📁 Upload Local Files'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        disabled={uploadingImage}
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setShowBulkPaste(!showBulkPaste)}
                      className="px-3.5 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-800 text-xs font-bold cursor-pointer min-h-[42px]"
                    >
                      {showBulkPaste ? 'Hide Bulk Paste' : '📋 Paste 5 URLs at Once'}
                    </button>
                  </div>

                  {/* Bulk Paste Box (Optional Accordion) */}
                  {showBulkPaste && (
                    <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2">
                      <label className="text-[11px] font-bold text-neutral-700 block">
                        Paste 1 to 5 image links (one per line or separated by commas):
                      </label>
                      <textarea
                        rows={3}
                        value={bulkUrls}
                        onChange={(e) => setBulkUrls(e.target.value)}
                        placeholder="https://images.unsplash.com/photo-1...&#10;https://images.unsplash.com/photo-2...&#10;https://images.unsplash.com/photo-3..."
                        className="w-full p-2.5 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 font-mono"
                      />
                      <button
                        type="button"
                        onClick={handleApplyBulkUrls}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold cursor-pointer"
                      >
                        Distribute to 5 Slots
                      </button>
                    </div>
                  )}

                  {/* 5 Direct URL Input Fields */}
                  <div className="space-y-1.5 pt-1">
                    <span className="text-[11px] font-bold text-neutral-600 block">
                      Direct Photo Links (Paste URLs directly below — auto-saved):
                    </span>
                    {[0, 1, 2, 3, 4].map((slotIdx) => (
                      <div key={slotIdx} className="flex items-center gap-2">
                        <span className="text-[11px] font-black text-neutral-500 w-16 shrink-0">
                          {slotIdx === 0 ? 'Cover #1:' : `Photo #${slotIdx + 1}:`}
                        </span>
                        <input
                          type="url"
                          value={imageSlots[slotIdx]}
                          onChange={(e) => handleSlotUrlChange(slotIdx, e.target.value)}
                          placeholder={
                            slotIdx === 0
                              ? 'https://... (Primary cover photo)'
                              : `https://... (Gallery angle #${slotIdx + 1})`
                          }
                          className="flex-1 px-3 py-2 rounded-xl border border-neutral-300 text-xs text-neutral-900 placeholder:text-neutral-400 focus:ring-2 focus:ring-emerald-500 min-h-[38px]"
                        />
                        {imageSlots[slotIdx] && (
                          <button
                            type="button"
                            onClick={() => handleClearSlot(slotIdx)}
                            className="text-neutral-400 hover:text-red-600 p-1 cursor-pointer font-bold"
                            title="Clear"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-neutral-100 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-neutral-300 font-bold text-neutral-700 hover:bg-neutral-50 min-h-[44px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold min-h-[44px]"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
