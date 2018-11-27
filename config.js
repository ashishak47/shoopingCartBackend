module.exports = {
    development: {
      port: process.env.PORT || 5200,
      saltingRounds: 10,
      mongoDBUrl : "mongodb://localhost:27017/shoppingCart",
      JWT_SECRET : "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes",
    }
  }