import { Router } from "express";
import { db, knowledgeDocuments, knowledgeChunks } from "@workspace/db";
import { eq, and, sql } from "drizzle-orm";
import { z } from "zod";
import multer from "multer";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdfParse = require("pdf-parse");
import { mockStore } from "../lib/mockStore";
import { requireOrgMembership } from "../middlewares/requireOrgMembership";
import { validate } from "../middlewares/validate";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Helpers
function chunkText(text: string, chunkSize = 600, overlap = 100): string[] {
  const words = text.split(/\s+/).filter(Boolean);
  const chunks: string[] = [];
  for (let i = 0; i < words.length; i += (chunkSize - overlap)) {
    const chunkWords = words.slice(i, i + chunkSize);
    if (chunkWords.length > 0) {
      chunks.push(chunkWords.join(" "));
    }
    if (i + chunkSize >= words.length) {
      break;
    }
  }
  return chunks;
}

async function getEmbedding(text: string, apiKey: string): Promise<number[]> {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-embedding-2:embedContent?key=${apiKey}`;
  const response = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "models/gemini-embedding-2",
      content: {
        parts: [{ text }]
      },
      outputDimensionality: 768
    })
  });
  if (!response.ok) {
    throw new Error(`Gemini embedding failed: ${response.statusText}`);
  }
  const data = await response.json() as any;
  return data.embedding.values;
}

// POST /api/knowledge/upload
router.post("/upload", requireOrgMembership, upload.single("file"), async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId as string || "1");
    const filename = req.file?.originalname || "document.txt";
    
    if (!req.file) {
      return res.status(400).json({ error: "Missing uploaded file" });
    }

    let text = "";
    if (req.file.mimetype === "application/pdf" || filename.toLowerCase().endsWith(".pdf")) {
      const pdfData = await pdfParse(req.file.buffer);
      text = pdfData.text;
    } else {
      text = req.file.buffer.toString("utf-8");
    }

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: "Document is empty or text could not be extracted" });
    }

    const chunks = chunkText(text);
    const apiKey = process.env.GEMINI_API_KEY || "";

    if (process.env.DATABASE_URL) {
      const [doc] = await db.insert(knowledgeDocuments).values({
        orgId,
        filename
      }).returning();

      for (const chunk of chunks) {
        const embedding = apiKey ? await getEmbedding(chunk, apiKey) : Array.from({ length: 768 }, () => Math.random());
        await db.insert(knowledgeChunks).values({
          orgId,
          documentId: doc.id,
          filename,
          contentText: chunk,
          embedding
        });
      }
      return res.json({ success: true, message: `Successfully uploaded ${filename} and created ${chunks.length} chunks.`, documentId: doc.id });
    } else {
      // Fallback
      const doc = {
        id: mockStore.knowledgeDocuments.length + 1,
        orgId,
        filename,
        createdAt: new Date().toISOString()
      };
      mockStore.knowledgeDocuments.push(doc);

      for (const chunk of chunks) {
        const embedding = apiKey ? await getEmbedding(chunk, apiKey) : Array.from({ length: 768 }, () => Math.random());
        mockStore.knowledgeChunks.push({
          id: mockStore.knowledgeChunks.length + 1,
          orgId,
          documentId: doc.id,
          filename,
          contentText: chunk,
          embedding,
          createdAt: new Date().toISOString()
        });
      }
      return res.json({ success: true, message: `Successfully uploaded ${filename} and created ${chunks.length} chunks.`, documentId: doc.id });
    }
  } catch (err: any) {
    console.error("Upload Error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

// Cosine similarity helper for in-memory mockStore arrays
function cosineSimilarity(vecA: number[], vecB: number[]): number {
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0;
  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

// POST /api/knowledge/query
const querySchema = z.object({
  question: z.string().min(1),
  orgId: z.number()
});

router.post("/query", requireOrgMembership, validate(querySchema), async (req, res) => {
  try {
    const { question, orgId } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || "";

    // 1. Embed query
    let queryEmbedding: number[];
    if (apiKey) {
      queryEmbedding = await getEmbedding(question, apiKey);
    } else {
      queryEmbedding = Array.from({ length: 768 }, () => Math.random());
    }

    // 2. Retrieve top-k chunks matching orgId only
    let matchedChunks: any[] = [];
    if (process.env.DATABASE_URL) {
      matchedChunks = await db.select({
        id: knowledgeChunks.id,
        filename: knowledgeChunks.filename,
        contentText: knowledgeChunks.contentText,
        similarity: sql<number>`1 - (${knowledgeChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector)`
      })
      .from(knowledgeChunks)
      .where(eq(knowledgeChunks.orgId, orgId))
      .orderBy(sql`${knowledgeChunks.embedding} <=> ${JSON.stringify(queryEmbedding)}::vector`)
      .limit(3);
    } else {
      // In-memory cosine similarity
      const orgChunks = mockStore.knowledgeChunks.filter(c => c.orgId === orgId);
      const chunksWithScore = orgChunks.map(c => ({
        id: c.id,
        filename: c.filename,
        contentText: c.contentText,
        similarity: cosineSimilarity(queryEmbedding, c.embedding)
      }));
      chunksWithScore.sort((a, b) => b.similarity - a.similarity);
      matchedChunks = chunksWithScore.slice(0, 3);
    }

    // 3. Construct prompt with retrieved chunks
    const context = matchedChunks.length > 0 
      ? matchedChunks.map(c => `[Source: ${c.filename}]\n${c.contentText}`).join("\n\n")
      : "No contextual documentation found.";

    const systemInstruction = `You are a supportive, grounded merchant assistant. You must ONLY answer questions using the provided context from their uploaded documentation. If the context does not contain the answer, politely say that you cannot find this information in the uploaded documents and invite them to add more files. DO NOT invent or hallucinate facts.`;
    
    const userPrompt = `Context:\n${context}\n\nQuestion: ${question}\n\nGenerate a grounded answer, indicating which sources supported your points:`;

    let generatedText = "Simulated support answer based on mock chunks (no Gemini API Key set).";
    if (apiKey) {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;
      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: userPrompt }] }],
          systemInstruction: { parts: [{ text: systemInstruction }] },
          generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
        }),
      });

      if (response.ok) {
        const data = await response.json() as any;
        generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
      } else {
        generatedText = `Gemini call failed with status: ${response.statusText}`;
      }
    }

    return res.json({
      answer: generatedText,
      sources: matchedChunks.map(c => ({
        id: c.id,
        filename: c.filename,
        contentText: c.contentText.substring(0, 150) + "...",
        similarity: c.similarity
      }))
    });

  } catch (err: any) {
    console.error("Query Error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

// GET /api/knowledge/documents
router.get("/documents", requireOrgMembership, async (req, res) => {
  try {
    const orgId = parseInt(req.query.orgId as string || "1");
    if (process.env.DATABASE_URL) {
      const docs = await db.select().from(knowledgeDocuments).where(eq(knowledgeDocuments.orgId, orgId));
      return res.json(docs);
    } else {
      const docs = mockStore.knowledgeDocuments.filter(d => d.orgId === orgId);
      return res.json(docs);
    }
  } catch (err: any) {
    console.error("List Docs Error:", err);
    return res.status(500).json({ error: `Internal server error: ${err.message}` });
  }
});

export default router;
