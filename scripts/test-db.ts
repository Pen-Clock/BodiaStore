// scripts/test-db.ts
import { create } from 'domain';
import { addItemToCart, checkoutCustomerCart, createNewCustomer ,updateCartItemQuanity,updateMultipleCartItems,getCartItems,
  clearCustomerCart
} from '../lib/actions';
import { check } from 'drizzle-orm/gel-core';
import { get } from 'http';

async function runTest() {
  await clearCustomerCart(1);
  console.log("🚀 Starting Test...");
  // 1. Test adding items
  console.log("Adding items to cart...");
  await addItemToCart(1, 1, 2); // Customer 1, Item 1, Qty 2
  await addItemToCart(1, 2, 1); // Customer 1, Item 2, Qty 1
  
  console.log(await getCartItems(1));
  
  // insert already existing item

  console.log("INSERTING EXISITING ITEM...");
  await addItemToCart(1, 2, 1); // Customer 1, Item 1, Qty 1 more

  console.log(await getCartItems(1));
  // updating amount 

  console.log("UPDATE EXISITING ITEM...");
  await updateMultipleCartItems(1, [
    { itemId: 1, quantity: 3 }, // Update Item 1 to Qty 3
    { itemId: 2, quantity: 0 }  // Remove Item 2
  ]);

  console.log(await getCartItems(1));

  console.log("✅ Items added. Check Drizzle Studio 'cart' table now.");
  // 2. Test Checkout
  console.log("Running Checkout...");
  const result = await checkoutCustomerCart(1, [1]);
  try{
    await checkoutCustomerCart(1, [2]);
  }
  catch(e :any){
    console.log("✅ Caught expected error for empty cart checkout:", e.message);
  }
  
  console.log("✅ Checkout Complete!", result);
  console.log("👉 Now refresh Drizzle Studio and check 'orders', 'order_items', and 'payments'.");
}

runTest().catch(console.error);