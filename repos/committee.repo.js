const BaseRepo = require("../abstracts/repo.abstract");
const Committee = require("../models/committee.model");
const knessetApiService = require("../services/knesset-api.service");
const _ = require("lodash");
class CommitteeRepo extends BaseRepo {
  typeEnum = {
    70: "knesset",
    71: "main",
    72: "special",
    73: "joint",
  };

  subTypeEnum = {
    991: "permanent",
    72: "special",
    993: "investigation",
  };

  constructor() {
    super(Committee);
  }

  async updateCommitteesFromKnessetApi() {
    const committees = await this.find();
    const committeesIds = committees.map((committee) => committee.originId);
    const committeesFromApi = await knessetApiService.getCommittees(
      committeesIds
    );
    const arrangedCommittees = await this.arrangeCommittees(committeesFromApi);
    await this.updateMany(arrangedCommittees);
  }

  async arrangeCommittees(committees) {
    for (const committee of committees) {
      if (committee.ParentCommitteeID) {
        const parentCommittee = await this.findOne({
          originId: committee.ParentCommitteeID,
        });
        _.set(committee, "parentCommittee", parentCommittee._id);
      }
    }

    return committees.map((committee) => ({
      name: committee.Name,
      originId: committee.CommitteeID,
      email: committee.Email,
      type: this.typeEnum[committee.CommitteeTypeID],
      subType: this.subTypeEnum[committee.AdditionalTypeID],
      parentCommittee: committee.parentCommittee,
      knessetNum: committee.KnessetNum,
    }));
  }
}

module.exports = new CommitteeRepo();
