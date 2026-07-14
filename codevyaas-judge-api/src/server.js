import express from 'express';
import cors from "cors";
import { execute } from './dockerRunner.js';
import { languages } from './languages.js';

const app = express();
app.use(cors({
  origin: "http://localhost:3000", 
}));
app.disable('x-powered-by');
app.use(express.json({ limit: '150kb' }));
app.get('/health', (_req, res) => res.json({ ok: true, languages: Object.keys(languages) }));
app.post('/api/execute', async (req, res) => {
  const { language, source, stdin = '' } = req.body ?? {};
  if (typeof language !== 'string' || typeof source !== 'string' || typeof stdin !== 'string') return res.status(400).json({ error: 'language and source must be strings; stdin is optional.' });
  try { return res.status(200).json(await execute({ language, source, stdin })); }
  catch (error) { return res.status(400).json({ error: error.message }); }
});
app.use((_req, res) => res.status(404).json({ error: 'Not found' }));
app.listen(process.env.PORT || 3000, () => console.log('Judge API listening on port 3000'));
