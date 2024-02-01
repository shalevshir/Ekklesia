const { ObjectId } = require("mongoose/lib/types");
const BaseRepo = require("../abstracts/repo.abstract");
const Query = require("../models/query.model");
const knessetApiService = require("../services/knesset-api.service");
const personRepo = require("./person.repo");
const ministryRepo = require("./ministry.repo");

class QueryRepo extends BaseRepo {
  typesEnum = {
    48: "regular",
    50: "urgent",
    49: "direct",
  };
  statusEnum = {
    6: "pending",
    9: "answered",
  };
  constructor() {
    super(Query);
  }
  async fetchQueriesFromKnesset() {
    const queriesData = await knessetApiService.getQueries();
    const arrangedQueries = await this.arrangeQueries(queriesData);
    await this.findOrCreateMany(arrangedQueries);
  }
  async arrangeQueries(queries) {
    for await (const query of queries) {
      const ministry = await ministryRepo.findOne({
        name: query.KNS_GovMinistry.Name,
      });
      if(!ministry && query.KNS_GovMinistry.IsActive === true){
        throw new Error(`Ministry ${query.KNS_GovMinistry.Name} not found`);
      }
      query.replyMinister = ministry?._id;

      for( let document of query.KNS_DocumentQueries){
        if (document && document.GroupTypeDesc === "שאילתה") {
          query.queryLink = document.FilePath;
        }
        if(document && document.GroupTypeDesc === "תשובת השר"){
          query.replyLink = document.FilePath;
        }
      } 

      const person = await personRepo.findOne({ originId: query.PersonID });
      if (person) {
        query.PersonID = new ObjectId(person._id);
      }else{
        delete query.PersonID;
      }
    }
    return queries.map((query) => ({
      originId: query.QueryID,
      name: query.Name,
      type: this.typesEnum[query.TypeID],
      submitDate: query.SubmitDate,
      replyDate: query.ReplyMinisterDate,
      status: this.statusEnum[query.StatusID],
      submitter: query.PersonID,
      replyMinister: query.replyMinister,
      queryLink: query.queryLink,
    }));
  }
}

module.exports = new QueryRepo();
