import React, { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BarChart3,
  Layers,
  HeartHandshake,
  AlertTriangle,
  Lightbulb,
  Building2,
  Users2,
  Filter,
  TrendingUp,
  Info,
  CheckCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { SurveyAnalysisSummary } from "../types/survey";

interface ChartsDashboardProps {
  summary: SurveyAnalysisSummary;
}

const PALETTE = ["#2563eb", "#0ea5e9", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#6366f1", "#14b8a6", "#f97316"];

// Inline helper component for displaying detected choices with interactive preview
const ChoiceTagsPreview: React.FC<{
  title?: string;
  choices?: string[];
  themeColor?: "blue" | "emerald" | "rose" | "amber" | "purple";
}> = ({ title = "認識された選択肢", choices = [], themeColor = "blue" }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  if (!choices || choices.length === 0) return null;

  const colorStyles = {
    blue: "bg-blue-50 text-blue-700 border-blue-200/80 hover:bg-blue-100",
    emerald: "bg-emerald-50 text-emerald-800 border-emerald-200/80 hover:bg-emerald-100",
    rose: "bg-rose-50 text-rose-800 border-rose-200/80 hover:bg-rose-100",
    amber: "bg-amber-50 text-amber-800 border-amber-200/80 hover:bg-amber-100",
    purple: "bg-purple-50 text-purple-800 border-purple-200/80 hover:bg-purple-100",
  }[themeColor];

  return (
    <div className="pt-2 border-t border-slate-100/90">
      <div className="flex items-center justify-between gap-1 text-[11px]">
        <button
          type="button"
          onClick={() => setIsExpanded(!isExpanded)}
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-bold transition ${colorStyles}`}
          title="クリックで認識された全選択肢テキストを展開"
        >
          <Sparkles className="w-2.5 h-2.5" />
          <span>{title} ({choices.length}項目)</span>
          {isExpanded ? <ChevronUp className="w-2.5 h-2.5" /> : <ChevronDown className="w-2.5 h-2.5" />}
        </button>
      </div>

      {isExpanded && (
        <div className="mt-2 p-2.5 bg-slate-50/90 rounded-lg border border-slate-200/80 flex flex-wrap gap-1 max-h-28 overflow-y-auto no-scrollbar animate-fadeIn">
          {choices.map((c, i) => (
            <span
              key={i}
              className="inline-block px-1.5 py-0.5 rounded bg-white text-slate-800 border border-slate-200 text-[10px] font-medium shadow-2xs"
            >
              {c}
            </span>
          ))}
        </div>
      )}
    </div>
  );
};

export const ChartsDashboard: React.FC<ChartsDashboardProps> = ({ summary }) => {
  const [crossTabMode, setCrossTabMode] = useState<"worry" | "hope">("worry");
  const [activeQuestionTab, setActiveQuestionTab] = useState<"standard" | "allQuestions">("standard");

  // Format horizontal bar data for Top 7 items
  const worryData = summary.worryRanking.slice(0, 7).map((item) => ({
    name: item.name.length > 18 ? item.name.substring(0, 18) + "..." : item.name,
    fullName: item.name,
    count: item.count,
    percentage: item.percentage,
  }));

  const hopeData = summary.hopeRanking.slice(0, 7).map((item) => ({
    name: item.name.length > 18 ? item.name.substring(0, 18) + "..." : item.name,
    fullName: item.name,
    count: item.count,
    percentage: item.percentage,
  }));

  const prideData = summary.prideRanking.slice(0, 7).map((item) => ({
    name: item.name.length > 18 ? item.name.substring(0, 18) + "..." : item.name,
    fullName: item.name,
    count: item.count,
    percentage: item.percentage,
  }));

  const facilityData = summary.facilityRanking.slice(0, 6).map((item) => ({
    name: item.name.length > 18 ? item.name.substring(0, 18) + "..." : item.name,
    fullName: item.name,
    count: item.count,
    percentage: item.percentage,
  }));

  // Build matrix for Cross Tabulation (Age × Worry or Hope)
  const crossSource = crossTabMode === "worry" ? summary.ageToWorry : summary.ageToHope;
  const allTargetItems =
    crossTabMode === "worry"
      ? summary.worryRanking.slice(0, 6).map((w) => w.name)
      : summary.hopeRanking.slice(0, 6).map((h) => h.name);

  // Dynamic analytical metrics
  const total = summary.totalCount || 1;
  const seniorCount = summary.ageDistribution
    .filter((a) => a.name.includes("60") || a.name.includes("70") || a.name.includes("80"))
    .reduce((acc, cur) => acc + cur.count, 0);
  const seniorPct = Math.round((seniorCount / total) * 100);

  const topAge = summary.ageDistribution[0];
  const topHousehold = summary.householdDistribution[0];
  const topWorry = summary.worryRanking[0];
  const secondWorry = summary.worryRanking[1];
  const topHope = summary.hopeRanking[0];
  const secondHope = summary.hopeRanking[1];
  const topPride = summary.prideRanking[0];
  const topFacility = summary.facilityRanking[0];

  const titles = summary.questionTitles || {};
  const choices = summary.questionChoices || {};

  const q3Title = titles.q3 || "回答者の年代構成（問3）";
  const q4Title = titles.q4 || "世帯構成の分布（問4）";
  const q7Title = titles.q7 || (summary.isYanaiPreset ? "まちなかでの不安・困りごと（問7 上位）" : "不安・困りごと・課題（上位）");
  const q8Title = titles.q8 || (summary.isYanaiPreset ? "あったらいいなと思うもの（問8 上位）" : "あったらいいな・期待（上位）");
  const q5Title = titles.q5 || (summary.isYanaiPreset ? "柳井の自慢できるもの・誇り（問5）" : "地域の自慢・強み・満足点");
  const q6Title = titles.q6 || (summary.isYanaiPreset ? "普段よく利用するまちなかの施設（問6）" : "利用施設・行動動線");

  const q3Choices = choices.q3 && choices.q3.length > 0 ? choices.q3 : summary.ageDistribution.map((d) => d.name);
  const q4Choices = choices.q4 && choices.q4.length > 0 ? choices.q4 : summary.householdDistribution.map((d) => d.name);
  const q7Choices = choices.q7 && choices.q7.length > 0 ? choices.q7 : summary.worryRanking.map((d) => d.name);
  const q8Choices = choices.q8 && choices.q8.length > 0 ? choices.q8 : summary.hopeRanking.map((d) => d.name);
  const q5Choices = choices.q5 && choices.q5.length > 0 ? choices.q5 : summary.prideRanking.map((d) => d.name);
  const q6Choices = choices.q6 && choices.q6.length > 0 ? choices.q6 : summary.facilityRanking.map((d) => d.name);

  return (
    <div id="survey-dashboard-root" className="space-y-6">
      {/* Top Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            <h3 className="text-lg font-bold text-slate-900">
              アンケート基本集計グラフ・クロス集計
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            全設問の回答分布と、世代間・属性間ギャップを視覚化した基礎統計グラフ
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          {summary.dynamicQuestions && summary.dynamicQuestions.length > 0 && (
            <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveQuestionTab("standard")}
                className={`px-3 py-1.5 rounded-md transition ${
                  activeQuestionTab === "standard"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                標準主要設問 (問1〜問8)
              </button>
              <button
                type="button"
                onClick={() => setActiveQuestionTab("allQuestions")}
                className={`px-3 py-1.5 rounded-md transition flex items-center gap-1.5 ${
                  activeQuestionTab === "allQuestions"
                    ? "bg-white text-blue-700 shadow-2xs font-bold"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>全設問グラフ一覧</span>
                <span className="px-1.5 py-0.2 rounded-full bg-blue-100 text-blue-800 text-[10px]">
                  {summary.dynamicQuestions.length}問
                </span>
              </button>
            </div>
          )}
          <span className="text-xs text-slate-500 font-medium">
            総回答数: <strong className="text-blue-700 font-bold">{summary.totalCount}</strong> 件
          </span>
        </div>
      </div>

      {/* Summary Insights Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-sm space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" />
          <h4 className="text-sm font-bold text-white tracking-wide">
            グラフ集計から読み取れる3大分析結果・重要傾向
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-slate-300">
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/70 space-y-1">
            <span className="text-[11px] font-bold text-blue-300 block">
              1. 回答者の人口構成
            </span>
            <p className="leading-relaxed">
              60代以上の回答が全体の <strong className="text-white font-bold">{seniorPct}%</strong> を占め、シニア層のまちづくりへの関心が極めて高い一方、30〜40代の子育て層（{100 - seniorPct}%）との世代間ニーズの違いに着目する必要があります。
            </p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/70 space-y-1">
            <span className="text-[11px] font-bold text-rose-300 block">
              2. 課題と期待の明確な結びつき
            </span>
            <p className="leading-relaxed">
              {summary.isYanaiPreset ? (
                <>不安第1位の「{topWorry?.name}」（{topWorry?.percentage}%）に対し、期待第1位は「{topHope?.name}」（{topHope?.percentage}%）。建物の物理的修繕だけでなく「人が集まる交流機能」を求める声が顕著です。</>
              ) : (
                <>「{q7Title}」第1位の「{topWorry?.name}」（{topWorry?.percentage}%）に対し、「{q8Title}」第1位は「{topHope?.name}」（{topHope?.percentage}%）。課題の裏返しとして住民主体の解決アプローチが期待されています。</>
              )}
            </p>
          </div>
          <div className="bg-slate-800/80 rounded-lg p-3 border border-slate-700/70 space-y-1">
            <span className="text-[11px] font-bold text-emerald-300 block">
              3. 地域資源と日常動線のギャップ
            </span>
            <p className="leading-relaxed">
              {summary.isYanaiPreset ? (
                <>誇り第1位は「{topPride?.name}」（{topPride?.percentage}%）ですが、日常よく利用する施設は「{topFacility?.name}」などの生活インフラ。歴史遺産と日常の歩行動線の連携が再生の鍵です。</>
              ) : (
                <>「{q5Title}」第1位は「{topPride?.name}」（{topPride?.percentage}%）で、「{q6Title}」では「{topFacility?.name}」が最多。強みとして認識されている要素と日常動線の結びつきが対話の鍵となります。</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Mode A: Standard Preset Questions */}
      {activeQuestionTab === "standard" && (
        <>
          {/* Row 1: Age Distribution & Household Composition */}
          <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 1: Age Distribution (問3) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q3Title}>
                <Users2 className="w-4 h-4 text-blue-600 shrink-0" />
                <span className="truncate">{q3Title}</span>
              </h4>
              <span className="text-[11px] text-slate-400 shrink-0">最多: {topAge?.name} ({topAge?.count}名)</span>
            </div>

            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={summary.ageDistribution}
                  margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#475569" }}
                    interval={0}
                    angle={-20}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: "#475569" }} />
                  <Tooltip
                    formatter={(value: any) => [`${value}名`, "回答数"]}
                    labelFormatter={(label) => `年代: ${label}`}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ChoiceTagsPreview title="認識された年代・属性" choices={q3Choices} themeColor="blue" />
          </div>

          {/* Card 2: Household Distribution (問4) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q4Title}>
                  <Layers className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{q4Title}</span>
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0">最多: {topHousehold?.name} ({topHousehold?.count}名)</span>
              </div>

              <div className="h-64 w-full flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.householdDistribution}
                      dataKey="count"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      innerRadius={36}
                      paddingAngle={2}
                      label={({ name, percent }: any) =>
                        `${(name || "").substring(0, 6)}: ${((percent || 0) * 100).toFixed(0)}%`
                      }
                      labelLine={false}
                    >
                      {summary.householdDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={PALETTE[index % PALETTE.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: any, name: any) => [`${value}名`, name]}
                      contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ChoiceTagsPreview title="認識された世帯構成" choices={q4Choices} themeColor="emerald" />
          </div>
        </div>

        {/* Narrative Analysis for Row 1 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
          <Info className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              【属性分析の示唆】人口構造とまちなか利用の背景
            </span>
            <p className="leading-relaxed text-slate-600">
              {summary.isYanaiPreset ? (
                <>回答者は <strong>{topAge?.name || "シニア層"}</strong> および <strong>{topHousehold?.name || "小世帯"}</strong> が中心となっており、柳井市中心街の高齢化と単身・夫婦世帯の増加を如実に反映しています。ワークショップ設計においては、現状の主たる生活者であるシニア層の「歩きやすさ・日常生活の足」を担保しつつ、これからの持続性を担う子育て・現役世代が「まちなかに訪れたくなる動機」を意図的に掛け合わせることが対話の肝となります。</>
              ) : (
                <>「<strong>{q3Title}</strong>」では <strong>{topAge?.name}</strong>（{topAge?.percentage}%）、「<strong>{q4Title}</strong>」では <strong>{topHousehold?.name}</strong>（{topHousehold?.percentage}%）が最多回答となっています。回答者の属性構成を踏まえ、主要回答層のニーズに応えつつ、多様な立場の視点を取りこぼさない対話の場づくりが求められます。</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Row 2: Worries (問7) & Hopes (問8) */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 3: Worries (問7) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
            <div className="flex items-center justify-between gap-2">
              <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q7Title}>
                <AlertTriangle className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="truncate">{q7Title}</span>
              </h4>
              <span className="text-[11px] text-slate-400 shrink-0">複数回答 (最大3つ)</span>
            </div>

            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={worryData}
                  margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={130}
                    tick={{ fontSize: 10, fill: "#334155" }}
                  />
                  <Tooltip
                    formatter={(val: any, _name: any, item: any) => [
                      `${val}票 (${item.payload.percentage}%)`,
                      "選択数",
                    ]}
                    labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ""}
                    contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                  />
                  <Bar dataKey="count" fill="#f43f5e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <ChoiceTagsPreview title="認識された不安・課題の選択肢" choices={q7Choices} themeColor="rose" />
          </div>

          {/* Card 4: Hopes (問8) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q8Title}>
                  <Lightbulb className="w-4 h-4 text-amber-500 shrink-0" />
                  <span className="truncate">{q8Title}</span>
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0">複数回答 (最大3つ)</span>
              </div>

              <div className="h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={hopeData}
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fontSize: 10, fill: "#334155" }}
                    />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}票 (${item.payload.percentage}%)`,
                        "選択数",
                      ]}
                      labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ""}
                      contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="count" fill="#0ea5e9" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ChoiceTagsPreview title="認識された期待・要望の選択肢" choices={q8Choices} themeColor="amber" />
          </div>
        </div>

        {/* Narrative Analysis for Row 2 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
          <TrendingUp className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              【課題と期待の対比分析】不安の根本原因と住民が求める解決アプローチ
            </span>
            <p className="leading-relaxed text-slate-600">
              {summary.isYanaiPreset ? (
                <>不安の上位には <strong>「{topWorry?.name}」（{topWorry?.percentage}%）</strong>、<strong>「{secondWorry?.name}」（{secondWorry?.percentage}%）</strong> が並び、まちなかの活気減退と景観維持への強い危機感が表れています。一方、期待では <strong>「{topHope?.name}」（{topHope?.percentage}%）</strong> や <strong>「{secondHope?.name}」（{secondHope?.percentage}%）</strong> が突出し、大型再開発よりも「気軽に立ち寄り、人の温もりを感じられる場所」「日常にちょっとした楽しみが生まれる仕掛け」が圧倒的に求められている傾向が読み取れます。</>
              ) : (
                <>「<strong>{q7Title}</strong>」の上位には <strong>「{topWorry?.name}」（{topWorry?.percentage}%）</strong>{secondWorry ? <>、<strong>「{secondWorry?.name}」（{secondWorry?.percentage}%）</strong></> : null} が並び、最も切実な改善課題が浮き彫りになっています。対照的に「<strong>{q8Title}</strong>」では <strong>「{topHope?.name}」（{topHope?.percentage}%）</strong>{secondHope ? <>、<strong>「{secondHope?.name}」（{secondHope?.percentage}%）</strong></> : null} が求められており、課題の裏返しとして住民主体の解決アプローチや環境改善への強い期待が表れています。</>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Row 3: Cross Tabulation Matrix - Generational Needs */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Filter className="w-4 h-4 text-indigo-600" />
              【クロス集計】年代別（問3）× 課題・期待のコントラスト
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              世代ごとに何に困り、何を求めているかのギャップを比較します。
            </p>
          </div>

          {/* Toggle worry vs hope cross tab */}
          <div className="inline-flex p-1 bg-slate-100 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCrossTabMode("worry")}
              className={`px-3 py-1.5 rounded-md transition ${
                crossTabMode === "worry"
                  ? "bg-white text-rose-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              世代別 × 不安・困りごと (問7)
            </button>
            <button
              type="button"
              onClick={() => setCrossTabMode("hope")}
              className={`px-3 py-1.5 rounded-md transition ${
                crossTabMode === "hope"
                  ? "bg-white text-blue-700 shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              世代別 × あったらいいな (問8)
            </button>
          </div>
        </div>

        {/* Cross Tab Table */}
        <div className="overflow-x-auto border border-slate-200 rounded-lg">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-700 font-semibold">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">年代区分</th>
                <th className="py-2.5 px-3 text-center whitespace-nowrap">回答数</th>
                {allTargetItems.map((item, idx) => (
                  <th key={idx} className="py-2.5 px-3 min-w-[130px]">
                    {item}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {crossSource.map((group, rowIdx) => (
                <tr key={rowIdx} className="hover:bg-slate-50/70 transition">
                  <td className="py-2.5 px-3 font-semibold text-slate-900 whitespace-nowrap bg-slate-50/40">
                    {group.category}
                  </td>
                  <td className="py-2.5 px-3 text-center font-bold text-slate-600">
                    {group.total}名
                  </td>
                  {allTargetItems.map((itemKey, colIdx) => {
                    const count = group.items[itemKey] || 0;
                    const pct = group.total > 0 ? Math.round((count / group.total) * 100) : 0;
                    const isHigh = pct >= 40;

                    return (
                      <td key={colIdx} className="py-2.5 px-3">
                        <div className="flex items-center gap-2">
                          <span className={`font-bold ${isHigh ? "text-indigo-600 font-extrabold" : "text-slate-700"}`}>
                            {count}
                          </span>
                          <span className="text-[10px] text-slate-400">({pct}%)</span>
                          {isHigh && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" title="高得票率 (40%以上)" />
                          )}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Narrative Analysis for Row 3 */}
        <div className="bg-indigo-50/60 border border-indigo-200/80 rounded-lg p-3 text-xs text-indigo-950 flex items-start gap-2">
          <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-indigo-900 block mb-0.5">
              【クロス集計の分析結果・世代間ギャップ】
            </span>
            <p className="leading-relaxed text-indigo-900/90">
              {summary.isYanaiPreset ? (
                crossTabMode === "worry" ? (
                  <>
                    70代以上のシニア層では「歩道の段差・街灯の暗さ」「日常の買い物困難」などの<strong>生活インフラ・安全性</strong>への懸念比率が高い傾向にあります。対照的に、30〜50代では「空き家・空き店舗の放置」「子どもが遊べる場所の不足」「夜の静まり返り」への問題意識が高く、<strong>まちの活気・世代循環</strong>への危機感が顕著です。
                  </>
                ) : (
                  <>
                    30〜40代は「親子で過ごせるカフェやマルシェ」「若者の創業支援スペース」への支持率が高く、<strong>日常的な滞在・消費の場</strong>を強く期待しています。一方、60代以上は「気軽に集まり談笑できる縁側のような居場所」「散歩途中のベンチや日陰」を重視しており、<strong>目的を問わず長居できる安心の場</strong>を求める傾向があります。
                  </>
                )
              ) : (
                crossTabMode === "worry" ? (
                  <>
                    世代・属性によって、選択された「<strong>{q7Title}</strong>」に明確な濃淡が見られます。最多得票の「<strong>{topWorry?.name}</strong>」をはじめとする各項目について、どの年代層が切実な課題と感じているかを踏まえた上で、対話のテーマを設定することが効果的です。
                  </>
                ) : (
                  <>
                    世代・属性ごとに「<strong>{q8Title}</strong>」で望む項目の優先順位に差が見られます。全世代共通で支持される「<strong>{topHope?.name}</strong>」を土台としつつ、各世代特有の期待項目も組み込んだアイデア検討が対話を深めます。
                  </>
                )
              )}
            </p>
          </div>
        </div>
      </div>

      {/* Row 4: Pride (問5) & Facilities (問6) */}
      <div className="space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Card 5: Pride & Strengths (問5) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q5Title}>
                  <HeartHandshake className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="truncate">{q5Title}</span>
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0">地域の資源</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={prideData}
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fontSize: 10, fill: "#334155" }}
                    />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}票 (${item.payload.percentage}%)`,
                        "選択数",
                      ]}
                      labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ""}
                      contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="count" fill="#10b981" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ChoiceTagsPreview title="認識された強み・資源の選択肢" choices={q5Choices} themeColor="emerald" />
          </div>

          {/* Card 6: Facilities (問6) */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-slate-800 flex items-center gap-2 truncate" title={q6Title}>
                  <Building2 className="w-4 h-4 text-purple-600 shrink-0" />
                  <span className="truncate">{q6Title}</span>
                </h4>
                <span className="text-[11px] text-slate-400 shrink-0">生活動線</span>
              </div>

              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={facilityData}
                    margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
                    <YAxis
                      dataKey="name"
                      type="category"
                      width={130}
                      tick={{ fontSize: 10, fill: "#334155" }}
                    />
                    <Tooltip
                      formatter={(val: any, _name: any, item: any) => [
                        `${val}票 (${item.payload.percentage}%)`,
                        "選択数",
                      ]}
                      labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ""}
                      contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                    />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <ChoiceTagsPreview title="認識された施設・行動の選択肢" choices={q6Choices} themeColor="purple" />
          </div>
        </div>

        {/* Narrative Analysis for Row 4 */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3.5 text-xs text-slate-700 flex items-start gap-2.5">
          <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-bold text-slate-900 block">
              【資源と動線の結合分析】「強み」を「日常の居場所」に変える視点
            </span>
            <p className="leading-relaxed text-slate-600">
              {summary.isYanaiPreset ? (
                <>誇りとしては <strong>「{topPride?.name}」（{topPride?.percentage}%）</strong> が圧倒的であり、金魚ちょうちんや歴史遺産への愛着は市民共通の財産です。一方で日常の利用動線は <strong>「{topFacility?.name}」</strong> や駅前周辺に偏っており、「白壁エリアは観光客向けであり普段はあまり立ち寄らない」という市民の距離感が窺えます。誇りである白壁エリアの空き家に、日常使いできるカフェやコミュニティスペースを誘致することが、最大の相乗効果を生み出します。</>
              ) : (
                <>「<strong>{q5Title}</strong>」では <strong>「{topPride?.name}」（{topPride?.percentage}%）</strong> が最も高い支持を集め、回答者の共通の強み・誇りとなっています。一方で「<strong>{q6Title}</strong>」では <strong>「{topFacility?.name}」</strong> などの日常的な利用動線が中心。認識されている強みと日常の行動動線をいかに結びつけるかが、次のアクションプランの焦点となります。</>
              )}
            </p>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Mode B: All Questions Dynamic Visualizer for Any Google Form */}
      {activeQuestionTab === "allQuestions" && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold text-sm text-blue-950">
                読み込んだGoogleフォームの全設問（{summary.dynamicQuestions.length}問）を自動解析
              </p>
              <p className="text-blue-800 mt-0.5">
                単一選択・複数選択・自由記述を各設問ごとに自動判別し、最適チャートとランキングを生成しています。
              </p>
            </div>
            <span className="text-[11px] px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-blue-800 font-semibold shrink-0">
              自動判別完了
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {summary.dynamicQuestions.map((q, idx) => {
              if (q.questionType === "text") {
                return (
                  <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3 md:col-span-2">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-100 text-purple-700 flex items-center justify-center font-bold text-xs">
                          {idx + 1}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{q.title}</h4>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded bg-purple-50 text-purple-700 font-semibold">
                        自由記述欄 ({q.totalAnswered}件回答)
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto p-1">
                      {q.opinions && q.opinions.length > 0 ? (
                        q.opinions.slice(0, 12).map((op, oIdx) => (
                          <div key={oIdx} className="p-3 bg-slate-50 border border-slate-200/80 rounded-lg text-xs text-slate-700 leading-relaxed">
                            「{op}」
                          </div>
                        ))
                      ) : (
                        <p className="text-slate-400 text-xs italic">回答なし</p>
                      )}
                    </div>
                  </div>
                );
              }

              const chartData = q.topCounts.slice(0, 8).map((c) => ({
                name: c.name.length > 16 ? c.name.substring(0, 16) + "..." : c.name,
                fullName: c.name,
                count: c.count,
                percentage: c.percentage,
              }));

              return (
                <div key={idx} className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      <span className="w-6 h-6 rounded-md bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-xs shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900 truncate" title={q.title}>
                        {q.title}
                      </h4>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold shrink-0">
                      {q.questionType === "multiple" ? "複数選択" : "単一選択"} ({q.totalAnswered}名)
                    </span>
                  </div>

                  <div className="h-60 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={chartData}
                        margin={{ top: 5, right: 25, left: 10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "#475569" }} />
                        <YAxis
                          dataKey="name"
                          type="category"
                          width={120}
                          tick={{ fontSize: 10, fill: "#334155" }}
                        />
                        <Tooltip
                          formatter={(val: any, _name: any, item: any) => [
                            `${val}票 (${item.payload.percentage}%)`,
                            "回答数",
                          ]}
                          labelFormatter={(_label, payload) => payload[0]?.payload?.fullName || ""}
                          contentStyle={{ borderRadius: "8px", fontSize: "12px", border: "1px solid #e2e8f0" }}
                        />
                        <Bar
                          dataKey="count"
                          fill={PALETTE[idx % PALETTE.length]}
                          radius={[0, 4, 4, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {q.topCounts[0] && (
                    <div className="pt-1 text-[11px] text-slate-500 flex items-center justify-between">
                      <span>最多回答: <strong>{q.topCounts[0].name}</strong></span>
                      <span className="font-semibold text-blue-700">{q.topCounts[0].percentage}% ({q.topCounts[0].count}票)</span>
                    </div>
                  )}

                  <ChoiceTagsPreview
                    title="認識された選択肢一覧"
                    choices={q.topCounts.map((c) => c.name)}
                    themeColor="blue"
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
