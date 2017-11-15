require('dotenv').config();

module.exports = {
  apilayer:{
    api_kay: process.env.API_KEY || '4b82d12fe8b4a37303ab386ea28c9241'
  },
  rest: {
    port: process.env.PORT || 8080
  }
};