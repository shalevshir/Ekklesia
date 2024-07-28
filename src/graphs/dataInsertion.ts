import { CompiledStateGraph, START, StateGraph } from '@langchain/langgraph';
import { agentStateChannels, IAgentStateChannels } from './states/graphState';
import { summarizeAgent } from './agents/summarize';
import { getSupervisorChain, members } from './agents/supervisor';
import { HumanMessage } from '@langchain/core/messages';
import { Runnable } from '@langchain/core/runnables';
import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { gpt35Turbo, gpt4o, llama31 } from '../abstracts/models';


export class DataInsertionGraph {
  flow: StateGraph<IAgentStateChannels, any, any>;
  graph: CompiledStateGraph<IAgentStateChannels, any, any> | null = null;
  summarizeAgent: Runnable | null = null;
  constructor() {
    this.flow = new StateGraph<IAgentStateChannels, any, any>({
      channels: agentStateChannels
    });
  }

  async initiate() {
    this.summarizeAgent = await summarizeAgent
    this.flow.addNode('supervisor', await getSupervisorChain());
    this.flow.addNode('summarize', this.summarizeAgent);

    members.forEach((member) => {
      this.flow.addEdge(member, 'supervisor');
    });

    this.flow.addConditionalEdges('supervisor', (state) => state.next);

    this.flow.addEdge(START, 'supervisor');

    this.graph = this.flow.compile();
    return this.graph;
  }

  async summarize(input: string) {
    if (!this.graph) {
      await this.initiate();
    }
    const translatePrompt = ChatPromptTemplate.fromTemplate(`Task: Translate the provided text to Hebrew.
    Text to Translate: {output}`);
    return await this.summarizeAgent?.
      pipe(translatePrompt)?.
      pipe(llama31).
      invoke(
      {
        messages: [
          new HumanMessage(input),
        ]
      }
    );
  }
}
