import * as XLSX from "xlsx";
import { AutoMappingResult, ColumnMapping, SurveyRow } from "../types/survey";

// Detect delimiter (tab, comma, semicolon)
export function detectDelimiter(text: string): string {
  const clean = text.replace(/^\uFEFF/, "");
  let inQuotes = false;
  let tabs = 0;
  let commas = 0;
  let semicolons = 0;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    if (char === '"') {
      if (inQuotes && i + 1 < clean.length && clean[i + 1] === '"') {
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if ((char === "\n" || char === "\r") && !inQuotes) {
      if (tabs > 0 || commas > 0 || semicolons > 0) {
        break;
      }
    } else if (!inQuotes) {
      if (char === "\t") tabs++;
      else if (char === ",") commas++;
      else if (char === ";") semicolons++;
    }
  }

  if (tabs > commas && tabs >= semicolons && tabs > 0) return "\t";
  if (commas >= semicolons && commas > 0) return ",";
  if (semicolons > 0) return ";";
  return tabs > 0 ? "\t" : ",";
}

// Split text line respecting quotes
export function parseDelimitedLine(line: string, delimiter: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      result.push(current.trim());
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

// Parse text into 2D string array with full support for multiline quoted cells (RFC 4180)
export function parseRawText(rawText: string): { headers: string[]; rows: string[][] } {
  const clean = rawText.replace(/^\uFEFF/, "");
  if (!clean.trim()) return { headers: [], rows: [] };

  const delimiter = detectDelimiter(clean);
  const records: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = "";
  let inQuotes = false;

  const len = clean.length;
  for (let i = 0; i < len; i++) {
    const char = clean[i];

    if (char === '"') {
      if (inQuotes && i + 1 < len && clean[i + 1] === '"') {
        // Escaped double quote ("") inside quoted field
        currentCell += '"';
        i++;
      } else {
        // Toggle quote state
        inQuotes = !inQuotes;
      }
    } else if (char === delimiter && !inQuotes) {
      // Field delimiter outside quotes
      currentRow.push(currentCell.trim());
      currentCell = "";
    } else if ((char === "\r" || char === "\n") && !inQuotes) {
      // Row break outside quotes
      if (char === "\r" && i + 1 < len && clean[i + 1] === "\n") {
        i++; // skip \n in CRLF
      }
      currentRow.push(currentCell.trim());
      currentCell = "";

      if (currentRow.some((c) => c.length > 0)) {
        records.push(currentRow);
      }
      currentRow = [];
    } else {
      // Regular character or newline inside quoted cell
      if (char === "\r" && i + 1 < len && clean[i + 1] === "\n") {
        currentCell += "\n";
        i++;
      } else {
        currentCell += char;
      }
    }
  }

  // Push final cell and row
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some((c) => c.length > 0)) {
      records.push(currentRow);
    }
  }

  if (records.length === 0) return { headers: [], rows: [] };

  const headers = records[0] || [];
  const rows = records.slice(1).filter((r) => r.some((cell) => cell.length > 0));

  return { headers, rows };
}

// Parse binary/buffer Excel file via sheetjs
export function parseExcelBuffer(buffer: ArrayBuffer): { headers: string[]; rows: string[][] } {
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheetName = workbook.SheetNames[0];
  if (!sheetName) return { headers: [], rows: [] };

  const sheet = workbook.Sheets[sheetName];
  const rawJson: string[][] = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: "" });

  if (!rawJson || rawJson.length === 0) return { headers: [], rows: [] };

  const headers = (rawJson[0] || []).map((h) => String(h || "").trim());
  const rows = rawJson
    .slice(1)
    .map((r) => r.map((c) => String(c ?? "").trim()))
    .filter((r) => r.some((c) => c.length > 0));

  return { headers, rows };
}

// Clean option string by stripping numerical prefixes like "1. ", "10. ", "1.女性", etc.
export function cleanOptionValue(text: string): string {
  if (!text) return "";
  return text.trim().replace(/^[\d０-９]+[\.．:：\s、\)\-]\s*/, "").trim();
}

// Choice mapping dictionaries for Questions where numbers represent text options
export const Q5_PRIDE_CHOICES: Record<number, string> = {
  1: "公園や緑が身近",
  2: "災害が少なく安心",
  3: "子育てしやすい",
  4: "教育環境が充実",
  5: "医療機関が充実",
  6: "健康づくり・福祉が充実",
  7: "買い物がしやすい",
  8: "公共交通が利用しやすい",
  9: "歴史や文化",
  10: "地元の特産品",
  11: "観光資源",
  12: "地域の団結力",
  13: "人の温かさ・治安の良さ",
  14: "自然環境が豊か",
};

export const Q7_WORRY_CHOICES: Record<number, string> = {
  1: "防災・防犯",
  2: "住宅の維持・管理",
  3: "空き家・周辺環境",
  4: "家庭生活全般",
  5: "健康・医療",
  6: "介護・高齢者の見守り",
  7: "子育て・教育",
  8: "買い物",
  9: "公共交通や移動",
  10: "若者の流出・就労機会",
  11: "人とのつながり",
  12: "地域の担い手不足",
  13: "道路・生活インフラの老朽化",
  14: "その他・特になし",
};

export const Q8_HOPE_CHOICES: Record<number, string> = {
  1: "防災・防犯対策",
  2: "憩いの空間",
  3: "空き家の適正管理",
  4: "暮らしに関するサポート",
  5: "多世代が集える場所",
  6: "医療や福祉の充実",
  7: "高齢者の見守り",
  8: "子どもの遊び場",
  9: "買い物や生活サービス",
  10: "公共交通の充実",
  11: "若者の定住・雇用の創出",
  12: "趣味や学びの講座",
  13: "地域イベント",
  14: "コミュニティ交通・移動支援",
  15: "その他・特になし",
};

// Facility synonyms & normalization dictionary (Yanai City)
// Standardizes English vs Katakana, full-width vs half-width, with/without dots
export const FACILITY_NORMALIZATION_MAP: { canonical: string; aliases: string[] }[] = [
  {
    canonical: "Mr.Max（ミスターマックス）",
    aliases: [
      "ミスターマックス", "mr.max", "mrmax", "mr max", "mr. max",
      "ミスター・マックス", "ミスター マックス", "ｍｒ．ｍａｘ", "ｍｒｍａｘ", "MR.MAX", "MRMAX",
    ],
  },
  {
    canonical: "ゆめタウン柳井",
    aliases: [
      "ゆめタウン柳井", "ゆめタウン", "ゆめタウンやない", "youme", "youmetown",
      "ユメタウン", "ゆめタ", "夢タウン",
    ],
  },
  {
    canonical: "やない西蔵",
    aliases: [
      "やない西蔵", "西蔵", "柳井西蔵", "せいぞう", "やないせいぞう",
    ],
  },
  {
    canonical: "サンビームやない",
    aliases: [
      "サンビームやない", "サンビーム柳井", "サンビーム", "さんびーむ",
    ],
  },
  {
    canonical: "みどりが丘図書館",
    aliases: [
      "みどりが丘図書館", "みどりが丘", "緑が丘図書館", "市立図書館", "図書館", "柳井市立図書館",
    ],
  },
  {
    canonical: "白壁の町並み",
    aliases: [
      "白壁の町並み", "白壁の街並み", "白壁通り", "白壁", "重伝建",
    ],
  },
  {
    canonical: "やまぐちフラワーランド",
    aliases: [
      "やまぐちフラワーランド", "フラワーランド", "山口フラワーランド", "花公園",
    ],
  },
  {
    canonical: "柳井ウェルネスパーク",
    aliases: [
      "柳井ウェルネスパーク", "ウェルネスパーク", "ウェルネス",
    ],
  },
  {
    canonical: "柳井駅",
    aliases: [
      "柳井駅", "JR柳井駅", "柳井駅前", "駅",
    ],
  },
  {
    canonical: "柳井市役所",
    aliases: [
      "柳井市役所", "市役所", "役所",
    ],
  },
  {
    canonical: "バタフライアリーナ（市体育館）",
    aliases: [
      "バタフライアリーナ", "柳井市体育館", "市民体育館", "体育館",
    ],
  },
  {
    canonical: "アクティブやない",
    aliases: [
      "アクティブやない", "アクティブ柳井", "アクティブ",
    ],
  },
  {
    canonical: "アクロスプラザ柳井",
    aliases: [
      "アクロスプラザ柳井", "アクロスプラザ", "アクロス",
    ],
  },
  {
    canonical: "ウォンツ",
    aliases: [
      "ウォンツ", "wants", "Wants", "WANTS", "ドラッグストアウォンツ",
    ],
  },
  {
    canonical: "ディスカウントドラッグ コスモス",
    aliases: [
      "コスモス", "ドラッグコスモス", "ディスカウントドラッグコスモス",
    ],
  },
  {
    canonical: "マックスバリュ",
    aliases: [
      "マックスバリュ", "MaxValu", "MAXVALU", "マックスバリュー",
    ],
  },
  {
    canonical: "アルク柳井店",
    aliases: [
      "アルク", "アルク柳井店", "丸久", "マルキュウ",
    ],
  },
  {
    canonical: "南町ふれあいタウン",
    aliases: [
      "南町ふれあいタウン", "ふれあいタウン",
    ],
  },
  {
    canonical: "公園・児童公園",
    aliases: [
      "お散歩公園", "近所の公園", "児童公園", "公園",
    ],
  },
  {
    canonical: "医療機関・病院",
    aliases: [
      "柳井病院", "医師会病院", "病院", "医院", "クリニック",
    ],
  },
  {
    canonical: "コンビニエンスストア",
    aliases: [
      "コンビニ", "セブンイレブン", "ローソン", "ファミリーマート", "セブン",
    ],
  },
];

// Normalize a single facility name (standardizes Mr.Max/ミスターマックス etc, while keeping custom names intact)
export function normalizeFacilityName(term: string): string {
  const trimmed = term.trim().replace(/^[\d０-９]+[\.．:：\s、\)\-]\s*/, "").trim();
  if (!trimmed || ["-", "特になし", "なし", "特になし。", "特になし・無回答"].includes(trimmed)) return "";

  const clean = trimmed.toLowerCase().replace(/[\s\.\-_・]/g, "");

  // 1. Exact alias match
  for (const item of FACILITY_NORMALIZATION_MAP) {
    for (const alias of item.aliases) {
      const aliasClean = alias.toLowerCase().replace(/[\s\.\-_・]/g, "");
      if (clean === aliasClean) {
        return item.canonical;
      }
    }
  }

  // 2. Substring match for substantial aliases (4+ chars), bounded by length to prevent swallowing multi-word text
  for (const item of FACILITY_NORMALIZATION_MAP) {
    for (const alias of item.aliases) {
      const aliasClean = alias.toLowerCase().replace(/[\s\.\-_・]/g, "");
      if (
        aliasClean.length >= 4 &&
        clean.includes(aliasClean) &&
        Math.abs(clean.length - aliasClean.length) <= 3
      ) {
        return item.canonical;
      }
    }
  }

  // 3. Return original string for any other custom facility / store / spot
  return trimmed;
}

// Split multiple facility answers (supports commas, slashes, bullets, spaces, connectors)
// Accurately extracts each facility as an independent item and normalizes variants like Mr.Max / ミスターマックス
export function splitFacilityAnswers(text: string): string[] {
  if (!text) return [];

  let s = text.trim();
  if (!s || ["-", "特になし", "なし"].includes(s)) return [];

  // Protect "ミスター・マックス" and similar katakana with middle dots before bullet splitting
  s = s.replace(/ミスター[・\s]マックス/gi, "MRMAX_TEMP");
  s = s.replace(/ディスカウントドラッグ[・\s]コスモス/gi, "COSMOS_TEMP");

  // Delimiters:
  // - Comma, japanese comma, slash, semicolon, newline, bullet, tab
  // - Connector words with spaces: " と ", " や ", " 及び ", " および "
  // - Direct "と" or "及び" when connecting distinct terms
  s = s.replace(
    /\s*(?:[,、\n\r;；／/\t・]|(?:\s+(?:と|や|及び|および|＆|&)\s+)|(?:\s*(?:と|及び|および)\s*)|(?:\s+(?:や)\s+))\s*/g,
    "||"
  );

  const parts = s.split("||");
  const results: string[] = [];

  for (const p of parts) {
    let t = p
      .trim()
      .replace(/MRMAX_TEMP/g, "Mr.Max（ミスターマックス）")
      .replace(/COSMOS_TEMP/g, "ディスカウントドラッグ コスモス");
    if (!t) continue;

    // Check if token contains full-width or multiple spaces separating independent names
    if (t.includes("　") || /\s{2,}/.test(t)) {
      const spaceSub = t.split(/[\s　]+/g);
      for (const sub of spaceSub) {
        const norm = normalizeFacilityName(sub);
        if (norm && norm !== "-" && norm !== "特になし") {
          results.push(norm);
        }
      }
    } else {
      const norm = normalizeFacilityName(t);
      if (norm && norm !== "-" && norm !== "特になし") {
        results.push(norm);
      }
    }
  }

  // Return unique facility list
  return Array.from(new Set(results));
}

// Converts a number or numbered option into the official question text
export function parseNumberOrTextOption(val: string, mapping: Record<number, string>): string {
  if (!val) return "";
  const trimmed = val.trim();
  if (!trimmed) return "";

  // Convert full-width numbers (０-９) to half-width (0-9)
  const normalized = trimmed.replace(/[０-９]/g, (s) =>
    String.fromCharCode(s.charCodeAt(0) - 0xfee0)
  );

  // Case 1: Pure number e.g. "1", "01", "10"
  if (/^\d+$/.test(normalized)) {
    const num = parseInt(normalized, 10);
    if (mapping[num]) {
      return mapping[num];
    }
  }

  // Case 2: Number with prefix e.g. "1. 公園や緑が身近" or "1: 歴史や文化"
  const prefixMatch = trimmed.match(/^[\d０-９]+[\.．:：\s、\)\-]\s*(.*)$/);
  if (prefixMatch && prefixMatch[1] && prefixMatch[1].trim()) {
    const textPart = prefixMatch[1].trim();
    return textPart;
  }

  // Case 3: "1." or "01." where only number and dot exists
  const onlyNumDot = trimmed.match(/^([\d０-９]+)[\.．\s\)]*$/);
  if (onlyNumDot) {
    const num = parseInt(
      onlyNumDot[1].replace(/[０-９]/g, (s) => String.fromCharCode(s.charCodeAt(0) - 0xfee0)),
      10
    );
    if (mapping[num]) {
      return mapping[num];
    }
  }

  // Fallback: return clean text as-is
  return cleanOptionValue(trimmed);
}

// Split multiple answers where items may be numbers or text (Q5, Q7, Q8)
export function splitNumberMappedAnswers(
  text: string,
  mapping: Record<number, string>
): string[] {
  if (!text) return [];

  const rawParts = text.split(/[,、\n\r;；\t]+/g);
  const results: string[] = [];

  for (const part of rawParts) {
    const p = part.trim();
    if (!p) continue;

    // Check if multiple numbers are separated by spaces e.g. "1 3 5" or "1　3　5"
    if (/^[\d０-９\s　]+$/.test(p)) {
      const nums = p.split(/[\s　]+/g);
      for (const n of nums) {
        if (n.trim()) {
          const mapped = parseNumberOrTextOption(n, mapping);
          if (mapped && mapped !== "-" && mapped !== "特になし") {
            results.push(mapped);
          }
        }
      }
      continue;
    }

    const mapped = parseNumberOrTextOption(p, mapping);
    if (mapped && mapped !== "-" && mapped !== "特になし") {
      results.push(mapped);
    }
  }

  return Array.from(new Set(results));
}

// Split answers flexibly: supports both numerical codes (Yanai style) and direct text answers (standard Google Forms)
export function splitFlexibleAnswers(
  text: string,
  choiceMapping?: Record<number, string>
): string[] {
  if (!text) return [];

  const trimmed = text.trim();
  if (!trimmed || ["-", "特になし", "なし", "特になし。"].includes(trimmed)) return [];

  // Delimit by comma, japanese comma, newline, semicolon, slash, or bullet
  const rawParts = trimmed.split(/[,、\n\r;；/／・\t]+/g);
  const results: string[] = [];

  for (const part of rawParts) {
    const p = part.trim();
    if (!p) continue;

    // Check if multiple numbers are separated by spaces e.g. "1 3 5"
    if (/^[\d０-９\s　]+$/.test(p)) {
      const nums = p.split(/[\s　]+/g);
      for (const n of nums) {
        if (!n.trim()) continue;
        if (choiceMapping) {
          const mapped = parseNumberOrTextOption(n, choiceMapping);
          if (mapped && mapped !== "-" && mapped !== "特になし") {
            results.push(mapped);
            continue;
          }
        }
        const clean = cleanOptionValue(n);
        if (clean && clean !== "-" && clean !== "特になし") {
          results.push(clean);
        }
      }
      continue;
    }

    // Try choiceMapping first (if numbers or numbered prefix e.g. "1. 白壁の町並み")
    if (choiceMapping) {
      const mapped = parseNumberOrTextOption(p, choiceMapping);
      if (mapped && mapped !== "-" && mapped !== "特になし") {
        results.push(mapped);
        continue;
      }
    }

    // Standard Google Forms text choice
    const clean = cleanOptionValue(p);
    if (clean && clean !== "-" && clean !== "特になし") {
      results.push(clean);
    }
  }

  return Array.from(new Set(results));
}

// Smart auto-detect and bind Google Forms questions to analysis roles
export function autoDetectAndBindFormQuestions(
  headers: string[],
  rows?: string[][]
): AutoMappingResult {
  const mapping: ColumnMapping = {
    q1: -1,
    q2: -1,
    q3: -1,
    q4: -1,
    q5: -1,
    q6: -1,
    q7: -1,
    q8: -1,
    q9: -1,
  };

  const titles: Record<keyof ColumnMapping, string> = {
    q1: "自治会・地区・所属",
    q2: "性別",
    q3: "年齢・年代",
    q4: "世帯構成・立場",
    q5: "地域の自慢・強み・満足点",
    q6: "利用施設・行動動線",
    q7: "不安・困りごと・課題",
    q8: "あったらいいな・期待・要望",
    q9: "自由意見・感想",
  };

  const confidence: Record<keyof ColumnMapping, number> = {
    q1: 0,
    q2: 0,
    q3: 0,
    q4: 0,
    q5: 0,
    q6: 0,
    q7: 0,
    q8: 0,
    q9: 0,
  };

  const reasons: Record<keyof ColumnMapping, string> = {
    q1: "未検出",
    q2: "未検出",
    q3: "未検出",
    q4: "未検出",
    q5: "未検出",
    q6: "未検出",
    q7: "未検出",
    q8: "未検出",
    q9: "未検出",
  };

  if (!headers || headers.length === 0) {
    return { mapping, titles, confidence, reasons, autoDetectedCount: 0 };
  }

  // Define comprehensive semantic patterns for Google Forms
  const roleRules: {
    key: keyof ColumnMapping;
    label: string;
    keywords: RegExp;
    dataPatterns?: RegExp;
    weight: number;
  }[] = [
    {
      key: "q3",
      label: "年齢・年代",
      keywords: /年齢|年代|おいくつ|生年|歳|age|学年|誕生/i,
      dataPatterns: /10代|20代|30代|40代|50代|60代|70代|80代|歳|才/,
      weight: 10,
    },
    {
      key: "q2",
      label: "性別",
      keywords: /性別|ジェンダー|gender/i,
      dataPatterns: /^男$|^女$|男性|女性|その他|無回答/,
      weight: 10,
    },
    {
      key: "q1",
      label: "地区・地域・所属",
      keywords: /自治会|地区|地域|町内|住所|市|町|エリア|拠点|所属|部署|事業所|居住地/i,
      weight: 8,
    },
    {
      key: "q4",
      label: "世帯構成・立場",
      keywords: /世帯|家族|同居|暮らし|単身|夫婦|子ども|同居|立場|身分|構成/i,
      dataPatterns: /単身|一人|夫婦|子育て|世帯|親/,
      weight: 8,
    },
    {
      key: "q7",
      label: "不安・困りごと・課題",
      keywords: /不安|困り|課題|不満|問題|悩み|改善|デメリット|心配|不便|ボトルネック|リスク/i,
      weight: 9,
    },
    {
      key: "q8",
      label: "あったらいいな・期待・要望",
      keywords: /あったらいいな|期待|希望|欲しい|ほしい|アイデア|今後|未来|提案|施策|要望|やってみたい/i,
      weight: 9,
    },
    {
      key: "q5",
      label: "自慢・強み・魅力・満足",
      keywords: /自慢|強み|魅力|誇り|好きな|良い|満足|メリット|評価|理由|きっかけ|関心/i,
      weight: 8,
    },
    {
      key: "q6",
      label: "利用施設・行動動線",
      keywords: /施設|利用|行く|場所|どこ|頻度|買い物|交通|店舗|スポット|動線/i,
      weight: 7,
    },
    {
      key: "q9",
      label: "自由意見・感想",
      keywords: /自由|意見|ご意見|感想|その他|コメント|メッセージ|記述|備考|一言|要望等/i,
      weight: 9,
    },
  ];

  const assignedCols = new Set<number>();
  let detectedCount = 0;

  // Step 1: Match high-confidence keyword and data pattern pairs
  for (const rule of roleRules) {
    let bestCol = -1;
    let highestScore = 0;
    let bestReason = "";

    headers.forEach((header, colIdx) => {
      if (assignedCols.has(colIdx)) return;
      if (/タイムスタンプ|timestamp/i.test(header)) return;

      let score = 0;
      let matchedReason = "";

      // Check header text match
      if (rule.keywords.test(header)) {
        score += rule.weight;
        matchedReason = `ヘッダー「${header.substring(0, 15)}...」から検出`;
      }

      // Check question number prefix e.g. "問1", "問3", "Q1", "Q3"
      const qNumMatch = header.match(/(?:問|Q|q)([1-9])/);
      if (qNumMatch && `q${qNumMatch[1]}` === rule.key) {
        score += 15;
        matchedReason = `設問番号「${qNumMatch[0]}」に完全一致`;
      }

      // Check sample rows data
      if (rows && rows.length > 0 && rule.dataPatterns) {
        const sampleColValues = rows.slice(0, 10).map((r) => r[colIdx] || "");
        const matchCount = sampleColValues.filter((v) => rule.dataPatterns!.test(v)).length;
        if (matchCount > 0) {
          score += matchCount * 2;
          matchedReason = `${matchedReason ? matchedReason + " + " : ""}回答データ（例: ${sampleColValues[0]}）から検出`;
        }
      }

      if (score > highestScore) {
        highestScore = score;
        bestCol = colIdx;
        bestReason = matchedReason;
      }
    });

    if (bestCol >= 0 && highestScore >= 5) {
      mapping[rule.key] = bestCol;
      titles[rule.key] = headers[bestCol] || titles[rule.key];
      confidence[rule.key] = Math.min(100, highestScore * 10);
      reasons[rule.key] = bestReason || "自動検出";
      assignedCols.add(bestCol);
      detectedCount++;
    }
  }

  // Step 2: Intelligent Fallback for remaining unassigned columns
  // If q9 (Free opinions) not found, look for any column with long text
  if (mapping.q9 === -1 && rows && rows.length > 0) {
    headers.forEach((header, colIdx) => {
      if (assignedCols.has(colIdx)) return;
      if (/タイムスタンプ|timestamp/i.test(header)) return;

      const values = rows.map((r) => (r[colIdx] || "").trim()).filter(Boolean);
      if (values.length === 0) return;
      const avgLen = values.reduce((sum, v) => sum + v.length, 0) / values.length;
      if (avgLen > 25 && mapping.q9 === -1) {
        mapping.q9 = colIdx;
        titles.q9 = header;
        confidence.q9 = 75;
        reasons.q9 = `回答の平均文字数（${Math.round(avgLen)}文字）から自由意見と判定`;
        assignedCols.add(colIdx);
        detectedCount++;
      }
    });
  }

  // Step 3: For unassigned keys, map to available columns sequentially if non-timestamp
  const unassignedKeys: (keyof ColumnMapping)[] = [
    "q1", "q2", "q3", "q4", "q5", "q6", "q7", "q8"
  ];
  let nextAvailableCol = 0;

  for (const key of unassignedKeys) {
    if (mapping[key] === -1) {
      while (
        nextAvailableCol < headers.length &&
        (assignedCols.has(nextAvailableCol) || /タイムスタンプ|timestamp/i.test(headers[nextAvailableCol] || ""))
      ) {
        nextAvailableCol++;
      }

      if (nextAvailableCol < headers.length) {
        mapping[key] = nextAvailableCol;
        titles[key] = headers[nextAvailableCol] || `(列 ${nextAvailableCol + 1})`;
        confidence[key] = 50;
        reasons[key] = `列 ${nextAvailableCol + 1} を順次バインド`;
        assignedCols.add(nextAvailableCol);
        detectedCount++;
        nextAvailableCol++;
      }
    }
  }

  return {
    mapping,
    titles,
    confidence,
    reasons,
    autoDetectedCount: detectedCount,
  };
}

// Backward-compatible detectColumnMapping
export function detectColumnMapping(headers: string[], rows?: string[][]): ColumnMapping {
  return autoDetectAndBindFormQuestions(headers, rows).mapping;
}

// Split multiple answers (general fallback)
export function splitMultiAnswers(text: string): string[] {
  return splitFlexibleAnswers(text);
}

// Normalize Survey Rows with mapping, converting Q5/7/8 numbers to text & splitting Q6 facilities
export function buildSurveyRows(
  headers: string[],
  rows: string[][],
  mapping: ColumnMapping
): SurveyRow[] {
  return rows.map((r, idx) => {
    const rawObj: Record<string, string> = {};
    headers.forEach((h, colIdx) => {
      rawObj[h || `Col_${colIdx + 1}`] = r[colIdx] || "";
    });

    const getCol = (colIdx: number) =>
      colIdx >= 0 && colIdx < r.length ? (r[colIdx] || "").trim() : "";

    return {
      id: `row-${idx + 1}`,
      raw: rawObj,
      q1_jichikai: cleanOptionValue(getCol(mapping.q1)) || "未回答",
      q2_gender: cleanOptionValue(getCol(mapping.q2)) || "回答なし",
      q3_age: cleanOptionValue(getCol(mapping.q3)) || "不明",
      q4_household: cleanOptionValue(getCol(mapping.q4)) || "未回答",
      // Flexible answers: supports numerical dictionary matching AND direct text matching
      q5_pride: splitFlexibleAnswers(getCol(mapping.q5), Q5_PRIDE_CHOICES),
      q6_facilities: splitFlexibleAnswers(getCol(mapping.q6)),
      q7_worry: splitFlexibleAnswers(getCol(mapping.q7), Q7_WORRY_CHOICES),
      q8_hope: splitFlexibleAnswers(getCol(mapping.q8), Q8_HOPE_CHOICES),
      q9_opinion: getCol(mapping.q9),
    };
  });
}

