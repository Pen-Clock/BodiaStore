"use server"

import db from "./db"
import { items, customers, orders, orderItems, payments, cart } from "./schema"
import { eq, desc, and, inArray, sql } from "drizzle-orm"
import { revalidatePath } from "next/cache"
type Iteminput = {
  itemId: number
  quantity: number
}

/**
 * CART RELATED ACTIONS
 */
export async function getCartItems(customerID: number) {
  const cartItems = await db
    .select()
    .from(cart)
    .where(eq(cart.customerId, customerID))

  return cartItems
}

export async function addItemToCart(
  customerId: number,
  itemId: number,
  quantity: number
) {
  // Fetch the item price from the items table
  await ensureCustomerExists(customerId)

  const found = await db
    .select()
    .from(items)
    .where(eq(items.itemId, itemId))
    .limit(1)

  const item = found[0]

  if (!item) {
    throw new Error(`Item with ID ${itemId} not found`)
  }

  // Insert the item into the cart table
  const inserted = await db
    .insert(cart)
    .values({
      customerId: customerId,
      itemId: itemId,
      cartItemPrice: item.itemPrice,
      cartItemQuantity: quantity,
    })
    .onConflictDoUpdate({
      // Which columns to check for a "clash"
      target: [cart.customerId, cart.itemId],
      // What to do if they clash: Add the new quantity to the existing one
      set: {
        cartItemQuantity: sql`${cart.cartItemQuantity} + ${quantity}`,
      },
    })
    .returning()
  revalidatePath("/")      // Revalidate home page (header cart count)
  revalidatePath("/cart")  // Revalidate cart page

  return inserted[0] // Returns the newly created cart row
}

export async function addMultipleItemsToCart(
  customerId: number,
  itemsToAdd: Iteminput[]
) {
  await ensureCustomerExists(customerId)

  // Extract all item IDs to fetch their prices in ONE query
  const ids = itemsToAdd.map((i) => i.itemId)

  // Get the prices for all items in the list
  const productDetails = await db
    .select()
    .from(items)
    .where(inArray(items.itemId, ids))

  // Create a "Map" so we can easily find the price by ID
  const priceMap = new Map(productDetails.map((p) => [p.itemId, p.itemPrice]))

  // Prepare the data for the cart table
  const cartValues = itemsToAdd.map((item) => {
    const price = priceMap.get(item.itemId)

    if (price === undefined) {
      throw new Error(`Item with ID ${item.itemId} not found`)
    }

    return {
      customerId: customerId,
      itemId: item.itemId,
      cartItemPrice: price,
      cartItemQuantity: item.quantity,
    }
  })

  // Perform the bulk insert
  const insertedItems = await db.insert(cart).values(cartValues).returning()

  return insertedItems // Returns an array of newly created cart rows
}

export async function removeItemFromCart(customerId: number, itemId: number) {
  await db
    .delete(cart)
    .where(and(eq(cart.customerId, customerId), eq(cart.itemId, itemId)))
    revalidatePath("/")
    revalidatePath("/cart")
}

// update one cart item quantity
export async function updateCartItemQuanity(
  customerId: number,
  itemId: number,
  newQuantity: number
) {
  if (newQuantity <= 0) {
    await db
      .delete(cart)
      .where(and(eq(cart.customerId, customerId), eq(cart.itemId, itemId)))
  } else {
    // 2. Simple update
    await db
      .update(cart)
      .set({ cartItemQuantity: newQuantity })
      .where(and(eq(cart.customerId, customerId), eq(cart.itemId, itemId)))
  }
  revalidatePath("/")
  revalidatePath("/cart")
}

export async function updateMultipleCartItems(
  customerId: number,
  updates: { itemId: number; quantity: number }[]
) {
  // 1. The outer function remains 'async' for Next.js
  // 2. The inner callback MUST NOT be 'async'
  //
  // NOTE: When using Turso/libSQL (async driver), the transaction callback
  // *should* be async and awaited. The intent of the original comment still
  // applies: keep all the operations inside one transaction.
  await db.transaction(async (tx) => {
    for (const item of updates) {
      if (item.quantity <= 0) {
        // Delete if quantity is 0 (.run() executes it synchronously)
        //
        // NOTE: With Turso/libSQL, we await the query instead of using .run().
        await tx
          .delete(cart)
          .where(
            and(eq(cart.customerId, customerId), eq(cart.itemId, item.itemId))
          )
      } else {
        // Update quantity (.run() executes it synchronously)
        //
        // NOTE: With Turso/libSQL, we await the query instead of using .run().
        await tx
          .update(cart)
          .set({ cartItemQuantity: item.quantity })
          .where(
            and(eq(cart.customerId, customerId), eq(cart.itemId, item.itemId))
          )
      }
    }
  })
}

export async function clearCustomerCart(customerId: number) {
  await db.delete(cart).where(eq(cart.customerId, customerId))
  revalidatePath("/")
  revalidatePath("/cart")
}

export async function getCartWithDetails(customerId: number) {
  const rows = await db
    .select({
      itemId: items.itemId,
      name: items.itemName,
      image: items.itemImagePath,
      unitPrice: cart.cartItemPrice,
      quantity: cart.cartItemQuantity,
    })
    .from(cart)
    .innerJoin(items, eq(cart.itemId, items.itemId))
    .where(eq(cart.customerId, customerId))
    .orderBy(desc(items.itemId))

  return rows
}

/**
 * ITEM RELATED ACTIONS
 */
export async function getAllItems() {
  const allItems = await db.select().from(items).orderBy(desc(items.itemId))
  return allItems
}

export async function getItemById(itemId: number) {
  const found = await db
    .select()
    .from(items)
    .where(eq(items.itemId, itemId))
    .limit(1)

  return found[0] ?? null
}

export async function createNewItem(
  itemName: string,
  itemDescription: string,
  itemImagePath: string | null,
  itemPrice: number
) {
  const inserted = await db
    .insert(items)
    .values({
      itemName: itemName,
      itemDescription: itemDescription,
      itemImagePath: itemImagePath,
      itemPrice: itemPrice,
    })
    .returning()

  return inserted[0]
}

export async function deleteItem(itemId: number) {
  await db.delete(items).where(eq(items.itemId, itemId))
}

export async function updateItemPrice(itemId: number, newPrice: number) {
  await db
    .update(items)
    .set({
      itemPrice: newPrice,
    })
    .where(eq(items.itemId, itemId))
}

export async function updateItemName(itemId: number, newName: string) {
  await db
    .update(items)
    .set({
      itemName: newName,
    })
    .where(eq(items.itemId, itemId))
}

export async function updateItemDescription(
  itemId: number,
  newDescription: string
) {
  await db
    .update(items)
    .set({
      itemDescription: newDescription,
    })
    .where(eq(items.itemId, itemId))
}

export async function updateItemImageUrl(itemId: number, newImagePath: string) {
  await db
    .update(items)
    .set({
      itemImagePath: newImagePath,
    })
    .where(eq(items.itemId, itemId))
}

export async function updateItem(
  itemId: number,
  itemName: string,
  itemImagePath: string | null,
  itemDescription: string,
  itemPrice: number
) {
  await db
    .update(items)
    .set({
      itemName: itemName,
      itemDescription: itemDescription,
      itemImagePath: itemImagePath,
      itemPrice: itemPrice,
    })
    .where(eq(items.itemId, itemId))
}

/**
 * CUSTOMER RELATED ACTIONS
 */

export async function createNewCustomer(customerName: string) {
  const inserted = await db
    .insert(customers)
    .values({
      customerName: customerName,
    })
    .returning()

  return inserted[0]
}

export async function getCustomerById(customerId: number) {
  const found = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, customerId))
    .limit(1)

  return found[0] ?? null
}

export async function getAllCustomers() {
  const allCustomers = await db
    .select()
    .from(customers)
    .orderBy(desc(customers.customerId))

  return allCustomers
}

export async function deleteCustomer(customerId: number) {
  await db.delete(customers).where(eq(customers.customerId, customerId))
}

export async function updateCustomerName(customerId: number, newName: string) {
  await db
    .update(customers)
    .set({
      customerName: newName,
    })
    .where(eq(customers.customerId, customerId))
}

/**
 * CHECK OUT RELATED FUNCTIONS
 */
// when customer checkout it would created and order and order items as a form of
// reciepts
// customer can check out specific items in their cart
export async function checkoutCustomerCart(customerId: number, itemIds: number[]) {
  // 1. Wrap everything in a transaction
  await ensureCustomerExists(customerId)

  const result = await db.transaction(async (tx) => {
    // 2. Get the specific cart items
    const cartItems = await tx
      .select()
      .from(cart)
      .where(and(eq(cart.customerId, customerId), inArray(cart.itemId, itemIds)))

    if (cartItems.length === 0) {
      throw new Error("No items in cart to checkout")
    }

    // 3. Calculate total price
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + item.cartItemPrice * item.cartItemQuantity
    }, 0)

    // 4. Create the Order
    const insertedOrders = await tx
      .insert(orders)
      .values({
        orderTotalPrice: totalPrice,
        customerId: customerId,
      })
      .returning()

    const newOrder = insertedOrders[0]
    if (!newOrder) {
      throw new Error("Failed to create order")
    }

    const orderItemsValues = cartItems.map((cartItem) => ({
      orderId: newOrder.orderId,
      itemId: cartItem.itemId,
      orderItemQuantity: cartItem.cartItemQuantity,
    }))

    // Use .run() for operations where you don't need to return data
    //
    // NOTE: With Turso/libSQL, we await the query instead of using .run().
    await tx.insert(orderItems).values(orderItemsValues)

    await tx.insert(payments).values({
      orderId: newOrder.orderId,
      paymentAmount: totalPrice,
    })

    await tx
      .delete(cart)
      .where(
        and(eq(cart.customerId, customerId), inArray(cart.itemId, itemIds))
      )

    // 4. Return the object directly (it is not a promise)
    //
    // NOTE: With Turso/libSQL, the outer transaction callback is async, but the
    // return value is still the result of the transaction.
    return {
      success: true,
      orderId: newOrder.orderId,
      amountPaid: totalPrice,
    }
  })

  return result
}

export async function ensureCustomerExists(customerId: number) {
  // Use INSERT OR IGNORE which works reliably in SQLite/Turso
  await db.run(
    sql`INSERT OR IGNORE INTO customers (customer_id, customer_name) VALUES (${customerId}, 'Demo Customer')`
  )

  const found = await db
    .select()
    .from(customers)
    .where(eq(customers.customerId, customerId))
    .limit(1)

  const existing = found[0]
  if (!existing) {
    throw new Error("Failed to ensure customer exists")
  }

  return existing
}