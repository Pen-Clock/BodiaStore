import { NextResponse } from 'next/server';
import db from '../../lib/db';
import { items, customers, orders, orderItem, payments } from '../../lib/schema';
import { eq, desc } from 'drizzle-orm';






export async function GET()  {
  const rows = await db.select().from(todos).orderBy(desc(todos.id));
  return NextResponse.json(rows);
}

export async function POST(req: Request) {
  const { title } = await req.json();
  const [row] = await db.insert(todos).values({ title }).returning();
  return NextResponse.json(row);
}

export async function PUT(req: Request) {
  const { id, done } = await req.json();
  const [row] = await db.update(todos).set({ done }).where(eq(todos.id, id)).returning();
  return NextResponse.json(row);
}

export async function DELETE(req: Request) {
  const { id } = await req.json();
  await db.delete(todos).where(eq(todos.id, id));
  return NextResponse.json({ ok: true });
}




'use server' // Tells Next.js this runs only on the server

export async function checkoutProcedure(userId: string) {
  // 1. Get the items in the user's cart
  const userCart = await db.select().from(orderItem).where(eq(orderITem.userId, userId));
  
  if (userCart.length === 0) throw new Error("Cart is empty");

  // 2. Start a Transaction (This makes it a "Procedure")
  return await db.transaction(async (tx) => {
    // 3. Calculate total
    let total = 0;
    
    // 4. Create the main Order record
    const [newOrder] = await tx.insert(orders).values({
      userId: userId,
      total: 0, // Placeholder
      status: 'paid'
    }).returning();

    // 5. Move items from Cart to OrderItems
    for (const cartEntry of userCart) {
      // Get current price from items table
      const [product] = await tx.select().from(items).where(eq(items.itemId, cartEntry.productId));
      
      await tx.insert(orderItems).values({
        orderId: newOrder.id,
        productId: cartEntry.productId,
        quantity: cartEntry.quantity,
        priceAtPurchase: product.itemPrice
      });

      total += product.itemPrice * (cartEntry.quantity || 1);
    }

    // 6. Update the Order with the final total
    await tx.update(orders).set({ total }).where(eq(orders.id, newOrder.id));

    // 7. Clear the cart
    await tx.delete(cartItems).where(eq(cartItems.userId, userId));

    return { success: true, orderId: newOrder.id };
  });
}
