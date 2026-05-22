import dotenv from 'dotenv';
dotenv.config();

async function checkModels() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GEMINI_API_KEY}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    data.models.forEach(m => console.log(m.name));
  } catch (e) {
    console.error(e);
  }
}
checkModels();
