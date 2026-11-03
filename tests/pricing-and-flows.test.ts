import {
  calculateDynamicPrice,
  calculateDiscountPercent,
  formatGBP,
  generateCartItemHash,
  toPence,
  fromPence,
} from '../src/lib/pricing';
import { repository } from '../src/lib/db/repository';

async function runTestSuite() {
  console.log('--- STARTING ESOLS MARKETPLACE AUTOMATED VERIFICATION SUITE ---\n');

  let passedTests = 0;
  let failedTests = 0;

  function assert(condition: boolean, testName: string, details?: string) {
    if (condition) {
      console.log(`✅ PASS: ${testName}`);
      passedTests++;
    } else {
      console.error(`❌ FAIL: ${testName}`);
      if (details) console.error(`   Details: ${details}`);
      failedTests++;
    }
  }

  const BASE_PRICE = 269.99;
  const COMPARE_AT = 539.98;

  // TEST 1: Combination 1 (Default Small Single 2FT6, No Storage, FREE 26" Headboard, Standard Base, No Assembly)
  const combo1Options = [
    { label: 'Cream Naples', extraPrice: 0.0 },
    { label: 'Small Single 2FT6', extraPrice: 90.0 },
    { label: 'No Storage', extraPrice: 0.0 },
    { label: 'FREE 26" Headboard', extraPrice: 0.0 },
    { label: 'Standard Base', extraPrice: 0.0 },
  ];
  const price1 = calculateDynamicPrice(BASE_PRICE, combo1Options);
  assert(price1 === 359.99, 'Config 1 Price Calculation (£359.99)', `Got ${price1}`);

  // TEST 2: Combination 2 (Single 3FT, 2 Drawers Left Side)
  const combo2Options = [
    { label: 'Seal Grey Naples', extraPrice: 0.0 },
    { label: 'Single 3FT', extraPrice: 95.0 },
    { label: '2 Drawers Left Side', extraPrice: 50.0 },
    { label: 'FREE 26" Headboard', extraPrice: 0.0 },
    { label: 'Standard Base', extraPrice: 0.0 },
  ];
  const price2 = calculateDynamicPrice(BASE_PRICE, combo2Options);
  assert(price2 === 414.99, 'Config 2 Price Calculation (£414.99)', `Got ${price2}`);

  // TEST 3: Combination 3 (Double 4FT6, 2 Drawers Foot End, 54" Floor Standing Headboard, Reinforced Base, Assembly)
  const combo3Options = [
    { label: 'Slate Grey Naples', extraPrice: 0.0 },
    { label: 'Double 4FT6', extraPrice: 110.0 },
    { label: '2 Drawers Foot End', extraPrice: 155.0 },
    { label: '54" Floor Standing Headboard', extraPrice: 10.0 },
    { label: 'Reinforced Base', extraPrice: 25.0 },
    { label: 'Professional Assembly', extraPrice: 39.99 },
  ];
  const price3 = calculateDynamicPrice(BASE_PRICE, combo3Options);
  assert(price3 === 609.98, 'Config 3 Price Calculation (£609.98)', `Got ${price3}`);

  // TEST 4: Combination 4 (King 5FT, 4 Drawers, 54" Floor Standing Headboard, Reinforced Base, No Assembly)
  const combo4Options = [
    { label: 'Black Naples', extraPrice: 0.0 },
    { label: 'King 5FT', extraPrice: 125.0 },
    { label: '4 Drawers', extraPrice: 210.0 },
    { label: '54" Floor Standing Headboard', extraPrice: 10.0 },
    { label: 'Reinforced Base', extraPrice: 25.0 },
  ];
  const price4 = calculateDynamicPrice(BASE_PRICE, combo4Options);
  assert(price4 === 639.99, 'Config 4 Price Calculation (£639.99)', `Got ${price4}`);

  // TEST 5: Combination 5 (Super King 6FT, 4 Drawers, 54" Floor Standing Headboard, Reinforced Base, Professional Assembly)
  const combo5Options = [
    { label: 'Mauve Naples', extraPrice: 0.0 },
    { label: 'Super King 6FT', extraPrice: 150.0 },
    { label: '4 Drawers', extraPrice: 210.0 },
    { label: '54" Floor Standing Headboard', extraPrice: 10.0 },
    { label: 'Reinforced Base', extraPrice: 25.0 },
    { label: 'Professional Assembly', extraPrice: 39.99 },
  ];
  const price5 = calculateDynamicPrice(BASE_PRICE, combo5Options);
  assert(price5 === 704.98, 'Config 5 Price Calculation (£704.98)', `Got ${price5}`);

  // TEST 6: Compare-at discount badge calculation
  const discount = calculateDiscountPercent(BASE_PRICE, COMPARE_AT);
  assert(discount === 50, '50% OFF Badge Calculation', `Got ${discount}%`);

  // TEST 7: Separate Cart Line Items Hash uniqueness
  const hash1 = generateCartItemHash('prod-prague-divan-001', {
    Colour: { optionId: 'opt-col-cream', extraPrice: 0 },
    Size: { optionId: 'opt-sz-sm-single', extraPrice: 90 },
  });
  const hash2 = generateCartItemHash('prod-prague-divan-001', {
    Colour: { optionId: 'opt-col-sealgrey', extraPrice: 0 },
    Size: { optionId: 'opt-sz-double', extraPrice: 110 },
  });
  assert(hash1 !== hash2, 'Distinct Configuration Hash Generation', `hash1: ${hash1}, hash2: ${hash2}`);

  // TEST 8: Server-Side Verified Order Engine
  console.log('\n--- TESTING REPOSITORY & SERVER PRICING VERIFICATION ---');
  const verifiedOrder = await repository.createVerifiedOrder({
    buyerId: 'usr-buyer-001',
    buyerEmail: 'buyer@demo.com',
    buyerName: 'Sarah Jenkins',
    shippingAddress: {
      fullName: 'Sarah Jenkins',
      addressLine1: '14 Highfield Gardens',
      city: 'Manchester',
      postcode: 'M14 6TJ',
      phone: '+44 7911 123456',
    },
    items: [
      {
        productId: 'prod-prague-divan-001',
        quantity: 1,
        selectedOptions: {
          Colour: { groupId: 'grp-colour', optionId: 'opt-col-cream' },
          Size: { groupId: 'grp-size', optionId: 'opt-sz-king' }, // +£125
          Storage: { groupId: 'grp-storage', optionId: 'opt-stg-4drw' }, // +£210
          Headboard: { groupId: 'grp-headboard', optionId: 'opt-hb-54floor' }, // +£10
          Base: { groupId: 'grp-base', optionId: 'opt-base-reinf' }, // +£25
          Assembly: { groupId: 'grp-assembly', optionId: 'opt-assembly-pro' }, // +£39.99
        },
      },
    ],
  });

  // Base £269.99 + 125 + 210 + 10 + 25 + 39.99 = 679.98
  assert(
    verifiedOrder.totalAmount === 679.98,
    'Server Verified Order Recalculation (£679.98)',
    `Order total was ${verifiedOrder.totalAmount}`
  );
  assert(verifiedOrder.status === 'new', 'Order Initial Status is "new"');
  assert(verifiedOrder.items.length === 1, 'Order Items Count is 1');
  assert(
    verifiedOrder.items[0].selectedConfiguration['Size'].includes('+£125.00'),
    'Preserved Historical Configuration in Order Item'
  );

  // TEST 9: Order Status Transition
  const updateSuccess = await repository.updateOrderItemStatus(
    verifiedOrder.id,
    verifiedOrder.items[0].id,
    'confirmed'
  );
  assert(updateSuccess === true, 'Order Item Status Transition to "confirmed"');

  console.log(`\n========================================`);
  console.log(`TOTAL TESTS: ${passedTests + failedTests}`);
  console.log(`PASSED: ${passedTests}`);
  console.log(`FAILED: ${failedTests}`);
  console.log(`========================================\n`);

  if (failedTests > 0) {
    process.exit(1);
  }
}

runTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
