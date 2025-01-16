import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';
import { Runnable } from '@langchain/core/runnables';

export async function createAgent(
  llm: any,
  tools: any[],
  systemPrompt: string,
): Promise<Runnable> {
  // Each worker node will be given a name and some tools.
  const prompt = ChatPromptTemplate.fromMessages([
    [ 'system', systemPrompt ],
    new MessagesPlaceholder('messages'),
    new MessagesPlaceholder('agent_scratchpad')
  ]) as unknown as ChatPromptTemplate;
  const agent = await createOpenAIFunctionsAgent({ llm, tools, prompt });
  return new AgentExecutor({ agent, tools });
}
