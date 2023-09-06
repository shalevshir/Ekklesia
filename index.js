const connectDB = require("./config/db");
const committeeRepo = require("./repos/committee.repo");
const CommitteeSessionsRepo = require("./repos/committeeSession.repo");
const personRepo = require("./repos/person.repo");
const wait = async (seconds) => {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
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

exports.updateCommitteesMembers = async (req, res) => {
  const persons = await personRepo.find();
  await committeeRepo.updateCommitteesMembers(persons);
  res.send("done");
};

exports.fetchCommitteesSessions = async (req, res) => {
  const committees = await committeeRepo.find();
  for (const committee of committees) {
    await CommitteeSessionsRepo.fetchCommitteesSessions(committee.originId);
    await wait(0.3);
  }
  res.send("done");
};
