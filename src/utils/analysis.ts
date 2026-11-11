import {
  AggregatedCount,
  CrossTabItem,
  SurveyAnalysisSummary,
  SurveyRow,
  SurveyOpinion,
  CorrelationItem,
  CorrelationAnalysisSummary,
  SurveyDimensionKey,
  PivotMetric,
  PivotTableData,
  DynamicQuestionAnalysis,
  QuestionProfile,
  QuestionType,
} from "../types/survey";

// Count occurrences helper
export function aggregateCounts(items: string[], totalDenom: number): AggregatedCount[] {
  const map: Record<string, number> = {};
  items.forEach((item) => {
    if (!item || item.trim() === "") return;
    map[item] = (map[item] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, count]) => ({
      name,
      count,
      percentage: totalDenom > 0 ? Math.round((count / totalDenom) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.count - a.count);
}

// Inspect header and row values to determine Question Type
export function profileHeadersAndData(headers: string[], rows: SurveyRow[]): QuestionProfile[] {
  return headers.map((header, idx) => {
    const rawColName = header || `列${idx + 1}`;
    const cleanTitle = rawColName.replace(/^問[\d０-９]+[:：\.\s]*/, "").trim() || rawColName;
    const values = rows.map((r) => r.raw[rawColName] || "").filter((v) => v.trim().length > 0);
    const uniqueVals = Array.from(new Set(values));

    // Determine type
    let questionType: QuestionType = "single";
    const hasMultipleSeparators = values.some(
      (v) => (v.includes(",") || v.includes("、") || v.includes(";") || v.includes(";\n")) && v.length > 2
    );
    const avgLength = values.length > 0 ? values.reduce((acc, v) => acc + v.length, 0) / values.length : 0;
    const allNumeric = values.length > 0 && values.every((v) => !isNaN(Number(v.replace(/,/g, ""))));

    if (allNumeric && uniqueVals.length > 8) {
      questionType = "number";
    } else if (hasMultipleSeparators && uniqueVals.length > 1) {
      questionType = "multiple";
    } else if (avgLength > 30 || (uniqueVals.length > 15 && uniqueVals.length === values.length)) {
      questionType = "text";
    } else {
      questionType = "single";
    }

    return {
      index: idx,
      header: rawColName,
      cleanTitle,
      questionType,
      uniqueCount: uniqueVals.length,
      sampleValues: uniqueVals.slice(0, 3),
    };
  });
}

// Cross tabulate primary category with multi-choice array items
export function crossTabulate(
  rows: SurveyRow[],
  categoryKey: "q3_age" | "q4_household" | "q1_jichikai",
  itemsKey: "q7_worry" | "q8_hope" | "q5_pride" | "q6_facilities"
): CrossTabItem[] {
  const groups: Record<string, { total: number; items: Record<string, number> }> = {};

  rows.forEach((row) => {
    const cat = row[categoryKey] || "未回答";
    if (!groups[cat]) {
      groups[cat] = { total: 0, items: {} };
    }
    groups[cat].total += 1;

    const list = row[itemsKey] || [];
    list.forEach((item) => {
      groups[cat].items[item] = (groups[cat].items[item] || 0) + 1;
    });
  });

  return Object.entries(groups).map(([category, data]) => ({
    category,
    total: data.total,
    items: data.items,
  }));
}

// Split cell value for dynamic multiple choice question
export function splitDynamicCellValues(text: string): string[] {
  if (!text || !text.trim()) return [];
  const trimmed = text.trim();
  if (["-", "特になし", "なし", "特になし。"].includes(trimmed)) return [];
  return trimmed
    .split(/[,、;\n\t]+/g)
    .map((s) => s.trim().replace(/^[\d０-９]+[\.．:：\s、\)\-]\s*/, "").trim())
    .filter((s) => s.length > 0 && s !== "-" && s !== "特になし");
}

// Summarize entire survey dataset with dynamic Google Forms question awareness
export function analyzeSurveyData(
  rows: SurveyRow[],
  headers: string[] = [],
  surveyTitle?: string
): SurveyAnalysisSummary {
  const total = rows.length;

  const ageDistribution = aggregateCounts(
    rows.map((r) => r.q3_age || "不明"),
    total
  );
  const householdDistribution = aggregateCounts(
    rows.map((r) => r.q4_household || "未回答"),
    total
  );
  const genderDistribution = aggregateCounts(
    rows.map((r) => r.q2_gender || "回答なし"),
    total
  );
  const jichikaiDistribution = aggregateCounts(
    rows.map((r) => r.q1_jichikai || "未回答"),
    total
  );

  const prideRanking = aggregateCounts(
    rows.flatMap((r) => r.q5_pride),
    total
  );
  const facilityRanking = aggregateCounts(
    rows.flatMap((r) => r.q6_facilities),
    total
  );
  const worryRanking = aggregateCounts(
    rows.flatMap((r) => r.q7_worry),
    total
  );
  const hopeRanking = aggregateCounts(
    rows.flatMap((r) => r.q8_hope),
    total
  );

  // Dynamic analysis for each column from headers
  const dynamicQuestions: DynamicQuestionAnalysis[] = [];
  headers.forEach((h, colIdx) => {
    // Skip timestamp if recognized
    if (/タイムスタンプ|timestamp/i.test(h)) return;

    const values = rows.map((r) => r.raw[h] || "").filter((v) => v.trim().length > 0);
    const nonEmpties = values.length;
    if (nonEmpties === 0) return;

    // Detect if this column is multiple choice
    const isMultiple = values.some(
      (v) => (v.includes(",") || v.includes("、") || v.includes(";")) && v.length > 2
    );
    const avgLen = values.reduce((sum, v) => sum + v.length, 0) / nonEmpties;
    const isText = avgLen > 30 || (new Set(values).size > 15 && new Set(values).size === nonEmpties);

    if (isText) {
      dynamicQuestions.push({
        colIndex: colIdx,
        title: h,
        questionType: "text",
        topCounts: [],
        totalAnswered: nonEmpties,
        opinions: values.slice(0, 20),
      });
    } else {
      let tokens: string[] = [];
      if (isMultiple) {
        tokens = values.flatMap((v) => splitDynamicCellValues(v));
      } else {
        tokens = values.map((v) => v.trim().replace(/^[\d０-９]+[\.．:：\s、\)\-]\s*/, "").trim());
      }
      const topCounts = aggregateCounts(tokens, nonEmpties);
      dynamicQuestions.push({
        colIndex: colIdx,
        title: h,
        questionType: isMultiple ? "multiple" : "single",
        topCounts,
        totalAnswered: nonEmpties,
      });
    }
  });

  const isYanaiPreset =
    prideRanking.some((p) => p.name.includes("白壁") || p.name.includes("金魚") || p.name.includes("歴史")) ||
    facilityRanking.some((f) => f.name.includes("西蔵") || f.name.includes("ゆめタウン")) ||
    jichikaiDistribution.some((j) => j.name.includes("古市") || j.name.includes("金屋") || j.name.includes("姫田"));

  const ageToWorry = crossTabulate(rows, "q3_age", "q7_worry");
  const ageToHope = crossTabulate(rows, "q3_age", "q8_hope");
  const householdToWorry = crossTabulate(rows, "q4_household", "q7_worry");
  const householdToHope = crossTabulate(rows, "q4_household", "q8_hope");

  // Young/Child-rearing vs Senior contrasts
  const youngRows = rows.filter(
    (r) =>
      r.q3_age?.includes("20") ||
      r.q3_age?.includes("30") ||
      r.q3_age?.includes("40") ||
      r.q3_age?.includes("10")
  );
  const seniorRows = rows.filter(
    (r) =>
      r.q3_age?.includes("60") ||
      r.q3_age?.includes("70") ||
      r.q3_age?.includes("80")
  );
  const childRearingRows = rows.filter(
    (r) =>
      r.q4_household?.includes("子育て") ||
      r.q4_household?.includes("子ども") ||
      r.q4_household?.includes("同居")
  );
  const singleRows = rows.filter(
    (r) =>
      r.q4_household?.includes("単身") ||
      r.q4_household?.includes("1人") ||
      r.q4_household?.includes("一人")
  );

  const getTop = (targetRows: SurveyRow[], key: "q7_worry" | "q8_hope") => {
    if (targetRows.length === 0) return undefined;
    const list = targetRows.flatMap((r) => r[key]);
    const agg = aggregateCounts(list, targetRows.length);
    return agg[0];
  };

  // Collect non-empty free opinions (including Q9 or dynamic text columns)
  let opinions: SurveyOpinion[] = rows
    .filter((r) => r.q9_opinion && r.q9_opinion.trim().length > 0)
    .map((r, idx) => ({
      id: `opinion-${idx + 1}`,
      jichikai: r.q1_jichikai,
      age: r.q3_age,
      household: r.q4_household,
      text: r.q9_opinion!.trim(),
    }));

  // If no Q9 opinion but dynamic text questions exist, populate from the first text question
  if (opinions.length === 0) {
    const textQ = dynamicQuestions.find((q) => q.questionType === "text" && q.opinions && q.opinions.length > 0);
    if (textQ && textQ.opinions) {
      opinions = textQ.opinions.map((text, idx) => ({
        id: `opinion-${idx + 1}`,
        text,
      }));
    }
  }

  return {
    totalCount: total,
    surveyTitle,
    isYanaiPreset,
    ageDistribution,
    householdDistribution,
    genderDistribution,
    jichikaiDistribution,
    prideRanking,
    facilityRanking,
    worryRanking,
    hopeRanking,
    dynamicQuestions,
    ageToWorry,
    ageToHope,
    householdToWorry,
    householdToHope,
    youngTopWorry: getTop(youngRows, "q7_worry"),
    youngTopHope: getTop(youngRows, "q8_hope"),
    seniorTopWorry: getTop(seniorRows, "q7_worry"),
    seniorTopHope: getTop(seniorRows, "q8_hope"),
    childRearingTopHope: getTop(childRearingRows, "q8_hope"),
    childRearingTopWorry: getTop(childRearingRows, "q7_worry"),
    singleTopWorry: getTop(singleRows, "q7_worry"),
    opinions,
  };
}

// Generate the Facilitation Markdown format (Adapts dynamically to any Google Form or Yanai Form)
export function generateFacilitationMarkdown(summary: SurveyAnalysisSummary): string {
  const topPrides = summary.prideRanking.slice(0, 3);
  const topWorries = summary.worryRanking.slice(0, 3);
  const topHopes = summary.hopeRanking.slice(0, 3);

  // If this is a general/custom Google Form that doesn't have standard pride/worry/hope rankings,
  // adapt using dynamic questions automatically!
  const choiceQuestions = summary.dynamicQuestions.filter(
    (q) => (q.questionType === "single" || q.questionType === "multiple") && q.topCounts.length > 0
  );

  const pride1 = topPrides[0]?.name || choiceQuestions[0]?.topCounts[0]?.name || "地域の魅力や資源";
  const pride2 = topPrides[1]?.name || choiceQuestions[0]?.topCounts[1]?.name || "生活環境";
  const pride3 = topPrides[2]?.name || choiceQuestions[0]?.topCounts[2]?.name || "安心安全";

  const worry1 = topWorries[0]?.name || choiceQuestions[1]?.topCounts[0]?.name || "暮らしの利便性や課題";
  const worry2 = topWorries[1]?.name || choiceQuestions[1]?.topCounts[1]?.name || "移動や交通";
  const worry3 = topWorries[2]?.name || choiceQuestions[1]?.topCounts[2]?.name || "維持管理や環境";

  const hope1 = topHopes[0]?.name || choiceQuestions[2]?.topCounts[0]?.name || "集いの場や交流空間";
  const hope2 = topHopes[1]?.name || choiceQuestions[2]?.topCounts[1]?.name || "サービスの充実";
  const hope3 = topHopes[2]?.name || choiceQuestions[2]?.topCounts[2]?.name || "安心できる仕組み";

  // Detailed gap extraction
  const youngWorry = summary.youngTopWorry?.name || "子育て・教育や買い物・利便性";
  const youngWorryPct = summary.youngTopWorry ? `${summary.youngTopWorry.percentage}%` : "多数";
  const youngHope = summary.youngTopHope?.name || "活動・交流の場や生活サポート";

  const seniorWorry = summary.seniorTopWorry?.name || "健康・医療や公共交通・移動";
  const seniorWorryPct = summary.seniorTopWorry ? `${summary.seniorTopWorry.percentage}%` : "多数";
  const seniorHope = summary.seniorTopHope?.name || "医療・福祉の充実や見守り・安心";

  const childRearingHope = summary.childRearingTopHope?.name || "安心できる居場所・集い";

  // Sample real quotes from free opinions if available
  const sampleOpinions = summary.opinions.slice(0, 4);
  const opinionQuotes =
    sampleOpinions.length > 0
      ? `\n> **【回答者の生の声（自由記述・意見より抜粋）】**\n` +
        sampleOpinions
          .map(
            (o) =>
              `> - 「${o.text}」${o.jichikai || o.age ? `（${[o.jichikai, o.age].filter(Boolean).join("・")}）` : ""}`
          )
          .join("\n") +
        "\n>"
      : "";

  const surveySubject = summary.surveyTitle || (summary.isYanaiPreset ? "柳井市まちなかまちづくり" : "アンケート調査");

  return `## 1. まちなかの現状サマリー（定量データのハイライト）

- **全体回収数**: 回答総数 **${summary.totalCount}名**（${surveySubject}の回答データを瞬時に分析・可視化）
- **地域の誇り・強み・高い支持を得た項目**:
  1. **${topPrides[0]?.name || pride1}** (${topPrides[0]?.percentage || 0}% / ${topPrides[0]?.count || 0}票)
  2. **${topPrides[1]?.name || pride2}** (${topPrides[1]?.percentage || 0}% / ${topPrides[1]?.count || 0}票)
  3. **${topPrides[2]?.name || pride3}** (${topPrides[2]?.percentage || 0}% / ${topPrides[2]?.count || 0}票)
- **全体の共通課題・不安**:
  - 最も多くの声が集まったのは **「${worry1}」** (${topWorries[0]?.percentage || 0}%)、次いで **「${worry2}」** (${topWorries[1]?.percentage || 0}%)、**「${worry3}」** (${topWorries[2]?.percentage || 0}%)。
- **世代別・属性別に見られた顕著なギャップ**:
  - **若い世代・現役層**: 日常の切実な困りごととして **「${youngWorry}」** (${youngWorryPct}) への言及が多く、求めているものは **「${youngHope}」** や日常の利便性向上。
  - **シニア層**: **「${seniorWorry}」** (${seniorWorryPct}) や身近な環境への危機感が高く、求めているものは **「${seniorHope}」** や安心して集える居場所。
- **世帯構成別・生活スタイルの対比**:
  - 同居・ファミリー世帯では「${childRearingHope}」への期待が強い一方、単身世帯や高齢世帯では「移動の安心」「見守りやつながり」を重視する傾向が顕著です。

---

## 2. ワークショップ用 事前インプット情報（参加者への提示用）

> **【ファシリテーターからの語りかけ・データを物語として翻訳】**
>
> 今回のアンケートには、私たちのまちや日々の暮らしに対する熱い思いが集まりました。「${pride1}」や「${pride2}」といった誇りや資源を大切に感じながらも、日々の生活では立場や世代によって見えている景色に違いがあります。
>
> - **若い世代・現役層の声**:
>   「${youngWorry}」に直面しており、「日々の生活や子育ての中で安心して過ごせる場所（${youngHope}）がほしい」と願っています。
>
> - **シニア世代・小規模世帯の声**:
>   「${seniorWorry}」への不安を抱えつつも、孤立することなく「**${seniorHope}**」や「気軽に顔を合わせて話せる場」を求めています。
>${opinionQuotes}
>
> 不安や困りごとの内容は人それぞれですが、根底にあるのは「**もっと安心して心地よく暮らしたい**」という共通の願いです。この願いを重ね合わせることこそが、建設的な対話を始める出発点です。

---

## 3. 対話を深める3つの「問い立て」

### 【問い1】地域の強み・自慢 × 課題・不安
> **「私たちが持っている強み『${pride1}』や身近な資源を活かして、住民が不安に感じている『${worry1}』や『${worry3}』を、みんなが安心できる場や新しい価値に変えるには、どんなアイデアがあるでしょうか？」**
> - **対話のヒント**: 強みと課題を対立させず、「すでにある宝物」を使って困りごとを包み込むアプローチを話し合ってみましょう。

### 【問い2】課題・不安 × あったらいいな（期待）
> **「『${worry2}』や『${worry1}』といった日々の困りごとを解消しながら、みんなが望む『${hope1}』や『${hope2}』をカタチにするために、住民同士の小さな助け合いや工夫で始められる一歩は何でしょうか？」**
> - **対話のヒント**: 大きな仕組みだけでなく、明日から試せる声かけや小さな集まりのアイデアを引き出します。

### 【問い3】世代間・多様な立場の掛け合わせ
> **「現役世代が求める『${youngHope}』と、シニア世代が願う『${seniorHope}』。この2つが同じ場所で同時に叶う空間やイベントをつくるとしたら、どんな風景が浮かびますか？」**
> - **対話のヒント**: 多世代が無理なく交ざり合い、お互いに「居心地が良い」と感じられる共通項を探りましょう。
`;
}

// Analyze Co-occurrence & Correlation among Q5 (Pride), Q7 (Worry), Q8 (Hope) for each respondent
export function analyzeCorrelations(rows: SurveyRow[]): CorrelationAnalysisSummary {
  const N = rows.length;
  if (N === 0) {
    return {
      prideToWorry: [],
      worryToHope: [],
      prideToHope: [],
      topStrongestPairs: [],
      worryToPrimaryHope: [],
      prideToPrimaryHope: [],
    };
  }

  // Count individual frequencies
  const prideCounts: Record<string, number> = {};
  const worryCounts: Record<string, number> = {};
  const hopeCounts: Record<string, number> = {};

  rows.forEach((r) => {
    (r.q5_pride || []).forEach((p) => {
      prideCounts[p] = (prideCounts[p] || 0) + 1;
    });
    (r.q7_worry || []).forEach((w) => {
      worryCounts[w] = (worryCounts[w] || 0) + 1;
    });
    (r.q8_hope || []).forEach((h) => {
      hopeCounts[h] = (hopeCounts[h] || 0) + 1;
    });
  });

  // Calculate pair co-occurrences
  const computePairList = (
    sourceKey: "q5_pride" | "q7_worry",
    targetKey: "q5_pride" | "q7_worry" | "q8_hope",
    sourceCounts: Record<string, number>,
    targetCounts: Record<string, number>
  ): CorrelationItem[] => {
    const pairMap: Record<string, number> = {};

    rows.forEach((r) => {
      const sourceList = (r[sourceKey] || []) as string[];
      const targetList = (r[targetKey] || []) as string[];

      // Unique combinations per respondent
      const setS = Array.from(new Set(sourceList));
      const setT = Array.from(new Set(targetList));

      for (const s of setS) {
        for (const t of setT) {
          if (s === t && sourceKey === targetKey) continue;
          const key = `${s}|||${t}`;
          pairMap[key] = (pairMap[key] || 0) + 1;
        }
      }
    });

    const results: CorrelationItem[] = [];

    Object.entries(pairMap).forEach(([key, coOccurrence]) => {
      const [source, target] = key.split("|||");
      const sCount = sourceCounts[source] || 0;
      const tCount = targetCounts[target] || 0;
      if (sCount === 0 || tCount === 0) return;

      const conditionalProb = Math.round((coOccurrence / sCount) * 1000) / 10;
      const reverseProb = Math.round((coOccurrence / tCount) * 1000) / 10;
      // Lift = (coOccurrence / N) / ((sCount / N) * (tCount / N)) = (coOccurrence * N) / (sCount * tCount)
      const lift = Math.round(((coOccurrence * N) / (sCount * tCount)) * 100) / 100;
      // Jaccard = coOccurrence / (sCount + tCount - coOccurrence)
      const jaccard = Math.round((coOccurrence / (sCount + tCount - coOccurrence)) * 100) / 100;

      results.push({
        source,
        target,
        sourceCategory: sourceKey,
        targetCategory: targetKey,
        coOccurrence,
        sourceCount: sCount,
        targetCount: tCount,
        conditionalProb,
        reverseProb,
        lift,
        jaccard,
      });
    });

    // Sort primarily by co-occurrence, then lift
    return results.sort((a, b) => b.coOccurrence - a.coOccurrence || b.lift - a.lift);
  };

  const prideToWorry = computePairList("q5_pride", "q7_worry", prideCounts, worryCounts);
  const worryToHope = computePairList("q7_worry", "q8_hope", worryCounts, hopeCounts);
  const prideToHope = computePairList("q5_pride", "q8_hope", prideCounts, hopeCounts);

  // Top strongest pairs across categories with meaningful support (coOccurrence >= 3 or >= 10% of total)
  const minCo = Math.max(2, Math.round(N * 0.08));
  const candidatePool = [...worryToHope, ...prideToHope, ...prideToWorry].filter(
    (item) => item.coOccurrence >= minCo
  );
  // Sort by lift * coOccurrence weight
  const topStrongestPairs = candidatePool
    .sort((a, b) => b.lift * Math.log2(b.coOccurrence + 1) - a.lift * Math.log2(a.coOccurrence + 1))
    .slice(0, 10);

  // Mapping each worry to its top correlated hopes (What people who have this worry actually want)
  const worryToPrimaryHope = Object.keys(worryCounts)
    .filter((w) => worryCounts[w] >= 2)
    .map((worry) => {
      const related = worryToHope
        .filter((item) => item.source === worry)
        .map((item) => ({
          hope: item.target,
          count: item.coOccurrence,
          percentage: item.conditionalProb,
          lift: item.lift,
        }))
        .sort((a, b) => b.count - a.count || b.lift - a.lift);

      return {
        worry,
        worryCount: worryCounts[worry],
        topHopes: related.slice(0, 4),
      };
    })
    .sort((a, b) => b.worryCount - a.worryCount);

  // Mapping each pride to top correlated hopes
  const prideToPrimaryHope = Object.keys(prideCounts)
    .filter((p) => prideCounts[p] >= 2)
    .map((pride) => {
      const related = prideToHope
        .filter((item) => item.source === pride)
        .map((item) => ({
          hope: item.target,
          count: item.coOccurrence,
          percentage: item.conditionalProb,
        }))
        .sort((a, b) => b.count - a.count);

      return {
        pride,
        prideCount: prideCounts[pride],
        topHopes: related.slice(0, 4),
      };
    })
    .sort((a, b) => b.prideCount - a.prideCount);

  return {
    prideToWorry,
    worryToHope,
    prideToHope,
    topStrongestPairs,
    worryToPrimaryHope,
    prideToPrimaryHope,
  };
}

// Extract string items for any dimension from a SurveyRow (supports presets and dynamic raw column names)
export function getDimensionValues(row: SurveyRow, key: SurveyDimensionKey): string[] {
  switch (key) {
    case "q1_jichikai":
      return row.q1_jichikai ? [row.q1_jichikai] : ["未回答・不明"];
    case "q2_gender":
      return row.q2_gender ? [row.q2_gender] : ["未回答"];
    case "q3_age":
      return row.q3_age ? [row.q3_age] : ["年代不明"];
    case "q4_household":
      return row.q4_household ? [row.q4_household] : ["未回答"];
    case "q5_pride":
      return row.q5_pride && row.q5_pride.length > 0 ? row.q5_pride : ["特になし/未回答"];
    case "q6_facilities":
      return row.q6_facilities && row.q6_facilities.length > 0 ? row.q6_facilities : ["特になし/未回答"];
    case "q7_worry":
      return row.q7_worry && row.q7_worry.length > 0 ? row.q7_worry : ["特になし/未回答"];
    case "q8_hope":
      return row.q8_hope && row.q8_hope.length > 0 ? row.q8_hope : ["特になし/未回答"];
    default: {
      // Dynamic column name lookup directly from raw record
      const val = row.raw[key];
      if (!val || !val.trim()) return ["未回答・空欄"];
      // Check if multiple items
      if (val.includes(",") || val.includes("、") || val.includes(";")) {
        const tokens = splitDynamicCellValues(val);
        return tokens.length > 0 ? tokens : [val.trim()];
      }
      return [val.trim().replace(/^[\d０-９]+[\.．:：\s、\)\-]\s*/, "").trim()];
    }
  }
}

// Dimension display label mapping
export const DIMENSION_LABELS: Record<string, string> = {
  q1_jichikai: "問1: 自治会・地区",
  q2_gender: "問2: 性別",
  q3_age: "問3: 年齢・年代",
  q4_household: "問4: 世帯構成",
  q5_pride: "問5: 自慢できるもの（強み）",
  q6_facilities: "問6: 利用施設",
  q7_worry: "問7: 不安・困りごと（課題）",
  q8_hope: "問8: あったらいいな（期待）",
};

// Helper to get human label for any dimension key
export function getDimensionLabel(key: string): string {
  if (DIMENSION_LABELS[key]) return DIMENSION_LABELS[key];
  return key;
}

// Compute custom dynamic pivot table for any pair of dimensions
export function computePivotTable(
  rows: SurveyRow[],
  rowDim: SurveyDimensionKey,
  colDim: SurveyDimensionKey,
  metric: PivotMetric
): PivotTableData {
  const respondentCount = rows.length;

  // Track raw counts: rowItem -> colItem -> count
  const rawMatrix: Record<string, Record<string, number>> = {};
  const rowTotals: Record<string, number> = {};
  const colTotals: Record<string, number> = {};
  let grandTotal = 0;

  // Initialize
  rows.forEach((row) => {
    const rowVals = Array.from(new Set(getDimensionValues(row, rowDim)));
    const colVals = Array.from(new Set(getDimensionValues(row, colDim)));

    rowVals.forEach((rVal) => {
      if (!rawMatrix[rVal]) rawMatrix[rVal] = {};
      rowTotals[rVal] = (rowTotals[rVal] || 0) + 1;

      colVals.forEach((cVal) => {
        rawMatrix[rVal][cVal] = (rawMatrix[rVal][cVal] || 0) + 1;
        colTotals[cVal] = (colTotals[cVal] || 0) + 1;
        grandTotal += 1;
      });
    });
  });

  // Extract and sort labels
  const rowLabels = Object.keys(rowTotals).sort((a, b) => (rowTotals[b] || 0) - (rowTotals[a] || 0));
  const colLabels = Object.keys(colTotals).sort((a, b) => (colTotals[b] || 0) - (colTotals[a] || 0));

  // Compute final metric values
  const matrix: Record<string, Record<string, number>> = {};

  rowLabels.forEach((rVal) => {
    matrix[rVal] = {};
    const rTotal = rowTotals[rVal] || 0;

    colLabels.forEach((cVal) => {
      const rawCount = rawMatrix[rVal]?.[cVal] || 0;
      const cTotal = colTotals[cVal] || 0;

      if (metric === "count") {
        matrix[rVal][cVal] = rawCount;
      } else if (metric === "row_percent") {
        matrix[rVal][cVal] = rTotal > 0 ? Math.round((rawCount / rTotal) * 1000) / 10 : 0;
      } else if (metric === "col_percent") {
        matrix[rVal][cVal] = cTotal > 0 ? Math.round((rawCount / cTotal) * 1000) / 10 : 0;
      } else if (metric === "total_percent") {
        // Based on total respondent count if available
        matrix[rVal][cVal] =
          respondentCount > 0 ? Math.round((rawCount / respondentCount) * 1000) / 10 : 0;
      }
    });
  });

  return {
    rowDimension: rowDim,
    colDimension: colDim,
    rowDimensionLabel: getDimensionLabel(rowDim),
    colDimensionLabel: getDimensionLabel(colDim),
    metric,
    rowLabels,
    colLabels,
    matrix,
    rowTotals,
    colTotals,
    grandTotal,
    respondentCount,
  };
}


