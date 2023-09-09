const { ObjectId } = require("mongoose/lib/types");
const BaseRepo = require("../abstracts/repo.abstract");
const Query = require("../models/query.model");
const knessetApiService = require("../services/knesset-api.service");

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
    const arrangedQueries = this.arrangeQueries(queriesData);
    await this.findOrCreateMany(arrangedQueries);
  }
  arrangeQueries(queries) {
    return queries.map((query) => ({
      originId: query.QueryID,
      name: query.Name,
      type: this.typesEnum[query.TypeID],
      submitDate: query.SubmitDate,
      replyDate: query.ReplyMinisterDate,
      status: this.statusEnum[query.StatusID],
      submitter: query.PersonID,
      replyMinister: query.GovMinistryID,
    }));
  }
}

module.exports = new QueryRepo();
