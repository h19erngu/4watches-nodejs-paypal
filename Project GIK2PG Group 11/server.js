const express = require('express');
//const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const routes = require('./routes');
const app = express();
const port = 3000;



const session = require('express-session');
app.use(session({ secret: 'ssshhhhh', saveUninitialized: true, resave: true }));
app.set('view engine', 'ejs');

app.get('*', function(req, res, next) {
    res.locals.cart = req.session.cart;
    next();
});

app.use(function(req, res, next) {
    res.locals.session = req.session;
    res.locals.cart = req.session.cart;
    // res.locals.user = req.session.user

    next();
});


app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/views'));
app.use(routes);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}/`);
});

// ES 6
//import rater from 'rater-js';
// CommonJS:
//const rater = require('rater-js');