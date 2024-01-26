const { Schema, default: mongoose } = require("mongoose");

const voteSchema =
  {
    person: {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
    vote: {
      type: String,
      enum: ["for", "against", "abstain", "no-vote"],
    },
  };
const billsSchema = new Schema(
  {
    originId: String,
    name: String,
    number: Number,
    pNumber: Number,
    displayName: String,
    summary: String,
    topic: String,
    billLink: String,
    type: {
      type: String,
      enum: ["governmental", "private", "committee"],
    },
    status: String,
    date: Date,
    committee: {
      type: Schema.Types.ObjectId,
      ref: "Committee",
    },
    initiators: [
      {
        type: Schema.Types.ObjectId,
        ref: "Person",
      },
    ],
    stages: [
      {
        name: {
          type: String,
          enum: [
            "first-reading",
            "second-reading",
            "committee",
            "third-reading",
          ],
        },
        description: String,
        date: Date,
        votes: [ voteSchema ],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Bills = mongoose.model("Bills", billsSchema);

module.exports = Bills;
