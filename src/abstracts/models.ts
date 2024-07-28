import { ChatOpenAI } from '@langchain/openai';
import {GoogleVertexAI} from '@langchain/community/llms/googlevertexai';
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HarmBlockThreshold, HarmCategory } from "@google/generative-ai";
export const gpt35Turbo = new ChatOpenAI({
  model: 'gpt-3.5-turbo',
  temperature: 0
});

export const gpt4o = new ChatOpenAI({
  model: 'gpt-4o',
  temperature: 0.5
});

export const gpt4oMini = new ChatOpenAI({
  model: 'gpt-4o-mini',
  temperature: 0.5
});

export const gemini1_5 = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-pro',
  temperature: 0,
  maxRetries: 3
});


export const gemini1_5_flash = new ChatGoogleGenerativeAI({
  model: 'gemini-1.5-flash',
  temperature: 0,
});