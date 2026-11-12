export interface SurveyRow {
  id: string;
  raw: Record<string, string>;
  q1_jichikai?: string; // 問1: 自治会 / 地区
  q2_gender?: string;   // 問2: 性別
  q3_age?: string;      // 問3: 年齢
  q4_household?: string;// 問4: 世帯構成
  q5_pride: string[];   // 問5: 自慢できるもの / 強み
  q6_facilities: string[]; // 問6: 利用施設 / 行動
  q7_worry: string[];   // 問7: 不安・困りごと / 課題
  q8_hope: string[];    // 問8: あったらいいな / 期待
  q9_opinion?: string;  // 問9: 自由意見
}

export interface ColumnMapping {
  q1: number; // 自治会・地区
  q2: number; // 性別
  q3: number; // 年齢
  q4: number; // 世帯構成
  q5: number; // 自慢できるもの（強み）
  q6: number; // 利用施設
  q7: number; // 不安・困りごと（課題）
  q8: number; // あったらいいな（期待）
  q9: number; // 自由意見
}

export interface AutoMappingResult {
  mapping: ColumnMapping;
  titles: Record<keyof ColumnMapping, string>;
  confidence: Record<keyof ColumnMapping, number>;
  reasons: Record<keyof ColumnMapping, string>;
  autoDetectedCount: number;
}


export type QuestionType = "single" | "multiple" | "text" | "number";

export interface QuestionProfile {
  index: number;
  header: string;
  cleanTitle: string;
  questionType: QuestionType;
  uniqueCount: number;
  sampleValues: string[];
  role?: keyof ColumnMapping;
}

export interface AggregatedCount {
  name: string;
  count: number;
  percentage: number;
}

export interface CrossTabItem {
  category: string;
  total: number;
  items: { [key: string]: number };
}

export interface SurveyOpinion {
  id: string;
  jichikai?: string;
  age?: string;
  household?: string;
  text: string;
}

export interface DynamicQuestionAnalysis {
  colIndex: number;
  title: string;
  questionType: QuestionType;
  topCounts: AggregatedCount[];
  totalAnswered: number;
  opinions?: string[];
}

export interface SurveyAnalysisSummary {
  totalCount: number;
  surveyTitle?: string;
  isYanaiPreset: boolean;
  questionTitles?: Record<string, string>;
  ageDistribution: AggregatedCount[];
  householdDistribution: AggregatedCount[];
  genderDistribution: AggregatedCount[];
  jichikaiDistribution: AggregatedCount[];
  prideRanking: AggregatedCount[];
  facilityRanking: AggregatedCount[];
  worryRanking: AggregatedCount[];
  hopeRanking: AggregatedCount[];
  
  // Dynamic question distributions for any Google Form
  dynamicQuestions: DynamicQuestionAnalysis[];

  // Cross tabulations
  ageToWorry: CrossTabItem[];
  ageToHope: CrossTabItem[];
  householdToWorry: CrossTabItem[];
  householdToHope: CrossTabItem[];
  
  // Generational contrast highlights
  youngTopWorry?: { name: string; count: number; percentage: number };
  youngTopHope?: { name: string; count: number; percentage: number };
  seniorTopWorry?: { name: string; count: number; percentage: number };
  seniorTopHope?: { name: string; count: number; percentage: number };
  
  childRearingTopHope?: { name: string; count: number; percentage: number };
  childRearingTopWorry?: { name: string; count: number; percentage: number };
  singleTopWorry?: { name: string; count: number; percentage: number };

  // Free opinions
  opinions: SurveyOpinion[];
}

export interface CorrelationItem {
  source: string;
  target: string;
  sourceCategory: string;
  targetCategory: string;
  coOccurrence: number;
  sourceCount: number;
  targetCount: number;
  conditionalProb: number;
  reverseProb: number;
  lift: number;
  jaccard: number;
}

export interface CorrelationAnalysisSummary {
  prideToWorry: CorrelationItem[];
  worryToHope: CorrelationItem[];
  prideToHope: CorrelationItem[];
  topStrongestPairs: CorrelationItem[];
  worryToPrimaryHope: {
    worry: string;
    worryCount: number;
    topHopes: {
      hope: string;
      count: number;
      percentage: number;
      lift: number;
    }[];
  }[];
  prideToPrimaryHope: {
    pride: string;
    prideCount: number;
    topHopes: {
      hope: string;
      count: number;
      percentage: number;
    }[];
  }[];
}

export type SurveyDimensionKey =
  | "q1_jichikai"
  | "q2_gender"
  | "q3_age"
  | "q4_household"
  | "q5_pride"
  | "q6_facilities"
  | "q7_worry"
  | "q8_hope"
  | string; // Allows arbitrary column name or "col_<index>"

export type PivotMetric = "count" | "row_percent" | "col_percent" | "total_percent";

export interface PivotTableData {
  rowDimension: SurveyDimensionKey;
  colDimension: SurveyDimensionKey;
  rowDimensionLabel: string;
  colDimensionLabel: string;
  metric: PivotMetric;
  rowLabels: string[];
  colLabels: string[];
  matrix: Record<string, Record<string, number>>;
  rowTotals: Record<string, number>;
  colTotals: Record<string, number>;
  grandTotal: number;
  respondentCount: number;
}

export interface SurveyDataset {
  id: string;
  name: string; // 表示タイトル（編集可能）
  headers: string[];
  rawRows: string[][];
  mapping: ColumnMapping;
  questionTitles?: Record<string, string>;
  mappingReasons?: Record<string, string>;
  sourceName: string;
  sourceUrl?: string; // 登録されたGoogleフォーム/スプレッドシートURL（永続化）
  createdAt: number;
  filterJichikai: string;
  filterAge: string;
  filterHousehold: string;
  aiMarkdown?: string | null;
}

export interface PresentationSlide {
  id: number;
  tag: string;
  title: string;
  subtitle?: string;
  points: string[];
  highlight?: string;
  category: "cover" | "summary" | "ranking" | "story" | "question" | "action";
}



