import { ChatPromptTemplate } from '@langchain/core/prompts';
import { END } from '@langchain/langgraph';
import { JsonOutputToolsParser } from 'langchain/output_parsers';
import { FunctionDefinition } from '@langchain/core/language_models/base';
import { pull } from 'langchain/hub';
import { gpt4o } from '../../abstracts/models';

export const members = [ 'summarize' ];

const options = [ END, ...members ];

// Define the routing function
const functionDef: FunctionDefinition = {
  name: 'route',
  description: 'Select the next role.',
  parameters: {
    title: 'routeSchema',
    type: 'object',
    properties: {
      next: {
        title: 'Next',
        anyOf: [
          { enum: options }
        ]
      }
    },
    required: [ 'next' ]
  }
};

const toolDef = {
  type: 'function',
  function: functionDef
} as const;

export async function getSupervisorChain() {
  const messages = await pull<ChatPromptTemplate>('karl-sova/fujitsu_supervisor_chat');

  const formattedPrompt = await messages.partial({
    options: options.join(', '),
    members: members.join(', ')
  });

  if (!gpt4o.bindTools) {
    throw new Error('Model does not support structured output');
  }

  const supervisorChain = formattedPrompt
    .pipe(gpt4o.bindTools(
      [ toolDef ],
      {
        tool_choice: { 'type': 'function', 'function': { 'name': 'route' } }
      },
    ))
    .pipe(new JsonOutputToolsParser())
  // select the first one
    .pipe((x) => (x[0].args));

  return supervisorChain;
}
