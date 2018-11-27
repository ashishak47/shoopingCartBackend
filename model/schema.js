// password encryption
const bcrypt = require('bcrypt');

const environment = process.env.NODE_ENV || "development";
const stage = require('../config')[environment];

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
const userSchema = 
  new Schema({
    userId: {
      type: 'String',
      required: true,
      trim: true,
      unique: true
    },
    password: {
      type: 'String',
      required: true,
      trim: true
    },
    address: [String],
  });

userSchema.pre('save', function(next) {
  const user = this;
  if(!user.isModified || !user.isNew) { // don't rehash if it's an old user
    next();
  } else {
    bcrypt.hash(user.password, stage.saltingRounds, function(err, hash) {
      if (err) {
        console.log('Error hashing password for user', user.name);
        next(err);
      } else {
        user.password = hash;
        next();
      }
    });
  }
});  
module.exports.users = mongoose.model('Users',userSchema);

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


