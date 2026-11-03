'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { CartItem, ProductWithVariations, SelectedOptionDetail } from '@/lib/types';
import { calculateDynamicPrice, fromPence, generateCartItemHash, toPence } from '@/lib/pricing';

interface CartContextType {
  items: CartItem[];
  addItem: (
    product: ProductWithVariations,
    selectedOptions: Record<string, SelectedOptionDetail>,
    quantity?: number
  ) => void;
  removeItem: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const LOCAL_STORAGE_CART_KEY = 'esols_marketplace_cart_items';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to load cart from localStorage', e);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart to localStorage', e);
      }
    }
  }, [items, isLoaded]);

  const addItem = (
    product: ProductWithVariations,
    selectedOptions: Record<string, SelectedOptionDetail>,
    quantity: number = 1
  ) => {
    // Determine unit price based on base price + selected options
    const optionsArray = Object.values(selectedOptions);
    const unitPrice = calculateDynamicPrice(product.basePrice, optionsArray);

    // Compute unique configuration hash to ensure distinct line items
    const hash = generateCartItemHash(product.id, selectedOptions);

    // Main image or colour-associated image
    const chosenColour = selectedOptions['Colour']?.label;
    const matchingImg =
      product.images.find((img) => img.associatedColour === chosenColour) ||
      product.images[0] || { url: '/placeholder-bed.jpg' };

    setItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id === hash);

      if (existingIndex > -1) {
        // Increment quantity of exact same configuration
        const updated = [...prevItems];
        const newQty = updated[existingIndex].quantity + quantity;
        const lineTotalPence = toPence(unitPrice) * newQty;
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          lineTotal: fromPence(lineTotalPence),
        };
        return updated;
      } else {
        // Add new unique configuration line item
        const lineTotalPence = toPence(unitPrice) * quantity;
        const newItem: CartItem = {
          id: hash,
          productId: product.id,
          productTitle: product.title,
          productImage: matchingImg.url,
          basePrice: product.basePrice,
          selectedOptions,
          quantity,
          unitPrice,
          lineTotal: fromPence(lineTotalPence),
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeItem = (itemId: string) => {
    setItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const lineTotalPence = toPence(item.unitPrice) * quantity;
          return {
            ...item,
            quantity,
            lineTotal: fromPence(lineTotalPence),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const subtotal = fromPence(
    items.reduce((sum, item) => sum + toPence(item.lineTotal), 0)
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        itemCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
