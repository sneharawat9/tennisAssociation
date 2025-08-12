const mongoose = require("mongoose");

const RegistrationSchema = new mongoose.Schema({
  player1: {
    name: String,
    whatsapp: String,
    dob: String,
    city: String,
    tshirt: String,
    shorts: String,
    food: String,
    stay: String,
  },
  player2: {
    name: String,
    whatsapp: String,
    dob: String,
    city: String,
  },
  category: String,

  //  field to track lucky eligibility
  luckyEligible: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Registration", RegistrationSchema);
