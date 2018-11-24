const express = require('express');
const bodyParser = require('body-parser');

const proxy = require('http-proxy-middleware');

// let cfenv = require('cfenv');

// let oAppEnv = cfenv.getAppEnv();
const mongoose = require('mongoose');
const auth = require('basic-auth');
const app = express();
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: false }));
mongoose.connect('mongodb://localhost:27017/shoppingCart');
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

app.get('/getCart', (req, res) => {
  Carts.find({})
    .populate('users')
    .exec((err, result) => {
      if (err) res.send(err);
      res.json(result);
    });
});

app.get('/loginCredentials', (req, res) => {
  const user = auth.parse(req.headers.authorization);
  Users.find({ userId: user.name, password: user.pass }, (err, result) => {
    if (err) res.send(err);
    let response;
    if (result.length > 0) {
      response = result;
    } else {
      response = 'Invalid Credentials';
    }
    res.json(response);
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

app.set('port', process.env.PORT || 5200);
app.listen(app.get('port'), () =>
  console.log(`App started on port${app.get('port')}`),
);
