import React from "react";
import { SlidersHorizontal, Check, AlertCircle } from "lucide-react";
import { ColumnMapping } from "../types/survey";

interface ColumnMapperProps {
  headers: string[];
  mapping: ColumnMapping;
  onMappingChange: (newMapping: ColumnMapping) => void;
  isOpen: boolean;
  onToggle: () => void;
}

const QUESTION_LABELS: { key: keyof ColumnMapping; label: string; desc: string }[] = [
  { key: "q1", label: "自治会・地区・所属", desc: "地区・拠点・所属組織など（単一属性）" },
  { key: "q2", label: "性別", desc: "回答者の性別区分" },
  { key: "q3", label: "年齢・年代", desc: "年代・世代区分（クロス集計の主軸）" },
  { key: "q4", label: "世帯構成・立場", desc: "世帯構成・職業・家族状況など" },
  { key: "q5", label: "地域の自慢・強み・満足点", desc: "魅力・誇り・強み（複数回答または単一）" },
  { key: "q6", label: "利用施設・行動", desc: "普段よく行く場所・利用動線" },
  { key: "q7", label: "不安・困りごと・課題", desc: "日常の悩み・課題・改善してほしい点" },
  { key: "q8", label: "あったらいいな・期待・要望", desc: "将来への期待・欲しい施設やサービス" },
  { key: "q9", label: "自由意見・自由記述", desc: "自由なご意見・感想・生の声" },
];

export const ColumnMapper: React.FC<ColumnMapperProps> = ({
  headers,
  mapping,
  onMappingChange,
  isOpen,
  onToggle,
}) => {
  const handleChange = (key: keyof ColumnMapping, index: number) => {
    onMappingChange({
      ...mapping,
      [key]: index,
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-xs mb-6 overflow-hidden">
      <div
        onClick={onToggle}
        className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition"
      >
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-semibold text-slate-800">
            アンケート設問と分析項目の対応付け設定
          </span>
          <span className="text-[11px] px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-medium">
            全Googleフォーム自動対応
          </span>
        </div>
        <span className="text-xs text-blue-600 font-medium hover:underline">
          {isOpen ? "設定を閉じる" : "列の割り当てを変更・確認"}
        </span>
      </div>

      {isOpen && (
        <div className="p-4 sm:p-5 bg-white space-y-4 text-xs">
          <p className="text-slate-500">
            取り込んだGoogleフォームのヘッダー名から自動で各分析役割を判別しています。必要に応じてプルダウンから手動で変更できます。また、「基本集計グラフ」タブの「全設問グラフ一覧」では、対応付けに関わらず全設問の分布が表示されます。
          </p>

          <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-lg text-xs space-y-1.5 text-blue-900">
            <div className="flex items-center gap-1.5 font-semibold text-blue-800">
              <span>✨ 自動データクレンジング & 全設問自動グラフ生成機能が有効です</span>
            </div>
            <p className="text-[11px] leading-relaxed text-blue-800/90">
              ・<span className="font-semibold">自由な設問に対応:</span> どんなアンケートであっても、スプレッドシートやCSVの各列から自動で選択肢を抽出し、単一選択・複数選択・自由記述を適切に分類してグラフ化します。
            </p>
            <p className="text-[11px] leading-relaxed text-blue-800/90">
              ・<span className="font-semibold">柳井市アンケートの互換性:</span> 従来の柳井市まちなかアンケート形式（番号による選択肢や施設名の表記揺れ）も自動判別して最適化されます。
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {QUESTION_LABELS.map((item) => {
              const currentVal = mapping[item.key];
              const isMapped = currentVal >= 0 && currentVal < headers.length;

              return (
                <div
                  key={item.key}
                  className="p-3 bg-slate-50/50 rounded-lg border border-slate-200/80 flex flex-col justify-between space-y-2"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-slate-800">{item.label}</span>
                      {isMapped ? (
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5">{item.desc}</p>
                  </div>

                  <select
                    value={currentVal}
                    onChange={(e) => handleChange(item.key, parseInt(e.target.value, 10))}
                    className="w-full mt-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-500 truncate"
                  >
                    <option value={-1}>-- 割り当てなし --</option>
                    {headers.map((header, idx) => (
                      <option key={idx} value={idx}>
                        列 {idx + 1}: {header || `(列 ${idx + 1})`}
                      </option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
