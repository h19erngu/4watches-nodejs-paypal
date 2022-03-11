
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');
const saltRounds = 11;

const dbPromise = (async() => {
    return open({
        filename: './SQLite.db',
        driver: sqlite3.Database
    });
})();

//Generate a hashed password
const genPass = async(password) => {
    const salt = await bcrypt.genSalt(saltRounds);
    const hash = await bcrypt.hash(password, salt);
    return hash;
};

//Compare hashed password
const compPass = async(password, hash) => {
    const match = await bcrypt.compare(password, hash);
    return match;
};

//Get hashed password
const getHash = async(data) => {
    try {
        const db = await dbPromise;
        const user = await db.get("SELECT password FROM user WHERE username = (?)", [data]);
        return user;


    } catch (error) {
        console.log(error);
        throw error;
    }
};

const getUserByUsername = async(data) => {
    try {
        const db = await dbPromise;
        const user = await db.get("SELECT username, userID, firstName, lastName, adress, role FROM user WHERE username = (?)", [data]);
        return user;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

//GET ALL CATEGORIES
const getAllCategories = async() => {
    try {
        db = await dbPromise;
        const categories = db.all('SELECT * from category')
        return categories;
    } catch (error) {
        console.log(error)
    }
}

//Get all users
const getUsers = async() => {
    try {
        db = await dbPromise;
        const users = await db.all('SELECT * from user');
        return users;
    } catch (error) {
        console.log(error);
        throw new Error("Error handling...");
    }
}

//GET ALL USERS WITH ROLE CUSTOMER
const getUsersWithRoleCustomer = async() => {
    try {
        db = await dbPromise;
        const users = await db.all('SELECT * from user WHERE role = "Customer"');
        return users;
    } catch (error) {
        console.log(error);
    }
}

//Get one user by id
const getUserByID = async(data) => {
    try {
        db = await dbPromise;
        const user = await db.get("SELECT userID, userName, lastName, firstName, adress, role FROM user WHERE userID = ?", [data]);
        return user;
    } catch (error) {
        console.log(error);
        throw new Error("Error handling...")
    }
}

//Add a new user
const addUser = async(data) => {
    try {
        db = await dbPromise;
        const results = await db.run("INSERT INTO user (username, firstName, lastName, password, adress, role) values(?, ?, ?, ?, ?, ?)", [data.userName, data.firstName, data.lastName, data.password, data.adress, data.role])
        return { status: "ok" };
    } catch (error) {
        console.log(error);
        throw new Error("Error handling...")
    }
}


//Delete a user by ID
const deleteUserByID = async(data) => {
    try {
        db = await dbPromise;
        const result = await db.run('DELETE FROM user WHERE userID = ?', [data])
        return { status: "ok" };
    } catch (error) {
        throw new Error("Error handling...")

    }
}

//Update a user by ID
const updateUserByID = async(userId, data) => {
    try {
        db = await dbPromise;
        const result = await db.run(`UPDATE user SET userName = ?, firstName = ?, lastName = ?, password = ?, role = ?, adress = ? WHERE userID = ? `, [data.userName, data.firstName, data.lastName, data.password, data.role, data.adress, userId]);
        return { status: "ok" };
    } catch (error) {
        console.log(error)
        throw new Error("Error handling...");
    }
};

const customerUpdateUserByID = async(userId, data) => {
    try {
        db = await dbPromise;
        const result = await db.run(`UPDATE user SET userName = ?, firstName = ?, lastName = ?, password = ?, adress = ? WHERE userID = ? `, [data.userName, data.firstName, data.lastName, data.password, data.adress, userId]);
        return { status: "ok" };
    } catch (error) {
        console.log(error)
        throw new Error("Error handling...");
    }
};

//Update a user without password
const updateUserByIDWithoutPassword = async(userId, data) => {
    try {
        db = await dbPromise;
        const result = await db.run(`UPDATE user SET userName = ?, firstName = ?, lastName = ?, adress = ? WHERE userID = ? `, [data.userName, data.firstName, data.lastName, data.adress, userId]);
        return { status: "ok" };
    } catch (error) {
        console.log(error)
        throw new Error("Error handling...");
    }
}


//Get all products
const getProducts = async() => {
        try {
            db = await dbPromise;
            const products = await db.all('SELECT category.categoryName as categoryName, product.productName, product.price, product.productImage, product.productID, product.description, product.categoryID from product INNER JOIN category ON category.categoryID = product.categoryID');
            return products;
        } catch (error) {
            console.log(error);
            throw new Error("Error handling...");
        }
    }
    //Get product by ID
const getProductByID = async(data) => {
    try {
        const db = await dbPromise;
        const results = await db.get('SELECT * from product WHERE productID = ?', [data])
        return results;
    } catch (error) {
        console.log(error)
    }
}



//get product by category
const getProductByCategory = async(data) => {
    try {
        const db = await dbPromise;
        const products = await db.all('SELECT * FROM product WHERE categoryID = ?', [data]);
        return products;
    } catch (error) {
        console.log(error);
    }
};

//get Male products only
const getProductByCategoryMale = async() => {
    try {
        const db = await dbPromise;
        const products = await db.all('SELECT * FROM product WHERE categoryID = 1');
        return products;
    } catch (error) {
        console.log(error);
    }
};
//get Female products only
const getProductByCategoryFemale = async() => {
    try {
        const db = await dbPromise;
        const products = await db.all('SELECT * FROM product WHERE categoryID = 2');
        return products;
    } catch (error) {
        console.log(error);
    }
};
//get Kids products only
const getProductByCategoryKids = async() => {
    try {
        const db = await dbPromise;
        const products = await db.all('SELECT * FROM product WHERE categoryID = 3');
        return products;
    } catch (error) {
        console.log(error);
    }
};

const getProductByCategoryDeals = async() => {
    try {
        const db = await dbPromise;
        const products = await db.all('SELECT * FROM product WHERE categoryID = 4');
        return products;
    } catch (error) {
        console.log(error);
    }
};
const getProductByCategoryNoDeals = async() => {
    try {
        db = await dbPromise;
        const products = await db.all('SELECT * from product WHERE categoryID != 4');
        return products;
    } catch (error) {
        console.log(error);
        throw new Error("Error handling...");
    }
}

//FIND PRODUCT BY NAME
const findProductByName = async(data) => {
    try {
        const dbCon = await dbPromise;
        const products = await dbCon.all('SELECT * FROM product WHERE productName = ? ', [data]);
        return products;
    } catch (error) {
        console.log(error);
    }
};

//add product
const addProduct = async(data, filename) => {
        try {
            const db = await dbPromise;
            const result = await db.run('INSERT INTO product (productName, description, price, categoryID, productImage) values(?, ?, ?, ?, ?)', [data.productName, data.description, data.price, data.categoryID, filename])
            return { status: "ok" }
        } catch (error) {
            console.log(error)
        }
    }
    //delete product by id
const deleteProductByID = async(productID) => {
    try {
        const dbCon = await dbPromise;
        const dProductID = await dbCon.run(`DELETE FROM product WHERE productID = ?`, [productID]);
        return { status: "ok" };
    } catch (error) {
        throw new Error(error);
    }
};
//update product by id
const updateProductByID = async(id, image, data) => {
    try {
        const dbCon = await dbPromise;
        const uProductID = await dbCon.run(`UPDATE product SET productName = ?, description = ?, price = ?, categoryID = ?, productImage = ? WHERE productID = ? `, [data.productName, data.description, data.price, data.categoryID, image, id]);
        return uProductID;
    } catch (error) {
        return false
        console.log(error)
    }
};


//GET ALL REVIEWS
const getAllReviews = async() => {
    try {
        const db = await dbPromise;
        const reviews = db.all('SELECT * from review');
        return reviews;
    } catch (error) {
        console.log(error)
    }
};

//GET ALL REVIEWS FOR A PRODUCT
const getReviewsByProductID = async(data) => {
    try {
        const db = await dbPromise;
        const reviews = db.all('SELECT * FROM review WHERE productID = ?', [data])
        return reviews;
    } catch (error) {
        console.log(error)
    }
}

//GET REVIEW BY ID
const getReviewByID = async(data) => {
    try {
        const db = await dbPromise;
        const review = db.get('SELECT * from review WHERE reviewID = ?', [data]);
        return review;
    } catch (error) {
        console.log(error)
    }
};

//GET REVIEW BY USER ID
const getReviewByUserID = async(data) => {
    try {
        const db = await dbPromise;
        const reviews = db.all('SELECT * from review WHERE userID = ?', [data]);
        return reviews;
    } catch (error) {
        console.log(error)
    }
};

//ADD REVIEW
const addReview = async(data) => {
        try {
            const db = await dbPromise;
            const review = db.run('INSERT INTO review (reviewTitle, reviewComment, rating, userID, productID) values(?, ?, ?, ?, ?)', [data.reviewTitle, data.reviewComment, data.rating, data.userID, data.productID]);
            return { status: "ok" }
        } catch (error) {
            console.log(error)
        }
    }
    // DELETE REVIEW
const deleteReviewByID = async(id) => {
    try {
        const db = await dbPromise;
        const remove = await db.get("DELETE FROM review WHERE reviewID = (?)", [id]);
        return {
            status: 'ok'
        };
    } catch (error) {
        console.log(error);
        throw error;
    }
};

//UPDATE REVIEW
const updateReviewByID = async(id, data) => {
    try {
        const db = await dbPromise;
        const update = await db.run("UPDATE review SET reviewTitle = ?, reviewComment = ?, rating = ? WHERE reviewID = ?", [data.reviewTitle, data.reviewComment, data.rating, id]);
        return update;
    } catch (error) {
        console.log(error);
        throw error;
    }
};

//Cart

//GET CART BY CARTID
const getCartByCartID = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.all('SELECT * from cart WHERE cartID = ?', [data])
        return cart;
    } catch (error) {
        console.log(error)
    }
}

//GET CART BY USERID
const getCartByUserID = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.all('SELECT * from cart WHERE customerID = ?', [data])
        return cart;
    } catch (error) {
        console.log(error)
    }
}

//ADD A NEW CART THAT BELONGS TO A CUSTOMER
const addCart = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.run('INSERT INTO cart (customerID) values(?)', [data.customerID])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//DELETE A CART BY CARTID
const deleteCartByCartID = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.run('DELETE from cart WHERE cartID = ?', [data])
        return { status: "ok" }
    } catch (error) {
        console.log(error);
    }
}

//DELETE A CART BY CUSTOMERID
const deleteCartByCustomerID = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.run('DELETE from cart WHERE customerID = ?', [data])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//CARTITEM
//ADD cartItem
const addcartItem = async(data) => {
    try {
        db = await dbPromise;
        const cartItem = await db.run('INSERT into cartItem (quantity, productID, cartID) values(?, ?, ?)', [data.quantity, data.productID, data.cartID])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//UPDATE cartItem
const updatecartItem = async(data, id) => {
    try {
        db = await dbPromise;
        const cartItem = await db.run('UPDATE cartItem SET quantity = ? WHERE cartItemID = ?', [data.quantity, id])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//GET ALL cartItem ROWS FOR A CART. MEANING ALL THE PRODUCTS INSIDE OF A CART
const getcartItemsByCartID = async(data) => {
    try {
        db = await dbPromise;
        const cart = await db.all('SELECT * from cartItem WHERE cartID = ?', [data])
        return cart;
    } catch (error) {
        console.log(error)
    }
}

//DELETE A cartItem
const deletecartItem = async(data) => {
    try {
        db = await dbPromise;
        const cartItem = await db.run('DELETE FROM cartItem WHERE cartItemID = ?', [data])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//ORDERS
//GET ALL ORDERS
const getAllOrders = async(data) => {
    try {
        db = await dbPromise;
        const orders = await db.all('SELECT * from orders')
        return orders;
    } catch (error) {
        console.log(error)
    }
}

//GET ORDER BY ID
const getOrderByID = async(data) => {
    try {
        db = await dbPromise;
        const order = await db.get('SELECT * from orders WHERE orderID = ?', [data])
        return order;
    } catch (error) {
        console.log(error)
    }
}

//GET ALL ORDERS BY USERID
const getAllOrdersByUserID = async(data) => {
    try {
        db = await dbPromise;
        const orders = await db.all('SELECT * from orders WHERE customerID = ?', [data])
        return orders;
    } catch (error) {
        console.log(error)
    }
}

const getAllOrderDetails = async(data, id) => {
    try {
        db = await dbPromise;
        const orders = await db.all('SELECT orders.orderID as orderID, product.productName as productName, product.productImage as productImage, product.price as price, orderItem.productID as productID, orderItem.quantity as quantity FROM orders LEFT JOIN orderItem ON orders.orderID = orderItem.orderID LEFT JOIN product ON orderItem.productID = product.productID WHERE orders.orderID = ?', [data])
        return orders;
    } catch (error) {
        console.log(error)
    }
}

//Get all information for the reviews by productID
const getAllReviewInformationByProductID = async(data, id) => {
    try {
        db = await dbPromise;
        const orders = await db.all('SELECT review.reviewID, review.reviewComment, review.reviewTitle, review.rating, user.userName FROM review LEFT JOIN user ON review.userID = user.userID WHERE review.productID = ?', [data])
        return orders;
    } catch (error) {
        console.log(error)
    }
}


//ADD A NEW ORDER
const addOrder = async(id, status) => {
    try {
        db = await dbPromise;
        const order = await db.run('INSERT INTO orders (customerID, orderStatus, orderDate) values(?, ?, CURRENT_TIMESTAMP)', [id, status])
        return { order }
    } catch (error) {
        console.log(error)
    }
}

const addOrderNotLoggedIn = async(data) => {
    try {
        db = await dbPromise;
        const order = await db.run('INSERT INTO orders ( orderStatus, orderDate) values(?, CURRENT_TIMESTAMP)', [data])
        return { order }
    } catch (error) {
        console.log(error)
    }
}

//UPDATE A ORDER BY ORDER ID
const updateOrderByID = async(data, orderID) => {
    try {
        db = await dbPromise;
        const order = await db.run('UPDATE orders SET orderStatus = ? WHERE orderID = ?', [data.orderStatus, orderID])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//DELETE ORDER BY ID
const deleteOrderByID = async(data) => {
    try {
        db = await dbPromise;
        const order = await db.run('DELETE from orders WHERE orderID = ?', [data])
        return { status: "Ok" }
    } catch (error) {
        console.log(error)
    }
}

//ORDERITEM
//GET ALL ORDERITEMS BY ORDERID
const getAllOrderItemsByOrderID = async(data) => {
    try {
        db = await dbPromise;
        const orders = await db.all('SELECT * from orderItem WHERE orderID = ?', [data])
        return orders;
    } catch (error) {
        console.log(error)
    }
}

//GET ORDER ITEM BY ORDERITEMID
const getOrderItemByID = async(data) => {
    try {
        db = await dbPromise;
        const orderItem = await db.all('SELECT * from orderItem WHERE orderItemID = ?', [data])
        return orderItem;
    } catch (error) {
        console.log(error)
    }
}

//ADD A NEW ORDERITEM
const addOrderItem = async(data, orderID) => {
    try {
        db = await dbPromise;
        const orderItem = await db.run('INSERT INTO orderItem (productID, orderID, quantity) values(?, ?, ?)', [data.productID, orderID, data.quantity])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

//DELETE ORDERITEM
const deleteOrderItemByID = async(data) => {
    try {
        db = await dbPromise;
        const deleteOrderItem = await db.run('DELETE FROM orderItem WHERE orderItemID = ?', [data])
        return { status: "ok" }
    } catch (error) {
        console.log(error)
    }
}

const addFileToDb = async(data, id) => {
    try {
        const db = await dbPromise;
        const addFileToDb = await db.run("UPDATE product SET productImage = ? WHERE productID = ?", [data, id]);
        return { status: "ok" }
    } catch (error) {
        console.log(error);
    }
};

//Add orderinfo
const addOrderInfo = async(data, orderID) => {
    try {
        db = await dbPromise;
        const orderItem = await db.run('INSERT INTO orderInfo (email, adress, firstName, lastName, orderID) values(?, ?, ?, ?, ?)', [data.email, data.adress, data.firstName, data.lastName, orderID])
        return { status: "orderinfo added" }
    } catch (error) {
        console.log(error)
    }
}


module.exports = {
    getAllCategories,
    //USERS
    getUsers,
    getUserByID,
    addUser,
    deleteUserByID,
    updateUserByID,
    customerUpdateUserByID,
    updateUserByIDWithoutPassword,
    getUserByUsername,
    getUsersWithRoleCustomer,
    //PRODUCTS
    getProducts,
    getProductByID,
    addProduct,
    addFileToDb,
    deleteProductByID,
    updateProductByID,
    getProductByCategory,
    getProductByCategoryMale,
    getProductByCategoryFemale,
    getProductByCategoryKids,
    getProductByCategoryDeals,
    getProductByCategoryNoDeals,
    findProductByName,
    //REVIEW
    getAllReviews,
    getReviewByID,
    getReviewByUserID,
    getReviewsByProductID,
    getAllReviewInformationByProductID,
    addReview,
    deleteReviewByID,
    updateReviewByID,
    //PASSWORD
    genPass,
    getHash,
    compPass,
    //CART
    addCart,
    getCartByCartID,
    getCartByUserID,
    deleteCartByCartID,
    deleteCartByCustomerID,
    //cartItem
    addcartItem,
    getcartItemsByCartID,
    deletecartItem,
    updatecartItem,
    //Order
    getAllOrders,
    getAllOrdersByUserID,
    getAllOrderDetails,
    getOrderByID,
    addOrder,
    addOrderNotLoggedIn,
    deleteOrderByID,
    updateOrderByID,
    //ORDERITEM
    getAllOrderItemsByOrderID,
    getOrderItemByID,
    addOrderItem,
    deleteOrderItemByID,
    addOrderInfo,
};