const BaseRepo = require("../abstracts/repo.abstract");
const personRepo = require("./person.repo");
const Bills = require("../models/bills.model");
const knessetApiService = require("../services/knesset-api.service");
const committeeRepo = require("./committee.repo");
const _ = require("lodash");
class BillsRepo extends BaseRepo {
  constructor() {
    super(Bills);
  }
  types = {
    54: "private",
    53: "governmental",
    55: "committee",
  };
  statuses = {
    101: "preparationForFirstVote",
    104: "onTableForEarlyDiscussion",
    106: "inKnessetCommittee",
    108: "preparationForFirstVote",
    109: "approvedInCommitteeForFirstVote",
    110: "requestForContinuousVoteDeniedInPlenum",
    111: "inPlenumForFirstVote",
    113: "preparationForSecondAndThirdVote",
    114: "inPlenumForSecondAndThirdVote",
    115: "returnedToCommitteeForPreparationForThirdVote",
    117: "inPlenumForThirdVote",
    118: "approvedInPlenumForThirdVote",
    120: "inPlenumForContinuousVote",
    122: "mergedWithAnotherBill",
    124: "movedToOrderOfTheDay",
    126: "splitForEarlyDiscussion",
    130: "onTableForSecondAndThirdVote",
    131: "onTableForThirdVote",
    140: "removedFromOrderOfTheDayByCommitteeRequest",
    141: "onTableForFirstVote",
    142: "inKnessetCommittee",
    143: "removedFromOrderOfTheDayByCommitteeRequest",
    150: "inPlenumForEarlyDiscussion",
    158: "splitInPlenum",
    161: "splitInPlenum",
    162: "splitInPlenum",
    165: "splitInPlenum",
    167: "approvedInCommitteeForFirstVote",
    169: "mergedInKnessetCommittee",
    175: "inCommitteeForContinuousVote",
    176: "requestForContinuousVoteDeniedInCommittee",
    177: "stopped",
    178: "approvedInCommitteeForSecondAndThirdVote",
    179: "approvedInCommitteeForSecondAndThirdVote",
  };
  async fetchBillsFromKnesset() {
    const billsData = await knessetApiService.getBills();
    const arrangedBills = await this.arrangeBills(billsData);
    await this.findOrCreateMany(arrangedBills);
  }
  async arrangeBills(bills) {
    let billsArranged = [];
    for await (const bill of bills) {
      bill.initiator = [];
      const billType = this.types[bill.SubTypeID];
      const billStatus = this.statuses[bill.StatusID];
      const committee = await committeeRepo.findOne({
        originId: bill.CommitteeID,
      });
      for await (const initiator of bill.KNS_BillInitiators) {
        const person = await personRepo.findOne({
          originId: initiator.PersonID,
        });
        if (!person) continue;

        bill.initiator.push(person._id);
      }
      const arrangedBill = {
        originId: bill.BillID,
        name: bill.Name,
        topic: bill.Topic,
        summary: bill.SummaryLaw,
        type: billType,
        status: billStatus,
        date: bill.LastUpdatedDate,
        number: bill.Number,
        pNumber: bill.PrivateNumber,
        committee: committee ? committee._id : null,
        initiators: bill.initiator,
      };
      billsArranged.push(arrangedBill);
    }
    return billsArranged;
  }

  async updateBillsFromKnesset() {
    const bills = await this.find();
    const billsIds = bills.map((bill) => bill.originId);
    const billsData = await knessetApiService.getBillsLinks(billsIds);

    await this.updateMany(billsData);
  }
}

module.exports = new BillsRepo();
