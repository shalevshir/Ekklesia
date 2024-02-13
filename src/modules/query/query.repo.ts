import BaseRepo from "../../abstracts/repo.abstract";
import QueryModel, { Query } from "./query.model";
import knessetApiService from "../../utils/knesset-api.service";
import personRepo from "../person/person.repo";
import ministryRepo from "../ministry/ministry.repo";
import categoryRepo from "../category/category.repo";

class QueryRepo extends BaseRepo<Query> {
  typesEnum: Record<number,string> = {
    48: "regular",
    50: "urgent",
    49: "direct",
  };
  statusEnum: Record<number,string> = {
    6: "pending",
    9: "answered",
  };
  constructor() {
    super(QueryModel);
  }
  async fetchQueriesFromKnesset() {
    const queriesData = await knessetApiService.getQueries();
    const arrangedQueries = await this.arrangeQueries(queriesData);
    await this.updateMany(arrangedQueries, { upsert:true});
  }

  async arrangeQueries(queries: any[]) {
    for await (const query of queries) {
      if(!query.QueryID){
        query.QueryID = query.Id;
      }
      const ministry = await ministryRepo.findOne({
        name: query.KNS_GovMinistry.Name,
      });
      if(!ministry && query.KNS_GovMinistry.IsActive === true){
        throw new Error(`Ministry ${query.KNS_GovMinistry.Name} not found`);
      }
      query.replyMinistry = ministry?._id;
      const documents = await knessetApiService.getQueriesDocuments(query.Id);
      for( let document of documents ? documents : []){
        if (document && document.GroupTypeDesc === "שאילתה") {
          query.queryLink = document.FilePath;
        }else if(document && document.GroupTypeDesc === "תשובת השר"){
          query.replyLink = document.FilePath;
        }else {
          throw new Error(`Document (ID:${document.Id}) type(${document.GroupTypeDesc}) not recognized`);
        }
      } 

      const person = await personRepo.findOne({ originId: query.PersonID });
      if (person) {
        query.PersonID = person?._id;
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
      replyMinistry: query.replyMinistry,
      queryLink: query.queryLink,
      replyLink: query.replyLink,
    }));
  }

  async getNextQuery() {
    const query = await this.findOne({"categories": {"$size": 0}}, {populate: "replyMinistry"});
    return query;
  }

  async addCategoryToQuery(queryId: number, categories: any[]) {
    const queryObj = await this.findOne({_id: queryId});
    if(!queryObj){
      throw new Error(`Query ${queryId} not found`);
    }
    for(const category of categories){
      
      const { subCategoryId, mainCategory, subCategoryName } = category;
      if(subCategoryId){
        const subCategoryObj = await categoryRepo.findOne({
          _id: subCategoryId,
        });
        if(!subCategoryObj){
          throw new Error(`Category ${subCategoryId} not found`);
        }
        queryObj.categories?.push(subCategoryObj._id);
      }
      else{
        //create new category
        const newCategory = await categoryRepo.create({
          name: subCategoryName,
          isMainCategory: false,
        });
        await categoryRepo.update({name: mainCategory}, { $push: { subCategories: newCategory._id } });
        queryObj.categories?.push(newCategory._id);
      }
    }
    await queryObj.save();
    return queryObj;
  }
}

export default new QueryRepo();