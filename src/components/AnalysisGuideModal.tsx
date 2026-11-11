import React from "react";
import {
  BookOpen,
  X,
  CheckCircle2,
  Table,
  Link2,
  Sparkles,
  BarChart3,
  HelpCircle,
  Copy,
  Check,
} from "lucide-react";

interface AnalysisGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AnalysisGuideModal({ isOpen, onClose }: AnalysisGuideModalProps) {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen) return null;

  const handleCopyGuide = () => {
    const guideText = `# 柳井市 まちなかアンケート分析ダッシュボード 分析可能項目・機能仕様書

## 1. 概要と目的
本ダッシュボードは、山口県柳井市の「まちなかまちづくり（まちなか井戸端会議など）」に向けた住民アンケート結果（Googleフォーム、CSV、Excel、スプレッドシート等）を多角的に分析し、住民同士の対話を深める「インサイト（気づき）」と「アクションを生み出す問い立て」を瞬時に導出する支援システムです。

---

## 2. 対象データ項目（定義）
- 問1: 自治会・地区（古市金屋、姫田、新庄、柳井、その他地区）
- 問2: 性別（男性、女性、その他・無回答）
- 問3: 年齢・年代（10代〜20代、30代、40代、50代、60代、70代以上）
- 問4: 世帯構成（単身、夫婦のみ、子育て世帯、二世代・三世代同居など）
- 問5: 自慢できるもの【強み・最大3つ複数選択】（歴史や文化、景観・白壁の町並み、人の温かさ、商業・飲食、自然環境、治安・安心など）
- 問6: 利用施設【最大3つ複数選択】（やない西蔵、柳井駅、図書館、商業施設、公園など）
- 問7: 不安・困りごと【課題・最大3つ複数選択】（空き家の増加、買い物の不便、公共交通・移動、防災・防犯、若者の流出、高齢者の見守りなど）
- 問8: あったらいいな【期待・最大3つ複数選択】（カフェ・居場所、子どもの遊び場、コミュニティスペース、イベント、日常買い物機能など）
- 問9: 自由意見（住民の生の声・定性コメント）

---

## 3. ダッシュボードで可能になる分析項目一覧

### ①【対話設計・インサイト】ファシリテーション用サマリー分析
1. まちなかの現状サマリー（定量ハイライト）
   - 全体の傾向と、世代別（問3）・世帯構成別（問4）で顕著に見られたギャップの自動抽出。
2. ワークショップ用 事前インプット情報（参加者への提示用）
   - データを住民の生活風景や物語として翻訳した文章（「〇〇代の多くが〜に不安を抱える一方、〜を求めている」など）。
   - 自由意見（問9）の感情・文脈と掛け合わせた共感ストーリーの生成。
3. 対話を深める3つの「問い立て」
   - 【問い1】問5（強み）× 問7（課題）：自慢をテコに不安を和らげる前向きな問い。
   - 【問い2】問7（課題）× 問8（期待）：困りごとをワクワクする未来像へ転換する問い。
   - 【問い3】世代間・世帯間の掛け合わせ：若者・子育て世代とシニア世代が共にまちなかに関われる問い。
   - 各問いに対する背景解説および住民が発言しやすい「対話のヒント」。
4. Gemini AI による動的リフレッシュ & 自由着眼点追加プロンプト。

### ②【同一回答者 相関・共起分析】個人単位のクロス連動
1. 【課題解決パス】不安(問7) × あったらいいな(問8)
   - 「特定の不安（例: 交通、空き家、買い物）」を抱えている人が、同じアンケートでどの「あったらいいな」を同時に選んでいるかの同時選択率（%）と共起人数。
   - 偶然の同時選択を超えて強く結びついているかを示す「リフト値（Lift）」の算出。
2. 【強み発展】自慢(問5) × あったらいいな(問8)
   - 自慢や誇りに感じている資源と、将来の期待機能の親和性を分析。
3. 【誇りと現実】自慢(問5) × 不安(問7)
   - 「歴史文化や白壁」に誇りを持つ住民ほど「空き家や街並みの老朽化」に強い危機感を持つといった、誇りと課題感の表裏関係を特定。
4. 相関強度トップペアランキング
   - 全組み合わせの中から、統計的共起強度（リフト値 × 共起確率）が高い上位ペアを自動ランキング化。

### ③【自由ピボットクロス集計】全設問の2軸カスタムマトリクス
1. 全8ディメンションの自由掛け合わせ
   - 縦軸（行）と横軸（列）を、問1〜問8から任意に選択。
   - 単一属性（年代・世帯・地区・性別）だけでなく、複数選択設問（自慢・利用施設・不安・期待）同士のクロス集計にも完全対応。
2. 4種類の表示指標切り替え
   - 件数（人数）
   - 行割合（%）：行ごとの構成比
   - 列割合（%）：列ごとの構成比
   - 全体割合（%）：全回答者に対する割合
3. ヒートマップ濃淡表示
   - 数値の大小に応じたカラーグラデーションで、データの集中・偏りを直感的に発見。
4. ワンクリックおすすめプリセット
   - 「不安×期待」「年代×不安」「年代×期待」「世帯×期待」「自慢×期待」「地区×不安」
5. 集計結果のCSVエクスポート機能
   - Excelや外部ツールでそのまま活用できるフォーマットで出力。

### ④【基礎集計グラフ & 属性フィルタリング】
1. 単変量基礎集計グラフ
   - 問1（地区分布）、問2（性別）、問3（年代）、問4（世帯構成）、問5（自慢ランキング）、問6（施設利用度）、問7（不安ランキング）、問8（期待ランキング）。
2. グローバル属性フィルタリング
   - 「特定地区のみ（例: 古市金屋地区）」や「特定年代のみ（例: 30代子育て層）」に瞬時に絞り込み、上記の全分析をリアルタイム再計算。

---

## 4. データ取り込み & 自動クレンジング仕様（Googleフォーム・CSV・スプレッドシート）

### ① 問5（自慢）・問7（不安）・問8（期待）の数字→設問テキスト自動変換
- Googleフォーム等の集計出力で「1, 3, 5」や「9, 11, 2」のように選択肢番号の数字（半角・全角問わず）で保存されている場合でも、自動的に正式な設問テキストへ変換して集計します。
  - 例（問5 自慢）: 「1」→「公園や緑が身近」、「9」→「歴史や文化」、「11」→「観光資源」
  - 例（問7 不安）: 「1」→「防災・防犯」、「3」→「空き家・周辺環境」、「9」→「公共交通や移動」
  - 例（問8 期待）: 「5」→「多世代が集える場所」、「8」→「子どもの遊び場」、「10」→「公共交通の充実」
- 「1. 公園や緑が身近」のように番号接頭辞がついている場合も自動で不要な記号をトリムして綺麗な日本語テキストとして同定します。

### ② 問6（利用施設）の複数回答分割 & 表記揺れ統一同定
- 1つの回答欄に複数の施設名が記入されている場合（読点「、」、カンマ「,」、スラッシュ「/」、中黒「・」、改行、スペース、接続詞「と」「及び」など）、別々の独立した施設名として漏れなく個別に抽出して集計します。
- **表記揺れの統一同定（英語・カタカナ・大文字小文字・全角半角・記号差の吸収）**:
  - 「Mr.Max」「ミスターマックス」「MR.MAX」「ミスター・マックス」「ｍｒ．ｍａｘ」等をすべて同一施設「Mr.Max（ミスターマックス）」として統一集計。
  - 「ゆめタウン」「ゆめタウン柳井」「youme」「ユメタウン」を「ゆめタウン柳井」へ統一。
  - 「西蔵」「やない西蔵」「柳井西蔵」を「やない西蔵」へ統一。
  - 「図書館」「みどりが丘図書館」「柳井市立図書館」を「みどりが丘図書館」へ統一。
  - 「サンビーム」「サンビームやない」「サンビーム柳井」を「サンビームやない」へ統一。
- **未知の個人店・スポットも100%全て集計**:
  - 辞書にない個人店（カフェ、飲食店、商店、クリニック、広場など）であっても、回答を捨てることなく全て独立した言葉として取り上げてランキング・集計一覧に反映します。

---

## 5. ワークショップ・井戸端会議での実践的な活用シーン
- **机上配布用インプットシート**: 「現状サマリー」と「事前インプット情報」をそのまま印刷またはプロジェクター投影し、参加者の目線を揃える。
- **テーブル対話のテーマ決め**: 「3つの問い立て」を各テーブルの模造紙の中央に配置し、ブレインストーミングを開始する。
- **合意形成・施策検討**: 「課題×期待の相関分析」を参照し、住民の不満を解消するだけでなく、住民自らが愛着を持って関われる事業プランを策定する。
`;

    navigator.clipboard.writeText(guideText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/80 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                まちなかアンケート 分析可能項目・機能仕様書
              </h3>
              <p className="text-xs text-slate-500">
                本ダッシュボードで実行できる分析メニューとワークショップでの活用方法
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyGuide}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg shadow-2xs transition"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-700">コピーしました</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-500" />
                  <span>全文マークダウンをコピー</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-slate-700 text-xs sm:text-sm leading-relaxed">
          {/* Section 1 */}
          <div className="p-4 rounded-xl bg-blue-50/60 border border-blue-100 text-blue-950 space-y-2">
            <h4 className="font-bold text-sm text-blue-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-blue-600" />
              ダッシュボードの基本目的と役割
            </h4>
            <p className="text-xs text-blue-900/80 leading-relaxed">
              Googleフォームで収集した柳井市のまちなかアンケートデータを瞬時に集計し、
              単なる数値の羅列ではなく、住民ワークショップ（まちなか井戸端会議）で
              <strong>「参加者が自分ごととして捉えられる物語」</strong>と
              <strong>「前向きな対話を生み出す3つの問い立て」</strong>を自動生成します。
            </p>
          </div>

          {/* Section 2: Four Key Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Pillar 1 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>① 対話設計・ファシリテーションインサイト</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>
                  <strong>まちなかの現状サマリー:</strong> 全体傾向と、年代・世帯間の顕著なギャップのハイライト
                </li>
                <li>
                  <strong>ワークショップ用 事前インプット:</strong> 「〜代の多くが〜に不安を感じる一方、〜を求めている」など参加者の心に響く物語文
                </li>
                <li>
                  <strong>対話を深める3つの「問い立て」:</strong> 「強み×課題」「課題×期待」「世代間連携」の3軸で具体的な最初の一言ヒント付き
                </li>
                <li>
                  <strong>Gemini AIリフレッシュ:</strong> 自由な観点（例:「白壁の町並みを活かした空き家対策」）を追加して再分析可能
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
                <Link2 className="w-4 h-4" />
                <span>② 同一回答者 相関・共起分析</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>
                  <strong>【課題解決パス】不安(問7) × あったらいいな(問8):</strong> 「移動に不安がある人は具体的に何を求めているか？」の同時選択率と人数
                </li>
                <li>
                  <strong>【強み発展】自慢(問5) × あったらいいな(問8):</strong> 自慢に感じる地域資源から発展させる新機能の親和性
                </li>
                <li>
                  <strong>【誇りと現実】自慢(問5) × 不安(問7):</strong> 誇りがあるからこそ危惧している課題感の表裏関係
                </li>
                <li>
                  <strong>リフト値 (Lift) 判定:</strong> 偶然以上によく一緒に選ばれている結びつきの強さを数理的に判定
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                <Table className="w-4 h-4" />
                <span>③ 全設問対応 自由ピボットクロス集計</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>
                  <strong>自由な2軸選択:</strong> 問1〜問8（自治会、性別、年代、世帯、自慢、施設、不安、期待）を行・列に自由指定
                </li>
                <li>
                  <strong>複数回答同士のクロス対応:</strong> 問5〜8の複数選択項目同士も正確に集計
                </li>
                <li>
                  <strong>4種の表示指標:</strong> 件数（人数）/ 行割合 % / 列割合 % / 全体割合 %
                </li>
                <li>
                  <strong>ヒートマップ濃淡表示:</strong> 密度の高いセルを青色グラデーションで可視化
                </li>
                <li>
                  <strong>CSV出力:</strong> ワンクリックでExcel用CSVエクスポート
                </li>
              </ul>
            </div>

            {/* Pillar 4 */}
            <div className="p-4 rounded-xl border border-slate-200 bg-white shadow-2xs space-y-2">
              <div className="flex items-center gap-2 text-violet-700 font-bold text-sm">
                <BarChart3 className="w-4 h-4" />
                <span>④ 基礎集計グラフ & 属性絞り込み</span>
              </div>
              <ul className="space-y-1.5 text-xs text-slate-600 list-disc list-inside">
                <li>
                  <strong>設問別グラフ:</strong> 自治会地区・年代・世帯・性別・自慢・施設・不安・期待のランキンググラフ
                </li>
                <li>
                  <strong>リアルタイム・フィルタ:</strong> 「特定地区（例: 古市金屋）のみ」「特定世代（例: 30代子育て層）のみ」に絞り込み全画面が瞬時に連動
                </li>
                <li>
                  <strong>回答元データ閲覧:</strong> 検索・ソート・個別回答詳細モーダル
                </li>
                <li>
                  <strong>データ柔軟入力:</strong> スプレッドシートURL / CSV / TSV / Excel / テキスト貼り付け
                </li>
              </ul>
            </div>
          </div>

          {/* Section 2.5: Data Ingestion & Auto Cleansing Spec */}
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 space-y-2">
            <h4 className="font-bold text-sm text-amber-900 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              データ取り込み & 自動クレンジング仕様（問5・問7・問8の数字変換、問6の表記揺れ統一同定）
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-amber-950">
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200/70 space-y-1">
                <p className="font-bold text-slate-800">問5・問7・問8：数字の自動テキスト展開</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  Googleフォームで「1, 3, 5」や「9, 11, 2」のように数字（半角・全角問わず）で出力された場合、自動的に対応する設問テキスト（「1」→「公園や緑が身近」、「9」→「歴史や文化」など）へ展開して集計します。「1. 公園や緑が身近」等の記号付きも綺麗にトリムされます。
                </p>
              </div>
              <div className="bg-white/80 p-3 rounded-lg border border-amber-200/70 space-y-1">
                <p className="font-bold text-slate-800">問6：複数回答の個別抽出 & 表記揺れ統合</p>
                <p className="text-slate-600 text-[11px] leading-relaxed">
                  1セルに複数施設がある場合（読点、カンマ、スラッシュ、中黒、空白、接続詞など）を正確に分割。「Mr.Max」「ミスターマックス」「MR.MAX」「ｍｒ．ｍａｘ」等の言語・表記揺れを「Mr.Max（ミスターマックス）」に完全統一同定します。辞書にない個人店やカフェも漏れなく全て抽出・集計対象となります。
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: Questions Matrix */}
          <div className="space-y-2">
            <h4 className="font-bold text-slate-900 text-sm">
              ■ 対象アンケート設問（問1〜問9）と分析マトリクス
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-2.5 px-3">設問番号</th>
                    <th className="py-2.5 px-3">設問名</th>
                    <th className="py-2.5 px-3">データ型</th>
                    <th className="py-2.5 px-3">主な分析・クロス集計の用途</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問1</td>
                    <td className="py-2 px-3 font-medium">自治会・地区</td>
                    <td className="py-2 px-3 text-slate-500">単一選択</td>
                    <td className="py-2 px-3">地区別の課題感・期待感・施設利用の地域差比較</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問2</td>
                    <td className="py-2 px-3 font-medium">性別</td>
                    <td className="py-2 px-3 text-slate-500">単一選択</td>
                    <td className="py-2 px-3">性別による不安・居場所ニーズの差の把握</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問3</td>
                    <td className="py-2 px-3 font-medium">年齢・年代</td>
                    <td className="py-2 px-3 text-slate-500">単一選択</td>
                    <td className="py-2 px-3">世代間ギャップ分析（若者・子育て層 vs シニア層）</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問4</td>
                    <td className="py-2 px-3 font-medium">世帯構成</td>
                    <td className="py-2 px-3 text-slate-500">単一選択</td>
                    <td className="py-2 px-3">単身高齢世帯 vs ファミリー世帯の生活ニーズの比較</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問5</td>
                    <td className="py-2 px-3 font-medium">自慢できるもの（強み）</td>
                    <td className="py-2 px-3 text-slate-500">複数選択 (最大3)</td>
                    <td className="py-2 px-3">地域の資源・プライドの可視化、課題解決のテコ</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問6</td>
                    <td className="py-2 px-3 font-medium">利用施設</td>
                    <td className="py-2 px-3 text-slate-500">複数選択 (最大3)</td>
                    <td className="py-2 px-3">西蔵、駅、図書館等の日常動線・生活接点の把握</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問7</td>
                    <td className="py-2 px-3 font-medium">不安・困りごと（課題）</td>
                    <td className="py-2 px-3 text-slate-500">複数選択 (最大3)</td>
                    <td className="py-2 px-3">生活インフラ・空き家・交通などの優先解決課題</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問8</td>
                    <td className="py-2 px-3 font-medium">あったらいいな（期待）</td>
                    <td className="py-2 px-3 text-slate-500">複数選択 (最大3)</td>
                    <td className="py-2 px-3">未来のまちなか空間・コミュニティ機能の構想</td>
                  </tr>
                  <tr>
                    <td className="py-2 px-3 font-bold text-slate-800">問9</td>
                    <td className="py-2 px-3 font-medium">自由意見</td>
                    <td className="py-2 px-3 text-slate-500">自由記述</td>
                    <td className="py-2 px-3">定性的な熱量・具体的事例のインプット・対話のタネ</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between rounded-b-2xl">
          <span className="text-xs text-slate-500">
            山口県柳井市 まちなかまちづくり対話支援システム
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold transition"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  );
}
