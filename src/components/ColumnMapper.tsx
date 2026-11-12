import React from "react";
import { SlidersHorizontal, Check, AlertCircle, Sparkles, RefreshCw, CheckCircle2 } from "lucide-react";
import { ColumnMapping } from "../types/survey";

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (newMapping: ColumnMapping) => void;
  isOpen: boolean;
  onToggle: () => void;
  questionTitles?: Record<string, string>;
  mappingReasons?: Record<string, string>;
  onAutoReset?: () => void;
}

const QUESTION_ROLES: { key: keyof ColumnMapping; label: string; desc: string; defaultHeaderPattern: string }[] = [
  { key: "q1", label: "自治会・地区・所属 (問1相当)", desc: "地区・拠点・所属組織（単一属性）", defaultHeaderPattern: "地区・自治会" },
  { key: "q2", label: "性別 (問2相当)", desc: "回答者の性別区分", defaultHeaderPattern: "性別" },
  { key: "q3", label: "年齢・年代 (問3相当)", desc: "年代・世代区分（クロス集計の主軸）", defaultHeaderPattern: "年代・年齢" },
  { key: "q4", label: "世帯構成・立場 (問4相当)", desc: "世帯構成・家族状況・同居など", defaultHeaderPattern: "世帯・家族" },
  { key: "q5", label: "自慢・強み・満足点 (問5相当)", desc: "地域の魅力・誇り・強み・満足理由", defaultHeaderPattern: "自慢・魅力・強み" },
  { key: "q6", label: "利用施設・行動動線 (問6相当)", desc: "普段よく行く場所・利用施設・買い物動線", defaultHeaderPattern: "利用施設・行動" },
  { key: "q7", label: "不安・困りごと・課題 (問7相当)", desc: "日常の悩み・課題・改善してほしい点", defaultHeaderPattern: "不安・困りごと・課題" },
  { key: "q8", label: "あったらいいな・期待 (問8相当)", desc: "将来への期待・欲しい施設やサービス", defaultHeaderPattern: "あったらいいな・期待" },
  { key: "q9", label: "自由意見・生の声 (問9相当)", desc: "自由なご意見・感想・長文メッセージ", defaultHeaderPattern: "自由記述・意見" },
];

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  mapping,
  onMappingChange,
  isOpen,
  onToggle,
  questionTitles,
  mappingReasons,
  onAutoReset,
}) => {
  const handleChange = (key: keyof ColumnMapping, index: number) => {
    onMappingChange({
      ...mapping,
      [key]: index,
    });
  };

  const mappedCount = (Object.values(mapping) as number[]).filter(
    (v) => typeof v === "number" && v >= 0 && v < headers.length
  ).length;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-2xs mb-6 overflow-hidden">
      {/* Clickable Header Bar */}
      <div
        onClick={onToggle}
        className="px-4 py-3 bg-gradient-to-r from-slate-50 via-blue-50/30 to-slate-50 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 cursor-pointer hover:bg-slate-100/60 transition"
      >
        <div className="flex items-center gap-2 flex-wrap">
          <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-600" />
          </div>
          <span className="text-xs font-bold text-slate-800">
            アンケート設問と分析項目の対応付け設定
          </span>
          <span className="inline-flex items-center gap-1 text-[11px] px-2.5 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-full font-bold">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Googleフォーム全自動対応（{mappedCount}項目自動設定済み・入力不要）
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="text-slate-500 hidden sm:inline">
            設問の手動入力なしでダッシュボードに反映中
          </span>
          <span className="text-blue-600 font-bold hover:underline">
            {isOpen ? "設定詳細を閉じる" : "自動設定内容を確認・調整"}
          </span>
        </div>
      </div>

      {/* Expanded Details */}
      {isOpen && (
        <div className="p-4 sm:p-5 bg-white space-y-4 text-xs animate-fadeIn">
          {/* Status Alert Banner */}
          <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs space-y-1.5 text-emerald-950 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
                <Sparkles className="w-4 h-4 text-emerald-600" />
                <span>Googleフォームの設問内容・回答データを全自動解析して設定しています</span>
              </div>
              <p className="text-[11px] leading-relaxed text-emerald-800">
                設問文をユーザーが手動入力する必要はありません。ヘッダーの設問文と回答パターンから最適な分析項目を自動バインドし、ダッシュボードのグラフ・ピボット・サマリーに100%反映しています。
              </p>
            </div>

            {onAutoReset && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onAutoReset();
                }}
                className="shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 bg-white hover:bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg text-xs font-bold transition shadow-2xs"
                title="Googleフォームから自動再解析してリセット"
              >
                <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
                <span>自動再解析・リセット</span>
              </button>
            )}
          </div>

          {/* Cards for each question role */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {QUESTION_ROLES.map((item) => {
              const currentVal = mapping[item.key];
              const isMapped = currentVal >= 0 && currentVal < headers.length;
              const mappedHeader = isMapped ? headers[currentVal] : null;
              const reason = mappingReasons ? mappingReasons[item.key] : null;

              return (
                <div
                  key={item.key}
                  className={`p-3.5 rounded-xl border flex flex-col justify-between space-y-2.5 transition ${
                    isMapped
                      ? "bg-white border-slate-200 shadow-2xs"
                      : "bg-slate-50 border-slate-200 opacity-70"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="font-bold text-slate-800 text-xs">{item.label}</span>
                      {isMapped ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60">
                          <Check className="w-3 h-3 text-emerald-600" />
                          自動設定済
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200/60">
                          <AlertCircle className="w-3 h-3 text-amber-600" />
                          未割り当て
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">{item.desc}</p>

                    {/* Detected Google Forms Header Preview */}
                    {isMapped && mappedHeader && (
                      <div className="mt-2 p-2 bg-blue-50/50 rounded-lg border border-blue-100 text-[11px] space-y-0.5">
                        <span className="text-[10px] font-bold text-blue-900 block">
                          検出されたフォーム設問:
                        </span>
                        <p className="text-slate-800 font-semibold line-clamp-2" title={mappedHeader}>
                          {mappedHeader}
                        </p>
                        {reason && (
                          <span className="text-[10px] text-blue-700/80 block mt-0.5">
                            💡 {reason}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Manual Override Dropdown */}
                  <div>
                    <label className="text-[10px] text-slate-400 block mb-0.5">
                      列の手動変更（通常は変更不要）:
                    </label>
                    <select
                      value={currentVal}
                      onChange={(e) => handleChange(item.key, parseInt(e.target.value, 10))}
                      className="w-full px-2 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
                    >
                      <option value={-1}>-- 割り当てなし --</option>
                      {headers.map((header, idx) => (
                        <option key={idx} value={idx}>
                          列 {idx + 1}: {header || `(列 ${idx + 1})`}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
