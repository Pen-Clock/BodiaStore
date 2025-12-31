'use server'
import { NextResponse } from 'next/server';
import db from './db';
import { items, customers, orders, orderItem, payments } from './schema';
import { eq, desc , and} from 'drizzle-orm';


/**
 * GET all item in the cart, 
 *  - get from order
 *  - get from customer 
 * add/remove item from a cart orderItem without a status 
 * 
 */
export async function  getCartItems(p_orderId: number) {
  const cartItems = await db.select().from(orderItem).where(eq(orderItem.orderId, p_orderId));
  return cartItems;
}

export async function addItemToCart(p_orderId: number, p_itemId: number, p_quantity: number) {
  const [newCartItem] = await db.insert(orderItem).values({
    orderId: p_orderId,
    itemId: p_itemId,
    orderitemQuantity: p_quantity
  }).returning()
  return newCartItem
}

export async function removeItemFromCart(p_orderId: number, p_itemId: number) {
    await db.delete(orderItem).where(and(
          eq(orderItem.orderId, p_orderId),
          eq(orderItem.itemId, p_itemId)
        )
    )
}
