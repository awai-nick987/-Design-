import React, { useState, useMemo } from "react";
import {
  Link2,
  TrendingUp,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  Award,
  Filter,
  CheckCircle2,
  Info,
  HelpCircle,
} from "lucide-react";
import { CorrelationAnalysisSummary, CorrelationItem } from "../types/survey";

interface CorrelationAnalysisViewProps {
  correlations: CorrelationAnalysisSummary;
  totalRespondents: number;
}

export function CorrelationAnalysisView({
  correlations,
  totalRespondents,
}: CorrelationAnalysisViewProps) {
  const [activeTab, setActiveTab] = useState<"worryToHope" | "prideToHope" | "prideToWorry" | "allPairs">(
    "worryToHope"
  );
  const [selectedWorry, setSelectedWorry] = useState<string>("all");

  const worryOptions = useMemo(() => {
    return correlations.worryToPrimaryHope.map((w) => w.worry);
  }, [correlations]);

  const filteredWorryList = useMemo(() => {
    if (selectedWorry === "all") return correlations.worryToPrimaryHope;
    return correlations.worryToPrimaryHope.filter((w) => w.worry === selectedWorry);
  }, [correlations, selectedWorry]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50/70 via-blue-50/40 to-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-600 text-white text-xs font-bold flex items-center gap-1">
                <Link2 className="w-3.5 h-3.5" />
                同一回答者 相関・共起分析
              </span>
              <span className="text-xs text-slate-500 font-medium">
                対象回答者数: {totalRespondents}名
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              強み（自慢）・課題（不安）・期待（あったらいいな）のつながり
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              1人ひとりの回答の中で、「この不安を抱えている人は、同時にどんな解決策を望んでいるか？」「この自慢を感じている人は、どんな未来を期待しているか？」の相関性（共起率・リフト値）を数理的に分析し、真のニーズを解き明かします。
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mt-5">
          <button
            type="button"
            onClick={() => setActiveTab("worryToHope")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "worryToHope"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-300" />
            <span>【課題解決パス】不安(問7) × あったらいいな(問8)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prideToHope")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "prideToHope"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>【強み発展】自慢(問5) × あったらいいな(問8)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("prideToWorry")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "prideToWorry"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <Award className="w-3.5 h-3.5 text-indigo-300" />
            <span>【誇りと現実】自慢(問5) × 不安(問7)</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("allPairs")}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "allPairs"
                ? "bg-blue-700 text-white shadow-xs"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5 text-violet-300" />
            <span>相関強度トップペアランキング</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {/* Tab 1: Worry -> Hope (Actionable Solution Paths) */}
        {activeTab === "worryToHope" && (
          <div className="space-y-6">
            {/* Analytical Takeaway Callout */}
            {correlations.worryToPrimaryHope.length > 0 && (() => {
              const topW = correlations.worryToPrimaryHope[0];
              const topH = topW?.topHopes?.[0];
              return (
                <div className="bg-gradient-to-r from-amber-500/10 via-rose-500/5 to-transparent border-l-4 border-amber-500 rounded-r-xl p-4 text-xs space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-amber-600" />
                    <span className="font-bold text-amber-950 text-sm">
                      【分析結果・傾向】住民が直感的に求める「不安の処方箋」
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    不安第1位の「<strong>{topW?.worry}</strong>」を挙げた回答者の <strong>{topH?.percentage}%</strong>（{topH?.count}名）が、同時に「<strong>{topH?.hope}</strong>」を選択しています。
                    住民は空き家の単なる解体や更地化ではなく、<strong>「人が集まり温もりを感じられる交流拠点」への再生・活用</strong>を強い解決策として期待しています。ハードの修繕だけでなく、日常の居場所づくりを掛け合わせることが最も納得感の高い合意形成につながります。
                  </p>
                </div>
              );
            })()}

            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <Info className="w-4 h-4 text-blue-600 shrink-0" />
                <span>
                  <strong>読み解き方:</strong> 不安や困りごと（問7）を挙げた人が、同じアンケート内でどの「あったらいいな（問8）」を求めているかの同時選択率です。住民が納得する対策の優先順位がわかります。
                </span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="font-semibold text-slate-700">不安項目で絞り込み:</span>
                <select
                  value={selectedWorry}
                  onChange={(e) => setSelectedWorry(e.target.value)}
                  className="px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-medium text-slate-800"
                >
                  <option value="all">すべての不安・困りごと ({worryOptions.length}件)</option>
                  {worryOptions.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredWorryList.map((item, idx) => (
                <div
                  key={item.worry}
                  className="border border-slate-200 rounded-xl p-4 bg-white hover:border-blue-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{item.worry}</h3>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      訴求者数: {item.worryCount}名 ({Math.round((item.worryCount / totalRespondents) * 100)}%)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>同時に求めている解決策（あったらいいな）</span>
                      <span>同時選択率 (人数)</span>
                    </div>

                    {item.topHopes.length === 0 ? (
                      <p className="text-xs text-slate-400 py-2">共起データが十分ではありません</p>
                    ) : (
                      item.topHopes.map((h, hIdx) => (
                        <div key={h.hope} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-1.5">
                              <span
                                className={`w-4 h-4 rounded-full text-[10px] font-bold flex items-center justify-center ${
                                  hIdx === 0
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-100 text-slate-600"
                                }`}
                              >
                                {hIdx + 1}
                              </span>
                              <span className="font-semibold text-slate-800">{h.hope}</span>
                              {h.lift >= 1.5 && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.2 rounded border border-emerald-200">
                                  相関強 (x{h.lift})
                                </span>
                              )}
                            </div>
                            <span className="font-bold text-slate-900">
                              {h.percentage}%{" "}
                              <span className="text-slate-400 font-normal">({h.count}名)</span>
                            </span>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                hIdx === 0 ? "bg-blue-600" : "bg-blue-400/80"
                              }`}
                              style={{ width: `${Math.min(100, h.percentage)}%` }}
                            />
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 2: Pride -> Hope */}
        {activeTab === "prideToHope" && (
          <div className="space-y-6">
            {/* Analytical Takeaway Callout */}
            {correlations.prideToPrimaryHope.length > 0 && (() => {
              const topP = correlations.prideToPrimaryHope[0];
              const topH = topP?.topHopes?.[0];
              return (
                <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/5 to-transparent border-l-4 border-emerald-500 rounded-r-xl p-4 text-xs space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    <span className="font-bold text-emerald-950 text-sm">
                      【分析結果・傾向】「誇り・アイデンティティ」を現代の体験・賑わいへ昇華
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    自慢第1位の「<strong>{topP?.pride}</strong>」を誇りに思う回答者の <strong>{topH?.percentage}%</strong>（{topH?.count}名）が「<strong>{topH?.hope}</strong>」を求めています。
                    歴史文化をただ保存・眺めるだけの対象にするのではなく、<strong>「日常的に歩き、買い物をし、人が集える生きた空間」として再定義したい</strong>という住民の明確な前向き意志が表れています。
                  </p>
                </div>
              );
            })()}

            <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80 text-xs text-emerald-950 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              <div>
                <strong>強みを活かしたまちづくりの方向性:</strong> 「自分たちの町の自慢（問5）」に誇りを持っている住民が、まちなかに何を期待（問8）しているかの相関です。まちのアイデンティティを活かしたプロジェクト作りに最適です。
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {correlations.prideToPrimaryHope.map((item, idx) => (
                <div
                  key={item.pride}
                  className="border border-slate-200 rounded-xl p-4 bg-white hover:border-emerald-300 transition shadow-2xs space-y-3"
                >
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <h3 className="font-bold text-slate-900 text-sm">{item.pride}</h3>
                    </div>
                    <span className="text-xs bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                      自慢者数: {item.prideCount}名 ({Math.round((item.prideCount / totalRespondents) * 100)}%)
                    </span>
                  </div>

                  <div className="space-y-2">
                    <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                      <span>同時に期待するまちの機能（あったらいいな）</span>
                      <span>同時選択率</span>
                    </div>

                    {item.topHopes.map((h, hIdx) => (
                      <div key={h.hope} className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-800 flex items-center gap-1.5">
                            <span className="text-slate-400">{hIdx + 1}.</span> {h.hope}
                          </span>
                          <span className="font-bold text-slate-900">
                            {h.percentage}% <span className="text-slate-400 font-normal">({h.count}名)</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-emerald-600 transition-all duration-500"
                            style={{ width: `${Math.min(100, h.percentage)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Pride -> Worry */}
        {activeTab === "prideToWorry" && (
          <div className="space-y-4">
            {/* Analytical Takeaway Callout */}
            {correlations.prideToWorry.length > 0 && (() => {
              const topPair = correlations.prideToWorry[0];
              return (
                <div className="bg-gradient-to-r from-indigo-500/10 via-blue-500/5 to-transparent border-l-4 border-indigo-500 rounded-r-xl p-4 text-xs space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-indigo-600" />
                    <span className="font-bold text-indigo-950 text-sm">
                      【分析結果・傾向】「誇り」があるからこそ募る切実な危機感
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    自慢（誇り）と不安の結びつきで最も共起が高いのは「<strong>{topPair?.source}</strong>」×「<strong>{topPair?.target}</strong>」（共起 {topPair?.coOccurrence}名 / 該当自慢者の <strong>{topPair?.conditionalProb}%</strong> が懸念 / 相関倍率 <strong>{topPair?.lift}倍</strong>）。
                    地域への愛着や自慢の気持ちが強い人ほど、空き家増加や商店街の衰退を「自分たちの誇りが崩れていく痛み」として切実に受け止めています。この誇りと危機の表裏一体の関係を対話の出発点とすることで、保全への当事者意識を引き出せます。
                  </p>
                </div>
              );
            })()}

            <div className="bg-indigo-50/60 p-3.5 rounded-xl border border-indigo-200/80 text-xs text-indigo-950 flex items-start gap-2">
              <Info className="w-4 h-4 text-indigo-700 shrink-0 mt-0.5" />
              <div>
                <strong>誇りがあるからこそ感じる不安:</strong> 例えば「歴史や文化」に誇りを持つ住民ほど「空き家の増加」や「街並みの衰退」を強く危惧している、などのギャップが見えてきます。
              </div>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-4">自慢できるもの（強み）</th>
                    <th className="py-2.5 px-4">同時に抱く不安・困りごと</th>
                    <th className="py-2.5 px-3 text-right">共起人数</th>
                    <th className="py-2.5 px-3 text-right">自慢者中の不安割合 (%)</th>
                    <th className="py-2.5 px-3 text-right">リフト値 (相関倍率)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {correlations.prideToWorry.slice(0, 15).map((item, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition">
                      <td className="py-2.5 px-4 font-semibold text-emerald-800">{item.source}</td>
                      <td className="py-2.5 px-4 font-semibold text-amber-800">{item.target}</td>
                      <td className="py-2.5 px-3 text-right font-bold text-slate-800">{item.coOccurrence}名</td>
                      <td className="py-2.5 px-3 text-right font-semibold text-slate-700">{item.conditionalProb}%</td>
                      <td className="py-2.5 px-3 text-right">
                        <span
                          className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                            item.lift >= 1.4
                              ? "bg-blue-100 text-blue-800"
                              : "bg-slate-100 text-slate-600"
                          }`}
                        >
                          {item.lift}x
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: All Pairs Ranking */}
        {activeTab === "allPairs" && (
          <div className="space-y-4">
            {/* Analytical Takeaway Callout */}
            {correlations.topStrongestPairs.length > 0 && (() => {
              const topP = correlations.topStrongestPairs[0];
              return (
                <div className="bg-gradient-to-r from-violet-500/10 via-purple-500/5 to-transparent border-l-4 border-violet-500 rounded-r-xl p-4 text-xs space-y-1.5 text-slate-800">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-violet-600" />
                    <span className="font-bold text-violet-950 text-sm">
                      【分析結果・傾向】全組み合わせ中最強の相関「最大共鳴テーマ」
                    </span>
                  </div>
                  <p className="leading-relaxed text-slate-700">
                    全組み合わせの中で最も高い相関強度（リフト値 <strong>{topP?.lift}倍</strong>）を記録したのは、「<strong>{topP?.source}</strong>」と「<strong>{topP?.target}</strong>」のペアです（共起 {topP?.coOccurrence}名 / 同時選択率 {topP?.conditionalProb}%）。
                    通常期待される確率の{topP?.lift}倍という強力な連動性があり、住民の関心において不可分なホットスポットです。ワークショップのメインテーマやグループワークの議題として設定することで、住民の「まさにそこが一番話したかった！」という深い納得感と前向きなアイデア創出を喚起できます。
                  </p>
                </div>
              );
            })()}

            <div className="flex items-center justify-between text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-200">
              <span>
                全組み合わせの中で、独立回答の確率に対して特に強く共起（結びつき）しているトップペアです。
              </span>
              <span className="font-semibold text-slate-700">
                リフト値 1.0以上 = 偶然以上によく一緒に選ばれている
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {correlations.topStrongestPairs.map((pair, idx) => {
                const getBadge = (cat: string) => {
                  if (cat === "q5_pride")
                    return <span className="bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded text-[10px] font-bold">自慢(問5)</span>;
                  if (cat === "q7_worry")
                    return <span className="bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded text-[10px] font-bold">不安(問7)</span>;
                  return <span className="bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded text-[10px] font-bold">期待(問8)</span>;
                };

                return (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 bg-white hover:border-indigo-300 transition flex items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          {getBadge(pair.sourceCategory)}
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                            {pair.source}
                          </span>
                          <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                          {getBadge(pair.targetCategory)}
                          <span className="font-bold text-slate-900 text-xs truncate max-w-[140px]">
                            {pair.target}
                          </span>
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-500 pl-7">
                        {pair.source}を選んだ人のうち <strong>{pair.conditionalProb}%</strong> が{pair.target}を同時に選択
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-sm font-bold text-indigo-700">
                        {pair.lift} <span className="text-[10px] font-normal text-slate-500">倍 (Lift)</span>
                      </div>
                      <div className="text-[11px] text-slate-500 font-medium">
                        共起: {pair.coOccurrence}名
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
