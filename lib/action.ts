'use server'
import { NextResponse } from 'next/server';
import db from './db';
import { items, customers, orders, orderItems, payments , cart} from './schema';
import { eq, desc , and,inArray } from 'drizzle-orm';

type Iteminput = {
  itemId: number;
  quanity: number;
};

/**
 * CART RELATED ACTIONS
 */
export async function  getCartItems(customerID: number) {
  const cartItems = await db.select().from(cart).where(eq(cart.customerId, customerID));
  return cartItems;
}

export async function addItemToCart(customerId: number, itemId: number, quantity: number) {
  // Fetch the item price from the items table
  const item = await db.select().from(items)
    .where(eq(items.itemId, itemId)).limit(1).get();

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`);
  }
  // Insert the item into the cart table
  const [insertedItem] = await db
    .insert(cart)
    .values({
      customerId: customerId,
      itemId: itemId,
      cartItemPrice: item.itemPrice,
      cartItemQuantity: quantity,
    })
    .returning();   
  return insertedItem; // Returns the newly created cart row
}

export async function addMultipleItemsToCart(customerId: number, itemsToAdd: ItemInput[]) {
  // Extract all item IDs to fetch their prices in ONE query
  const ids = itemsToAdd.map((i) => i.itemId);
  
  // Get the prices for all items in the list
  const productDetails = await db
    .select()
    .from(items)
    .where(inArray(items.itemId, ids));

  // Create a "Map" so we can easily find the price by ID
  const priceMap = new Map(productDetails.map(p => [p.itemId, p.itemPrice]));

  // Prepare the data for the cart table
  const cartValues = itemsToAdd.map((item) => {
    const price = priceMap.get(item.itemId);
    
    if (price === undefined) {
      throw new Error(`Item with ID ${item.itemId} not found`);
    }

    return {
      customerId: customerId,
      itemId: item.itemId,
      cartItemPrice: price,
      cartItemQuantity: item.quantity,
    };
  });

  // Perform the bulk insert
  const insertedItems = await db
    .insert(cart)
    .values(cartValues)
    .returning();

  return insertedItems; // Returns an array of newly created cart rows
}

export async function removeItemFromCart(customerId: number, itemId: number) {
  await db.delete(cart).where(and(
        eq(cart.customerId, customerId),
        eq(cart.itemId, itemId)
      )
  )
} 


// update one cart item quantity
export async function updateCartItemQuanity(customerId: number, itemId:number, newQuantity:number){
    if (newQuantity <= 0){
        await db.delete(cart).where(and(
          eq(cart.customerId, customerId),
          eq(cart.itemId, itemId)
        ));
    } else {
    // 2. Simple update
    await db.update(cart)
      .set({ cartItemQuantity: newQuantity })
      .where(and(
          eq(cart.customerId, customerId),
          eq(cart.itemId, itemId)));
  }
}

export async function updateMultipleCartItems(
  customerId: number, 
  updates: { itemId: number; quantity: number }[]
) {
  // Perform all updates inside a single database transaction
  await db.transaction(async (tx) => {
    for (const item of updates) {
      if (item.quantity <= 0) {
        // Delete if quantity is 0
        await tx.delete(cart)
          .where(
            and(
              eq(cart.customerId, customerId),
              eq(cart.itemId, item.itemId)
            )
          );
      } else {
        // Update quantity
        await tx.update(cart)
          .set({ cartItemQuantity: item.quantity })
          .where(
            and(
              eq(cart.customerId, customerId),
              eq(cart.itemId, item.itemId)
            )
          );
      }
    }
  });

}


/** 
 * ITEM RELATED ACTIONS
*/
export async function getAllItems() {
  const allItems = await db.select().from(items).orderBy(desc(items.itemId));
  return allItems;
}

export async function getItemById(itemId: number) {
  const item = await db.select().from(items).where(eq(items.itemId, itemId)).limit(1).get();
  return item;
}

export async function createNewItem(itemName: string, itemDescription: string, itemPrice: number) {
  const [newItem] = await db.insert(items).values({
    itemName:itemName,
    itemDescription: itemDescription,
    itemPrice: itemPrice
  }).returning();
  return newItem;
}

export async function deleteItem(itemId: number) {
  await db.delete(items).where(eq(items.itemId, itemId));
}

export async function updateItemPrice(itemId: number, newPrice: number) {
  await db.update(items).set({
    itemPrice : newPrice
  })
  .where(eq(items.itemId, itemId));
}

export async function updateItemDescription(itemId: number, newDescription: string) {
  await db.update(items).set({
    itemDescription : newDescription
  })
  .where(eq(items.itemId, itemId));
}

export async function updateItemName(itemId: number, newName: string) {
  await db.update(items).set({
    itemName : newName
  })
  .where(eq(items.itemId, itemId));
}

export async function updateItem(itemId: number, itemName: string, itemDescription: string, itemPrice: number) {
  await db.update(items).set({
    itemName: itemName,
    itemDescription: itemDescription,
    itemPrice: itemPrice
  }).where(eq(items.itemId, itemId));
}

/**
 * CUSTOMER RELATED ACTIONS
 */

export async function createNewCustomer(customerName: string) {
  const [newCustomer] = await db.insert(customers).values({
    customerName: customerName
  }).returning();
  return newCustomer;
}

export async function getCustomerById(customerId: number) {
  const customer = await db.select().from(customers).where(eq(customers.customerId, customerId)).limit(1).get();
  return customer;
}

export async function getAllCustomers() {
  const allCustomers = await db.select().from(customers).orderBy(desc(customers.customerId));
  return allCustomers;
}

export async function deleteCustomer(customerId: number) {
  await db.delete(customers).where(eq(customers.customerId, customerId));
}

export async function updateCustomerName(customerId: number, newName: string) {
  await db.update(customers).set({
    customerName : newName
  })
  .where(eq(customers.customerId, customerId));
}

/**
 * CHECK OUT RELATED FUNCTIONS
 */

