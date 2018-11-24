const mongoose = require('mongoose');
const Schema = mongoose.Schema;

module.exports.products = mongoose.model(
  'Products',
  new Schema({
    product: String,
    pricePerQuantity: Number,
    rating: Number,
    supplier: String,
  }),
);

const cartList = new Schema({
  product: String,
  rating: Number,
  pricePerQuantity: Number,
  supplier: String,
  quantity: Number,
  totalPrice: Number,
});

//  var Address =  new Schema({
//     location : String

//  });
const users = mongoose.model(
  'Users',
  new Schema({
    userId: String,
    password: String,
    address: [String],
  }),
);
module.exports.users = users;

module.exports.carts = mongoose.model(
  'Carts',
  new Schema({
    users: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    totalPrice: Number,
    cart: [cartList],
    dateTime: {
      type: Date,
      default: Date.now,
    },
    paymentMode: Boolean,
  }),
);
