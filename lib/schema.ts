import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

// 1. ITEMS
export const items = sqliteTable('items', {
  itemId: integer('item_id').primaryKey({ autoIncrement: true }),
  itemName: text('item_name').notNull(),
  itemDescription: text('item_description'),
  itemPrice: real('item_price').notNull()
});

// 2. CUSTOMERS
export const customers = sqliteTable('customers', {
  customerId: integer('customer_id').primaryKey({ autoIncrement: true }),
  customerName: text('customer_name').notNull()
});

// 3. ORDERS
export const orders = sqliteTable('orders', {
  orderId: integer('order_id').primaryKey({ autoIncrement: true }),
  orderTotalPrice: real('order_total_price').notNull(),
  orderTimestamp: text('order_timestamp').notNull().default(sql`(CURRENT_TIMESTAMP)`),
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.customerId)
});

// 4. ORDER ITEMS (Associative Entity for Orders)
export const orderItems = sqliteTable('order_items', {
  orderItemId: integer('order_item_id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.orderId),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.itemId),
  orderItemQuantity: integer('order_item_quantity').notNull().default(1)
});

// 5. PAYMENTS
export const payments = sqliteTable('payments', {
  paymentId: integer('payment_id').primaryKey({ autoIncrement: true }),
  orderId: integer('order_id')
    .notNull()
    .references(() => orders.orderId),
  paymentAmount: real('payment_amount').notNull(),
  paymentTimestamp: text('payment_timestamp').notNull().default(sql`(CURRENT_TIMESTAMP)`)
});

// 6. CART 
export const cart = sqliteTable('cart', {
  customerId: integer('customer_id')
    .notNull()
    .references(() => customers.customerId, { onDelete: 'cascade' }),
  itemId: integer('item_id')
    .notNull()
    .references(() => items.itemId, { onDelete: 'cascade' }),
  cartItemPrice: real('cart_item_price').notNull(),
  cartItemQuantity: integer('cart_item_quantity').notNull()
}, (table) => [
  primaryKey({ columns: [table.customerId, table.itemId] })
]);


