import { BillRecord } from './../airtable/types/bill.airtable-type';
import BaseRepo from '../../abstracts/repo.abstract';
import BillModel, { Bill,  BillStatuses, BillStatusesOrder, Vote } from './bill.model';
import knessetApiService from '../../utils/knesset-api.service';
import committeeRepo from '../committee/committee.repo';
import _ from 'lodash';
import { connection } from '../../utils/db';
import PersonModel from '../person/person.model';
import logger from '../../utils/logger';
import personRepo from '../person/person.repo';
import mainCategoryRepo from '../category/mainCategory.repo';
import airtableService, { TableNames } from '../airtable/airtable.service';
import { Document } from 'mongoose';
import { SubCategoryRecord } from '../airtable/types/subCategory.airtable-type';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
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

  async fetchBillsFromKnesset() {
    const billsData = await knessetApiService.getBills();
    const chunks = _.chunk(billsData, 200);
    const updatedBills: any[] = [];
    for(const chunk of chunks) {
      logger.info(`Fetching ${ chunk.length } bills out of ${ billsData.length }`);
      const arrangedBills = await this.arrangeBills(chunk);
      logger.info(`Updating ${ arrangedBills.length } bills`);
      const updated = await this.updateMany(arrangedBills, { upsert: true });
      updatedBills.push(...updated.map(bill=>{
          return {
            _id: bill._id,
            createAt: bill.createdAt,
            updatedAt: bill.updatedAt
          }
        }
      ))
      const toPromise = [];
      logger.info(`Updating initiators for ${ updated.length } bills`);
      for (const bill of updated) {
        for (const initiator of bill.initiators) {
          toPromise.push(personRepo.findAndUpdate({ _id: initiator }, { $addToSet: { bills: bill._id } }));
        }
      }
      await Promise.all(toPromise);
    }
    logger.info(`Fetched ${ updatedBills.length } bills from knesset`);
    return updatedBills.map(this.mapUpsert);
  }

  async arrangeBills(bills: any[]) {
    logger.info(`Arranging ${ bills.length } bills`);
    const billsArranged: any[] = [];
    let billNumber = 1;
    for await (const bill of bills) {
      logger.info(`Arranging bill #${ billNumber++ } out of ${ bills.length }`, { billId: bill.BillID });
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
      billsArranged.push(arrangedBill);
    }
    logger.info('Arranged all bills');
    return billsArranged;
  }

  async updateBillsDocumentsLinks() {
    const bills = await this.model.find({  }).lean();
    const chunkSize = 200;
    const chunks = _.chunk(bills, chunkSize);
    const data = []
    for(let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      logger.info(`Getting bills links - Chunk ${ i + 1 } out of ${ chunks.length }`);
      const billsData = await knessetApiService.getBillsLinks(chunk);
      if (!billsData) {
        throw new Error('No bills found');
      }
      data.push(await this.updateMany(billsData, { upsert: true }));
      await wait(1000);
    }
    return data.map(this.mapUpsert);
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
          logger.info({
            message: `No stages found for bill #${ billNumber } out of ${ bills.length }`, billId: bill._id
          });
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

  async updateBillsCategories() {
    // const pathToFile = path.join(__dirname, '../../..', 'categorized.bills.csv');
    // const data = await readCsv(pathToFile);
    const billsInstance = airtableService.getTableInstance<BillRecord>(TableNames.Bills);
    const data = await billsInstance.fetch({filterByFormula: '{is Exist}=1'});
    const originIds = data.map((item) => item.get('originId'));
    const bills = await this.model.find({originId:originIds }) as Document<Bill>[];  
    const categoriesCollection = await mainCategoryRepo.find({},{populate:'subCategories'});
    const subCategoriesInstance = await airtableService.getTableInstance<SubCategoryRecord>(TableNames.SubCategories);
    logger.info({ message: `Updating categories for ${ bills.length } bills ` });
    let billNumber = 1;
    const toPromise = [];
    for (const bill of bills) {
      logger.info({ message: `Updating bill #${ billNumber } out of ${ bills.length }` , billId: bill._id });
      const billData = data.find((dataItem) => +dataItem.get('originId') === +bill.get('originId'));
      if (!billData) {
        logger.info(`No categories found for bill #${ billNumber } out of ${ bills.length }`, { billId: bill._id });
        billNumber++;
        continue;
      }
      const mainCategoriesToSet = [];
      const subCategoriesToSet = [];
      const categories = billData.get("categoriesNames");
      // if (billData['re-categorize']) {
      //   categoryText = billData['re-categorize'];
      // }
      for (const category of categories) {
        const categoryObj = categoriesCollection.find((categoryItem) => categoryItem.name === category);
        if(!categoryObj) continue
        
        mainCategoriesToSet.push(categoryObj._id);
        
        const subCategories = billData.get('Sub Categories');
        for (const subCategory of subCategories??[]) {
          const subCategoryData = await subCategoriesInstance.getById(subCategory);
          const subCategoriesList = categoryObj.subCategories as unknown as SubCategoryRecord[];
          const subCategoryObj = subCategoriesList?.find((subCategoryItem) => subCategoryItem.name === subCategoryData.get('name'));
          if(!subCategoryObj) {
            for(const categoryItem of categoriesCollection){
              const subCategoriesList = categoryItem.subCategories as unknown as SubCategoryRecord[];
              const subCategoryObj = subCategoriesList?.find((subCategoryItem) => subCategoryItem.name === subCategoryData.get('name'));
              if(subCategoryObj){
                subCategoriesToSet.push(subCategoryObj._id);
                break;
              }
            }
          }
          if(subCategoryObj){
            subCategoriesToSet.push(subCategoryObj._id);
          };  
        };
      };

      toPromise.push(this.model.findOneAndUpdate({ _id: bill._id },
        { mainCategories: mainCategoriesToSet, subCategories: subCategoriesToSet })
      );
      billNumber++;
    }
    await Promise.all(toPromise);
  }
}

export default new BillsRepo();
