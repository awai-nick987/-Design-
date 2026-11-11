import React, { useState, useMemo } from "react";
import {
  Table,
  ArrowUpDown,
  Download,
  Filter,
  Layers,
  Sparkles,
  Info,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { SurveyDimensionKey, PivotMetric, SurveyRow } from "../types/survey";
import { computePivotTable, DIMENSION_LABELS } from "../utils/analysis";

interface CustomPivotTableProps {
  rows: SurveyRow[];
  headers?: string[];
}

export function CustomPivotTable({ rows, headers = [] }: CustomPivotTableProps) {
  const [rowDim, setRowDim] = useState<SurveyDimensionKey>("q7_worry");
  const [colDim, setColDim] = useState<SurveyDimensionKey>("q8_hope");
  const [metric, setMetric] = useState<PivotMetric>("count");
  const [showHeatmap, setShowHeatmap] = useState<boolean>(true);

  // Quick preset presets
  const applyPreset = (row: SurveyDimensionKey, col: SurveyDimensionKey, m: PivotMetric = "count") => {
    setRowDim(row);
    setColDim(col);
    setMetric(m);
  };

  // Swap row and column
  const handleSwap = () => {
    setRowDim(colDim);
    setColDim(rowDim);
  };

  // Compute pivot data
  const pivotData = useMemo(() => {
    return computePivotTable(rows, rowDim, colDim, metric);
  }, [rows, rowDim, colDim, metric]);

  // Find max value in matrix for heatmap scaling
  const maxValue = useMemo(() => {
    let max = 0;
    pivotData.rowLabels.forEach((r) => {
      pivotData.colLabels.forEach((c) => {
        const val = pivotData.matrix[r]?.[c] || 0;
        if (val > max) max = val;
      });
    });
    return max || 1;
  }, [pivotData]);

  // Find top concentrated intersection cell and top row/col for narrative insight
  const topIntersection = useMemo(() => {
    let top = { row: "", col: "", count: 0 };
    pivotData.rowLabels.forEach((r) => {
      pivotData.colLabels.forEach((c) => {
        const v = pivotData.matrix[r]?.[c] || 0;
        if (v > top.count) {
          top = { row: r, col: c, count: v };
        }
      });
    });

    let maxRow = { name: "", count: 0 };
    pivotData.rowLabels.forEach((r) => {
      const cnt = pivotData.rowTotals[r] || 0;
      if (cnt > maxRow.count) maxRow = { name: r, count: cnt };
    });

    let maxCol = { name: "", count: 0 };
    pivotData.colLabels.forEach((c) => {
      const cnt = pivotData.colTotals[c] || 0;
      if (cnt > maxCol.count) maxCol = { name: c, count: cnt };
    });

    return { topCell: top, topRow: maxRow, topCol: maxCol };
  }, [pivotData]);

  // Export to CSV
  const handleExportCsv = () => {
    const rowTitle = DIMENSION_LABELS[rowDim] || rowDim;
    const colTitle = DIMENSION_LABELS[colDim] || colDim;
    const lines: string[] = [];
    // Header
    const colHeaders = [
      `"${rowTitle} \\ ${colTitle}"`,
      ...pivotData.colLabels.map((c) => `"${c}"`),
      '"合計"',
    ];
    lines.push(colHeaders.join(","));

    // Body rows
    pivotData.rowLabels.forEach((r) => {
      const rowValues = [
        `"${r}"`,
        ...pivotData.colLabels.map((c) => {
          const val = pivotData.matrix[r]?.[c] || 0;
          return metric === "count" ? val : `${val}%`;
        }),
        metric === "count"
          ? (pivotData.rowTotals[r] || 0)
          : `${Math.round(((pivotData.rowTotals[r] || 0) / (pivotData.grandTotal || 1)) * 100)}%`,
      ];
      lines.push(rowValues.join(","));
    });

    // Col total row
    const totalRow = [
      '"列合計"',
      ...pivotData.colLabels.map((c) => (pivotData.colTotals[c] || 0).toString()),
      pivotData.grandTotal.toString(),
    ];
    lines.push(totalRow.join(","));

    const csvContent = "\uFEFF" + lines.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `pivot_${rowDim}_vs_${colDim}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Standard dimensions
  const standardDimensionKeys: { key: string; label: string }[] = [
    { key: "q1_jichikai", label: "問1: 自治会・地区" },
    { key: "q2_gender", label: "問2: 性別" },
    { key: "q3_age", label: "問3: 年齢・年代" },
    { key: "q4_household", label: "問4: 世帯構成" },
    { key: "q5_pride", label: "問5: 自慢できるもの（強み）" },
    { key: "q6_facilities", label: "問6: 利用施設" },
    { key: "q7_worry", label: "問7: 不安・困りごと（課題）" },
    { key: "q8_hope", label: "問8: あったらいいな（期待）" },
  ];

  // Dynamic headers from Google Form
  const dynamicDimensionKeys: { key: string; label: string }[] = useMemo(() => {
    return headers
      .filter((h) => h && !/タイムスタンプ|timestamp/i.test(h))
      .map((h) => ({
        key: h,
        label: `[Googleフォーム設問] ${h.length > 28 ? h.substring(0, 28) + "..." : h}`,
      }));
  }, [headers]);

  // Combined options
  const allDimensionOptions = useMemo(() => {
    if (dynamicDimensionKeys.length > 0) {
      return [
        ...standardDimensionKeys,
        ...dynamicDimensionKeys.filter((d) => !standardDimensionKeys.some((s) => s.label.includes(d.key))),
      ];
    }
    return standardDimensionKeys;
  }, [dynamicDimensionKeys]);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Top Header */}
      <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-slate-50 via-blue-50/20 to-white space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-blue-700 text-white text-xs font-bold flex items-center gap-1">
                <Table className="w-3.5 h-3.5" />
                自由クロス集計 (ピボットテーブル)
              </span>
              <span className="text-xs text-slate-500 font-medium">
                対象回答者数: {rows.length}名
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              アンケート全項目の自由クロス集計システム
            </h2>
            <p className="text-xs text-slate-600 max-w-3xl leading-relaxed">
              行項目と列項目を自由に選択し、任意の設問同士を掛け合わせたクロス集計表を即座に生成します。複数回答（問5・6・7・8）と単一属性（年代・世帯・地区）の組み合わせも正確に集計可能です。
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 rounded-lg text-xs font-semibold shadow-2xs transition"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>集計表CSV出力</span>
            </button>
          </div>
        </div>

        {/* Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="font-semibold text-slate-600 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            おすすめプリセット:
          </span>
          <button
            type="button"
            onClick={() => applyPreset("q7_worry", "q8_hope", "count")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q7_worry" && colDim === "q8_hope"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            不安(問7) × あったらいいな(問8)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("q3_age", "q7_worry", "row_percent")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q3_age" && colDim === "q7_worry"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            年代(問3) × 不安(問7) [割合%]
          </button>
          <button
            type="button"
            onClick={() => applyPreset("q3_age", "q8_hope", "row_percent")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q3_age" && colDim === "q8_hope"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            年代(問3) × あったらいいな(問8)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("q4_household", "q8_hope", "row_percent")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q4_household" && colDim === "q8_hope"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            世帯(問4) × あったらいいな(問8)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("q5_pride", "q8_hope", "count")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q5_pride" && colDim === "q8_hope"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            自慢(問5) × あったらいいな(問8)
          </button>
          <button
            type="button"
            onClick={() => applyPreset("q1_jichikai", "q7_worry", "count")}
            className={`px-2.5 py-1 rounded-md transition font-medium border ${
              rowDim === "q1_jichikai" && colDim === "q7_worry"
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            地区(問1) × 不安(問7)
          </button>
        </div>

        {/* Control Toolbar */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Row Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">行（縦軸）:</span>
              <select
                value={rowDim}
                onChange={(e) => setRowDim(e.target.value as SurveyDimensionKey)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[220px] truncate"
              >
                {allDimensionOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Swap Button */}
            <button
              type="button"
              onClick={handleSwap}
              title="行と列を入れ替える"
              className="p-1.5 rounded-lg border border-slate-300 text-slate-600 hover:bg-slate-100 transition"
            >
              <ArrowUpDown className="w-3.5 h-3.5" />
            </button>

            {/* Column Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">列（横軸）:</span>
              <select
                value={colDim}
                onChange={(e) => setColDim(e.target.value as SurveyDimensionKey)}
                className="px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 max-w-[220px] truncate"
              >
                {allDimensionOptions.map((opt) => (
                  <option key={opt.key} value={opt.key}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">表示指標:</span>
              <div className="inline-flex rounded-lg border border-slate-300 p-0.5 bg-slate-50">
                <button
                  type="button"
                  onClick={() => setMetric("count")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    metric === "count" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  件数 (人数)
                </button>
                <button
                  type="button"
                  onClick={() => setMetric("row_percent")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    metric === "row_percent" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  行割合 %
                </button>
                <button
                  type="button"
                  onClick={() => setMetric("col_percent")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    metric === "col_percent" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  列割合 %
                </button>
                <button
                  type="button"
                  onClick={() => setMetric("total_percent")}
                  className={`px-2.5 py-1 text-xs font-bold rounded-md transition ${
                    metric === "total_percent" ? "bg-blue-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  全体割合 %
                </button>
              </div>
            </div>

            {/* Heatmap Toggle */}
            <label className="flex items-center gap-1.5 text-xs font-medium text-slate-600 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={showHeatmap}
                onChange={(e) => setShowHeatmap(e.target.checked)}
                className="rounded text-blue-600 focus:ring-0 cursor-pointer"
              />
              <span>ヒートマップ濃淡</span>
            </label>
          </div>
        </div>
      </div>

      {/* Analytical Takeaway Callout for Current Pivot */}
      <div className="mx-3 sm:mx-6 mt-4 p-4 bg-gradient-to-r from-blue-50/80 via-indigo-50/40 to-slate-50 border border-blue-200/80 rounded-xl space-y-2.5 text-xs">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-blue-700" />
            <h4 className="font-bold text-slate-900 text-sm">
              【分析結果・傾向】「{DIMENSION_LABELS[rowDim]}」×「{DIMENSION_LABELS[colDim]}」のクロス集計インサイト
            </h4>
          </div>
          <span className="text-[11px] text-slate-500">
            総クロス集計票数: <strong className="text-slate-800">{pivotData.grandTotal}</strong> 票
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-blue-600 block">最多交差セル（最大集中）</span>
            <p className="font-semibold text-slate-800 truncate" title={`${topIntersection.topCell.row} × ${topIntersection.topCell.col}`}>
              {topIntersection.topCell.row || "なし"} × {topIntersection.topCell.col || "なし"}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              該当: <strong className="text-blue-700">{topIntersection.topCell.count}</strong> 件
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-slate-600 block">行（{DIMENSION_LABELS[rowDim]}）の最多項目</span>
            <p className="font-semibold text-slate-800 truncate" title={topIntersection.topRow.name}>
              {topIntersection.topRow.name || "なし"}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              合計: <strong className="text-slate-800">{topIntersection.topRow.count}</strong> 票
            </p>
          </div>

          <div className="bg-white p-2.5 rounded-lg border border-blue-100 shadow-2xs space-y-0.5">
            <span className="text-[10px] font-bold text-slate-600 block">列（{DIMENSION_LABELS[colDim]}）の最多項目</span>
            <p className="font-semibold text-slate-800 truncate" title={topIntersection.topCol.name}>
              {topIntersection.topCol.name || "なし"}
            </p>
            <p className="text-[11px] text-slate-500 font-medium">
              合計: <strong className="text-slate-800">{topIntersection.topCol.count}</strong> 票
            </p>
          </div>
        </div>

        <p className="text-slate-600 leading-relaxed pt-1 border-t border-blue-100/60">
          <strong>💡 対話ワークショップでの活用示唆:</strong> 「{DIMENSION_LABELS[rowDim]}」のグループ別に見ると、特に「{topIntersection.topRow.name || "最多項目"}」において「{topIntersection.topCell.col || "最多回答"}」への関心が際立っています。
          集計表の濃い青色のセル（ヒートマップ集中箇所）を住民に提示することで、「実はこの属性の人たちがここを強く望んでいる」という納得感ある事実共有と、具体的なアクション決めへの合意形成がスムーズになります。
        </p>
      </div>

      {/* Table Container */}
      <div className="p-3 sm:p-6 overflow-x-auto">
        <table className="w-full text-xs text-left border-collapse">
          <thead>
            <tr className="bg-slate-100 text-slate-700 font-bold border-b border-slate-300">
              <th className="p-3 sticky left-0 z-10 bg-slate-100 min-w-[160px] border-r border-slate-200">
                <div className="flex items-center justify-between text-slate-600">
                  <span className="text-[11px] font-normal">{DIMENSION_LABELS[rowDim]} ↓</span>
                  <span className="text-[11px] font-normal">→ {DIMENSION_LABELS[colDim]}</span>
                </div>
              </th>
              {pivotData.colLabels.map((col) => (
                <th
                  key={col}
                  className="p-3 text-center min-w-[110px] max-w-[160px] border-r border-slate-200 font-bold text-slate-800"
                >
                  <div className="truncate" title={col}>
                    {col}
                  </div>
                  <div className="text-[10px] font-normal text-slate-500 mt-0.5">
                    (計: {pivotData.colTotals[col] || 0})
                  </div>
                </th>
              ))}
              <th className="p-3 text-center min-w-[80px] bg-slate-200/70 font-bold text-slate-900">
                行合計
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200">
            {pivotData.rowLabels.map((row) => {
              const rTotal = pivotData.rowTotals[row] || 0;
              return (
                <tr key={row} className="hover:bg-slate-50 transition">
                  <td className="p-3 font-semibold text-slate-900 sticky left-0 z-10 bg-white border-r border-slate-200 shadow-xs">
                    <div className="flex items-center justify-between">
                      <span className="truncate max-w-[160px]" title={row}>
                        {row}
                      </span>
                      <span className="text-[10px] font-normal text-slate-400 ml-1">
                        ({rTotal})
                      </span>
                    </div>
                  </td>

                  {pivotData.colLabels.map((col) => {
                    const val = pivotData.matrix[row]?.[col] || 0;
                    const intensity = maxValue > 0 ? val / maxValue : 0;

                    let bgStyle = {};
                    if (showHeatmap && val > 0) {
                      const alpha = Math.min(0.85, Math.max(0.08, intensity));
                      bgStyle = {
                        backgroundColor: `rgba(37, 99, 235, ${alpha})`,
                        color: alpha > 0.45 ? "#ffffff" : "#0f172a",
                      };
                    }

                    return (
                      <td
                        key={col}
                        style={bgStyle}
                        className={`p-3 text-center border-r border-slate-200 font-medium transition ${
                          val === 0 ? "text-slate-300" : ""
                        }`}
                      >
                        {val === 0 ? (
                          "-"
                        ) : metric === "count" ? (
                          <span className="font-bold">{val}</span>
                        ) : (
                          <span className="font-bold">{val}%</span>
                        )}
                      </td>
                    );
                  })}

                  <td className="p-3 text-center font-bold text-slate-800 bg-slate-50">
                    {rTotal}
                  </td>
                </tr>
              );
            })}

            {/* Column Totals Row */}
            <tr className="bg-slate-100 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="p-3 sticky left-0 z-10 bg-slate-100 border-r border-slate-200">
                列合計 (総計)
              </td>
              {pivotData.colLabels.map((col) => (
                <td key={col} className="p-3 text-center border-r border-slate-200">
                  {pivotData.colTotals[col] || 0}
                </td>
              ))}
              <td className="p-3 text-center bg-slate-200 text-blue-900 font-extrabold">
                {pivotData.grandTotal}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Footer Notes */}
      <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
          <span>
            ※
            複数選択の設問（問5・問6・問7・問8）同士を掛け合わせた場合、1人が複数項目に該当するため合計値は回答者数（{rows.length}名）を上回ります。
          </span>
        </div>
        <div className="font-semibold text-slate-700">
          行数: {pivotData.rowLabels.length} 項目 × 列数: {pivotData.colLabels.length} 項目
        </div>
      </div>
    </div>
  );
}
