// import { createAgent } from '../../utils/llm.utils';
// import { gpt35Turbo, gpt4o, llama31 } from '../../abstracts/models';
// import { StructuredTool, Tool, } from '@langchain/core/tools';
// import { HumanMessage } from '@langchain/core/messages';
// import { RunnableConfig } from '@langchain/core/runnables';
// import { IAgentStateChannels } from '../states/graphState';
// import { Calculator } from '@langchain/community/tools/calculator';
import { loadSummarizationChain } from "langchain/chains";
import { gemini1_5, gemini1_5_flash, gpt4o, gpt4oMini } from "../../abstracts/models";
import { Document } from "@langchain/core/documents";
import { ChatPromptTemplate } from "@langchain/core/prompts";

// const tools: Tool[] = [
//   new Calculator()
// ];
// export const summarizeAgent = createAgent(
//   llama31,
//   tools,
//   `Role: Expert in legislative matters
//   Task: Summarize the provided legislative text.

//   Requirements:

  // The summary should be concise, capturing the essence of the text.
  // Limit the summary to 3-4 sentences.
  // Refer only to the content of the legislative text, excluding any metadata such as author or date of publication.`
// )
// export const invokeSummarize = summarizeAgent.then(async (agent) => {
//   return async (
//     state: IAgentStateChannels,
//     config?: RunnableConfig
//   ) => {
//     const result = await agent.invoke(state, config);
//     return {
//       messages: [
//         new HumanMessage({ content: result.output, name: 'summarize' }),
//       ]
//     };
//   };
// });
const prompt = ChatPromptTemplate.fromTemplate(
  `Summarize the provided legislative text.
  The summary should be concise, capturing the essence of the text.
  Limit the summary to 3-4 sentences.
  Refer only to the content of the legislative text, excluding any metadata such as author or date of publication.
  also avoid any headlines and markdowns, and intros like "The following text is about...", "This legislation..." etc..
  please differentiate between bills and Amendment of legislation.

  Example:
  Input:"
הכנסת העשרים וחמש



יוזמים:      חברי הכנסת	אימאן ח'טיב יאסין 				מנסור עבאס 				ווליד טאהא

 	 

______________________________________________				           

                                             פ/1289/25



הצעת חוק לתיקון פקודת התעבורה (הגבלת דמי חניה בחניוני בתי חולים), התשפ"ג–2023



תיקון סעיף 70ב1

1.

בפקודת התעבורה, בסעיף 70ב1, אחרי סעיף קטן (ב) יבוא:





"(ב1)	השר יקבע מחיר מרבי לדמי חניה בחניוני בתי חולים, ובלבד שמחיר שעת חניה לא יעלה על 7 שקלים חדשים ומחיר ליום חניה לא יעלה על 35 שקלים חדשים."

דברי הסבר

בחניונים של בתי חולים רבים בארץ מחירי החניה הרקיעו שחקים בשנים האחרונות. לעיתים מחיר יום חניה בודד עולה על מאה שקלים חדשים ומחיר שעת חניה מגיע לעשרות שקלים חדשים. מדובר במשאב ציבורי מוגבל שאמור להיות נגיש במחיר סביר לכלל הציבור ולא רק למי שהפרוטה בכיסו. נראה שהסיבה למחירים הגבוהים היא שהמאושפזים ובני משפחותיהם הם למעשה "לקוחות שבויים" הנמצאים בשעת מצוקה. 

לא מתקבל על הדעת שתושבים נאלצים להוציא סכומי עתק עבור דבר בסיסי כחניה בבית חולים. על כן, מוצע לקבוע ששר התחבורה והבטיחות בדרכים יגביל את הסכומים המרביים הנגבים בעבור חניה בחניונים של בתי חולים, כך שהמחיר המרבי לא יעלה על 7 שקלים חדשים , בכך שיהיה קרוב ככל האפשר למחיר בעבור שעת חניה בכחול לבן, ולא יעלה על 35 שקלים חדשים בעבור יום חניה במידה ויצטרך החונה לבלות יום בבית חולים. 

הצעות חוק דומות בעיקרן הונחו על שולחן הכנסת העשרים על ידי חברת הכנסת לאה פדידה וקבוצת חברי הכנסת (פ/5803/20), על שולחן הכנסת העשרים ושתיים על ידי חבר הכנסת איציק שמולי (פ/676/22), על שולחן הכנסת העשרים ושלוש על ידי חבר הכנסת איציק שמולי (פ/341/23) ועל ידי חברת הכנסת קארין אלהרר (פ/1078/23) על שולחן הכנסת העשרים וארבע על ידי חברת הכנסת מירב בן ארי (פ/697/24), על ידי חבר הכנסת אופיר כץ (פ/1659/24) ועל ידי חברי הכנסת אחמד טיבי ואוסאמה סעדי (פ/2653/24) ועל ידי חבר הכנסת איימן עודה וקבוצת חברי הכנסת (פ/3711/24), ועל שולחן הכנסת העשרים וחמש על ידי חבר הכנסת אחמד טיבי (פ/268/25) על ידי חברת הכנסת מרב בן ארי (פ/447/25), ועל ידי חבר הכנסת אופיר כץ (פ/857/25).

הצעות חוק זהות הונחו על שולחן הכנסת העשרים וארבע על ידי חברת הכנסת אימאן ח'טיב יאסין וקבוצת חברי הכנסת (פ/2852/24) ועל ידי חבר הכנסת איימן עודה וקבוצת חברי הכנסת (פ/3711/24), ועל שולחן הכנסת העשרים וחמש על ידי חבר הכנסת איימן עודה וקבוצת חברי הכנסת (פ/858/25).

הצעת החוק זהה לפ/3711/24 ולפיכך לא נבדקה מחדש על ידי הלשכה המשפטית של הכנסת.
"
Output:
"an Amendment of legislation to the Traffic Ordinance regarding parking fees. The amendment aims to standardize the calculation of parking fees to be based on minutes from the first hour, aligning it with the existing practice for mobile parking payments. To simplify cash transactions, the bill suggests rounding up parking fees to the nearest shekel. The proposed amendment will come into effect six months after its publication to allow parking operators time to adjust their systems. "

  Content to summarize: {text}`)

const translatePrompt = ChatPromptTemplate.fromTemplate(`If the provided text is in English translate it to Hebrew.
  if it's already in Hebrew, return the provided text as is.
  also make sure to remove every headlines and markdowns and return only the content.

 Text to Translate: {text}`);
export const summarizeChain = loadSummarizationChain(gemini1_5,{prompt,type:'stuff'});
export const runSummarize = (input:Document<Record<string, any>>[]) => {
  return summarizeChain.pipe(translatePrompt).pipe(gemini1_5_flash).invoke({input_documents: input})
};

