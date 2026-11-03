# 3-Minute Video Demonstration Script & Checklist

This script is designed for recording the required 3-minute Loom / screen recording demonstration for ESOLS Technologies.

---

## Video Recording Checklist

- [ ] 0:00 – 0:30: **Seller Product Management & AI Assistant**
- [ ] 0:30 – 1:15: **Buyer Customisation (Colour, Size, Storage, Headboard, Base, Assembly)**
- [ ] 1:15 – 1:45: **Dynamic Live Pricing & Basket Separation**
- [ ] 1:45 – 2:15: **Fake Checkout & Order Confirmation**
- [ ] 2:15 – 2:40: **Seller Status Transition (New -> Confirmed -> Shipped)**
- [ ] 2:40 – 3:00: **Mobile Web Responsiveness & PWA Installability**

---

## Step-by-Step Recording Script

### Part 1: Seller Portal & Variation Configuration (0:00 - 0:30)
1. **Show Navbar Role Switcher**: Click the role selector in the top bar and select **"Seller (Demo Seller)"**.
2. **Navigate to Seller Portal**: Click **"Seller Portal"** in the top navigation.
3. **Show Product List**: Point out the listed *Prague Divan Bed – Cream Naples* with base price £269.99 and compare-at £539.98.
4. **Demonstrate AI Copy Assistant**: Click **"Edit Pricing & Copy"** or **"Add New Bed Product"**. Click the **"Auto-Generate Copy"** button with the sparkles icon to show the AI feature automatically crafting the title, e-commerce copy, and feature bullets.
5. **Show Database-Driven Variations**: Point out how variation options and extra prices (e.g. Size +£90, +£110, Storage +£50, +£210) are managed from the database rather than hardcoded.

### Part 2: Buyer Customiser & Swatches (0:30 - 1:15)
1. **Switch to Buyer Role**: Use the top bar to switch to **"Buyer (Sarah)"**.
2. **Open Storefront**: Go to `/` or directly to `/products/prague-divan-bed-cream-naples`.
3. **Demonstrate Colour Swatches**:
   - Click **"Cream Naples"** (shows selected ring, label displays Cream Naples).
   - Click **"Seal Grey Naples"** (watch product title instantly change to *Prague Divan Bed – Seal Grey Naples* and the main image switch to the Seal Grey photography).
   - Click **"Slate Grey Naples"** and **"Black Naples"** to demonstrate responsive swatch transitions.
4. **Demonstrate Gallery**:
   - Click thumbnails to change images.
   - Click the expand button to show the full-screen lightbox modal.

### Part 3: Live Dynamic Pricing & Basket Separation (1:15 - 1:45)
1. **Change Size**: Click **"Double 4FT6"** -> Price immediately updates from £359.99 to **£379.99** (+£110 to base £269.99).
2. **Change Storage**: Click **"2 Drawers Left Side"** -> Price updates by +£50 to **£429.99**.
3. **Toggle Add-on**: Check **"Professional Assembly"** -> Price updates by +£39.99 to **£469.98**.
4. **Add to Basket**: Click **"Add to Basket"**.
5. **Add Second Distinct Combination**:
   - Change Size to **"King 5FT"** (+£125) and Storage to **"4 Drawers"** (+£210).
   - Click **"Add to Basket"**.
6. **Open Cart**: Click the Basket icon.
   - **Point out to the camera**: Both configurations of the Prague bed appear as **two separate cart lines**, clearly listing every chosen colour, size, storage, and assembly option!

### Part 4: Fake Checkout & Order Persistence (1:45 - 2:15)
1. **Proceed to Checkout**: Click **"Proceed to Fake Checkout"**.
2. **Point out Sandbox Banner**: Emphasize that the simulation clearly indicates no real payment is collected.
3. **Submit Order**: Click **"Confirm & Place Order"**.
4. **Order Confirmation**: Show the generated Order ID, total amount, and item breakdown.
5. **Check Buyer Orders**: Click **"View in My Orders"** to show the order logged with status **"New"**.

### Part 5: Seller Order Status Management (2:15 - 2:40)
1. **Switch Role to Seller**: Click top role switcher -> **Seller**.
2. **Go to Seller Portal -> Incoming Orders**:
   - The newly placed order appears in the incoming queue!
   - Click **"CONFIRMED"** -> Status badge turns amber.
   - Click **"SHIPPED"** -> Status badge turns purple.
3. **Verify on Buyer Side**: Switch back to Buyer and show that Sarah's order history immediately reflects the **"Shipped"** status.

### Part 6: Mobile Web & PWA Demonstration (2:40 - 3:00)
1. **Open DevTools in Chrome**: Press `F12` and toggle Device Toolbar (set width to **360px** - iPhone SE / Galaxy S20).
2. **Show No Sideways Scroll**: Scroll smoothly with zero horizontal overflow.
3. **Show Swipe Gallery**: Drag/swipe across the bed photos on the simulated touch screen.
4. **Show Sticky Add to Basket Bar**: Scroll up and down to show the fixed bottom bar displaying the live price and tap-friendly button.
5. **Highlight PWA**: Show the browser install icon in the address bar / three-dots menu ("Install Demo Marketplace").
