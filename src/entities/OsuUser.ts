export interface OsuUser {
  country: Country;
  account_history: any[];
  occupation: string;
  unranked_beatmapset_count: number;
  scores_best_count: number;
  ranked_beatmapset_count: number;
  is_restricted: boolean;
  has_supported: boolean;
  cover: Cover;
  twitter: string;
  profile_order: string[];
  id: number;
  is_bot: boolean;
  kudosu: Kudosu;
  ranked_and_approved_beatmapset_count: number;
  scores_pinned_count: number;
  active_tournament_banner: any;
  join_date: string;
  profile_colour: any;
  pm_friends_only: boolean;
  title_url: any;
  previous_usernames: any[];
  country_code: string;
  comments_count: number;
  post_count: number;
  pending_beatmapset_count: number;
  loved_beatmapset_count: number;
  title: any;
  default_group: string;
  playstyle: string[];
  scores_first_count: number;
  playmode: string;
  is_deleted: boolean;
  graveyard_beatmapset_count: number;
  is_online: boolean;
  cover_url: string;
  is_active: boolean;
  groups: any[];
  badges: any[];
  avatar_url: string;
  guest_beatmapset_count: number;
  interests: string;
  scores_recent_count: number;
  username: string;
  website: string;
  discord: string;
  nominated_beatmapset_count: number;
  location: string;
  support_level: number;
  is_supporter: boolean;
  rank_highest: RankHighest;
  max_friends: number;
  max_blocks: number;
  user_achievements: UserAchievement[];
  active_tournament_banners: any[];
  monthly_playcounts: MonthlyPlaycount[];
  beatmap_playcounts_count: number;
  favourite_beatmapset_count: number;
  statistics_rulesets: RulesetStatistics;
  rankHistory: RankHistory;
  last_visit: string;
  rank_history: RankHistory2;
  page: Page;
  follower_count: number;
  replays_watched_counts: ReplaysWatchedCount[];
  mapping_follower_count: number;
  statistics: Statistics;
}

interface Country {
  code: string;
  name: string;
}

interface Cover {
  id: any;
  url: string;
  custom_url: string;
}

interface Kudosu {
  total: number;
  available: number;
}

interface RankHighest {
  updated_at: string;
  rank: number;
}

interface UserAchievement {
  achievement_id: number;
  achieved_at: string;
}

interface MonthlyPlaycount {
  count: number;
  start_date: string;
}

interface RulesetStatistics {
  taiko: TaikoStatistics;
  fruits: FruitsStatistics;
  mania: ManiaStatistics;
  osu: OsuStatistics;
}

interface TaikoStatistics {
  pp: number;
  grade_counts: GradeCounts;
  level: Level;
  maximum_combo: number;
  play_count: number;
  play_time: number;
  ranked_score: number;
  total_hits: number;
  replays_watched_by_others: number;
  total_score: number;
  is_ranked: boolean;
  global_rank: any;
  hit_accuracy: number;
  pp_exp: number;
  global_rank_exp: any;
  count_miss: number;
  count_300: number;
  count_100: number;
  count_50: number;
}

interface GradeCounts {
  ss: number;
  a: number;
  s: number;
  sh: number;
  ssh: number;
}

interface Level {
  current: number;
  progress: number;
}

interface FruitsStatistics {
  pp: number;
  level: Level2;
  grade_counts: GradeCounts2;
  maximum_combo: number;
  play_count: number;
  play_time: number;
  ranked_score: number;
  hit_accuracy: number;
  total_hits: number;
  replays_watched_by_others: number;
  total_score: number;
  is_ranked: boolean;
  global_rank: any;
  pp_exp: number;
  global_rank_exp: any;
  count_miss: number;
  count_300: number;
  count_100: number;
  count_50: number;
}

interface Level2 {
  current: number;
  progress: number;
}

interface GradeCounts2 {
  ss: number;
  a: number;
  s: number;
  sh: number;
  ssh: number;
}

interface ManiaStatistics {
  pp: number;
  grade_counts: GradeCounts3;
  maximum_combo: number;
  ranked_score: number;
  replays_watched_by_others: number;
  is_ranked: boolean;
  global_rank: any;
  hit_accuracy: number;
  pp_exp: number;
  global_rank_exp: any;
  count_50: number;
  total_hits: number;
  count_miss: number;
  level: Level3;
  count_300: number;
  count_100: number;
  total_score: number;
  play_count: number;
  play_time: number;
}

interface GradeCounts3 {
  ss: number;
  a: number;
  s: number;
  sh: number;
  ssh: number;
}

interface Level3 {
  current: number;
  progress: number;
}

interface OsuStatistics {
  maximum_combo: number;
  is_ranked: boolean;
  hit_accuracy: number;
  level: Level4;
  pp_exp: number;
  pp: number;
  count_miss: number;
  grade_counts: GradeCounts4;
  play_count: number;
  play_time: number;
  ranked_score: number;
  total_hits: number;
  count_300: number;
  count_100: number;
  count_50: number;
  total_score: number;
  replays_watched_by_others: number;
  global_rank_exp: number;
  global_rank: number;
}

interface Level4 {
  current: number;
  progress: number;
}

interface GradeCounts4 {
  ss: number;
  sh: number;
  ssh: number;
  s: number;
  a: number;
}

interface RankHistory {
  mode: string;
  data: number[];
}

interface RankHistory2 {
  mode: string;
  data: number[];
}

interface Page {
  raw: string;
  html: string;
}

interface ReplaysWatchedCount {
  count: number;
  start_date: string;
}

interface Statistics {
  maximum_combo: number;
  is_ranked: boolean;
  hit_accuracy: number;
  level: Level5;
  pp_exp: number;
  pp: number;
  count_miss: number;
  grade_counts: GradeCounts5;
  play_count: number;
  play_time: number;
  ranked_score: number;
  total_hits: number;
  count_300: number;
  count_100: number;
  count_50: number;
  total_score: number;
  country_rank: number;
  replays_watched_by_others: number;
  rank: Rank;
  global_rank_exp: number;
  global_rank: number;
}

interface Level5 {
  current: number;
  progress: number;
}

interface GradeCounts5 {
  ss: number;
  sh: number;
  ssh: number;
  s: number;
  a: number;
}

interface Rank {
  country: number;
}
