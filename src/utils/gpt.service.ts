import { ChatOpenAI } from "@langchain/openai";
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from 'langchain/output_parsers';
import categoryRepo from "../modules/category/category.repo";

class GptService {
    chat = new ChatOpenAI({
        modelName: 'ft:gpt-3.5-turbo-1106:personal::8sdPcAh7',
        temperature: 1
    });
    taxonomy = ''
  constructor() {

  }

  async categorizeQuery(query: string): Promise<string> {
    // add cache mechanism to the taxonomy
    this.taxonomy = await categoryRepo.getCategoriesTree();
    try {    
        const template = ChatPromptTemplate.fromMessages([
            ["system","I'll provide you with a query from the Knesset that I need to categorize into a predefined taxonomy of main categories and sub-categories."],
            ["system","The taxonomy is structured with main categories, each having specific related sub-categories. Below is the taxonomy:"],
            ["system", this.taxonomy],
            ["system","Please categorize the following query based on the provided taxonomy. If you identify a need for a new sub-category, please suggest one and include \"isNewCategory\": true in your response, along with a brief explanation for your suggestion."],
            ["system","Note that you can select more then one subcategory and can have mix of main categories. but when you do so, make sure each sub category is in a different object in the array with it corresponding main category."],
            ["system","Your task is to categorize this query and provide the response in the specified format, including your reasoning for each categorization."],
            ["system","you're response should be structure in a pure json array without styling and prefixes and with the following keys in each object: mainCategory, subCategory, isNewSub, reason "],
            ["system","the json values should be in hebrew"],
            ["system","remember you can categorize the query into more then one main category and sub category"],
            ["system","The query is: "],
            ["user","{query}"], 
        ])
        const parser = StructuredOutputParser.fromNamesAndDescriptions(
            {
              mainCategory: "The main category of the query",
              subCategory: "The sub category of the query",
              isNewSub: "Is this a new sub category",
              reason: "The reason for the categorization"
            }
          )
        const chain = template.pipe(this.chat)
        const answerObj = await chain.invoke({query, formatInstructions:parser})
        //remove ```json and ``` from the response
        let content = answerObj.content as string;
        content = content.replace(/```json\n/g, '');
        content = content.replace(/\n```/g, '');

        const data = JSON.parse(content)
        for (const key in data) {
            console.log(`${key}: ${data[key]}`);
        }
        return data;
    } catch (error) {
      console.error('Error', error);
      throw error;
    }
  }
}

export default new GptService();
