require('dotenv').config();

module.exports = {
  env: {
    API_KEY: process.env.API_KEY,
    FORM_ID: process.env.FORM_ID,
    BASE_URL: process.env.BASE_URL,
  },
};
