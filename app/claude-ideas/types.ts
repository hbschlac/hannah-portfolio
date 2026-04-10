export type PostCategory = "pain_point" | "feature_request" | "positive" | "competitor";
export type Sentiment = "negative" | "positive" | "neutral";

export interface RedditPost {
  id: string;
  collected_run: string; // "YYYY-MM-DD"
  title: string;
  subreddit: string;
  score: number;
  num_comments: number;
  url: string; // direct Reddit link
  selftext_snippet: string; // first 300 chars
  category: PostCategory;
  tags: string[];
  sentiment: Sentiment;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface PmPriority {
  title: string;
  why: string[]; // 2-3 bullet points
  metric: string;
  roi_estimate: string;
  impact_level: "High" | "Medium" | "Low";
  effort_level: "High" | "Medium" | "Low";
  supporting_post_ids: string[]; // ids of posts that back this claim
}

export interface PmAnalysis {
  top_priority: PmPriority;
  secondary_priorities: PmPriority[];
}

export interface CategoryCounts {
  pain_point: number;
  feature_request: number;
  positive: number;
  competitor: number;
}

export interface Delta {
  pain_point_pct_change: number;
  feature_request_pct_change: number;
  positive_pct_change: number;
  competitor_pct_change: number;
  top_emerging_tag: string | null;
}

export interface RunSummary {
  run_date: string; // "YYYY-MM-DD"
  day: string; // "Monday"
  total_new_posts: number;
  cumulative_total: number;
  categories: CategoryCounts;
  top_tags: TagCount[];
  new_feature_requests: string[];
  delta_vs_last: Delta | null;
  pm_analysis: PmAnalysis;
}
