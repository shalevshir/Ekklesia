import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { Runnable } from '@langchain/core/runnables';
import { BaseChatGoogleVertexAI } from '@langchain/community/dist/chat_models/googlevertexai/common';

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
