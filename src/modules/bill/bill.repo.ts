import { DocumentType } from '@typegoose/typegoose';
import BaseRepo from '../../abstracts/repo.abstract';
import BillModel, { Bill, BillStatuses, BillStatusesOrder, Vote } from './bill.model';
import knessetApiService from '../../utils/knesset-api.service';
import committeeRepo from '../committee/committee.repo';
import _ from 'lodash';
import { connection } from '../../utils/db';
import PersonModel from '../person/person.model';
import logger from '../../utils/logger';
import { getFileAsText } from '../../utils/files.service';
import embeddingService from '../../utils/embedding.service';
import { RunHistory, RunStatuses } from '../runHistory/runHistory.model';
import personRepo from '../person/person.repo';

class BillsRepo extends BaseRepo<Bill> {
  constructor() {
    super(BillModel);
  }
  types: Record<number, string> = {
    54: 'private',
    53: 'governmental',
    55: 'committee'
  };
  statuses: Record<number, string> = {
    101: 'preparationForFirstVote',
    104: 'onTableForEarlyDiscussion',
    106: 'inKnessetCommittee',
    108: 'preparationForFirstVote',
    109: 'approvedInCommitteeForFirstVote',
    110: 'requestForContinuousVoteDeniedInPlenum',
    111: 'inPlenumForFirstVote',
    113: 'preparationForSecondAndThirdVote',
    114: 'inPlenumForSecondAndThirdVote',
    115: 'returnedToCommitteeForPreparationForThirdVote',
    117: 'inPlenumForThirdVote',
    118: 'approvedInPlenumForThirdVote',
    120: 'inPlenumForContinuousVote',
    122: 'mergedWithAnotherBill',
    124: 'movedToOrderOfTheDay',
    126: 'splitForEarlyDiscussion',
    130: 'onTableForSecondAndThirdVote',
    131: 'onTableForThirdVote',
    140: 'removedFromOrderOfTheDayByCommitteeRequest',
    141: 'onTableForFirstVote',
    142: 'inKnessetCommittee',
    143: 'removedFromOrderOfTheDayByCommitteeRequest',
    150: 'inPlenumForEarlyDiscussion',
    158: 'splitInPlenum',
    161: 'splitInPlenum',
    162: 'splitInPlenum',
    165: 'splitInPlenum',
    167: 'approvedInCommitteeForFirstVote',
    169: 'mergedInKnessetCommittee',
    175: 'inCommitteeForContinuousVote',
    176: 'requestForContinuousVoteDeniedInCommittee',
    177: 'stopped',
    178: 'approvedInCommitteeForSecondAndThirdVote',
    179: 'approvedInCommitteeForSecondAndThirdVote'
  };
  statusIdToEnumMap: Record<number, BillStatuses> = {
    // נעצרה
    177: BillStatuses.stopped,
    // מוזגה עם הצעת חוק אחרת
    122: BillStatuses.notInLegislation,
    // הבקשה לדין רציפות נדחתה במליאה
    110: BillStatuses.notInLegislation,
    // הבקשה לדין רציפות נדחתה בוועדה
    176: BillStatuses.notInLegislation,
    // לדיון במליאה על החלת דין רציפות
    120: BillStatuses.notInLegislation,
    // בדיון בוועדה על החלת דין רציפות
    175: BillStatuses.notInLegislation,
    // לאישור מיזוג בוועדת הכנסת
    169: BillStatuses.notInLegislation,
    // להסרה מסדר היום לבקשת ועדה
    140: BillStatuses.notInLegislation,
    // לאישור פיצול במליאה
    158: BillStatuses.notInLegislation,
    // לאישור פיצול במליאה
    162: BillStatuses.notInLegislation,
    // הוסבה להצעה לסדר היום
    124: BillStatuses.notInLegislation,
    // הונחה על שולחן הכנסת לדיון מוקדם
    104: BillStatuses.onTable,
    // במליאה לדיון מוקדם
    150: BillStatuses.earlyDiscussion,
    // בוועדת הכנסת לקביעת הוועדה המטפלת
    106: BillStatuses.preparationForFirstVote,
    // בוועדת הכנסת לקביעת הוועדה המטפלת
    142: BillStatuses.preparationForFirstVote,
    // הכנה לקריאה ראשוונה
    108: BillStatuses.preparationForFirstVote,
    // הכנה לקריאה ראשוונה
    101: BillStatuses.preparationForFirstVote,
    // אושרה בוועדה לקריאה ראשונה
    109: BillStatuses.preparationForFirstVote,
    // לדיון במליאה לקראת הקריאה הראשונה
    111: BillStatuses.preparationForFirstVote,
    // הונחה על שולחן הכנסת לקריאה ראשונה
    141: BillStatuses.firstVote,
    // הכנה לקריאה שנייה ושלישית
    113: BillStatuses.preparationForSecondThirdVote,
    // אושרה בוועדה לקריאה שנייה-שלישית
    178: BillStatuses.preparationForSecondThirdVote,
    // הונחה על שולחן הכנסת לקריאה שנייה-שלישית
    130: BillStatuses.preparationForSecondThirdVote,
    // לדיון במליאה לקראת קריאה שנייה-שלישית
    114: BillStatuses.secondThirdVote,
    // הוחזרה לוועדה להכנה לקריאה שלישית
    115: BillStatuses.thirdVote,
    // הונחה על שולחן הכנסת לקריאה שלישית
    131: BillStatuses.thirdVote,
    // לדיון במליאה לקראת קריאה שלישית
    117: BillStatuses.thirdVote,
    // התקבלה בקריאה שלישית
    118: BillStatuses.approved
  };

  async fetchBillsFromKnesset(run: DocumentType<RunHistory>) {
    const billsData = await knessetApiService.getBills();
    const arrangedBills = await this.arrangeBills(billsData);
    const updatedBills = await this.updateMany(arrangedBills, { upsert: true });

    await run.endRun({
      status: RunStatuses.SUCCESS,
      log: {
        message: `${ arrangedBills.length } bills fetched successfully`,
        billsIds: updatedBills.map((bill) => ({ _id: bill._id, created: bill.isNew }))
      }
    });
  }

  async arrangeBills(bills: any[]) {
    logger.info(`Arranging ${ bills.length } bills`);
    const billsArranged: any[] = [];
    for await (const bill of bills) {
      logger.info(`Arranging bill ${ bill.BillID }`);
      bill.initiator = [];
      const billType: string = this.types[bill.SubTypeID];

      const billStatus: BillStatuses = this.statusIdToEnumMap[bill.StatusID];
      const billStatusOrder = BillStatusesOrder[billStatus];
      const committee = await committeeRepo.findOne({
        originId: bill.CommitteeID
      });
      for await (const initiator of bill.KNS_BillInitiators) {
        const person = await personRepo.findOne({
          originId: initiator.PersonID
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
        statusOrder: billStatusOrder,
        date: bill.LastUpdatedDate,
        number: bill.Number,
        pNumber: bill.PrivateNumber,
        committee: committee ? committee._id : null,
        initiators: bill.initiator
      };
      logger.info(`Arranged bill ${ bill.BillID }`);
      billsArranged.push(arrangedBill);
    }
    logger.info('Arranged all bills');
    return billsArranged;
  }

  async updateBillsFromKnesset() {
    const bills = await this.find({});
    const billsIds: number[] = bills.map((bill: any) => bill.originId) as number[];
    const billsData = await knessetApiService.getBillsLinks(billsIds);
    if (!billsData) {
      throw new Error('No bills found');
    }
    await this.updateMany(billsData);
  }

  async updateBillsDocumentsLinks() {
    const bills = await this.model.find({ categories: { $ne: null } }).lean();
    const billsIds: number[] = bills.map((bill: any) => bill.originId) as number[];
    const billsData = await knessetApiService.getBillsLinks(billsIds);
    if (!billsData) {
      throw new Error('No bills found');
    }
    await this.updateMany(billsData);
  }

  async updateBillsStages() {
    try {
      const rawDataCollection = connection.collection('rawVotesData');
      // Filter by status when we know relevant statuses
      const bills = await this.model.find({ categories: { $ne: null } }).lean() as any[];
      logger.info({ message: `Updating stages for ${ bills.length } bills ` });
      let billNumber = 1;
      const toPromise = [];
      for (const bill of bills) {
        logger.info({ message: `updating bill #${ billNumber } out of ${ bills.length }`, billId: bill._id });
        const billData = await rawDataCollection.find({ 'Item ID': +bill.originId }).toArray();
        if (!billData.length) {
          logger.info({ message: `No stages found for bill #${ billNumber } out of ${ bills.length }`, billId: bill._id });
          billNumber++;
          continue;
        }

        const stagesGroupedBySession = _.groupBy(billData, 'Vote ID');
        const personIds = new Set(billData.filter((data) => data['MK ID']).map((data) => data['MK ID']));
        const personIdToDbIdMap = new Map();

        await Promise.all([ ...personIds ].map((id) =>
          PersonModel.findOne({ originId: +id }).then((person) => person && personIdToDbIdMap.set(id, person._id))
        ));

        const mappedStages = Object.entries(stagesGroupedBySession).map(([ stageId, votes ]) => {
          if (!votes.length) return;
          const filteredVotes = votes.filter((vote) => vote['MK ID'] && personIdToDbIdMap.has(vote['MK ID'])).map((vote) => ({
            person: personIdToDbIdMap.get(vote['MK ID']),
            vote: vote['הצבעה'] === 'בעד' ? Vote.FOR : Vote.AGAINST,
            originId: vote['Vote ID'],
            sessionId: vote['Session ID']
          }));

          return {
            date: new Date(votes[0]['תאריך']),
            votes: filteredVotes
          };
        }).filter((stage) => !!stage);

        toPromise.push(this.model.findOneAndUpdate({ _id: bill._id }, { stages: mappedStages }));
        billNumber++;
        logger.info({ message: `Update stages for bill #${ billNumber } completed`, billId: bill._id });
      }
    } catch (error) {
      logger.error({ message: 'Error in updateBillStages', error });
      throw error;
    }
  }

  async embedBills() {
    const bills = await this.model.find<DocumentType<Bill>>({ categories: { $ne: null } }).lean();
    logger.info({ message: `Embedding ${ bills.length } bills ` });
    let billNumber = 1;
    const toPromise = [];
    for (const bill of bills) {
      logger.info({ message: `Embedding bill #${ billNumber } out of ${ bills.length }`, billId: bill._id });
      let query = '';
      if (bill.billLink) {
        const textData = await getFileAsText(bill.billLink);
        if (textData) {
          query = textData;
        }
      } else {
        query = bill.name;
        if (bill.summary) {
          query += ` ${ bill.summary }`;
        }
      }
      const embeddedData = await embeddingService.embedData(query);
      toPromise.push(this.model.findOneAndUpdate({ _id: bill._id }, { vector: embeddedData }));
      logger.info({ message: `Embedding bill #${ billNumber++ } completed`, billId: bill._id });
    }
    await Promise.all(toPromise);
  }
}

export default new BillsRepo();
