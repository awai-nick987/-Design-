import React, { useState } from "react";
import { Table, Search, Download, X, Eye } from "lucide-react";
import { SurveyRow } from "../types/survey";

interface RawDataModalProps {
  rows: SurveyRow[];
  headers: string[];
  isOpen: boolean;
  onClose: () => void;
}

export const RawDataModal: React.FC<RawDataModalProps> = ({
  rows,
  headers,
  isOpen,
  onClose,
}) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJichikai, setSelectedJichikai] = useState("all");

  if (!isOpen) return null;

  const jichikaiList = Array.from(new Set(rows.map((r) => r.q1_jichikai || "").filter(Boolean)));

  const filteredRows = rows.filter((r) => {
    if (selectedJichikai !== "all" && r.q1_jichikai !== selectedJichikai) return false;
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      Object.values(r.raw).some((val) => String(val || "").toLowerCase().includes(term)) ||
      r.q1_jichikai?.toLowerCase().includes(term) ||
      r.q3_age?.toLowerCase().includes(term) ||
      r.q4_household?.toLowerCase().includes(term) ||
      r.q5_pride.some((p) => p.toLowerCase().includes(term)) ||
      r.q7_worry.some((w) => w.toLowerCase().includes(term)) ||
      r.q8_hope.some((h) => h.toLowerCase().includes(term)) ||
      (r.q9_opinion && r.q9_opinion.toLowerCase().includes(term))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Table className="w-5 h-5 text-blue-600" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                回答元データ一覧（全 {rows.length} 件）
              </h3>
              <p className="text-xs text-slate-500">
                Googleフォーム・スプレッドシートから読み込んだ生データの確認・絞り込み
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Controls */}
        <div className="p-3 sm:p-4 border-b border-slate-200 bg-white flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="キーワードで検索（例: カフェ、空き家、30代、新庄など）..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-slate-500 font-medium">自治会:</span>
            <select
              value={selectedJichikai}
              onChange={(e) => setSelectedJichikai(e.target.value)}
              className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none"
            >
              <option value="all">すべての地区 ({rows.length})</option>
              {jichikaiList.map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </div>

          <span className="text-xs text-slate-400">
            表示中: <strong>{filteredRows.length}</strong> 件
          </span>
        </div>

        {/* Table Content */}
        <div className="flex-1 overflow-auto p-4">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100/80 sticky top-0 border-b border-slate-200 text-slate-700 font-semibold z-10">
              <tr>
                <th className="py-2.5 px-3 whitespace-nowrap">No.</th>
                {headers.length > 0
                  ? headers.map((h, i) => (
                      <th key={i} className="py-2.5 px-3 min-w-[120px] max-w-[240px] truncate" title={h}>
                        {h}
                      </th>
                    ))
                  : (
                    <>
                      <th className="py-2.5 px-3 whitespace-nowrap">問1: 自治会</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">問2: 性別</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">問3: 年齢</th>
                      <th className="py-2.5 px-3 whitespace-nowrap">問4: 世帯構成</th>
                      <th className="py-2.5 px-3 min-w-[160px]">問5: 自慢できるもの</th>
                      <th className="py-2.5 px-3 min-w-[140px]">問6: 利用施設</th>
                      <th className="py-2.5 px-3 min-w-[180px]">問7: 不安・困りごと</th>
                      <th className="py-2.5 px-3 min-w-[180px]">問8: あったらいいな</th>
                      <th className="py-2.5 px-3 min-w-[220px]">問9: 自由意見</th>
                    </>
                  )}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRows.map((r, idx) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition">
                  <td className="py-2.5 px-3 font-mono text-slate-400 text-[11px] whitespace-nowrap">{idx + 1}</td>
                  {headers.length > 0 ? (
                    headers.map((h, hIdx) => (
                      <td
                        key={hIdx}
                        className="py-2.5 px-3 text-slate-700 max-w-[280px] truncate"
                        title={r.raw[h] || ""}
                      >
                        {r.raw[h] || "-"}
                      </td>
                    ))
                  ) : (
                    <>
                      <td className="py-2.5 px-3 font-medium text-slate-900 whitespace-nowrap">{r.q1_jichikai}</td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{r.q2_gender}</td>
                      <td className="py-2.5 px-3 text-slate-700 whitespace-nowrap font-semibold">{r.q3_age}</td>
                      <td className="py-2.5 px-3 text-slate-600 whitespace-nowrap">{r.q4_household}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.q5_pride.join(", ") || "-"}</td>
                      <td className="py-2.5 px-3 text-slate-700">{r.q6_facilities.join(", ") || "-"}</td>
                      <td className="py-2.5 px-3 text-rose-700 font-medium">{r.q7_worry.join(", ") || "-"}</td>
                      <td className="py-2.5 px-3 text-blue-700 font-medium">{r.q8_hope.join(", ") || "-"}</td>
                      <td className="py-2.5 px-3 text-slate-700 text-xs italic">{r.q9_opinion || "-"}</td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-lg text-xs font-semibold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
};
