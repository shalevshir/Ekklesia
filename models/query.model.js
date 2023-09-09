const { Schema, default: mongoose } = require("mongoose");

const QuerySchema = new Schema({
  name: String,
  originId: String,
  type: {
    type: String,
    enum: [],
  },
  description: String,
  status: {
    type: String,
    enum: ["pending", "answered"],
  },
  submitDate: Date,
  replyDate: Date,
  submitter: Number,
  replyMinister: Number,
});

const Query = mongoose.model("Query", QuerySchema);

module.exports = Query;
