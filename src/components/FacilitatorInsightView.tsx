import React, { useState } from "react";
import {
  Sparkles,
  Copy,
  Check,
  Printer,
  FileText,
  Lightbulb,
  MessageSquare,
  TrendingUp,
  Users,
  Compass,
  RefreshCw,
  Sliders,
  ChevronDown,
} from "lucide-react";
import { SurveyAnalysisSummary } from "../types/survey";

interface FacilitatorInsightViewProps {
  markdown: string;
  summary: SurveyAnalysisSummary;
  onRefreshAi?: (extraPrompt?: string) => Promise<void>;
  isAiLoading?: boolean;
}

export const FacilitatorInsightView: React.FC<FacilitatorInsightViewProps> = ({
  markdown,
  summary,
  onRefreshAi,
  isAiLoading = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [viewMode, setViewMode] = useState<"card" | "markdown">("card");
  const [promptExtra, setPromptExtra] = useState("");
  const [showPromptInput, setShowPromptInput] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(markdown);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  // Top rankings for cards
  const topPride = summary.prideRanking[0]?.name || "白壁の町並み";
  const topWorry = summary.worryRanking[0]?.name || "空き家・空き店舗の増加";
  const topHope = summary.hopeRanking[0]?.name || "多世代が交流できるカフェ・居場所";

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-8">
      {/* Facilitator Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-blue-950 text-white p-5 sm:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400 text-slate-950 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Facilitator Output
              </span>
              <span className="text-xs text-slate-300 font-medium">
                {summary.isYanaiPreset
                  ? "柳井市「まちなか井戸端会議」ワークショップ設計シート"
                  : `${summary.surveyTitle || "Googleフォーム"} ワークショップ対話設計シート`}
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>対話のためのインサイト ＆ 3つの問い立て</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              {summary.isYanaiPreset
                ? "集計データから世代間・世帯構成のギャップを物語に翻訳し、住民同士が「自分ごと」として前向きに協働できる対話の問いを設計しました。"
                : "アンケート回答データから立場や属性のギャップを抽出し、参加者同士が「自分ごと」として対話を深めるための問いを設計しました。"}
            </p>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {onRefreshAi && (
              <button
                type="button"
                onClick={() => setShowPromptInput(!showPromptInput)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-blue-600/80 hover:bg-blue-600 text-white border border-blue-400/40 transition shadow-xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAiLoading ? "animate-spin" : ""}`} />
                <span>AI深掘り生成</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            )}

            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-xs"
              title="Markdownテキストをクリップボードにコピー"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">コピー完了</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Markdownコピー</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold bg-white/10 hover:bg-white/20 text-white border border-white/20 transition shadow-xs"
              title="ワークショップ配布用に印刷・PDF保存"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ワークショップ用印刷</span>
            </button>
          </div>
        </div>

        {/* AI custom prompt accordion */}
        {showPromptInput && onRefreshAi && (
          <div className="mt-4 p-3.5 bg-white/10 rounded-lg border border-white/20 space-y-2">
            <p className="text-xs text-slate-200">
              柳井市まちなか井戸端会議のテーマ（例: 「空き店舗活用」「若者とシニアの居場所」「夜の賑わいづくり」など）に合わせた重点的な問い立てをAIに依頼できます。
            </p>
            <div className="flex gap-2">
              <input
                type="text"
                value={promptExtra}
                onChange={(e) => setPromptExtra(e.target.value)}
                placeholder="例: 白壁通りの古民家を若者カフェとして再生する問いを重点的に立ててほしい"
                className="flex-1 px-3 py-1.5 bg-slate-900/60 border border-white/30 rounded text-xs text-white placeholder:text-slate-400 focus:outline-none focus:border-blue-400"
              />
              <button
                type="button"
                onClick={() => onRefreshAi(promptExtra)}
                disabled={isAiLoading}
                className="px-4 py-1.5 bg-amber-400 hover:bg-amber-300 disabled:bg-slate-500 text-slate-950 font-bold text-xs rounded transition flex items-center gap-1.5"
              >
                {isAiLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                <span>生成</span>
              </button>
            </div>
          </div>
        )}

        {/* View mode toggle */}
        <div className="mt-4 flex items-center gap-2 pt-2 border-t border-white/10">
          <span className="text-xs text-slate-400">表示モード:</span>
          <div className="inline-flex p-0.5 bg-black/30 rounded-lg text-xs">
            <button
              type="button"
              onClick={() => setViewMode("card")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === "card" ? "bg-white text-slate-900 shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              ワークショップ提示用カード
            </button>
            <button
              type="button"
              onClick={() => setViewMode("markdown")}
              className={`px-3 py-1 rounded-md font-medium transition ${
                viewMode === "markdown" ? "bg-white text-slate-900 shadow-xs" : "text-slate-300 hover:text-white"
              }`}
            >
              マークダウン raw 出力
            </button>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="p-5 sm:p-8 space-y-8 bg-slate-50/50">
        {viewMode === "markdown" ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>指定のフォーマット（1.現状サマリー / 2.事前インプット情報 / 3.対話を深める3つの問い立て）に準拠した出力です。</span>
              <button onClick={handleCopy} className="text-blue-600 hover:underline flex items-center gap-1">
                <Copy className="w-3 h-3" />
                コピーする
              </button>
            </div>
            <pre className="p-4 sm:p-6 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm font-mono text-slate-800 whitespace-pre-wrap leading-relaxed shadow-inner overflow-x-auto">
              {markdown}
            </pre>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Section 1: Quantitative Highlights */}
            <section id="insight-summary" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  1
                </div>
                <h3 className="text-lg font-bold text-slate-900">
                  まちなかの現状サマリー（定量データのハイライト）
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Highlight Card: Strengths */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded truncate max-w-[200px]" title={summary.questionTitles?.q5}>
                      {summary.questionTitles?.q5 ? `${summary.questionTitles.q5.substring(0, 16)}...` : "問5: まちの誇り・強み"}
                    </span>
                    <Sparkles className="w-4 h-4 text-emerald-500 shrink-0" />
                  </div>
                  <p className="text-base font-bold text-slate-900">{topPride}</p>
                  <p className="text-xs text-slate-500">
                    {summary.isYanaiPreset
                      ? "白壁の町並み・金魚ちょうちん・瀬戸内の食など、歴史的資産と景観への愛着が圧倒的多数を獲得。"
                      : `「${summary.prideRanking.slice(0, 3).map((p) => p.name).join("」「")}」などが上位回答として選ばれています。`}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>上位得票率:</span>
                    <span className="font-bold text-slate-800">{summary.prideRanking[0]?.percentage || 0}%</span>
                  </div>
                </div>

                {/* Highlight Card: Worries */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded truncate max-w-[200px]" title={summary.questionTitles?.q7}>
                      {summary.questionTitles?.q7 ? `${summary.questionTitles.q7.substring(0, 16)}...` : "問7: 共通の課題・不安"}
                    </span>
                    <TrendingUp className="w-4 h-4 text-rose-500 shrink-0" />
                  </div>
                  <p className="text-base font-bold text-slate-900">{topWorry}</p>
                  <p className="text-xs text-slate-500">
                    {summary.isYanaiPreset
                      ? "商店街のシャッター化や空き家増加に加え、世代ごとに異なる切実な不便さや不安が顕在化。"
                      : `「${summary.worryRanking.slice(0, 3).map((w) => w.name).join("」「")}」などの課題への懸念が顕在化しています。`}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>最多困りごと率:</span>
                    <span className="font-bold text-slate-800">{summary.worryRanking[0]?.percentage || 0}%</span>
                  </div>
                </div>

                {/* Highlight Card: Hopes */}
                <div className="bg-white p-4 sm:p-5 rounded-xl border border-slate-200 shadow-2xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded truncate max-w-[200px]" title={summary.questionTitles?.q8}>
                      {summary.questionTitles?.q8 ? `${summary.questionTitles.q8.substring(0, 16)}...` : "問8: あったらいいな（期待）"}
                    </span>
                    <Lightbulb className="w-4 h-4 text-blue-500 shrink-0" />
                  </div>
                  <p className="text-base font-bold text-slate-900">{topHope}</p>
                  <p className="text-xs text-slate-500">
                    {summary.isYanaiPreset
                      ? "ただの商業施設ではなく、マルシェや多世代が気軽におしゃべり・滞在できる温かい場所を希望。"
                      : `「${summary.hopeRanking.slice(0, 3).map((h) => h.name).join("」「")}」などの前向きな改善が期待されています。`}
                  </p>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
                    <span>最多期待率:</span>
                    <span className="font-bold text-slate-800">{summary.hopeRanking[0]?.percentage || 0}%</span>
                  </div>
                </div>
              </div>

              {/* Generational Gap Highlight Callout */}
              <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-blue-600" />
                  世代別（問3）＆ 世帯構成別（問4）の顕著なギャップ
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-3.5 bg-blue-50/50 rounded-lg border border-blue-100 space-y-1.5">
                    <span className="inline-block px-2 py-0.5 bg-blue-600 text-white rounded text-[11px] font-bold">
                      若い世代・子育て世帯（20〜40代）
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>不安 (問7):</strong> {summary.youngTopWorry?.name || "子育て・教育や日常の買い物"} ({summary.youngTopWorry?.percentage || 0}%)
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>期待 (問8):</strong> {summary.youngTopHope?.name || "子どもの遊び場や多世代が集える場所"}
                    </p>
                  </div>

                  <div className="p-3.5 bg-amber-50/50 rounded-lg border border-amber-100 space-y-1.5">
                    <span className="inline-block px-2 py-0.5 bg-amber-600 text-white rounded text-[11px] font-bold">
                      シニア・高齢者世帯（60代〜80歳以上）
                    </span>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>不安 (問7):</strong> {summary.seniorTopWorry?.name || "健康・医療や移動手段、空き家問題"} ({summary.seniorTopWorry?.percentage || 0}%)
                    </p>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      <strong>期待 (問8):</strong> {summary.seniorTopHope?.name || "医療・福祉の充実や多世代が集える場所"}
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 2: Workshop Input Story */}
            <section id="insight-narrative" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    ワークショップ用 事前インプット情報（参加者への提示用）
                  </h3>
                  <p className="text-xs text-slate-500">
                    データを単なる数字ではなく、参加者が「自分ごと」として共感できる日常の物語に翻訳
                  </p>
                </div>
              </div>

              <div className="bg-gradient-to-br from-white via-slate-50/80 to-blue-50/30 p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-2xs space-y-4 text-slate-800 text-sm leading-relaxed">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-base">
                  <MessageSquare className="w-5 h-5 text-blue-600" />
                  <span>参加者への語りかけストーリー：「私たちのまちなか、いま見えている風景」</span>
                </div>

                <p>
                  柳井市まちなかには、全国から観光客も訪れる「<strong>{topPride}</strong>」をはじめ、瀬戸内の自然や美味しい食、そして顔の見える温かいご近所付き合いというかけがえのない宝物があります。
                </p>

                <div className="p-4 bg-white rounded-lg border border-slate-200/80 shadow-2xs space-y-3">
                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-blue-950 block">子育て世代・若い方々の日常から:</strong>
                      <span className="text-xs text-slate-600">
                        「子どもの教育や安全な遊び場が少ない」「夜道が暗くて不安」という声（問7）が寄せられる一方、問8では「
                        <strong>{summary.youngTopHope?.name || "子どもの遊び場や多世代が集える居場所"}</strong>
                        があれば、もっと日常的にまちなかに足を運びたい！」という前向きな期待が寄せられています。
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <span className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 shrink-0" />
                    <div>
                      <strong className="text-amber-950 block">地域を支え続けてこられたシニア世代の日常から:</strong>
                      <span className="text-xs text-slate-600">
                        「通院や買い物のための移動手段が足りない」「空き家が増えて近所の防犯が心配」という切実な困りごと（問7）に直面しています。それでも問8では「
                        <strong>{summary.seniorTopHope?.name || "医療福祉の充実や、多世代が集える場所、公共交通"}</strong>
                        を望んでおり、再び地域と笑顔でつながりたいという願いが溢れています。
                      </span>
                    </div>
                  </div>
                </div>

                {summary.opinions && summary.opinions.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-slate-200/80">
                    <h5 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      住民の生の声（問9: 自由意見からのピックアップ）
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {summary.opinions.slice(0, 6).map((op) => (
                        <div
                          key={op.id}
                          className="bg-white/90 p-3 rounded-lg border border-slate-200 shadow-2xs text-xs space-y-1.5"
                        >
                          <p className="text-slate-800 font-medium leading-snug">
                            「{op.text}」
                          </p>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                            {op.jichikai && (
                              <span className="px-1.5 py-0.5 bg-slate-100 rounded text-slate-600">
                                {op.jichikai}
                              </span>
                            )}
                            {op.age && (
                              <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 rounded font-medium">
                                {op.age}
                              </span>
                            )}
                            {op.household && (
                              <span className="text-slate-400">
                                ({op.household})
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <p className="text-xs text-slate-600 italic">
                  {summary.isYanaiPreset ? (
                    <>抱えている課題は世代ごとに違っても、「この柳井のまちなかを、ずっと温かく活気ある場所にしたい」という根底の想いはひとつです。</>
                  ) : (
                    <>抱えている課題や日常の関心は世代・立場ごとに異なっていても、「より良い環境や心地よい場をつくりたい」という前向きな願いは共通しています。</>
                  )}
                </p>
              </div>
            </section>

            {/* Section 3: 3 Dialogue Questions */}
            <section id="insight-questions" className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-200">
                <div className="w-7 h-7 rounded-lg bg-amber-100 flex items-center justify-center text-amber-800 font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900">
                    対話を深める3つの「問い立て」
                  </h3>
                  <p className="text-xs text-slate-500">
                    強み×課題、課題×期待、世代間の補い合いを掛け合わせた前向きなアクションを導く問い
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {/* Question 1 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-blue-300 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[11px] font-bold rounded">
                        【問い1】{summary.questionTitles?.q5 || "強み・誇り"} × {summary.questionTitles?.q7 || "課題・不安"}
                      </span>
                      <Compass className="w-4 h-4 text-blue-600" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {summary.isYanaiPreset
                        ? `「誇るべき『${topPride}』の空間や文化を活かして、増えつつある『${topWorry}』を人が集まる温かい拠点に変えるには？」`
                        : `「強みとして支持された『${topPride}』を活かして、住民が課題と感じている『${topWorry}』を安心できる場や新しい価値に変えるには？」`}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>問いの背景:</strong> {summary.isYanaiPreset
                        ? "空き家や課題を放置せず、柳井の歴史と情緒ある空間を住民の手でDIYや小商いの場として活かす発想を広げます。"
                        : "強みと課題を対立させず、すでにある強み・資源を活用して課題を包み込むアプローチを話し合います。"}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-1">対話のヒント:</span>
                    {summary.isYanaiPreset
                      ? "「空き古民家で週末だけの金魚ちょうちん工房や絵本カフェを開くとしたら？」"
                      : "「すでにある資源や拠点に、課題を解消する小さな機能を組み合わせるとしたら？」"}
                  </div>
                </div>

                {/* Question 2 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-emerald-300 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[11px] font-bold rounded">
                        【問い2】{summary.questionTitles?.q7 || "課題・不安"} × {summary.questionTitles?.q8 || "期待・要望"}
                      </span>
                      <Lightbulb className="w-4 h-4 text-emerald-600" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {summary.isYanaiPreset
                        ? `「『若者の流出や商店の寂しさ』を打ち破るために、私たちが求める『${topHope}』やマルシェでどんな楽しい週末がつくれるか？」`
                        : `「『${topWorry}』といった困りごとを解消しながら、みんなが望む『${topHope}』をカタチにするために、私たちが始められる一歩は何でしょうか？」`}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>問いの背景:</strong> {summary.isYanaiPreset
                        ? "困りごとの裏返しである「あったらいいな」を住民自身が仕掛ける小さなフェスやマルシェ、夜市へとつなげます。"
                        : "課題の裏返しである期待を具体化し、住民主体の小さな工夫や助け合いで始められる最初のアクションを引き出します。"}
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-1">対話のヒント:</span>
                    {summary.isYanaiPreset
                      ? "「甘露醤油を使ったグルメ屋台や、高校生・若者が1日店長になるチャレンジ店！」"
                      : "「大きな仕組みづくりだけでなく、まずは身近な仲間と小さく試せる実践アイデアを探しましょう。」"}
                  </div>
                </div>

                {/* Question 3 */}
                <div className="bg-white rounded-xl border border-slate-200 shadow-2xs p-5 flex flex-col justify-between space-y-4 hover:border-amber-300 transition">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 bg-amber-100 text-amber-900 text-[11px] font-bold rounded">
                        【問い3】多様な世代・立場の協働
                      </span>
                      <Users className="w-4 h-4 text-amber-600" />
                    </div>
                    <h4 className="text-sm sm:text-base font-bold text-slate-900 leading-snug">
                      {summary.isYanaiPreset
                        ? "「子育て世代が求める『子どもの居場所』と、シニアが求める『移動やふれあいの安心』。この2つが同時に叶う“まちなかの縁側”とは？」"
                        : `「現役層が望む『${summary.youngTopHope?.name || "活動・交流の場"}』と、シニア層が願う『${summary.seniorTopHope?.name || "安心・集いの場"}』。この双方が心地よく共存する風景とは？」`}
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      <strong>問いの背景:</strong> 世代ギャップを対立ではなく「支え合い」に昇華。お互いの知恵と元気を融合させます。
                    </p>
                  </div>

                  <div className="p-3 bg-slate-50 rounded-lg text-xs text-slate-700 border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-1">対話のヒント:</span>
                    {summary.isYanaiPreset
                      ? "「シニアが昔遊びを教えたり見守りをする駄菓子屋風カフェ、送迎ついでに立ち寄れる広場」"
                      : "「多世代が無理なく混ざり合い、お互いに居心地の良さを感じられる工夫を話し合いましょう。」"}
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};
