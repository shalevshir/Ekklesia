

const committeeRepo = require("./repos/committee.repo");
const CommitteeSessionsRepo = require("./repos/committeeSession.repo");
const queryRepo = require("./repos/query.repo");
const personRepo = require("./repos/person.repo");
const billRepo = require("./repos/bill.repo");

const wait = async (seconds) => {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  };
  

exports.fetchMks = async (req, res) => {
    await personRepo.createPersonFromKnessetApi();
  
    res.send("done");
  };
  
  exports.fetchCommittees = async (req, res) => {
    await committeeRepo.fetchCommitteesFromKnessetApi();
  
    res.send("done");
  };
  
  exports.updateCommitteesMembers = async (req, res) => {
    const persons = await personRepo.find();
    await committeeRepo.updateCommitteesMembers(persons);
    res.send("done");
  };
  
  exports.fetchCommitteesSessions = async (req, res) => {
    const committees = await committeeRepo.find();
    for await (const committee of committees) {
      await CommitteeSessionsRepo.fetchCommitteesSessions(committee.originId);
      await wait(0.3);
    }
    res.send("done");
  };
  
  exports.updateSessionsInCommittees = async (req, res) => {
    const committees = await committeeRepo.find();
    const toPromise = [];
    for await (const committee of committees) {
      const sessions = await CommitteeSessionsRepo.find({
        committee: committee._id,
      });
      const sessionsIds = sessions.map((session) => session._id);
      committee.sessions = sessionsIds;
      toPromise.push(committee.save());
    }
    await Promise.all(toPromise);
    res.send("done");
  };
  
  exports.fetchQueries = async (req, res) => {
    await queryRepo.fetchQueriesFromKnesset();
    res.send("done");
  };
  
  exports.fetchBills = async (req, res) => {
    await billRepo.fetchBillsFromKnesset();
    res.send("done");
  };
  
  exports.updateBills = async (req, res) => {
    await billRepo.updateBillsFromKnesset();
    res.send("done");
  };