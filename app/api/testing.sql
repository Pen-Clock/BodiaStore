

-- get customer information 
SELECT * FROM customers WHERE customerId = p_customerId;

-- get all the products item for display
SELECT * FROM items;

-- get all the payment records 
SELECT * FROM payments;

-- get payment records for a specific order
SELECT * FROM payments WHERE orderId = p_orderId;

-- get specific customer order history
SELECT * FROM orders WHERE customerId = p_customerId;
-- get specific customer payment history
SELECT * FROM payments WHERE customerId = p_customerId;



--- HANDLING CART OPERATIONS: 
-- get all current item in the cart
SELECT * FROM orderItem WHERE orderId = p_orderId;

-- update cart 
CREATE PROCEDURE updateCartItemQuantity(
    IN p_orderItemId INT,
    IN p_newQuantity INT
)
BEGIN
    UPDATE orderItem
    SET quantity = p_newQuantity
    WHERE orderItemId = p_orderItemId;
END;

-- insert new item into cart 
CREATE PROCEDURE addItemToCart(
    IN p_orderId INT,
    IN p_itemId INT,
    IN p_quantity INT
)  
BEGIN
    INSERT INTO orderItem (orderId, itemId, quantity)
    VALUES (p_orderId, p_itemId, p_quantity);
END;

-- delete item from cart
CREATE PROCEDURE removeItemFromCart(
    IN p_orderItemId INT
) 
BEGIN
    DELETE FROM orderItem
    WHERE orderItemId = p_orderItemId;
END;




-- UPDATING ORDER

-- get total amount in order price
CREATE FUNCTION calculateTotalOrderAmount(
    p_orderId INT
) RETURN DECIMAL(10,2) DETERMINISTIC
BEGIN
    DECLARE totalAmount DECIMAL(10,2);

    SELECT SUM(i.price * oi.quantity) INTO totalAmount
    FROM orderItem oi
    JOIN items i ON oi.itemId = i.itemId
    WHERE oi.orderId = p_orderId;

    RETURN totalAmount;
END;

-- Trigger updating order price 
CREATE TRIGGER afterOrderItemInsert(
    AFTER INSERT ON orderItem
    FOR EACH ROW
    BEGIN
        DECLARE newTotal DECIMAL(10,2);
        SET newTotal = calculateTotalOrderAmount(NEW.orderId);
         UPDATE orders
        SET totalAmount = newTotal
        WHERE orderId = NEW.orderId;
    END;
)

CREATE TRIGGER afterOrderItemChange(
    AFTER UPDATE ON orderItem
    FOR EACH ROW
    BEGIN
        DECLARE newTotal DECIMAL(10,2);
        SET newTotal = calculateTotalOrderAmount(NEW.orderId);
        UPDATE orders
        SET totalAmount = newTotal
        WHERE orderId = NEW.orderId;
    END;
)