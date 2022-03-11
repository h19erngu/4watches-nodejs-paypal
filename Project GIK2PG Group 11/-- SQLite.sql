-- SQLite
DROP TABLE IF EXISTS user;
CREATE TABLE IF NOT EXISTS user (
        userID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        userName VARCHAR(32) UNIQUE NOT NULL, 
        password VARCHAR(32) NOT NULL,
        role VARHCAR(32) NOT NULL,
        adress VARCHAR(32) NOT NULL,
        firstName VARCHAR(32) NOT NULL,
        lastName VARCHAR(32) NOT NULL        
);
--DROP TABLE IF EXISTS category;
CREATE TABLE IF NOT EXISTS category(
        categoryID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        categoryName VARCHAR(32)
        
);

INSERT INTO category(categoryName)
VALUES(
    'Male'
),
(
    'Female'
),
(
    'Kids'
),
(
    'Deals'
);


INSERT INTO user (username, password, role, adress, firstname, lastname)
VALUES('admin','123','Admin', 'SOMETHING', 'first', 'last'),
(      'notadmin','123','Customer', 'SOMEWHERE', 'firstname', 'lastname');
--DROP TABLE IF EXISTS product;
CREATE TABLE IF NOT EXISTS product(
        productID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        productName VARCHAR(32) NOT NULL,
        productImage VARCHAR(128),
        description VARCHAR(128) NOT NULL,
        price INTEGER NOT NULL,
        categoryID INTEGER,
        FOREIGN KEY(categoryID) REFERENCES category(categoryID)
);

DROP TABLE IF NOT EXISTS review;
CREATE TABLE IF NOT EXISTS review(
        reviewID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        reviewTitle VARCHAR(32),
        reviewComment VARCHAR(128),
        rating INTEGER,
        userID INTEGER,
        productID INTEGER,
        FOREIGN KEY (userID) REFERENCES user (userID),        
        FOREIGN KEY (productID) REFERENCES product (productID)

);
DROP TABLE IF EXISTS cart;
CREATE TABLE IF NOT EXISTS cart(
        cartID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        customerID INTEGER,
        FOREIGN KEY (customerID) REFERENCES user (userID)
);
--DROP TABLE IF EXISTS lineItem;
DROP TABLE IF EXISTS cartItem;
CREATE TABLE IF NOT EXISTS cartItem(
        cartItemID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        quantity INTEGER,
        productID INTEGER,
        cartID INTEGER,
        FOREIGN KEY (productID) REFERENCES product (productID),
        FOREIGN KEY (cartID) REFERENCES cart (cartID)
);
DROP TABLE IF EXISTS orders;
CREATE TABLE IF NOT EXISTS orders(
        orderID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        orderDate DATETIME CURRENT_TIME,
        orderStatus VARCHAR(32),
        customerID INTEGER,
        orderinfoID INTEGER,
        FOREIGN KEY (customerID) REFERENCES user (userID)
        FOREIGN KEY (orderinfoID) REFERENCES orderinfo (orderinfoID)
);

DROP TABLE IF EXISTS orderItem;
CREATE TABLE IF NOT EXISTS orderItem(
        orderItemID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        productID INTEGER,
        orderID INTEGER,
        quantity INTEGER,
        FOREIGN KEY (productID) REFERENCES product (productID),
        FOREIGN KEY (orderID) REFERENCES orders (orderID)
);

DROP TABLE IF EXISTS orderInfo;
CREATE TABLE IF NOT EXISTS orderInfo (
        orderinfoID INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
        email VARCHAR(32) NOT NULL, 
        adress VARCHAR(32) NOT NULL,
        firstName VARCHAR(32) NOT NULL,
        lastName VARCHAR(32) NOT NULL,
        orderID INTEGER,
        FOREIGN KEY (orderID) REFERENCES orders (orderID)     
);

