import { sql } from 'drizzle-orm';
import { sqliteTable, text, integer , real} from 'drizzle-orm/sqlite-core';

export const items = sqliteTable('items', {
    itemId: integer('item_id').primaryKey({autoIncrement: true}),
    itemName: text('item_name').notNull(),
    itemDescription: text('item_description'),
    itemPrice: real('item_price').notNull() 
});
export const customers = sqliteTable('customers', {
    customerID: integer('customer_id').primaryKey({autoIncrement: true}),
    customerName: text('customer_name').notNull()
});

export const orders = sqliteTable('orders', {
    orderId: integer('orderId').primaryKey({autoIncrement: true}),
    orderTotalPrice: real('order_total_price').notNull(),
    orderTimestamp: text('orderTimestamp').notNull().default(sql`(current_timestamp)`),
    customerId: integer('customer_id').notNull().references(() => customers.customerID)
});

export const orderItem = sqliteTable('order_items', {
    orderItemId: integer('order_item_id').primaryKey({autoIncrement: true}),
    orderId: integer('order_id').notNull().references(() => orders.orderId),
    itemId: integer('item_id').notNull().references(() => items.itemId),
    orderitemQuantity: integer('quantity').notNull().default(1)
});
export const payments = sqliteTable('payments', {
    paymentId: integer('payment_id').primaryKey({autoIncrement: true}),
    orderId: integer('order_id').notNull().references(() => orders.orderId),
    paymentAmount: real('payment_amount').notNull(),
    paymentTimestamp: text('paymentTimestamp').notNull().default(sql`(current_timestamp)`)
});

