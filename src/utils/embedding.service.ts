import { OpenAIEmbeddings } from '@langchain/openai';
import categoryRepo from '../modules/category/category.repo';
import { MongoDBAtlasVectorSearch } from '@langchain/mongodb';
import { Category } from '../modules/category/category.model';
import { connection } from './db';
import logger from './logger';
import { HuggingFaceInferenceEmbeddings } from '@langchain/community/embeddings/hf';
import axios from 'axios';

class EmbeddingService {
  hfEmbeddings = new HuggingFaceInferenceEmbeddings({
    model: 'intfloat/multilingual-e5-large '
  });

  // hfEmbeddings = new HuggingFaceTransformersEmbeddings({
  //     modelName: "Xenova/multilingual-e5-large",

  // });


  embeddings = new OpenAIEmbeddings({
    modelName: 'text-embedding-3-large',
    dimensions: 1024
  });
  taxonomy = '';
  constructor() {

  }

  async embedFromEndpoint(query: any): Promise<any> {
    try {
      const response = await axios.post('https://zfky7t147gil9g7h.us-east-1.aws.endpoints.huggingface.cloud', {
        inputs: query
      }, {
        headers: {
          'Authorization ': 'Bearer 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',
          'Content-Type': 'application/json'
        }
      });
      return response.data[0];
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  async embedData(data: string) {
    try {
      // this.hftransformer = await getHfModel();
      const response = await this.hfEmbeddings.embedQuery(data.replace(/(\r\n|\n|\r)/gm, ' '));
      return response;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }

  queryVector = async (query: string): Promise<{queryResults: [any, number][]; embeddedQuery: any}> => {
    try {
      const vectorStore = this.createVectorStore();

      if (query.length > 1024) query = query.substring(0, 1024);
      // const embeddedQuery = await this.embeddFromEndpoint(query);
      const embeddedQuery = await this.embeddings.embedQuery(query);
      const queryResults = await vectorStore.similaritySearchVectorWithScore(embeddedQuery, 5);
      return { queryResults, embeddedQuery };
    } catch (error) {
      logger.error('Error', error);
      return { queryResults: [], embeddedQuery: [] };
    }
  };

  private createVectorStore() {
    const collection = connection.collection('categories') as any;
    const vectorStore = new MongoDBAtlasVectorSearch(
      this.embeddings,
      {
        collection,
        indexName: 'vector_index',
        embeddingKey: 'vector'
      }
    );
    return vectorStore;
  }

  async vectorizeCategories(job: any, done: any) {
    logger.info('Vectorizing categories');
    try {
      done();
      const categories = await categoryRepo.getAllCategories();
      const toPromise = [];
      for (const category of categories) {
        // if(!category.subCategories?.length) continue;
        const subCategories = category.subCategories as Category[];
        const subCategoriesNames = subCategories.map((subCategory) => subCategory.name);
        let dataToQuery = category.name;
        if (subCategoriesNames?.length) {
          dataToQuery += ': ' + subCategoriesNames.join(', ');
        }
        logger.info('Vectorizing category', { name: category.name, dataToQuery });
        const embeddedCategory = await this.embeddings.embedQuery(dataToQuery);
        category.vector = embeddedCategory;
        toPromise.push(category.save());
      }
      await Promise.all(toPromise);
      logger.info('Vectorizing categories completed');
      return true;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}

export default new EmbeddingService();
