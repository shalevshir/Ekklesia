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

  async fetchCommitteesFromKnessetApi() {
    const mainCommitteesFromApi = await knessetApiService.getMainCommittees();
    const arrangedCommittees = await this.arrangeCommittees(mainCommitteesFromApi);
    await this.findOrCreateMany(arrangedCommittees);
    
    const subCommitteesFromApi = await knessetApiService.getSubCommittees();
    const arrangedSubCommittees = await this.arrangeCommittees(subCommitteesFromApi);
    await this.findOrCreateMany(arrangedSubCommittees);
  }

  async arrangeCommittees(committees) {
    for await (const committee of committees) {
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

  async updateCommitteesMembers(persons) {
    const commetteesToPeson = [];
    for (const person of persons) {
      for (const committee of person.committees) {
        commetteesToPeson.push({
          committee: committee.committeeId,
          person: person._id,
        });
      }
    }
    for await (const committeeToPerson of commetteesToPeson) {
      await this.findAndUpdate(
        {
          _id: committeeToPerson.committee,
        },
        {
          $addToSet: { members: committeeToPerson.person },
        }
      );
    }
  }
}

module.exports = new CommitteeRepo();
