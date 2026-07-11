/**
 * Service to translate custom generated assets (marketing copies, taglines) using AI
 * Includes a local cache layer to avoid redundant server roundtrips.
 */

const TRANSLATION_CACHE_KEY = "vyapaar_ai_translations";
const API_BASE_URL = import.meta.env.VITE_API_URL || "https://vyapaar-ai-guide-1.onrender.com";

interface CacheStore {
  [sourceTextAndTargetLang: string]: string;
}

function getCache(): CacheStore {
  try {
    const cached = localStorage.getItem(TRANSLATION_CACHE_KEY);
    return cached ? JSON.parse(cached) : {};
  } catch {
    return {};
  }
}

function writeCache(cache: CacheStore) {
  try {
    localStorage.setItem(TRANSLATION_CACHE_KEY, JSON.stringify(cache));
  } catch {}
}

export async function translateText(text: string, targetLang: string): Promise<string> {
  if (!text || !targetLang || targetLang === "en") return text;

  const cacheKey = `${targetLang}:${text.trim()}`;
  const cache = getCache();

  // Return from local cache if present
  if (cache[cacheKey]) {
    return cache[cacheKey];
  }

  try {
    // Send to our backend AI proxy server (e.g., reusing branding/marketing copilot generators)
    const response = await fetch(`${API_BASE_URL}/api/copilot/marketing`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        orgName: "System Translator",
        industryType: "service",
        campaignType: "translation",
        topic: `Translate the following text into ${targetLang} language. Output ONLY the raw translated text, no comments: "${text}"`,
      })
    });

    if (response.ok) {
      const data = await response.json();
      const translated = data.marketingCopy || data.text || text;
      
      // Save translation results to cache
      cache[cacheKey] = translated;
      writeCache(cache);

      return translated;
    }
  } catch (err) {
    console.error("AI Translation helper error:", err);
  }

  return text; // fallback to original
}
