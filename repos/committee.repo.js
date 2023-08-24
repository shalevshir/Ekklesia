const BaseRepo = require("../abstracts/repo.abstract");
const Committee = require("../models/committee.model");

class CommitteeRepo extends BaseRepo {
  constructor() {
    super(Committee);
  }

  async updateCommitteesFromKnessetApi() {
    const committees = await this.get();
    const committeesIds = committees.map((committee) => committee.name);
    // await this.createMany(committees);
  }
}

module.exports = new CommitteeRepo();
