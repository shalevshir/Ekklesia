const { default: mongoose, Schema } = require("mongoose");

const CommitteeSchema = new Schema(
  {
    name: String,
    displayName: String,
    description: String,
    originId: String,
    type: {
      type: String,
      enum: ["main", "sub", "special", "joint", "knesset"],
    },
    subType: {
      type: String,
      enum: ["permanent", "special", "investigation"],
    },
    email: String,
    parentCommittee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Committee",
    },
    headOfCommittee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Person",
    },
    knessetNum: Number,
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Person",
      },
    ],
    sessions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "CommitteeSession",
      },
    ],
    bills: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Bills",
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Committee = mongoose.model("Committee", CommitteeSchema);

module.exports = Committee;
