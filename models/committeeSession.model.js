const { Schema, default: mongoose } = require("mongoose");

// committee sessions model
const committeeSessionSchema = new Schema(
  {
    originId: {
      type: String,
      unique: true,
    },
    date: Date,
    topic: String,
    sessionNumber: Number,
    type: {
      type: String,
      enum: ["open", "tour", "secret"],
    },
    status: String,
    broadcastUrl: String,
    sessionUrl: String,
    transcriptUrl: String,
    committee: {
      type: Schema.Types.ObjectId,
      ref: "Committee",
    },
    bills: [
      {
        type: Schema.Types.ObjectId,
        ref: "Bills",
      },
    ],
    attendees: [
      {
        person: {
          type: Schema.Types.ObjectId,
          ref: "Person",
        },
        role: {
          type: String,
          enum: ["chairman", "member", "guest"],
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);
committeeSessionSchema.pre("insertMany", function (next, docs) {
  docs.forEach((doc) => {
    if (doc.type === "פתוחה") {
      doc.type = "open";
    } else if (doc.type === "סיור") {
      doc.type = "tour";
    } else if (doc.type === "סודי") {
      doc.type = "secret";
    }
  });
  next();
});

const CommitteeSession = mongoose.model(
  "CommitteeSession",
  committeeSessionSchema
);

module.exports = CommitteeSession;
