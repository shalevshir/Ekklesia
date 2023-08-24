const connectDB = require("./config/db");
const committeeRepo = require("./repos/committee.repo");
const personRepo = require("./repos/person.repo");

// Connect Database
connectDB();
exports.fetchKms = async (req, res) => {
  await personRepo.createPersonFromKnessetApi();

  res.send("done");
};

exports.updateCommittees = async (req, res) => {
  await committeeRepo.updateCommitteesFromKnessetApi();

  res.send("done");
};
