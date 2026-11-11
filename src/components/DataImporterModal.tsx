import React from "react";
import { X, FileSpreadsheet } from "lucide-react";
import { DataImporter } from "./DataImporter";

interface DataImporterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataLoaded: (headers: string[], rows: string[][], sourceName: string) => void;
}

export const DataImporterModal: React.FC<DataImporterModalProps> = ({
  isOpen,
  onClose,
  onDataLoaded,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/60 backdrop-blur-xs animate-fadeIn"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* Modal Top Bar */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/90">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                アンケートデータ取り込み
              </h3>
              <p className="text-xs text-slate-500">
                Googleスプレッドシート（URL）、Excel / CSVファイル、または直接テキスト貼り付けに対応
              </p>
            </div>
          </div>

          <button
            id="btn-close-importer-modal"
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
            title="閉じる"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body / Importer Content */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1 bg-slate-50/30">
          <DataImporter
            onDataLoaded={(headers, rows, sourceName) => {
              onDataLoaded(headers, rows, sourceName);
              onClose(); // Automatically close modal after successful load
            }}
            onClose={onClose}
            isModal={true}
          />
        </div>
      </div>
    </div>
  );
};
