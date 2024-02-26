import BaseRepo from "../../abstracts/repo.abstract";
import personRepo from "../person/person.repo";
import BillModel, {Bill, StageSchema, Vote} from "./bill.model";
import knessetApiService from "../../utils/knesset-api.service";
import committeeRepo from "../committee/committee.repo";
import _ from "lodash";
import { connection } from "../../utils/db";
import PersonModel from "../person/person.model";
import logger from "../../utils/logger";
class BillsRepo extends BaseRepo<Bill> {
  constructor() {
    super(BillModel);
  }
  types: Record<number,string>  = {
    54: "private",
    53: "governmental",
    55: "committee",
  };
  statuses: Record<number,string> = {
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
    await this.findOrCreate(arrangedBills);
  }
  async arrangeBills(bills: any[]) {
    let billsArranged: any[] = [];
    for await (const bill of bills) {
      bill.initiator = [];
      const billType: string = this.types[bill.SubTypeID];
      const billStatus: string = this.statuses[bill.StatusID];
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
    const bills = await this.find({});
    const billsIds:number[] = bills.map((bill: any) => bill.originId) as number[];
    const billsData = await knessetApiService.getBillsLinks(billsIds);
    if(!billsData) {
      throw new Error("No bills found");
    }
    await this.updateMany(billsData);
  }
  async updateBillStages() {
    try {
      const rawDataCollection = connection.collection('rawData');
      const bills = await this.find({ categories: { $ne: null } });
  
      for (const bill of bills) {
        const billData = await rawDataCollection.find({ 'Item ID': +bill.originId }).toArray();
        if (!billData.length) continue;
  
        const stagesGroupedBySession = _.groupBy(billData, 'Session ID');
        const personIds = new Set(billData.filter(data => data['MK ID']).map(data => data['MK ID']));
        const personIdToDbIdMap = new Map();
  
        // Fetch all persons in parallel
        const persons = await Promise.all([...personIds].map(id => 
          PersonModel.findOne({ originId: +id }).then(person => person && personIdToDbIdMap.set(id, person._id))
        ));
  
        const mappedStages = Object.entries(stagesGroupedBySession).map(([stageId, votes]) => {
          if(!votes.length) return;
          const filteredVotes = votes.filter(vote => vote['MK ID'] && personIdToDbIdMap.has(vote['MK ID'])).map(vote => ({
            person: personIdToDbIdMap.get(vote['MK ID']),
            vote: vote['הצבעה'] === 'בעד' ? Vote.FOR : Vote.AGAINST,
          }));
  
          return {
            date: new Date(votes[0]['תאריך']),
            votes: filteredVotes,
            sessionId: stageId,
          };
        }).filter(stage => !!stage);
  
        bill.stages = mappedStages as StageSchema[];
        await bill.save();
      }
    } catch (error) {
      logger.error("Error in updateBillStages", error);
      throw error;
    }
  }  
}

export default new BillsRepo();
