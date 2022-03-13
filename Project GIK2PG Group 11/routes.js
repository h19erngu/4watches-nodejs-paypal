const routes = require('express').Router();
const dbService = require('./database'); // för att prata med databasen 
const multer = require('multer');
const upload = multer({ dest: '/tmp/upload/' });
const fs = require("fs").promises;
const nodemailer = require('nodemailer');
require('dotenv').config();

const paypal = require('paypal-rest-sdk');
var client_id = 'AbhIvdlsTLooAyKNh03MgAjDxvJz1xoAi_ECa6y6GvUsboqqdsFA15qJ36LSt3MUDePGYwkPK29_wIYl';
var secret = 'EAb9WPLSuolkcFpuDz0sMt-JMTcOcod-Uc6P4P10I6KCIOVOaLV9dAeLlr6DtXleE1fcgFYlYa3J7cbt';

paypal.configure({
    'mode': 'sandbox', //sandbox or live
    'client_id': client_id,
    'client_secret': secret
});

//LOGIN
routes.post('/login', async (req, res) => {
    /* Req param: username, password */
    var sess;

    try {
        if (!req.body.password || !req.body.userName) {
            res.json('Enter login details')
        } else {

            const hash = await dbService.getHash(req.body.userName);
            const user = await dbService.getUserByUsername(req.body.userName);
            if (user.role == 'Customer') {
                const login = await dbService.compPass(req.body.password, hash.password);
                if (login) {
                    req.session.user = user
                    sess = req.session
                }
            }
            if (user.role == "Admin") {
                const login = await dbService.compPass(req.body.password, hash.password);
                if (login) {
                    req.session.user = user
                    sess = req.session
                }
            }

            res.json('Success Login')
        }
    } catch (error) {
        res.json('Not allowed, /login not working!');
    }
});

//LOGOUT
routes.get('/logout', async (req, res) => {
    req.session = null
    res.redirect('/public/home')
    });

//Startpage?
routes.get(['/public/home', '/', '/public'], (req, res) => {
    res.render('pages/index');
});






//CUSTOMER PROFILE ROUTE
routes.get('/public/profile', (req, res) => {
    var sess;
    sess = req.session
    if (sess.user.role == "Customer") {
        res.redirect('/public/customer');
    }
    if (sess.user.role == "Admin") {
        res.redirect('/public/admin');
    }
});

//ADMIN PANEL
routes.get('/public/admin/', (req, res) => {
    if (req.session.user.role == "Admin") {
        res.render('pages/admin');
    } else {
        res.send("You don't have permission to access this site")
    }
});

//ADMIN PANEL
routes.get('/public/adminproducts/', (req, res) => {
    if (req.session.user.role == "Admin") {
        res.render('pages/adminproducts');
    } else {
        res.send("You don't have permission to access this site")
    }
});

//CART
routes.get('/public/cart/', (req, res) => {
    res.render('pages/cart');
});

//CUSTOMER PROFILE
routes.get('/public/customer/', (req, res) => {

    if (req.session.user.role == "Customer") {
        res.render('pages/customer');
    } else {
        res.send("You don't have permission to access this site")
    }
});

//ABOUT US
routes.get('/public/about-us', (req, res) => {
    res.render('pages/aboutus');
});




//PRODUCTS
routes.get('/public/products', (req, res) => {
    res.render('pages/products');
});

//PRODUCTINFO 
routes.get('/public/products/:productid', (req, res) => {
    res.render('pages/productinfo');
});

//product categories
routes.get(['/public/category/male'], (req, res) => {
    res.render('pages/maleproducts');
});

routes.get(['/public/category/female'], (req, res) => {
    res.render('pages/femaleproducts');
});

routes.get(['/public/category/kids'], (req, res) => {
    res.render('pages/kidsproducts');
});

routes.get(['/public/category/deals'], (req, res) => {
    res.render('pages/deals');
});

//ROUTE FOR GETTING ALL CATEGORIES
routes.get('/categories/', async (req, res) => {
    try {
        const categories = await dbService.getAllCategories();
        res.send(categories)
    } catch (error) {
        console.log(error)
    }
});

//GET ALL USERS ROUTE
routes.get('/users/', async (req, res) => {
    try {
        const users = await dbService.getUsers();
        res.send(users);
    } catch (error) {
        res.send("COULDN'T FETCH ALL USERS")
    }
});
//GET ALL CUSTOMER USERS ROUTE
routes.get('/customer/users/', async (req, res) => {
    try {
        const users = await dbService.getUsersWithRoleCustomer();
        res.send(users);
    } catch (error) {
        res.send("COULDN'T FETCH ALL CUSTOMER USERS")
    }
});


//GET USER BY ID
routes.get('/user/:id', async (req, res) => {
    /* Req param: id */
    try {
        const id = req.params.id;
        const user = await dbService.getUserByID(id);
        res.send(user)
    } catch (error) {
        res.json({ status: 'Failed to get user with specified id' })
    }
});

//GET INLOGGED CUSTOMER DATA
routes.get('/customer/', async (req, res) => {
    try {
        var sess = req.session
        const user = await dbService.getUserByID(sess.user.userID)
        res.send(user)
    } catch (error) {
        console.log(error)
    }
})

//DELETE USER BY ID
routes.delete('/user/:id', async (req, res) => {
    /* Req param: id */
    const id = req.params.id;
    try {
        const user = await dbService.deleteUserByID(id);
        res.json({ status: 'You removed user' })
    } catch (error) {
        res.json({ status: 'Failed to remove user with specified id' })
    }
});

//ADD A NEW USER
routes.post('/user/', async (req, res) => {
    /* Req param: username, firstname, lastname, password, adress */
    try {
        const validFirstName = req.body.firstName;
        const validLastName = req.body.lastName;
        firstName = validFirstName.match(/^[A-Za-z]+$/);
        lastName = validLastName.match(/^[A-Za-z]+$/);
        if (firstName != null && lastName != null) {
            const pwd = await dbService.genPass(req.body.password);
            req.body.password = pwd;
            const result = await dbService.addUser(req.body);
            res.json({ status: 'You added user' });
        } else {

            throw "Please enter letters for first and lastname.";
        }
    } catch (error) {
        res.json({ status: 'Failed to add user' })
    }

});

//UPDATE A USER
routes.put('/user/:userId', async (req, res) => {
    /* Req param: email, firstname, lastname, status id as identifier */
    const userId = req.params.userId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const password = req.body.password;
    const adress = req.body.adress;

    //const email = req.body.email;
    const role = req.body.role;
    try {

        const found = await dbService.getUserByID(userId);
        if (found) {
            if (req.body.password) {
                const pwd = await dbService.genPass(req.body.password);
                req.body.password = pwd;
                await dbService.updateUserByID(userId, req.body);
                res.json({ status: `You updated User with id: ${userId}` })
            } else {
                await dbService.updateUserByIDWithoutPassword(userId, req.body);
                res.json({ status: `You updated User with id: ${userId}` })
            }

        } else {
            res.status(400).send({ Error: `User with id: ${userId} was not found` })
        }

    } catch (error) {
        res.json({ status: 'Failed to update User' })
    }
});

routes.put('/customer/user/:userId', async (req, res) => {
    /* Req param: email, firstname, lastname, status id as identifier */
    const userId = req.params.userId;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    const username = req.body.username;
    const password = req.body.password;
    const adress = req.body.adress;

    //const email = req.body.email;
    const role = req.body.role;
    try {

        const found = await dbService.getUserByID(userId);
        if (found) {
            if (req.body.password) {
                const pwd = await dbService.genPass(req.body.password);
                req.body.password = pwd;
                await dbService.customerUpdateUserByID(userId, req.body);
                res.json({ status: `You updated User with id: ${userId}` })
            } else {
                await dbService.updateUserByIDWithoutPassword(userId, req.body);
                res.json({ status: `You updated User with id: ${userId}` })
            }

        } else {
            res.status(400).send({ Error: `User with id: ${userId} was not found` })
        }

    } catch (error) {
        res.json({ status: 'Failed to update User' })
    }
});

//GET ALL PRODUCTS ROUTE
routes.get('/products/', async (req, res) => {
    try {
        const products = await dbService.getProducts();
        res.send(products);
    } catch (error) {
        res.send("COULDN'T FETCH ALL PRODUCTS")
    }
});

routes.get('/productsnodeals/', async (req, res) => {
    try {
        const products = await dbService.getProductByCategoryNoDeals();
        res.send(products);
    } catch (error) {
        res.send("COULDN'T FETCH ALL PRODUCTS")
    }
});

//GET PRODUCT BY ID
routes.get('/product/:productID', async (req, res) => {
    try {
        const product = await dbService.getProductByID(req.params.productID);
        res.json(product);
    } catch (error) {
        console.log(error);
        res.json({ status: 'Something went wrong while bringing the product infromation from the database' });
    }
});
//GET PRODUCT BY CATEGORY
routes.get('/product/category/:categoryID', async (req, res) => {
    try {
        const productCategory = req.params.categoryID
        const products = await dbService.getProductByCategory(productCategory);
        res.send(products)
    } catch (error) {
        res.send(error);
    }
});


//Get MALE products only
routes.get('/products/category/male', async (req, res) => {
    try {
        const products = await dbService.getProductByCategoryMale();
        res.send(products)
    } catch (error) {
        console.log(error);
    }
});

//Get FEMALE products only
routes.get('/products/category/female', async (req, res) => {
    try {
        const products = await dbService.getProductByCategoryFemale();
        res.send(products)
    } catch (error) {
        console.log(error);
    }
});

//Get KIDS products only
routes.get('/products/category/kids', async (req, res) => {
    try {
        const products = await dbService.getProductByCategoryKids();
        res.send(products)
    } catch (error) {
        console.log(error);
    }
});

//Get deals products only
routes.get('/products/category/deals', async (req, res) => {
    try {
        const products = await dbService.getProductByCategoryDeals();
        res.send(products)
    } catch (error) {
        console.log(error);
    }
});


//ADD A NEW PRODUCT
routes.post('/product/', async (req, res) => {
    try {
        const addProduct = await dbService.addProduct(req.body)
        res.send(addProduct)
    } catch (error) {
        console.log(error);
    }
});

//DELETE PRODUCT BY ID
routes.delete('/product/:id', async (req, res) => {
    try {
        const oldProduct = await dbService.getProductByID(req.params.id)
        var oldProductImage = './views' + oldProduct.productImage.slice(2)
        const dProductID = await dbService.deleteProductByID(req.params.id);
        await fs.unlink(oldProductImage)
        res.json({ status: 'The product was successfully deleted' });
    } catch (error) {
        console.log(error);
        res.json({ status: 'Something went wrong while deleteing the product from the database' });
    }
});

//UPDATE PRODUCT BY ID
routes.put('/product/:id', async (req, res) => {
    const { productName, description, price, categoryID } = req.body;
    try {
        await dbService.updateProductByID(req.params.id, req.body);
        res.json({ status: 'Product was successfully updated' });
    } catch (error) {
        console.log(error);
        res.json({ status: 'Something went wrong while updating the product from the database' });
    }
});



//ADD A REVIEW
routes.post('/review/', async (req, res) => {
    // Req param: userid, questionid, text
    req.body.userID = req.session.user.userID
    if (req.body.userID == 0 &&
        req.body.productID == 0 &&
        req.body.reviewTitle == 0 &&
        req.body.rating == 0 &&
        req.body.reviewComment == 0) {
        res.json({ status: 'Enter all fields to add.' });
    } else {
        try {
            const result = await dbService.addReview(req.body);
            if (result) {
                res.json({ status: 'You added a review' });
            } else {
                throw error;
            }
        } catch (error) {
            res.json({ status: 'Failed to add this review' });
        }
    }
});

//GET REVIEWS
routes.get('/reviews/', async (req, res) => {
    try {
        const reviews = await dbService.getAllReviews();
        res.json(reviews)
    } catch (error) {
        res.json({ status: 'Failed to get all reviews' })
    }
});

//GET A REVIEW BY ID
routes.get('/review/:reviewID', async (req, res) => {
    try {
        const review = await dbService.getReviewByID(req.params.reviewID);
        res.json(review)
    } catch (error) {
        res.json({ status: 'Failed to get reviewByID' })
    }
});

//GET ALL REVIEWS BY PRODUCTID
//routes.get('/reviews/:productID', async(req, res) => {
//try {
//  const reviews = await dbService.getReviewsByProductID(req.params.productID);
// res.json(reviews)
//} catch (error) {
//res.json({ status: 'Failed to get reviewByID' }) /
///}
//});

//Get review by userID
routes.get('/review/user/:userID', async (req, res) => {
    try {
        const review = await dbService.getReviewByUserID(req.params.userID);
        res.json(review)
    } catch (error) {
        res.json({ status: 'Failed to get review by user id' })
    }
});

//GET REVIEW BY SESSION USER ID
routes.get('/customer/reviews/', async (req, res) => {
    try {
        var s = req.session
        const review = await dbService.getReviewByUserID(s.user.userID);
        res.json(review)
    } catch (error) {
        res.json({ status: 'Failed to get review by user id' })
    }
});


routes.get('/reviews/:productid/', async (req, res) => {
    try {
        var id = req.params.productid
        const data = await dbService.getAllReviewInformationByProductID(id);
        res.json(data)
    } catch (error) {
        res.json({ status: 'Failed to get review by user id' })
    }
});


//DELETE REVIEW BY ID
routes.delete('/review/:id', async (req, res) => {
    /* Req param: id */
    const id = req.params.id;
    try {
        const review = await dbService.deleteReviewByID(id);
        res.json({ status: 'You removed an review' })
    } catch (error) {
        res.json({ status: 'Failed to remove review with specified id' })
    }
});

//UPDATE A REVIEW
routes.put('/review/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const updateReview = await dbService.updateReviewByID(id, req.body);
        res.json({ status: "Ok" })
    } catch (error) {
        console.log(error)
    }
});

//CART
//ADD A CART
routes.post('/cart/', async (req, res) => {
    try {
        const result = await dbService.addCart(req.body);
        if (result) {
            res.json({ status: 'You added a Cart' });
        } else {
            throw error;
        }
    } catch (error) {
        res.json({ status: 'Failed to add this Cart' });
    }

});

//GET A Cart BY cartID
routes.get('/cart/:id', async (req, res) => {
    try {
        const cart = await dbService.getCartByCartID(req.params.id);
        res.json(cart)
    } catch (error) {
        res.json({ status: 'Failed to get cart by cartID' })
    }
});

//GET A Cart BY userID
routes.get('/cart/user/:id', async (req, res) => {
    try {
        const cart = await dbService.getCartByUserID(req.params.id);
        res.json(cart)
    } catch (error) {
        res.json({ status: 'Failed to get cart by user id' })
    }
});

//DELETE Cart BY ID
routes.delete('/cart/:id', async (req, res) => {
    /* Req param: id */
    const id = req.params.id;
    try {
        const cart = await dbService.deleteCartByCartID(id);
        res.json({ status: 'You removed an Cart' })
    } catch (error) {
        res.json({ status: 'Failed to remove Cart with specified id' })
    }
});

//DELETE Cart BY userID
routes.delete('/cart/user/:id', async (req, res) => {
    /* Req param: id */
    const id = req.params.id;
    try {
        const cart = await dbService.deleteCartByCustomerID(id);
        res.json({ status: 'You removed a Cart' })
    } catch (error) {
        res.json({ status: 'Failed to remove Cart with specified customer id' })
    }
});


//CARTITEM
//GET A CARTITEM BY CartID
routes.get('/cartitem/:cartid', async (req, res) => {
    try {
        const cartitem = await dbService.getcartItemsByCartID(req.params.cartid);
        res.json(cartitem)
    } catch (error) {
        res.json({ status: 'Failed to get cartitem by CartID' })
    }
});

//ADD A CARTITEM
routes.post('/cartitem/', async (req, res) => {
    try {
        const result = await dbService.addcartItem(req.body);
        if (result) {
            res.json({ status: 'You added a item to the cart' });
        } else {
            throw error;
        }
    } catch (error) {
        res.json({ status: 'Failed to add this item to the Cart' });
    }

});

//UPDATE A CARTITEM
routes.put('/cartitem/:cartitemid', async (req, res) => {
    const id = req.params.cartitemid;
    try {
        const updateCartItem = await dbService.updatecartItem(req.body, id);
        res.json({ status: "Ok" })
    } catch (error) {
        console.log(error)
    }
});

//DELETE CARTITEM BY ID
routes.delete('/cartitem/:cartitemid', async (req, res) => {
    const id = req.params.cartitemid;
    try {
        const cartitem = await dbService.deletecartItem(id);
        res.json({ status: 'You removed a CartItem' })
    } catch (error) {
        res.json({ status: 'Failed to remove CartItem with specified id' })
    }
});


//ORDER
//Get order by userID
routes.get('/order/user/:userID', async (req, res) => {
    try {
        const order = await dbService.getAllOrdersByUserID(req.params.userID);
        res.json(order)
    } catch (error) {
        res.json({ status: 'Failed to get order by user id' })
    }
});

routes.get('/customer/order', async (req, res) => {
    try {
        const order = await dbService.getAllOrdersByUserID(req.session.user.userID);
        res.json(order)
    } catch (error) {
        res.json({ status: 'Failed to get order by user id' })
    }
});

//get all orders
routes.get('/orders/', async (req, res) => {
    try {
        const orders = await dbService.getAllOrders();
        res.send(orders);
    } catch (error) {
        res.send("COULDN'T FETCH ALL ORDERS")
    }
});

//get order by Order id

routes.get('/order/:orderID', async (req, res) => {
    try {
        const order = await dbService.getOrderByID(req.params.orderID);
        res.json(order)
    } catch (error) {
        res.json({ status: 'Failed to get order by order id' })
    }
});

//Delete order by ID
routes.delete('/order/:orderID', async (req, res) => {
    /* Req param: id */
    const orderID = req.params.orderID;
    try {
        const orderDelete = await dbService.deleteOrderByID(orderID);
        res.json({ status: 'You removed order' })
    } catch (error) {
        res.json({ status: 'Failed to remove order with specified id' })
    }
});

//Update order by id
routes.put('/order/:orderID', async (req, res) => {
    const { orderStatus } = req.body;
    try {
        await dbService.updateOrderByID(req.body, req.params.orderID);
        res.json({ status: 'Order was successfully updated' });
    } catch (error) {
        console.log(error);
        res.json({ status: 'Something went wrong while updating the order from the database' });
    }
});

//ORDERITEM
//ADD AN ORDERITEM
routes.post('/orderitem/', async (req, res) => {
    try {
        const addOrderItem = await dbService.addOrderItem(req.body)
        res.send(addOrderItem)
    } catch (error) {
        console.log(error);
    }
});

//GET ORDERITEM BY ORDERITEMID
routes.get('/orderitem/:id', async (req, res) => {
    try {
        const order = await dbService.getOrderItemByID(req.params.id);
        res.json(order)
    } catch (error) {
        res.json({ status: 'Failed to get orderitem by orderitemID' })
    }
});

//GET ORDERITEM BY ORDERID
routes.get('/orderitem/order/:id', async (req, res) => {
    try {
        const orderItems = await dbService.getAllOrderItemsByOrderID(req.params.id)
        res.send(orderItems);
    } catch (error) {
        console.log(error)
    }
});

//DELETE AN ORDERITEM BY ID
routes.delete('/orderitem/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const orderItem = await dbService.deleteOrderItemByID(id);
        res.json({ status: 'You removed a OrderItem' })
    } catch (error) {
        res.json({ status: 'Failed to remove OrderItem with specified id' })
    }
});

routes.get('/order/details/:orderID', async (req, res) => {
    try {
        const orders = await dbService.getAllOrderDetails(req.params.orderID);
        res.send(orders)
    } catch (error) {
        console.log(error)
    }
});


//upload bild
routes.post("/filetest/:id", upload.single("file"), async (req, res) => {
    const allOK = true;

    const uploadedFile = req.file;
    const exts = req.file.originalname.split(".");
    const fileEnd = exts[exts.length - 1];
    const fileName = 'product' + req.params.id + "." + fileEnd;
    const dbFileName = "../upload/" + 'product' + req.params.id + "." + fileEnd;
    const newPath = "./views/upload/" + fileName;
    if (!fileEnd.match(/png/) &&
        !fileEnd.match(/jpg/) &&
        !fileEnd.match(/jpeg/) &&
        !fileEnd.match(/PNG/) &&
        !fileEnd.match(/JPG/) &&
        !fileEnd.match(/JPEG/)) {
        await fs.unlink(newPath);
        return res.status(400).json({ status: 'file not supported' });
    }
    try {
        const filewrite = await fs.rename(uploadedFile.path, newPath);
        const uploaded = await dbService.addFileToDb(dbFileName, req.params.id);
        // if filewrite true
        if (filewrite) {
            allOK = false
        }
    } catch (error) {
        await fs.unlink(newPath);
        res.status(400).json(error);
    }
    if (!allOK) {
        res.json({ "status": "not ok" })
    } else {
        res.json({ "status": "ok" })
    }
});

//upload bild
routes.post("/file/", upload.single("file"), async (req, res) => {
    const allOK = true;
    const product = JSON.parse(req.body.product)

    const uploadedFile = req.file;
    const exts = req.file.originalname.split(".");
    const fileEnd = exts[exts.length - 1];
    const fileName = product.productName + "." + fileEnd;
    const dbFileName = "../upload/" + fileName;
    const newPath = "./views/upload/" + fileName;
    if (!fileEnd.match(/png/) &&
        !fileEnd.match(/jpg/) &&
        !fileEnd.match(/jpeg/) &&
        !fileEnd.match(/PNG/) &&
        !fileEnd.match(/JPG/) &&
        !fileEnd.match(/JPEG/)) {
        await fs.unlink(newPath);
        return res.status(400).json({ status: 'file not supported' });
    }
    try {
        const filewrite = await fs.rename(uploadedFile.path, newPath);
        const addProduct = await dbService.addProduct(product, dbFileName)
        // if filewrite true
        if (filewrite) {
            allOK = false
        }
    } catch (error) {
        await fs.unlink(newPath);
        res.status(400).json(error);
    }
    if (!allOK) {
        res.json({ "status": "not ok" })
    } else {
        res.json({ "status": "ok" })
    }
});


routes.get('/productsByCategory/:category', async (req, res) => {
    /* Req param: category */
    try {
        const category = req.params;
        const products = await dbService.getProductByCategory(category);
        res.send(products)
    } catch (error) {
        res.json({ status: 'Failed to get products with specified category' })
    }
});

routes.get('/cartcontent', async (req, res) => {
    var sess = req.session
    res.send(sess.cart)
});

routes.get('/confirmation', async (req, res) => {
    var sess = req.session
    res.send(sess.order)
});

routes.get('/session/info', async (req, res) => {
    var sess = req.session
    res.send(sess)
});


//Add to cart
routes.get('/cart/add/:product', async (req, res) => {
    var sess;

    var product = req.params.product;
    //sess = req.session;
    try {

        const item = await dbService.getProductByID(product);

        if (typeof req.session.cart == "undefined") {
            req.session.cart = [];
            item.quantity = 1;
            req.session.cart.push(item)
        } else {
            var cart = req.session.cart;
            var newItem = true;

            for (var i = 0; i < req.session.cart.length; i++) {
                if (req.session.cart[i].productID == item.productID) {
                    req.session.cart[i].quantity++;
                    newItem = false;
                }
            }
            if (newItem) {
                item.quantity = 1;
                req.session.cart.push(item)

            }
        }
        //res.session.cart = cart;
        sess = req.session;

        //console.log(sess)
        res.send(product)
    } catch (error) {
        res.json({ status: 'Failed to add product with specified ID to the cart' })
    }
});

//Remove one product from cart
routes.put('/cart/remove/:product', async (req, res) => {
    var product = req.params.product;

    try {
        sess = req.session;
        for (var i = 0; i < req.session.cart.length; i++) {
            if (req.session.cart[i].productID == product) {
                quantity = req.body.quantity
                req.session.cart[i].quantity = quantity;
                break;
            }
        }
        res.send("ok")

    } catch (error) {
        console.log(error)
    }
});

//DELETE PRODUCT FROM CART
routes.delete('/cart/delete/:product', async (req, res) => {
    var product = req.params.product;

    try {
        sess = req.session;
        for (var i = 0; i < req.session.cart.length; i++) {
            if (req.session.cart[i].productID == product) {
                req.session.cart.splice(i, 1)
                //console.log(req.session.cart)
                break;
            }
        }
        res.send("ok")

    } catch (error) {
        console.log(error)
    }
});


routes.post('/userinfo', async (req, res) => {
    /* bodyfrom google email firstnam lastname idtoken */
    var sess;
    try {

        //console.log('/userinfo used')
        user = req.body;
        newUser = true;
        const users = await dbService.getUsers();
        for (let i = 0; i < users.length; i++) {
            //console.log(users[i].userName)
            if (users[i].userName == user.userName) {
                newUser = false;
                found = users[i]
            }
        }
        if (newUser) {
            //username, firstName, lastName(google), password, adress, role(added)
            user.password = '';
            user.adress = '';
            user.role = 'Customer';
            const result = await dbService.addUser(req.body);
            const found2 = await dbService.getUserByUsername(user.userName);
            //console.log('found2')
            req.session.user = found2;
            sess = req.session;
            //console.log('new user created with google login')
        }
        if (newUser == false) {
            //console.log('found');
            //const userID = await dbService.getUserByID(found.userID);
            req.session.user = found;
            sess = req.session;
            //console.log('Google user found saved in session');
        }
        //res.redirect('/public/home')
        res.json({ status: 'Success' });
    } catch (error) {
        res.json({ status: 'Failed' })
    }

});


//UPDATE A PRODUCT AND THE IMAGE OF THE PRODUCT
routes.post("/file/update", upload.single("file"), async (req, res) => {
    const allOK = true;
    const product = JSON.parse(req.body.product)
    const uploadedFile = req.file;
    const exts = req.file.originalname.split(".");
    const fileEnd = exts[exts.length - 1];
    const fileName = product.productName + "." + fileEnd;
    const dbFileName = "../upload/" + fileName;
    const newPath = "./views/upload/" + fileName;
    if (!fileEnd.match(/png/) &&
        !fileEnd.match(/jpg/) &&
        !fileEnd.match(/jpeg/) &&
        !fileEnd.match(/PNG/) &&
        !fileEnd.match(/JPG/) &&
        !fileEnd.match(/JPEG/)) {
        await fs.unlink(newPath);
        return res.status(400).json({ status: 'file not supported' });
    }
    try {
        const oldProduct = await dbService.getProductByID(product.productID);
        var oldProductImage = './views' + oldProduct.productImage.slice(2)
        await fs.unlink(oldProductImage)
        const filewrite = await fs.rename(uploadedFile.path, newPath);
        const addProduct = await dbService.updateProductByID(product.productID, dbFileName, product)
        // if filewrite true
        if (filewrite || !addProduct) {
            allOK = false
        }
    } catch (error) {
        await fs.unlink(newPath);
        res.status(400).json(error);
    }
    if (!allOK) {
        res.json({ "status": "not ok" })
    } else {
        res.json({ "status": "ok" })
    }
});


routes.post('/pay', async (req, res) => {
    var sess;
    sess = req.session;

    if (!req.session.user) {


        var orderInfo = {
            email: req.body.email,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
            adress: req.body.adress,
        }
        sess.orderInfo = orderInfo
    }

    var total = String(req.body.total)
    const create_payment_json = {
        "intent": "sale",
        "payer": {
            "payment_method": "paypal"
        },
        "redirect_urls": {
            "return_url": "https://fourwatches.herokuapp.com/success",
            "cancel_url": "https://fourwatches.herokuapp.com/cancel"
        },
        "transactions": [{
            "amount": {
                "currency": "SEK",
                "total": total
            },
            "description": "4Watches Store"
        }]
    };

    paypal.payment.create(create_payment_json, function (error, payment) {
        if (error) {
            throw error;
        } else {
            for (let i = 0; i < payment.links.length; i++) {
                if (payment.links[i].rel === 'approval_url') {
                    //res.redirect(payment.links[i].href);
                    res.json({ forwardLink: payment.links[i].href });
                }
            }
        }
    });

});

routes.get('/success', async (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
        "payer_id": payerId,
        "transactions": [{
            "amount": {
                "currency": "SEK",
                "total": "25.00"
            }
        }]
    };
    var sess;
    sess = req.session;
    sess.order = sess.cart

    var status = "Undelivered";

    if (sess.user) {
   
        const result = await dbService.addOrder(sess.user.userID, status)
        for (let cartItem of sess.cart) {
            const line = await dbService.addOrderItem(cartItem, result.order.lastID)
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "nguyenerik97@gmail.com",
                pass: "testerik123"
                //user: process.env.EMAIL,
                //pass: process.env.PASSWORD
            }
        });

        //session email for logged in customer


        var mailBody =

            '<html><body>' + '<h1>' + sess.user.firstName + ', thank you for your order!</h1><br>' + '<h2><b>Order ID: ' + result.order.lastID + '</b></h2><br>';
        var totalPrice = 0;

        mailBody += '<table border="1">' +
            '<thead>' +
            '<tr>' +
            '<th>Name</th>' +
            '<th>Price</th>' +
            '<th>Quantity</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        for (let cartItem of sess.cart) {
            totalPrice += parseInt(cartItem.price) * parseInt(cartItem.quantity)
            mailBody += '<tr><td>' + cartItem.productName + '</td><td>' + cartItem.price + 'SEK</td><td>' + cartItem.quantity + '</td></tr>';
        }
        mailBody += '</tbody>' + '</table>' + '<br>' + '<b>Total Price: ' + totalPrice + 'SEK' + '</b><br><br>If you have any questions regarding your order, contact us at info@4WATCHes.se.<br><br>Best regards, <br>Team 4WATCHes<br></body></html>';



        let mailOptions = {
            from: 'nguyenerik97@gmail.com',
            to: sess.user.userName,
            subject: 'FOUR WATCHES | ' + sess.user.firstName + ', THANKS FOR YOUR ORDER! ',
            //text: "THIS IS AN EMAIL CONFIRMATION OF YOUR ORDER" + 
            html: mailBody

        };
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                console.log("sent email!")
            }
        })
        
    }





    else {
        const result2 = await dbService.addOrderNotLoggedIn(status)
        const orderInfo = await dbService.addOrderInfo(sess.orderInfo, result2.order.lastID)
        for (let cartItem of sess.cart) {
            const b = await dbService.addOrderItem(cartItem, result2.order.lastID)
        }
        let transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: "nguyenerik97@gmail.com",
                pass: "testerik123"
            }
        });



       var mailBody =

            '<html><body>' + '<h1>' + sess.orderInfo.firstName + ', thank you for your order!</h1><br>' + '<h2><b>Order ID: ' + result2.order.lastID + '</b></h2><br>';
        var totalPrice = 0;

        mailBody += '<table border="1">' +
            '<thead>' +
            '<tr>' +
            '<th>Name</th>' +
            '<th>Price</th>' +
            '<th>Quantity</th>' +
            '</tr>' +
            '</thead>' +
            '<tbody>';

        for (let cartItem of sess.cart) {
            totalPrice += parseInt(cartItem.price) * parseInt(cartItem.quantity)
            mailBody += '<tr><td>' + cartItem.productName + '</td><td>' + cartItem.price + 'SEK</td><td>' + cartItem.quantity + '</td></tr>';
        }
        mailBody += '</tbody>' + '</table>' + '<br>' + '<b>Total Price: ' + totalPrice + 'SEK' + '</b><br><br>If you have any questions regarding your order, contact us at info@4WATCHes.se.<br><br>Best regards, <br>Team 4WATCHes<br></body></html>';



        let mailOptions = {
            from: 'nguyenerik97@gmail.com',
            to: sess.orderInfo.email,
            subject: 'FOUR WATCHES | ' + sess.orderInfo.firstName + ', THANKS FOR YOUR ORDER! ',
            //text: "THIS IS AN EMAIL CONFIRMATION OF YOUR ORDER" + 
            html: mailBody
            //sess.cart[0].productName
        };
        transporter.sendMail(mailOptions, (err, data) => {
            if (err) {
                console.log(err)
            } else {
                console.log("sent email!")
            }
        })
    }

    // Obtains the transaction details from paypal
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
        //When error occurs when due to non-existent transaction, throw an error else log the transaction details in the console then send a Success string reposponse to the user.
        if (error) {
            console.log(error.response);
            throw error;
        } else {
            res.render('pages/success');
            
    req.session.cart = [];
    //console.log(req.session.cart);
    //console.log(req.session);
        }
    });
    req.session.cart = []
});
routes.get('/cancel', (req, res) => res.render('pages/cancel'));

module.exports = routes;