const { Schema, default: mongoose } = require("mongoose");

const votesSchema = [
  {
    person: {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
    vote: {
      type: String,
      enum: ["for", "against", "abstain", "no-vote"],
    },
  },
];
const billsSchema = new Schema(
  {
    originId: String,
    name: String,
    displayName: String,
    topic: String,
    description: String,
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
    initiator: {
      type: Schema.Types.ObjectId,
      ref: "Person",
    },
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
        votes: votesSchema,
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Bills = mongoose.model("Bills", billsSchema);

module.exports = Bills;
