CREATE TABLE `cart` (
	`customer_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`cart_item_price` real NOT NULL,
	`cart_item_quantity` integer NOT NULL,
	PRIMARY KEY(`customer_id`, `item_id`),
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `customers` (
	`customer_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`customer_name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `items` (
	`item_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`item_name` text NOT NULL,
	`item_description` text,
	`item_image_url` text,
	`item_price` real NOT NULL
);
--> statement-breakpoint
CREATE TABLE `order_items` (
	`order_item_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`item_id` integer NOT NULL,
	`order_item_quantity` integer DEFAULT 1 NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `orders` (
	`order_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_total_price` real NOT NULL,
	`order_timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	`customer_id` integer NOT NULL,
	FOREIGN KEY (`customer_id`) REFERENCES `customers`(`customer_id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`payment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`order_id` integer NOT NULL,
	`payment_amount` real NOT NULL,
	`payment_timestamp` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`order_id`) REFERENCES `orders`(`order_id`) ON UPDATE no action ON DELETE no action
);
