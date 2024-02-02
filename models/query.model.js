const { Schema, default: mongoose } = require("mongoose");

const QuerySchema = new Schema({
  name: String,
  originId: String,
  queryLink: String,
  replyLink: String,
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
  submitter: {
    type: Schema.Types.ObjectId,
    ref: "Person",
  },
  replyMinistry: {
    type: Schema.Types.ObjectId,
    ref: "Ministry",
  },
  categories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
  }],
});

const Query = mongoose.model("Query", QuerySchema);

module.exports = Query;
