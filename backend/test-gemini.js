import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function test() {
  const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
  try {
     const result = await model.generateContent('hi');
     console.log(result.response.text());
  } catch(e) {
     console.error(e);
  }
}
test();
