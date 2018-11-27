module.exports = {
    development: {
      port: process.env.PORT || 5200,
      saltingRounds: 10,
      mongoDBUrl : "mongodb://localhost:27017/shoppingCart",
      JWT_SECRET : "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes",
    },
    production:{
      port : process.env.PORT || 5200,
      saltingRounds : 20,
      mongoDBUrl : "mongodb://harshit886:bittu@886@ds115579.mlab.com:15579/shopping-list"
    }
  }