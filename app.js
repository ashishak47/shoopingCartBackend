require('dotenv').config(); 
const express = require('express');
const bcrypt = require('bcrypt');

// application logging
const logger = require('morgan');
const jwt = require('jsonwebtoken');


const bodyParser = require('body-parser');

const proxy = require('http-proxy-middleware');

// let cfenv = require('cfenv');

// let oAppEnv = cfenv.getAppEnv();
const mongoose = require('mongoose');
const auth = require('express-auth-parser');
const environment = process.env.NODE_ENV || "development";
const validateToken = require('./utils').validateToken;
// development environment
let stage = require('./config')[environment];

// Express app initialization
const app = express();
const router = express.Router();

// middleware used
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
if (environment !== 'production') {
  app.use(logger('dev'));
}
app.use(auth);
app.use("/api/*",validateToken);


// MongoDb Initialization
mongoose.connect(`${stage.mongoDBUrl}`, { 
  useNewUrlParser: true
  });
// setting the cf environment variable
// mongoose.connect(oAppEnv.services.mongodb[0].credentials.uri);


const schema = require('./model/schema.js');
Products = schema.products;
Users = schema.users;
Carts = schema.carts;

app.get('/getProducts', (req, res) => {
  Products.find({}, (err, result) => {
    if (err) res.send(err);
    res.json(result);
  });
});

app.get('/getUsers', (req, res) => {
  Users.find({}, (err, result) => {
    if (err) res.send(err);
    res.json(result);
  });
});

app.get('/api/getCart', (req, res) => {
  Users.findOne({'userId' : req.decoded.user},(err,result)=>{
    Carts.find({'users' : result.id})
    .populate('users')
    .exec((err, result) => {
      if (err) res.send(err);
      res.json(result);
    });
  })
  
});

app.post('/api/updateCart', (req, res) => {
  Users.findOne({'userId' : req.decoded.user},(err,result)=>{
  Carts.findOne({users : result.id})
    .exec((err, order) => {
      if (err) res.send(err);
      Products.findOne({product : req.body.product}, (err, result) => {
        if (err) res.send(err);
          let product = {};
          product.product = result.product;
          product.supplier= result.supplier;
          product.pricePerQuantity = result.pricePerQuantity;
          product.rating = result.rating;
          product.quantity = req.body.quantity;
          product.totalPrice = result.pricePerQuantity * product.quantity;
        order.cart.push(product);
        order.save((err,response)=>{
          if (err) res.send(err);
          res.json(response);
        })
      });
     
      
    });
  });
});

app.get('/loginCredentials', (req, res) => {
  const {username , password} = req.authorization.basic;
  
  let result = {};
  let status = 200;
 
  Users.findOne({userId : username}, (err, user) => {
    if (!err && user) {
      // We could compare passwords in our model instead of below
      bcrypt.compare(password, user.password).then(match => {
        if (match) {
         
          const payload = { user: user.userId };
          const options = { expiresIn: '2d', issuer: 'https://scotch.io' };
          const secret = stage.JWT_SECRET;
          const token = jwt.sign(payload, secret, options);
          result.status = status;
          result.result = user;
          // console.log('TOKEN', token);
          result.token = token;
        } else {
          status = 401;
          result.status = status;
          result.error = 'Authentication error';
        }
        res.status(status).send(result);
      }).catch(err => {
        status = 500;
        result.status = status;
        result.error = err;
        res.status(status).send(result);
      });
    } else {
      status = 404;
      result.status = status;
      result.error = err;
      res.status(status).send(result);
    }
  });

});

app.post('/saveUser', (req, res) => {
  const User = new Users();
  User.userId = req.body.userId;
  User.password = req.body.password;
  User.address = req.body.address;
  
  User.save((err, result) => {
    if (err) res.send(err);
    const Cart = new Carts();
    Cart.users = result;
    Cart.save((err, response) => {
      if (err) res.send(err);
      res.json(result);
    });
  });
});
function saveDB(payload) {
  const barCode = new barCodeSchema(); // create a new instance of the Bear model
  barCode.address = payload.address;
  barCode.barcode = payload.barcode;
  barCode.name = payload.name;
  barCode.phone = payload.phone;
  barCode.postalcode = payload.postalcode;
  barCode.state = payload.state;

  // save the barcode feedback data and check for errors
  return barCode.save(err => {
    if (err) console.log(err);
  });
}

app.post('/saveBarCodeFeedbackData', (req, res) => {
  const payload = req.body;

  saveDB(payload)
    .then(reponse => {
      res.send(JSON.stringify(reponse));
    })
    .catch(error => {
      // res.send(JSON.stringify(faceResponse));
      console.error('error in saving', error);
    });
});

// proxy set for barcode prediction
const barcodeUrl =
  'http://ec2-54-255-253-217.ap-southeast-1.compute.amazonaws.com:5008';
app.use(
  '/predictbarcode',
  proxy({
    target: barcodeUrl,
    pathRewrite: { '/predictbarcode/predict': '/predict' },
    changeOrigin: true,
  }),
);
app.use(express.static('ui/webapp'));

app.listen(`${stage.port}`, () =>
  console.log(`App started on port${stage.port}`),
);
