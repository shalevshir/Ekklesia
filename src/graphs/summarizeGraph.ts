import {
  collapseDocs,
  splitListOfDocs,
} from "langchain/chains/combine_documents/reduce";
import { Document } from "@langchain/core/documents";
import { StateGraph, Annotation, Send } from "@langchain/langgraph";
import { gpt4oMini as llm } from "../abstracts/models";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { pull } from "langchain/hub";
import { CharacterTextSplitter } from "@langchain/textsplitters";
import { cleanDocText } from "../utils/files.service";

let tokenMax = 1000;

async function lengthFunction(documents: Document[]) {
  const tokenCounts = await Promise.all(  
    documents.map(async (doc) => {
      return llm.getNumTokens(doc.pageContent);
    })
  );
  return tokenCounts.reduce((sum:number, count:number) => sum + count, 0);
}

const OverallState = Annotation.Root({
  contents: Annotation<Document[]>,
  // Notice here we pass a reducer function.
  // This is because we want combine all the summaries we generate
  // from individual nodes back into one list. - this is essentially
  // the "reduce" part
  summaries: Annotation<string[]>({
    reducer: (state, update) => state.concat(update),
  }),
  collapsedSummaries: Annotation<Document[]>,
  finalSummary: Annotation<string>,
  type: Annotation<string>,
  name: Annotation<string>,
});

// This will be the state of the node that we will "map" all
// documents to in order to generate summaries
interface SummaryState {
  content: string;
  type: string;
  name: string;
}

// Here we generate a summary, given a document
const generateSummary = async (
  state: SummaryState
): Promise<{ summaries: string[] }> => {
  const mapPrompt = await pull<ChatPromptTemplate>("summerize-chunk");
  const prompt = await mapPrompt.invoke({ docs: state.content });
  const response = await llm.invoke(prompt);
  return { summaries: [String(response.content)] };
};

const splitDoc = async (state: typeof OverallState.State) => {
  const docs = state.contents;
  const textSplitter = new CharacterTextSplitter({
    chunkSize: 1500,
    chunkOverlap: 200,
    separator: '\n\n'
  });
  
  const splitDocs = await textSplitter.splitDocuments(docs);
  cleanDocText(splitDocs);
  console.log(`Generated ${splitDocs.length} documents.`);
  if(splitDocs.length === 0){
    return {finalSummary: "No documents to summarize"};
  } 
  return {
    contents: splitDocs,
  };
}


const getBillMetadata = async (state: SummaryState) => {
  const checkTypePrompt = await pull<ChatPromptTemplate>("get-bill-metadata") as any;
  const prompt = await checkTypePrompt.invoke({ firstChunk: state.content });
  const response = await llm.withStructuredOutput(checkTypePrompt.schema).invoke(prompt);
  return {
    type: response.billOrAmendment,
    name: response.name
  };
}


const mapSummaries = (state: typeof OverallState.State) => {
  const firstSendObject = new Send("getBillMetadata", { content:state.contents[0].pageContent })
  if(state.contents.length === 1){
    return [firstSendObject, new Send("generateSummary", { content:state.contents[0].pageContent })];
  }else if(state.contents.length !== 0){
    const restOfSendObjects = state.contents.slice(1).map(
      (content:Document) => new Send("generateSummary", { content:content.pageContent })
    );
      return [firstSendObject, ...restOfSendObjects];
  }else{
    return '__end__';
  }
};

const collectSummaries = async (state: typeof OverallState.State) => {
  return {
    collapsedSummaries: state.summaries.map(
      (summary:string) => new Document({ pageContent: summary })
    ),
  };
};

async function _reduce(input:Document[], name?:string, type?:string){ 
  const reducePrompt = await pull<ChatPromptTemplate>("final-summary-bills");

  const prompt = await reducePrompt.invoke({ doc_summaries: input.map(doc => doc.pageContent).join('\n'), name, type });
  const response = await llm.invoke(prompt);
  return String(response.content);
}

// Add node to collapse summaries
const collapseSummaries = async (state: typeof OverallState.State) => {
  const docLists = splitListOfDocs(
    state.collapsedSummaries,
    lengthFunction,
    tokenMax
  );
  const results = [];
  for (const docList of docLists) {
    results.push(await collapseDocs(docList, _reduce));
  }

  return { collapsedSummaries: results };
};

// This represents a conditional edge in the graph that determines
// if we should collapse the summaries or not
async function shouldCollapse(state: typeof OverallState.State) {
  let numTokens = await lengthFunction(state.collapsedSummaries);
  if (numTokens > tokenMax) {
    return "collapseSummaries";
  } else {
    return "generateFinalSummary";
  }
}

// Here we will generate the final summary
const generateFinalSummary = async (state: typeof OverallState.State) => {
  const response = await _reduce(state.collapsedSummaries, state.name, state.type);
  return { finalSummary: response };
};

// Construct the graph
const graph = new StateGraph(OverallState)
  .addNode("splitDoc", splitDoc)
  .addNode("generateSummary", generateSummary)
  .addNode("getBillMetadata", getBillMetadata)
  .addNode("collectSummaries", collectSummaries)
  .addNode("collapseSummaries", collapseSummaries)
  .addNode("generateFinalSummary", generateFinalSummary)
  .addEdge("__start__", "splitDoc")
  .addConditionalEdges("splitDoc", mapSummaries, ["generateSummary", "getBillMetadata"])
  .addEdge("generateSummary", "collectSummaries")
  .addConditionalEdges("collectSummaries", shouldCollapse, [
    "collapseSummaries",
    "generateFinalSummary",
  ])
  .addConditionalEdges("collapseSummaries", shouldCollapse, [
    "collapseSummaries",
    "generateFinalSummary",
  ])
  .addEdge("generateFinalSummary", "__end__");

export const app = graph.compile();

export const runSummarize = async (docs:Document[]) =>{
  
  const results = await app.invoke({contents:docs})
  return results
}

