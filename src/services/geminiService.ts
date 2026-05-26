/**
 * AI helpers — calls Gemini when `GEMINI_API_KEY` is set (Vite `define`); otherwise local mocks.
 * Set `VITE_SIMULATE_AI_FAILURE=1` to test error UI. For production, prefer a server-side proxy over a public API key.
 */

import { Influencer } from '../types';

function getGeminiApiKey(): string {
  try {
    const v = (typeof process !== 'undefined' && process.env && process.env.GEMINI_API_KEY) || '';
    return typeof v === 'string' ? v.trim() : '';
  } catch {
    return '';
  }
}

async function geminiGenerateText(prompt: string): Promise<string> {
  const key = getGeminiApiKey();
  if (!key) throw new Error('NO_KEY');

  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-flash-latest'];
  let lastErr: string | null = null;

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
      }),
    });

    if (res.status === 404) {
      lastErr = `Model ${model} not available`;
      continue;
    }

    if (!res.ok) {
      const t = await res.text();
      throw new Error(`Gemini HTTP ${res.status}: ${t.slice(0, 200)}`);
    }

    const json = (await res.json()) as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      error?: { message?: string };
    };
    if (json.error?.message) throw new Error(json.error.message);

    const text =
      json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? '').join('')?.trim() ?? '';
    if (!text) throw new Error('Empty Gemini response');
    return text;
  }

  throw new Error(lastErr || 'No Gemini model succeeded');
}

const mockCampaignIdeas = (title: string, niche: string, platform: string) =>
  `This is an AI-generated strategy for "${title}" targeting the ${niche} niche on ${platform}. 
  
  Strategy: Focus on authentic storytelling by showcasing how the product fits into the daily lives of Kenyans. Use trending local sounds and relatable humor to drive engagement.
  
  Key Deliverables:
  • 1x High-quality ${platform} video showcasing product utility.
  • 2x Stories with direct call-to-action links.
  • 1x Collaborative post for cross-audience reach.`;

export const generateCampaignIdeas = async (title: string, niche: string, platform: string): Promise<string> => {
  const prompt = `You are a Kenya-market influencer campaign strategist. Write a concise brief (under 220 words) for a campaign titled "${title}", niche: ${niche}, primary platform: ${platform}. Use markdown bullets. Be specific to Kenyan audiences where relevant.`;

  try {
    const text = await geminiGenerateText(prompt);
    return text;
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 600));
    return mockCampaignIdeas(title, niche, platform);
  }
};

function mockAnalyzeFit(influencer: Influencer): { score: number; reason: string } {
  const score = 75 + Math.floor(Math.random() * 20);
  return {
    score,
    reason: `${influencer.name} has a strong presence in ${influencer.location} and their content style aligns with the ${influencer.niche[0]} focus of this campaign.`,
  };
}

/** Compatibility score + blurb for marketplace “Run Analysis”. */
export const analyzeInfluencerFit = async (
  campaignDescription: string,
  influencer: Influencer
): Promise<{ score: number; reason: string }> => {
  if (import.meta.env.VITE_SIMULATE_AI_FAILURE === '1') {
    await new Promise((resolve) => setTimeout(resolve, 400));
    throw new Error('The analysis service is temporarily unavailable. Please try again.');
  }

  const niches = influencer.niche?.join(', ') || 'general';
  const prompt = `You match influencers to brand campaigns. Campaign (short): ${campaignDescription.slice(0, 800)}
Influencer: name=${influencer.name}, location=${influencer.location}, niches=${niches}, followers≈${influencer.followers ?? 'unknown'}.
Reply with ONLY valid JSON, no markdown: {"score": <integer 0-100>, "reason": "<one or two sentences>"}`;

  try {
    const raw = await geminiGenerateText(prompt);
    const cleaned = raw.replace(/^```json\s*/i, '').replace(/\s*```$/i, '').trim();
    const parsed = JSON.parse(cleaned) as { score?: unknown; reason?: unknown };
    const score = typeof parsed.score === 'number' ? Math.min(100, Math.max(0, Math.round(parsed.score))) : 70;
    const reason = typeof parsed.reason === 'string' && parsed.reason.trim() ? parsed.reason.trim() : mockAnalyzeFit(influencer).reason;
    return { score, reason };
  } catch {
    await new Promise((resolve) => setTimeout(resolve, 800));
    return mockAnalyzeFit(influencer);
  }
};
