module.exports = {
    development: {
      port: process.env.PORT || 5200,
      saltingRounds: 10,
      mongoDBUrl : "mongodb://localhost/shoppingCart",
      JWT_SECRET : "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes",
    },
    production:{
      port : process.env.PORT || 5200,
      saltingRounds : 10,
      mongoDBUrl : "mongodb://harsh886:harshit886@ds115579.mlab.com:15579/shopping-list",
      JWT_SECRET : "addjsonwebtokensecretherelikeQuiscustodietipsoscustodes"
    }
  }