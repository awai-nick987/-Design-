import React, { useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Presentation,
  Download,
  Copy,
  Check,
  X,
  ExternalLink,
  Sparkles,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  Share2,
} from "lucide-react";
import * as XLSX from "xlsx";
import { SurveyAnalysisSummary, SurveyRow, PresentationSlide } from "../types/survey";

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: SurveyAnalysisSummary;
  filteredRows: SurveyRow[];
  headers: string[];
  activeMarkdown: string;
  datasetName: string;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  summary,
  filteredRows,
  headers,
  activeMarkdown,
  datasetName,
}) => {
  const [activeTab, setActiveTab] = useState<"docs" | "sheets" | "slides">("docs");
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [isFullscreenSlide, setIsFullscreenSlide] = useState(false);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);

  if (!isOpen) return null;

  const topPride = summary.prideRanking[0]?.name || "なし";
  const topWorry = summary.worryRanking[0]?.name || "なし";
  const topHope = summary.hopeRanking[0]?.name || "なし";

  // Build Presentation Slides
  const slides: PresentationSlide[] = [
    {
      id: 1,
      tag: "表紙",
      title: `${datasetName}`,
      subtitle: "住民アンケート分析結果 & まちなか対話ワークショップ",
      category: "cover",
      points: [
        `分析対象: ${summary.totalCount}名の住民回答`,
        `実施目的: 地域の現状を共有し、住民同士の共創対話を促進する`,
        `提示テーマ: 「強み」×「課題」から導くこれからのまちづくり`,
      ],
      highlight: `有効回答サンプル数: ${summary.totalCount}件`,
    },
    {
      id: 2,
      tag: "全体サマリー",
      title: "数字で見るまちなかの現在地",
      subtitle: "住民が誇りに思うこと・抱えている不安・期待する未来",
      category: "summary",
      points: [
        `自慢・誇り No.1: 「${topPride}」 (${summary.prideRanking[0]?.percentage || 0}%・${summary.prideRanking[0]?.count || 0}票)`,
        `最大の不安 No.1: 「${topWorry}」 (${summary.worryRanking[0]?.percentage || 0}%・${summary.worryRanking[0]?.count || 0}票)`,
        `期待・希望 No.1: 「${topHope}」 (${summary.hopeRanking[0]?.percentage || 0}%・${summary.hopeRanking[0]?.count || 0}票)`,
      ],
      highlight: "「誇り」を守りつつ「不安」を放置せず、「期待」へどう昇華させるかが鍵",
    },
    {
      id: 3,
      tag: "世代別ギャップ",
      title: "世代や世帯によって異なる視点と生活実感",
      subtitle: "シニア層と若者・子育て世代の関心",
      category: "ranking",
      points: [
        summary.seniorTopWorry
          ? `シニア層の切実な声: 「${summary.seniorTopWorry.name}」への不安 (${summary.seniorTopWorry.percentage}%)`
          : "シニア層: 日常の生活安心・通院・買い物の利便性を重視",
        summary.childRearingTopHope
          ? `子育て・現役世代の期待: 「${summary.childRearingTopHope.name}」を求める声 (${summary.childRearingTopHope.percentage}%)`
          : "現役・子育て世代: 子どもと日常的に過ごせる空間や活気を期待",
        "単身・高齢世帯とファミリー世帯で生活時間帯や中心部への関わり方が対照的",
      ],
      highlight: "対立ではなく「異なる世代が自然に交わる居場所」の共創へ",
    },
    {
      id: 4,
      tag: "住民の物語",
      title: "データから見えた日常の物語",
      subtitle: "数字の背景にある住民一人ひとりの想い",
      category: "story",
      points: [
        "白壁の町並みや歴史に深い愛着を持ちながらも、夜間の暗さや空き家の増加に寂しさを感じている住民たち。",
        "「買い物が不便」「若者が集まれる場所がない」と嘆きつつも、イベントやマルシェで人が賑わう瞬間には大きな希望を見出しています。",
        "行政にすべてを求めるのではなく、「自分たちの手でできること」のきっかけを待ち望んでいます。",
      ],
      highlight: "「他人事のまちづくり」から「自分たちの居場所づくり」への転換",
    },
    {
      id: 5,
      tag: "対話の問い 1",
      title: "【問い 1】強みを活かして課題を和らげるには？",
      subtitle: "「自慢できるもの」×「不安・困りごと」",
      category: "question",
      points: [
        `私たちが誇る「${topPride}」という歴史的・地域的景観や温かさを活かして、`,
        `住民が不安視する「${topWorry}」や寂しさを、どのように前向きに解決できるでしょうか？`,
        "例：空き家を単に撤去するのではなく、歴史ある佇まいを活かした憩いの交流カフェや休憩所にリノベーションする",
      ],
      highlight: "過去の遺産を、いま生きる私たちの安心と誇りの拠点にする",
    },
    {
      id: 6,
      tag: "対話の問い 2",
      title: "【問い 2】不安をバネに、期待する未来を拓くには？",
      subtitle: "「不安・困りごと」×「あったらいいな」",
      category: "question",
      points: [
        `「${topWorry}」などの困りごとを解決しながら、`,
        `住民が熱望する「${topHope}」を同時に実現するには、どんなアイデアが考えられるでしょうか？`,
        "例：遊休スペースを活用した定期的なマルシェ、世代間での支え合いサロン",
      ],
      highlight: "困りごとを「新しい活動を始めるチャンス」と捉え直す",
    },
    {
      id: 7,
      tag: "対話の問い 3",
      title: "【問い 3】私たち住民が今すぐ始められる「小さな一歩」は？",
      subtitle: "行政と住民の協働・共創アクション",
      category: "action",
      points: [
        "行政の予算や大きな工事を待つのではなく、",
        "今週末や来月から、住民有志や商店街・若者が一緒にできる「最初のアクション」は何ですか？",
        "例：町並みの清掃散歩、空きスペースでのお試しお茶会、SNSでの魅力発信",
      ],
      highlight: "「小さく始めて、楽しく続ける」が共創の鉄則",
    },
    {
      id: 8,
      tag: "次のステップ",
      title: "本日のワークショップ 対話ルール",
      subtitle: "誰もが安心して発言できる対話の場づくり",
      category: "action",
      points: [
        "1. 人の意見を否定せず、まず「それ面白いね！」と受け止める",
        "2. 役職や年齢に関係なく、一人の生活者としてフラットに対話する",
        "3. 正解を急がず、多様な「気づき」を楽しむ",
      ],
      highlight: "それでは、各テーブルで楽しく対話をスタートしましょう！",
    },
  ];

  // Helper for notification
  const triggerCopyFeedback = (type: string) => {
    setCopiedType(type);
    setTimeout(() => setCopiedType(null), 2500);
  };

  // 1. Google Docs Export Handlers
  const generateDocsHtml = (): string => {
    const prideRows = summary.prideRanking
      .slice(0, 5)
      .map(
        (p, idx) =>
          `<tr><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${idx + 1}位</td><td style="border:1px solid #cbd5e1;padding:8px 12px;font-weight:bold;">${p.name}</td><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;">${p.count}票 (${p.percentage}%)</td></tr>`
      )
      .join("");

    const worryRows = summary.worryRanking
      .slice(0, 5)
      .map(
        (w, idx) =>
          `<tr><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${idx + 1}位</td><td style="border:1px solid #cbd5e1;padding:8px 12px;font-weight:bold;color:#be123c;">${w.name}</td><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;">${w.count}票 (${w.percentage}%)</td></tr>`
      )
      .join("");

    const hopeRows = summary.hopeRanking
      .slice(0, 5)
      .map(
        (h, idx) =>
          `<tr><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;">${idx + 1}位</td><td style="border:1px solid #cbd5e1;padding:8px 12px;font-weight:bold;color:#1d4ed8;">${h.name}</td><td style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;">${h.count}票 (${h.percentage}%)</td></tr>`
      )
      .join("");

    return `
      <div style="font-family: Arial, 'Hiragino Kaku Gothic ProN', Meiryo, sans-serif; line-height: 1.7; color: #1e293b; max-width: 800px; margin: auto;">
        <h1 style="color: #0f172a; border-bottom: 3px solid #2563eb; padding-bottom: 8px; margin-bottom: 4px;">
          ${datasetName}
        </h1>
        <p style="color: #64748b; font-size: 13px; margin-top: 0;">
          作成日時: ${new Date().toLocaleDateString("ja-JP")} | 有効回答数: <strong>${summary.totalCount}件</strong> | まちなか対話ワークショップ支援資料
        </p>

        <div style="background-color: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 16px; margin: 20px 0; border-radius: 0 8px 8px 0;">
          <h2 style="font-size: 16px; margin: 0 0 8px 0; color: #1e3a8a;">【資料概要】</h2>
          <p style="font-size: 14px; margin: 0;">
            本資料は、アンケート結果を瞬時にクロス集計し、住民同士の対話ワークショップ（まちなか井戸端会議など）で提示するための「現状サマリー」「物語翻訳」「3つの問い立て」を整理したものです。
          </p>
        </div>

        <h2 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px;">
          1. まちなかの現状サマリー（定量データのハイライト）
        </h2>
        <ul>
          <li><strong>自慢・誇り No.1:</strong> 「${topPride}」 (${summary.prideRanking[0]?.percentage || 0}%)</li>
          <li><strong>最大の不安 No.1:</strong> 「${topWorry}」 (${summary.worryRanking[0]?.percentage || 0}%)</li>
          <li><strong>住民の期待 No.1:</strong> 「${topHope}」 (${summary.hopeRanking[0]?.percentage || 0}%)</li>
          ${
            summary.seniorTopWorry
              ? `<li><strong>世代別ギャップ:</strong> シニア層の${summary.seniorTopWorry.percentage}%が「${summary.seniorTopWorry.name}」を懸念する一方、若者・子育て層は居場所や日常の賑わいを希求。</li>`
              : ""
          }
        </ul>

        <h2 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px;">
          2. ワークショップ用 事前インプット情報（参加者への提示用）
        </h2>
        <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 14px 18px; margin: 16px 0;">
          <p style="margin: 0; font-size: 14px; line-height: 1.8; color: #1e40af;">
            多くの住民が「${topPride}」を地域の宝として大切に誇示する一方で、日常生活においては「${topWorry}」への不安を抱えています。しかし、住民が求めているのは単なる不満の解消ではなく、「${topHope}」をはじめとする、人と人とのふれあいや賑わいを取り戻すことです。
          </p>
        </div>

        <h2 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px;">
          3. 対話を深める3つの「問い立て」
        </h2>
        <ol style="padding-left: 20px; font-size: 14px; line-height: 1.8;">
          <li style="margin-bottom: 12px;">
            <strong>【強み×課題】</strong> 私たちの自慢である「${topPride}」を活かして、住民が最も不安を感じている「${topWorry}」を和らげるには、どのようなアイデアが考えられるでしょうか？
          </li>
          <li style="margin-bottom: 12px;">
            <strong>【課題×期待】</strong> 「${topWorry}」の悩みをバネにして、住民が求める「${topHope}」を形にしていくための具体的な仕掛けは何でしょうか？
          </li>
          <li style="margin-bottom: 12px;">
            <strong>【協働アクション】</strong> 行政に頼るだけでなく、私たち住民自身が来週・来月から始められる「小さな最初の一歩」は何でしょうか？
          </li>
        </ol>

        <h2 style="color: #1e3a8a; border-bottom: 1px solid #e2e8f0; padding-bottom: 6px; margin-top: 28px;">
          4. 主な設問ランキング一覧表
        </h2>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 12px 0;">
          <thead>
            <tr style="background-color: #f1f5f9;">
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;width:60px;">順位</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;">誇り・自慢できるもの (問5)</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;width:120px;">得票数 (割合)</th>
            </tr>
          </thead>
          <tbody>
            ${prideRows}
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <thead>
            <tr style="background-color: #fff1f2;">
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;width:60px;">順位</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;color:#be123c;">不安・困りごと (問7)</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;width:120px;">得票数 (割合)</th>
            </tr>
          </thead>
          <tbody>
            ${worryRows}
          </tbody>
        </table>

        <table style="width: 100%; border-collapse: collapse; font-size: 13px; margin: 16px 0;">
          <thead>
            <tr style="background-color: #eff6ff;">
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:center;width:60px;">順位</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:left;color:#1d4ed8;">あったらいいな (問8)</th>
              <th style="border:1px solid #cbd5e1;padding:8px 12px;text-align:right;width:120px;">得票数 (割合)</th>
            </tr>
          </thead>
          <tbody>
            ${hopeRows}
          </tbody>
        </table>

        <hr style="margin: 30px 0; border: none; border-top: 1px dashed #cbd5e1;" />
        <p style="font-size: 11px; color: #94a3b8; text-align: center;">
          あわいDesign | アンケート クロス集計ダッシュボード
        </p>
      </div>
    `;
  };

  const handleCopyRichTextDocs = async () => {
    try {
      const htmlContent = generateDocsHtml();
      const plainText = `${datasetName}\n\n${activeMarkdown}\n\n回答数: ${summary.totalCount}件`;

      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          "text/html": new Blob([htmlContent], { type: "text/html" }),
          "text/plain": new Blob([plainText], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else {
        await navigator.clipboard.writeText(plainText);
      }
      triggerCopyFeedback("docs-rich");
    } catch (e) {
      // Fallback
      navigator.clipboard.writeText(activeMarkdown);
      triggerCopyFeedback("docs-plain");
    }
  };

  const handleDownloadDocsHtml = () => {
    const fullHtml = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${datasetName}</title></head><body style="padding:40px;background:#f8fafc;">${generateDocsHtml()}</body></html>`;
    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${datasetName}_GoogleDocs提出用.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 2. Google Sheets Export Handlers (SheetJS XLSX)
  const handleDownloadSheetsXlsx = () => {
    const wb = XLSX.utils.book_new();

    // Sheet 1: Summary Sheet
    const summaryData = [
      ["ダッシュボード名称", datasetName],
      ["集計日時", new Date().toLocaleString("ja-JP")],
      ["有効回答数", summary.totalCount],
      [],
      ["【主要指標ハイライト】", ""],
      ["誇り・自慢 No.1", topPride, `${summary.prideRanking[0]?.count || 0}票`, `${summary.prideRanking[0]?.percentage || 0}%`],
      ["最大の不安 No.1", topWorry, `${summary.worryRanking[0]?.count || 0}票`, `${summary.worryRanking[0]?.percentage || 0}%`],
      ["住民の期待 No.1", topHope, `${summary.hopeRanking[0]?.count || 0}票`, `${summary.hopeRanking[0]?.percentage || 0}%`],
      [],
      ["【ファシリテーション用 3つの問い立て】", ""],
      ["問い1 (強み×課題)", `自慢「${topPride}」を活かして、不安「${topWorry}」をどう解消するか？`],
      ["問い2 (課題×期待)", `不安「${topWorry}」をバネに、期待「${topHope}」をどう実現するか？`],
      ["問い3 (協働アクション)", "行政任せでなく、住民自身が今すぐできる最初の一歩は何か？"],
    ];
    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    XLSX.utils.book_append_sheet(wb, wsSummary, "1_サマリー");

    // Sheet 2: Basic Rankings (問1〜8)
    const basicRankingsData: (string | number)[][] = [
      ["分類", "順位", "項目名", "回答数", "構成比(%)"],
    ];

    summary.prideRanking.forEach((p, i) => {
      basicRankingsData.push(["自慢・強み(問5)", i + 1, p.name, p.count, p.percentage]);
    });
    summary.worryRanking.forEach((w, i) => {
      basicRankingsData.push(["不安・課題(問7)", i + 1, w.name, w.count, w.percentage]);
    });
    summary.hopeRanking.forEach((h, i) => {
      basicRankingsData.push(["期待・要望(問8)", i + 1, h.name, h.count, h.percentage]);
    });
    summary.facilityRanking.forEach((f, i) => {
      basicRankingsData.push(["利用施設(問6)", i + 1, f.name, f.count, f.percentage]);
    });
    summary.ageDistribution.forEach((a, i) => {
      basicRankingsData.push(["年齢層(問3)", i + 1, a.name, a.count, a.percentage]);
    });
    summary.householdDistribution.forEach((hh, i) => {
      basicRankingsData.push(["世帯構成(問4)", i + 1, hh.name, hh.count, hh.percentage]);
    });

    const wsRankings = XLSX.utils.aoa_to_sheet(basicRankingsData);
    XLSX.utils.book_append_sheet(wb, wsRankings, "2_基本集計ランキング");

    // Sheet 3: Cross Tabulation Age x Worry
    const ageCategories = summary.ageDistribution.map((a) => a.name);
    const topWorries = summary.worryRanking.slice(0, 10).map((w) => w.name);
    const crossAgeWorryData: (string | number)[][] = [
      ["年代", ...topWorries, "回答数計"],
    ];

    summary.ageToWorry.forEach((row) => {
      const line: (string | number)[] = [row.category];
      topWorries.forEach((w) => {
        line.push(row.items[w] || 0);
      });
      line.push(row.total);
      crossAgeWorryData.push(line);
    });

    const wsCrossAge = XLSX.utils.aoa_to_sheet(crossAgeWorryData);
    XLSX.utils.book_append_sheet(wb, wsCrossAge, "3_クロス_年代×不安");

    // Sheet 4: Raw Responses Data
    const rawDataHeader = headers.length > 0 ? headers : ["No", "地区", "性別", "年代", "世帯", "自慢", "施設", "不安", "期待", "意見"];
    const rawDataRows: (string | number)[][] = [rawDataHeader];

    filteredRows.forEach((row, i) => {
      if (headers.length > 0) {
        rawDataRows.push(headers.map((h) => row.raw[h] || ""));
      } else {
        rawDataRows.push([
          i + 1,
          row.q1_jichikai || "",
          row.q2_gender || "",
          row.q3_age || "",
          row.q4_household || "",
          row.q5_pride.join(", "),
          row.q6_facilities.join(", "),
          row.q7_worry.join(", "),
          row.q8_hope.join(", "),
          row.q9_opinion || "",
        ]);
      }
    });

    const wsRaw = XLSX.utils.aoa_to_sheet(rawDataRows);
    XLSX.utils.book_append_sheet(wb, wsRaw, "4_全回答生データ");

    XLSX.writeFile(wb, `${datasetName}_スプレッドシート用.xlsx`);
  };

  const handleCopySheetsTsv = () => {
    // Basic TSV of top rankings
    const lines: string[] = [
      ["設問カテゴリ", "順位", "項目名", "回答数", "構成比(%)"].join("\t"),
    ];
    summary.prideRanking.forEach((p, i) => {
      lines.push(["問5_自慢", i + 1, p.name, p.count, `${p.percentage}%`].join("\t"));
    });
    summary.worryRanking.forEach((w, i) => {
      lines.push(["問7_不安", i + 1, w.name, w.count, `${w.percentage}%`].join("\t"));
    });
    summary.hopeRanking.forEach((h, i) => {
      lines.push(["問8_期待", i + 1, h.name, h.count, `${h.percentage}%`].join("\t"));
    });

    navigator.clipboard.writeText(lines.join("\n"));
    triggerCopyFeedback("sheets-tsv");
  };

  // 3. Google Slides Export Handlers
  const handleCopySlidesOutline = () => {
    const textBlocks = slides.map((s) => {
      return `【スライド ${s.id}: ${s.title}】\nサブタイトル: ${s.subtitle || ""}\n\n内容:\n${s.points
        .map((p) => `・ ${p}`)
        .join("\n")}\n\nハイライト: ${s.highlight || ""}\n----------------------------------------`;
    });

    const fullSlidesText = `${datasetName} - Googleスライド構成案\n全${slides.length}枚\n\n` + textBlocks.join("\n\n");
    navigator.clipboard.writeText(fullSlidesText);
    triggerCopyFeedback("slides-outline");
  };

  const handleDownloadSlidesHtml = () => {
    const slideCardsHtml = slides
      .map(
        (s) => `
        <div style="page-break-after: always; width: 960px; height: 540px; background: #ffffff; border-radius: 16px; margin: 24px auto; box-shadow: 0 4px 20px rgba(0,0,0,0.1); padding: 48px; box-sizing: border-box; display: flex; flex-direction: column; justify-content: space-between; border: 1px solid #e2e8f0; font-family: sans-serif;">
          <div>
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
              <span style="background: #eff6ff; color: #1d4ed8; font-weight: bold; font-size: 13px; padding: 4px 12px; rounded: 6px;">${s.tag}</span>
              <span style="color: #94a3b8; font-size: 13px;">${s.id} / ${slides.length}</span>
            </div>
            <h2 style="font-size: 28px; font-weight: bold; color: #0f172a; margin: 0 0 8px 0;">${s.title}</h2>
            <p style="font-size: 16px; color: #64748b; margin: 0 0 24px 0;">${s.subtitle || ""}</p>
            <ul style="font-size: 18px; line-height: 1.8; color: #334155; padding-left: 24px;">
              ${s.points.map((p) => `<li style="margin-bottom: 12px;">${p}</li>`).join("")}
            </ul>
          </div>
          ${
            s.highlight
              ? `<div style="background: #f8fafc; border-left: 4px solid #2563eb; padding: 12px 18px; border-radius: 4px; font-size: 16px; font-weight: bold; color: #1e3a8a;">💡 ${s.highlight}</div>`
              : ""
          }
        </div>
      `
      )
      .join("");

    const fullHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>${datasetName} - スライド資料</title>
          <style>
            @media print {
              body { background: white !important; margin: 0 !important; padding: 0 !important; }
              div { box-shadow: none !important; margin: 0 !important; page-break-after: always !important; }
            }
          </style>
        </head>
        <body style="background: #0f172a; padding: 20px; margin: 0;">
          <div style="text-align: center; color: white; margin-bottom: 20px;">
            <p style="font-size: 14px; color: #94a3b8;">※ ブラウザの印刷メニュー（Ctrl+P / Cmd+P）で「PDFとして保存」またはそのままプロジェクター投影できます。</p>
          </div>
          ${slideCardsHtml}
        </body>
      </html>
    `;

    const blob = new Blob([fullHtml], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${datasetName}_スライド発表資料.html`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const activeSlide = slides[currentSlideIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-2 sm:p-4 animate-fadeIn">
      {/* Fullscreen Presentation Mode */}
      {isFullscreenSlide ? (
        <div className="fixed inset-0 z-60 bg-slate-950 text-white flex flex-col justify-between p-6 sm:p-12 animate-fadeIn">
          {/* Top Bar in Fullscreen */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold uppercase tracking-wider">
                {activeSlide.tag}
              </span>
              <span className="text-sm font-medium text-slate-400">
                スライド {currentSlideIndex + 1} / {slides.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsFullscreenSlide(false)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition"
              title="全画面を終了 (ESC)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Slide Area */}
          <div className="max-w-4xl mx-auto w-full my-auto py-8">
            <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight mb-4">
              {activeSlide.title}
            </h1>
            {activeSlide.subtitle && (
              <p className="text-lg sm:text-xl text-blue-300 mb-8 font-medium">
                {activeSlide.subtitle}
              </p>
            )}

            <div className="bg-slate-900/80 rounded-2xl p-6 sm:p-8 border border-slate-800 mb-6">
              <ul className="space-y-4 text-base sm:text-xl text-slate-200">
                {activeSlide.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500 mt-2.5 shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>

            {activeSlide.highlight && (
              <div className="bg-blue-950/60 border-l-4 border-blue-400 p-4 rounded-r-xl text-blue-200 text-base sm:text-lg font-bold">
                💡 {activeSlide.highlight}
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          <div className="flex items-center justify-between border-t border-slate-800 pt-4">
            <button
              type="button"
              disabled={currentSlideIndex === 0}
              onClick={() => setCurrentSlideIndex((prev) => Math.max(0, prev - 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-sm font-semibold transition"
            >
              <ChevronLeft className="w-4 h-4" />
              前へ
            </button>

            <div className="flex items-center gap-1.5">
              {slides.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setCurrentSlideIndex(idx)}
                  className={`w-3 h-3 rounded-full transition ${
                    idx === currentSlideIndex ? "bg-blue-500 w-8" : "bg-slate-700 hover:bg-slate-600"
                  }`}
                />
              ))}
            </div>

            <button
              type="button"
              disabled={currentSlideIndex === slides.length - 1}
              onClick={() => setCurrentSlideIndex((prev) => Math.min(slides.length - 1, prev + 1))}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-sm font-semibold transition"
            >
              次へ
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        /* Regular Modal Card */
        <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center">
                  <Share2 className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    ダッシュボード内容のエクスポート
                  </h2>
                  <p className="text-xs text-slate-500">
                    「{datasetName}」（有効回答: {summary.totalCount}件）のデータを各サービス用に最適出力
                  </p>
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 3 Major Google Services Navigation Tabs */}
          <div className="border-b border-slate-200 bg-white px-4 sm:px-6 flex gap-2 sm:gap-4 overflow-x-auto no-scrollbar">
            {/* Tab 1: Google Docs */}
            <button
              type="button"
              onClick={() => setActiveTab("docs")}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === "docs"
                  ? "border-blue-600 text-blue-700 bg-blue-50/30"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileText className="w-4 h-4 text-blue-600" />
              <span>Googleドキュメント</span>
              <span className="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-medium">
                報告書・台本
              </span>
            </button>

            {/* Tab 2: Google Sheets */}
            <button
              type="button"
              onClick={() => setActiveTab("sheets")}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === "sheets"
                  ? "border-emerald-600 text-emerald-700 bg-emerald-50/30"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
              <span>Googleスプレッドシート</span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-medium">
                複数シートXLSX
              </span>
            </button>

            {/* Tab 3: Google Slides */}
            <button
              type="button"
              onClick={() => setActiveTab("slides")}
              className={`py-3 px-3 text-xs sm:text-sm font-bold border-b-2 flex items-center gap-2 transition whitespace-nowrap ${
                activeTab === "slides"
                  ? "border-amber-600 text-amber-700 bg-amber-50/30"
                  : "border-transparent text-slate-600 hover:text-slate-900"
              }`}
            >
              <Presentation className="w-4 h-4 text-amber-600" />
              <span>Googleスライド</span>
              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-medium">
                ワークショップ投影
              </span>
            </button>
          </div>

          {/* Tab Content Body */}
          <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-5 bg-slate-50/40">
            {/* 1. Google Docs Content */}
            {activeTab === "docs" && (
              <div className="space-y-4">
                <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-4 text-xs text-blue-900 flex items-start gap-3">
                  <FileText className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-blue-950">
                      Googleドキュメントに直接貼り付けできるリッチテキスト
                    </p>
                    <p className="text-blue-800 leading-relaxed">
                      「Googleドキュメント用にコピー」を押して、Google Docsの空白ページで <strong>Ctrl+V (Cmd+V)</strong> を押すだけで、見出し・箇条書き・集計表（テーブル）・強調枠がすべて崩れずそのまま貼り付けられます。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleCopyRichTextDocs}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    {copiedType === "docs-rich" ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === "docs-rich" ? "コピー完了！Google Docsに貼り付け可能" : "Googleドキュメント用にコピー (書式付き)"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadDocsHtml}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>HTMLレポートをダウンロード (.html)</span>
                  </button>
                </div>

                {/* Preview Box */}
                <div className="border border-slate-200 rounded-xl bg-white p-4 text-xs text-slate-700 shadow-2xs max-h-72 overflow-y-auto space-y-3 font-sans">
                  <div className="border-b border-slate-100 pb-2 flex items-center justify-between text-slate-400 text-[11px]">
                    <span>ドキュメント出力プレビュー</span>
                    <span>A4レポート形式</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900">{datasetName}</h3>
                  <div className="p-3 bg-slate-50 rounded-lg border border-slate-200/70 space-y-1">
                    <span className="font-bold text-slate-800">1. まちなかの現状サマリー</span>
                    <p className="text-slate-600">自慢1位: {topPride} ({summary.prideRanking[0]?.percentage || 0}%) / 不安1位: {topWorry} / 期待1位: {topHope}</p>
                  </div>
                  <div className="p-3 bg-blue-50/60 rounded-lg border border-blue-200/70 space-y-1">
                    <span className="font-bold text-blue-900">2. ワークショップ用 事前インプット情報</span>
                    <p className="text-blue-800">住民が「自分ごと」として捉えられる物語文章を提示。</p>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-lg border border-amber-200/70 space-y-1">
                    <span className="font-bold text-amber-900">3. 対話を深める3つの「問い立て」</span>
                    <p className="text-amber-800">強み×課題、課題×期待、協働アクションの3問を明記。</p>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Google Sheets Content */}
            {activeTab === "sheets" && (
              <div className="space-y-4">
                <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 text-xs text-emerald-950 flex items-start gap-3">
                  <FileSpreadsheet className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-emerald-950">
                      Googleドライブに直接アップロードできる複数シート形式（.xlsx）
                    </p>
                    <p className="text-emerald-800 leading-relaxed">
                      「Excel形式でダウンロード」したファイルをGoogleドライブにドラッグ＆ドロップすると、サマリー・基本集計・クロス集計・全回答生データの4つのシートが綺麗に分かれたスプレッドシートとしてすぐに開けます。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleDownloadSheetsXlsx}
                    className="flex items-center gap-2 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Download className="w-4 h-4" />
                    <span>スプレッドシート用エクセルをダウンロード (.xlsx)</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySheetsTsv}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    {copiedType === "sheets-tsv" ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === "sheets-tsv" ? "TSVコピー完了！" : "TSV形式でコピー（セル直接貼付用）"}</span>
                  </button>
                </div>

                {/* Sheet Structure Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">Sheet 1</span>
                      サマリー指標 & 問い立て
                    </span>
                    <p className="text-slate-500 text-[11px]">有効回答数、自慢・不安・期待の第1位指標、対話用3問のテキスト。</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">Sheet 2</span>
                      基本集計ランキング表
                    </span>
                    <p className="text-slate-500 text-[11px]">問1〜8（自治会・年代・世帯・自慢・施設・不安・期待）の回答度数と割合。</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">Sheet 3</span>
                      年代別クロス集計マトリクス
                    </span>
                    <p className="text-slate-500 text-[11px]">年代（20代〜80代以上）ごとの不安・課題Top10のクロス集計表。</p>
                  </div>
                  <div className="p-3.5 bg-white rounded-xl border border-slate-200 space-y-1 shadow-2xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-mono text-[10px]">Sheet 4</span>
                      全回答生データ (Filtered Rows)
                    </span>
                    <p className="text-slate-500 text-[11px]">アンケートの全回答行（{filteredRows.length}件）を1行1件で完全収録。</p>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Google Slides Content */}
            {activeTab === "slides" && (
              <div className="space-y-4">
                <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-4 text-xs text-amber-950 flex items-start gap-3">
                  <Presentation className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-amber-950">
                      ワークショップや報告会でそのまま投影できるスライド構成（全{slides.length}枚）
                    </p>
                    <p className="text-amber-800 leading-relaxed">
                      「スライド全画面投影」で今すぐプロジェクター発表ができるほか、「Googleスライド用アウトラインをコピー」でGoogleスライドにそのまま各ページの原稿として貼り付けられます。
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setIsFullscreenSlide(true);
                      setCurrentSlideIndex(0);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold shadow-xs transition"
                  >
                    <Maximize2 className="w-4 h-4" />
                    <span>スライド全画面投影（発表モード）</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCopySlidesOutline}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    {copiedType === "slides-outline" ? <Check className="w-4 h-4 text-amber-600" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedType === "slides-outline" ? "コピー完了！" : "Googleスライド用アウトラインをコピー"}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleDownloadSlidesHtml}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-semibold transition"
                  >
                    <Download className="w-4 h-4 text-slate-500" />
                    <span>スライドHTMLをダウンロード</span>
                  </button>
                </div>

                {/* Slides Thumbnail List */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  {slides.map((s, idx) => (
                    <div
                      key={s.id}
                      onClick={() => {
                        setCurrentSlideIndex(idx);
                        setIsFullscreenSlide(true);
                      }}
                      className="cursor-pointer bg-white rounded-xl border border-slate-200 p-3 hover:border-amber-400 hover:shadow-md transition text-left flex flex-col justify-between group"
                    >
                      <div>
                        <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                          <span className="font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded">
                            {s.tag}
                          </span>
                          <span>スライド {s.id}</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 group-hover:text-amber-800 transition line-clamp-2">
                          {s.title}
                        </h4>
                        <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                          {s.subtitle || s.points[0]}
                        </p>
                      </div>
                      <div className="mt-2 text-[10px] text-amber-600 font-semibold flex items-center gap-0.5">
                        <span>拡大プレビュー</span>
                        <ChevronRight className="w-3 h-3" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 sm:p-4 border-t border-slate-200 bg-white flex items-center justify-between">
            <span className="text-xs text-slate-500">
              各エクスポートは個人情報をマスキングした集計データが出力されます
            </span>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition"
            >
              閉じる
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
