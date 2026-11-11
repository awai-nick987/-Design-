import type { IncomingMessage, ServerResponse } from "http";
import { GoogleGenAI } from "@google/genai";

let geminiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return null;
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({ apiKey });
  }
  return geminiClient;
}

function parseJsonBody(req: IncomingMessage): Promise<any> {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", (chunk) => {
      body += chunk;
    });
    req.on("end", () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "Method Not Allowed" }));
    return;
  }

  try {
    const body = await parseJsonBody(req);
    const { summaryData, rawSample, promptExtra } = body;
    const ai = getGeminiClient();

    if (!ai) {
      res.statusCode = 503;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: "GEMINI_API_KEY_NOT_CONFIGURED",
          message: "Gemini APIキーが未設定です。ローカル集計エンジンによる高精度な自動ファシリテーション出力をご利用いただけます。",
        })
      );
      return;
    }

    const isYanai = Boolean(body.isYanai);
    const surveyTitle = body.surveyTitle || (isYanai ? "柳井市まちなかアンケート" : "アンケート調査");

    const systemInstruction = `あなたはアンケート調査・住民対話の場（まちづくり井戸端会議や住民ワークショップ、意見交換会）を設計する熟練のファシリテーター兼データアナリストです。
${isYanai ? "特に山口県柳井市の「まちなかまちづくり」（白壁の町並み、金魚ちょうちん、やない西蔵、柳井駅周辺、日常の買い物・交通・空き家・多世代交流・子どもや高齢者の居場所など）の地域文脈に配慮してください。" : "提供されたアンケート調査の設問内容や回答データに応じた最適な文脈で分析を行ってください。"}

【役割】
ユーザーからGoogleフォームのアンケート結果（集計サマリーおよび元データ抜粋）が提供されます。
そのデータを瞬時にクロス集計・深掘り分析し、参加者同士のワークショップや対話で提示するための「インサイト（気づき）」と、対話を深めるための「問い立て」を出力してください。
具体的で心に響く、温かく前向きな表現を心がけてください。

【出力フォーマット】
必ず以下の3つの大見出しを持つマークダウン形式で出力してください：

1. まちなかの現状サマリー（定量データのハイライト）
- 全体の傾向と、世代別・属性別・世帯構成別で顕著に見られたギャップや特徴的な数値をわかりやすく箇条書きで整理。

2. ワークショップ用 事前インプット情報（参加者への提示用）
- 参加者が「自分ごと」として捉えられるよう、データを物語として翻訳した文章。参加者一人ひとりの日常風景が浮かぶ共感度の高い語り口。
- 例：「〇〇代の多くが『〜』に不安や課題を抱える一方、『〜』を求めています」などの構図を複数織り交ぜる。

3. 対話を深める3つの「問い立て」
- 【問い1】地域の強み・自慢 × 課題・不安の掛け合わせ（強みを活かして不安を和らげる問い）
- 【問い2】課題・不安 × 期待・あったらいいなの掛け合わせ（困りごとをワクワクする未来へ転換する問い）
- 【問い3】世代間・多様な立場の掛け合わせ（異なる立場の人同士が共に主体的に関わり合える問い）
各問いには、参加者がテーブルで話し合いやすい「問いのフレーズ」「背景」「対話のヒント（最初の一言アイディア）」を添えてください。`;

    const userPrompt = `以下の【${surveyTitle}】の集計結果とデータをもとに、ワークショップ用のインサイトと問い立てを生成してください。

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
    res.statusCode = 200;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ markdown: markdownText }));
  } catch (error: any) {
    res.statusCode = 500;
    res.setHeader("Content-Type", "application/json");
    res.end(
      JSON.stringify({
        error: "ANALYSIS_FAILED",
        message: error?.message || "分析の生成中にエラーが発生しました。",
      })
    );
  }
}
