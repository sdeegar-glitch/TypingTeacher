import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
dotenv.config();

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const HINDU_RSS_URL = 'https://www.thehindu.com/opinion/editorial/feeder/default.rss';

export async function fetchAndGenerateTests() {
  console.log('Starting automated typing test generation from The Hindu...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set. Cannot run automated generation.');
    return;
  }

  try {
    const feed = await parser.parseURL(HINDU_RSS_URL);
    if (!feed.items || feed.items.length === 0) {
      console.log('No items found in RSS feed.');
      return;
    }

    // Process top 2 articles
    const articles = feed.items.slice(0, 2);

    for (const article of articles) {
      // Check if already processed
      const { data: existing } = await supabase
        .from('typing_test')
        .select('id')
        .eq('original_source', article.link)
        .single();
      
      if (existing) {
        console.log(`Article already processed: ${article.title}`);
        continue;
      }

      console.log(`Generating test for: ${article.title}`);
      
      const prompt = `
You are an expert educational content writer. Your task is to create a high-quality, plagiarism-free typing practice article based on the following editorial from The Hindu.

Title: ${article.title}
Summary/Snippet: ${article.contentSnippet || article.content}

Requirements:
1. Write a comprehensive, easy-to-read, educational article of around 1000 words based on the theme of this editorial.
2. The language should be highly readable for typing practice, maintaining excellent grammar and punctuation. Do NOT use markdown.
3. Automatically determine the difficulty level based on the topic: 'easy' (simple vocabulary), 'medium' (average editorial), or 'hard' (advanced).
4. Provide an SEO-optimized title, SEO description, a short excerpt (2-3 sentences), a category, and an array of tags.
5. Return ONLY a valid JSON object with the following structure (no markdown formatting, no code blocks):

{
  "title": "A catchy, SEO-optimized title",
  "content": "The full ~1000 word article text only, no markdown...",
  "excerpt": "A short engaging excerpt",
  "difficulty_level": "easy",
  "category": "Education",
  "seo_title": "SEO Title | FastTypingLab",
  "seo_description": "SEO description...",
  "tags": ["tag1", "tag2"],
  "keywords": ["keyword1", "keyword2"]
}
`;

      const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash', generationConfig: { responseMimeType: "application/json" } });
      const result = await model.generateContent(prompt);
      const text = result.response.text();
      
      try {
        const generatedData = JSON.parse(text);
        
        // Calculate word count
        const wordCount = generatedData.content.split(/\s+/).length;
        const estimatedReadTime = Math.ceil(wordCount / 200);
        
        // Create slug
        const slug = generatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now();

        const { error } = await supabase.from('typing_test').insert({
          title: generatedData.title,
          slug,
          original_source: article.link,
          content: generatedData.content,
          excerpt: generatedData.excerpt,
          difficulty_level: generatedData.difficulty_level,
          word_count: wordCount,
          estimated_read_time: estimatedReadTime,
          category: generatedData.category,
          tags: generatedData.tags,
          seo_title: generatedData.seo_title,
          seo_description: generatedData.seo_description,
          keywords: generatedData.keywords,
          typing_duration_options: ["1min", "3min", "5min", "10min"]
        });

        if (error) {
          console.error(`Error saving test to DB: ${error.message}`);
        } else {
          console.log(`Successfully generated and saved: ${generatedData.title}`);
        }
      } catch (parseError) {
        console.error('Error parsing JSON from Gemini:', parseError);
      }
    }
  } catch (err) {
    console.error('Error in automated generation:', err);
  }
}

// Run twice a day: at 00:00 and 12:00
export const initCronJobs = () => {
  cron.schedule('0 0,12 * * *', () => {
    fetchAndGenerateTests();
  });
  console.log('Cron jobs initialized: Typing test generation scheduled for 00:00 and 12:00 daily.');
};
