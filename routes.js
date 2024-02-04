

const committeeRepo = require("./src/repos/committee.repo");
const CommitteeSessionsRepo = require("./src/repos/committeeSession.repo");
const queryRepo = require("./src/repos/query.repo");
const personRepo = require("./src/repos/person.repo");
const billRepo = require("./src/repos/bill.repo");
const categoriesRepo = require("./src/repos/category.repo");

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

  exports.getCategories = async (req, res) => {
    const categories = await categoriesRepo.getAllCategories();
    res.send(categories);
  };

  exports.getSubCategories = async (req, res) => {
    const subCategories = await categoriesRepo.getSubCategories(req.params.categoryName);
    res.send(subCategories);
  }

  exports.getNextQuery = async (req, res) => {
    const query = await queryRepo.getNextQuery();
    res.send(query);
  }

  exports.addCategoryToQuery = async (req, res) => {  
    const query = await queryRepo.addCategoryToQuery(req.body.documentId, req.body.categories);
    res.send(query);
  }