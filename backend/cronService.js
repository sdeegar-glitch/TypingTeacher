import cron from 'node-cron';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import { supabase } from './supabaseClient.js';
import dotenv from 'dotenv';
// Uses Node.js 18+ built-in fetch for keep-alive pings
dotenv.config();

const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

const RSS_FEEDS = [
  { name: 'The Hindu', url: 'https://www.thehindu.com/opinion/editorial/feeder/default.rss' },
  { name: 'The Economic Times', url: 'https://economictimes.indiatimes.com/rssfeeds/43984.cms' },
  { name: 'The Indian Express', url: 'https://indianexpress.com/section/opinion/feed/' },
  { name: 'Hindustan Times', url: 'https://www.hindustantimes.com/feeds/rss/editorials/rssfeed.xml' }
];

export async function fetchAndGenerateTests() {
  console.log('Starting automated typing test generation from multiple sources...');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('GEMINI_API_KEY is not set. Cannot run automated generation.');
    return;
  }

  for (const source of RSS_FEEDS) {
    try {
      console.log(`Fetching RSS from ${source.name}...`);
      const feed = await parser.parseURL(source.url);
      if (!feed.items || feed.items.length === 0) {
        console.log(`No items found in RSS feed for ${source.name}.`);
        continue;
      }

      // Process top 1 article from each source to maintain variety
      const articles = feed.items.slice(0, 1);

      for (const article of articles) {
        console.log(`Generating test for: ${article.title} (Source: ${source.name})`);
        
        const prompt = `
You are an expert educational content writer. Your task is to create a high-quality, plagiarism-free typing practice article based on the following editorial from ${source.name}.

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

        try {
          const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash', generationConfig: { responseMimeType: "application/json" } });
          const result = await model.generateContent(prompt);
          const text = result.response.text();

          let jsonString = text;
          const startIndex = text.indexOf('{');
          const endIndex = text.lastIndexOf('}');
          if (startIndex !== -1 && endIndex !== -1) {
            jsonString = text.substring(startIndex, endIndex + 1);
          }
          const generatedData = JSON.parse(jsonString);

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
          console.error('Error generating/parsing for article:', parseError.message);
        }
      } // end for articles
    } catch (err) {
      console.error(`Error in automated generation for ${source.name}:`, err.message);
    }
  } // end for sources
}

// ⚠️ TESTING MODE: Runs every minute. Change back to '0 0,12 * * *' for production.
export const initCronJobs = () => {
  cron.schedule('* * * * *', () => {
    fetchAndGenerateTests();
  });
  console.log('Cron jobs initialized: Typing test generation scheduled EVERY MINUTE (testing mode).');

  // Keep-alive ping every 14 minutes to prevent Render free-tier cold starts (fixes 2-3 min loading delay)
  const BACKEND_URL = process.env.BACKEND_URL || 'https://typingteacher-2lnd.onrender.com';
  cron.schedule('*/14 * * * *', async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/health`);
      console.log(`[Keep-alive] Pinged ${BACKEND_URL}/health → ${res.status}`);
    } catch (err) {
      console.warn('[Keep-alive] Ping failed:', err.message);
    }
  });
  console.log(`[Keep-alive] Pinging ${BACKEND_URL}/health every 14 minutes to prevent cold starts.`);
};
