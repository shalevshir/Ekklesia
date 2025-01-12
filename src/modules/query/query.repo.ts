import BaseRepo from '../../abstracts/repo.abstract';
import QueryModel, { Query } from './query.model';
import knessetApiService from '../../utils/knesset-api.service';
import personRepo from '../person/person.repo';
import ministryRepo from '../ministry/ministry.repo';
import logger from '../../utils/logger';

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
class QueryRepo extends BaseRepo<Query> {
  typesEnum: Record<number, string> = {
    48: 'regular',
    50: 'urgent',
    49: 'direct'
  };
  statusEnum: Record<number, string> = {
    6: 'pending',
    9: 'answered'
  };
  constructor() {
    super(QueryModel);
  }
  async fetchQueriesFromKnesset() {
    let allArrangedQueries:any[] = [];
    const pageSize = 100;
    let skip = 0;
    let queriesData;
    do {
      queriesData = await knessetApiService.getQueries(pageSize, skip);
      if (queriesData?.length) {
        const arrangedQueries = await this.arrangeQueries(queriesData);
        allArrangedQueries = allArrangedQueries.concat(arrangedQueries);
        skip += 100;
      }
    } while (queriesData?.length === 100);

    if (!allArrangedQueries.length) {
      logger.info('No queries found');
      return [];
    }
    logger.info({ message: `fetched and arranged ${ allArrangedQueries.length } queries from knesset` });
    const data = await this.updateMany(allArrangedQueries, { upsert: true });
    const toPromise = allArrangedQueries.map((query) => {
      return personRepo.findAndUpdate({ _id: query.submitter }, { $addToSet: { queries: query._id } });
    });
    await Promise.all(toPromise);
    return data.map(this.mapUpsert);
  }

  async arrangeQueries(queries: any[]): Promise<Partial<Query>[]> {
    let queryNumber = 1;
    const queriesToSave = [];
    // queries = queries.splice(0, 3);
    for (const query of queries) {
      logger.info({
        message: `Mapping query #${ queryNumber } out of ${ queries.length }`, queryOriginId: query.QueryID
      });
      if (!query.QueryID) {
        query.QueryID = query.Id;
      }
      const ministry = await ministryRepo.findOne({
        name: query.KNS_GovMinistry.Name
      });
      if (!ministry && query.KNS_GovMinistry.IsActive === true) {
        throw new Error(`Ministry ${ query.KNS_GovMinistry.Name } not found`);
      }
      query.replyMinistry = ministry?._id;
      // const categoryByMinistry = ministryRepo.getCategoryByMinistryName(query.KNS_GovMinistry.Name);
      // query.categories = categoryByMinistry ? [ categoryByMinistry ] : [];
      const documents = await knessetApiService.getQueriesDocuments(query.Id);
      for ( const document of documents ? documents : []) {
        if (document && document.GroupTypeDesc === 'שאילתה') {
          query.queryLink = document.FilePath;
        } else if (document && document.GroupTypeDesc === 'תשובת השר') {
          query.replyLink = document.FilePath;
        } else {
          throw new Error(`Document (ID:${ document.Id }) type(${ document.GroupTypeDesc }) not recognized`);
        }
      }

      const person = await personRepo.findOne({ originId: query.PersonID });
      if (person) {
        query.PersonID = person?._id;
      } else {
        delete query.PersonID;
      }
      const queryToSend: Partial<Query> = {
        originId: query.QueryID,
        name: query.Name,
        type: this.typesEnum[query.TypeID],
        submitDate: query.SubmitDate,
        replyDate: query.ReplyMinisterDate,
        status: this.statusEnum[query.StatusID],
        submitter: query.PersonID,
        replyMinistry: query.replyMinistry,
        queryLink: query.queryLink,
        replyLink: query.replyLink
        // categories: query.categories
      };

      logger.info({ message: `Query #${ queryNumber } mapped`, query: queryToSend });

      queriesToSave.push(queryToSend);
      queryNumber++;
      await wait(1000);
    }
    return queriesToSave;
  }

  async getNextQuery() {
    // categories not exist or empty array

    const query = await this.findOne({ '$or': [ { 'categories': { '$exists': false } }, { 'categories': [] } ] }, { populate: 'replyMinistry' });
    return query;
  }

  // async addCategoryToQuery(queryId: number, categories: any[]) {
  //   const queryObj = await this.findOne({ _id: queryId });
  //   const toSave = [];
  //   if (!queryObj) {
  //     throw new Error(`Query ${ queryId } not found`);
  //   }
  //   for (const category of categories) {
  //     const { subCategoryId, mainCategory, subCategoryName } = category;
  //     if (subCategoryId) {
  //       const subCategoryObj = await categoryRepo.findOne({
  //         _id: subCategoryId
  //       });
  //       if (!subCategoryObj) {
  //         throw new Error(`Category ${ subCategoryId } not found`);
  //       }
  //       toSave.push(subCategoryObj._id);
  //     } else {
  //       // create new category
  //       const newCategory = await categoryRepo.create({
  //         name: subCategoryName,
  //         isMainCategory: false
  //       });
  //       await categoryRepo.update({ name: mainCategory }, { $push: { subCategories: newCategory._id } });
  //       toSave.push(newCategory._id);
  //     }
  //   }
  //   await queryObj.updateOne({ categories: toSave });
  //   return queryObj;
  // }
}

export default new QueryRepo();
