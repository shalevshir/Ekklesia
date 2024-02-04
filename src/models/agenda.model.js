const { Schema, default: mongoose } = require("mongoose");

const AgendaSchema = new Schema({
  originId: { type: Number, required: true },
  name: { type: String, required: true },
  
});
