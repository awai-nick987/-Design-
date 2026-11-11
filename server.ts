import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { normalizeSheetUrls, parseGoogleSheetHtml } from "./src/utils/sheetResolver";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Server-side Gemini initialization with lazy/safe pattern
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API Health Check
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    geminiAvailable: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

// Proxy to fetch Google Spreadsheet published URL or CSV safely
app.get("/api/fetch-sheet", async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    if (!rawUrl || !rawUrl.trim()) {
      return res.status(400).json({ error: "URLが指定されていません。" });
    }

    const trimmedUrl = rawUrl.trim();
    const candidateUrls = normalizeSheetUrls(trimmedUrl);

    let lastError = "";
    let isAuthError = false;

    for (const url of candidateUrls) {
      try {
        const response = await fetch(url, {
          headers: {
            "User-Agent":
              "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            Accept: "text/csv, text/tab-separated-values, text/plain, text/html, */*",
          },
          redirect: "follow",
        });

        if (!response.ok) {
          lastError = `HTTP ${response.status}: ${response.statusText}`;
          continue;
        }

        const text = await response.text();

        // Check if Google returned an HTML login/permission page
        if (text.includes("accounts.google.com") || text.includes("ServiceLogin")) {
          isAuthError = true;
          continue;
        }

        // If it looks like HTML (e.g. from /pubhtml or published web page)
        if (text.includes("<table") || (text.includes("<html") && text.includes("<tr"))) {
          const parsedCsv = parseGoogleSheetHtml(text);
          if (parsedCsv && parsedCsv.trim().length > 0) {
            res.setHeader("Content-Type", "text/plain; charset=utf-8");
            return res.send(parsedCsv);
          }
        }

        // If it's already CSV / text
        if (text.trim().length > 0 && !text.includes("<!DOCTYPE html>")) {
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          return res.send(text);
        }
      } catch (err: any) {
        lastError = err?.message || String(err);
      }
    }

    if (isAuthError) {
      return res.status(403).json({
        error:
          "スプレッドシートの閲覧権限がありません。以下のいずれかをご確認ください：\n1. スプレッドシート右上の「共有」ボタンで、一般的なアクセスを「リンクを知っている全員」を「閲覧者」に設定する。\n2. または「ファイル」→「共有」→「ウェブに公開」で「公開」をクリックする（形式は変更せずそのままでOKです）。",
      });
    }

    return res.status(400).json({
      error: `スプレッドシートからデータを取得できませんでした（${lastError || "形式を確認してください"}）。URLが正しいか、公開されているかご確認ください。`,
    });
  } catch (error: any) {
    console.error("fetch-sheet error:", error);
    return res.status(500).json({
      error: `スプレッドシート取得中にエラーが発生しました: ${error?.message || "不明なエラー"}`,
    });
  }
});

// AI Facilitator & Deep Cross-Tabulation Analysis Endpoint
app.post("/api/analyze", async (req, res) => {
  try {
    const { summaryData, rawSample, promptExtra } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.status(503).json({
        error: "GEMINI_API_KEY_NOT_CONFIGURED",
        message: "Gemini APIキーが未設定です。ローカル集計エンジンによる高精度な自動ファシリテーション出力をご利用いただけます。",
      });
    }

    const systemInstruction = `あなたは山口県柳井市の「まちなかまちづくり」における、対話の場（まちなか井戸端会議など）を設計する熟練のファシリテーター兼データアナリストです。

【役割】
ユーザーからGoogleフォームのアンケート結果（集計サマリーおよび元データ抜粋）が提供されます。
そのデータを瞬時にクロス集計・深掘り分析し、住民同士のワークショップで提示するための「インサイト（気づき）」と、対話を深めるための「問い立て」を出力してください。
柳井市の文脈（白壁の町並み、金魚ちょうちん、やない西蔵、柳井駅周辺、日常の買い物・交通・空き家・多世代交流・子どもや高齢者の居場所など）に深く配慮した、温かく具体的で心に響く表現を心がけてください。

【対象データ定義】
問1: 自治会、問2: 性別、問3: 年齢、問4: 世帯構成、問5: 自慢できるもの（3つ）、問6: 利用施設、問7: 不安・困りごと（3つ）、問8: あったらいいな（3つ）、問9: 自由意見（任意）

【出力フォーマット】
必ず以下の3つの大見出しを持つマークダウン形式で出力してください：

1. まちなかの現状サマリー（定量データのハイライト）
- 全体の傾向と、世代別（問3）・世帯構成別（問4）で顕著に見られたギャップや特徴的な数値をわかりやすく箇条書きで整理。

2. ワークショップ用 事前インプット情報（参加者への提示用）
- 参加者が「自分ごと」として捉えられるよう、データを物語として翻訳した文章。住民一人ひとりの日常風景が浮かぶ共感度の高い語り口。
- 例：「〇〇代の多くが問7で『〜』に不安を抱える一方、問8では『〜』を求めています」などの構図を複数織り交ぜる。

3. 対話を深める3つの「問い立て」
- 【問い1】問5（強み・地域の自慢）× 問7（課題・不安）の掛け合わせ（強みを活かして不安を和らげる問い）
- 【問い2】問7（課題）× 問8（期待・あったらいいな）の掛け合わせ（困りごとをワクワクする未来へ転換する問い）
- 【問い3】世代間・世帯構成間の掛け合わせ（若者・子育て世代とシニア世代が共にまちなかを舞台に関わり合える問い）
各問いには、住民がテーブルで話し合いやすい「問いのフレーズ」「背景」「対話のヒント（最初の一言アイディア）」を添えてください。`;

    const userPrompt = `以下の柳井市まちなかアンケートの集計結果とデータをもとに、住民ワークショップ「まちなか井戸端会議」用のインサイトと問い立てを生成してください。

【集計サマリー】
${typeof summaryData === "object" ? JSON.stringify(summaryData, null, 2) : summaryData}

${rawSample ? `【データサンプル（抜粋）】\n${rawSample}` : ""}
${promptExtra ? `【追加の要望・着眼点】\n${promptExtra}` : ""}`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",
      contents: userPrompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    const markdownText = response.text || "";
    return res.json({ markdown: markdownText });
  } catch (error: any) {
    console.error("Gemini analysis error:", error);
    return res.status(500).json({
      error: "ANALYSIS_FAILED",
      message: error?.message || "分析の生成中にエラーが発生しました。",
    });
  }
});

// Vite Middleware for dev, Static for production
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

startServer();
