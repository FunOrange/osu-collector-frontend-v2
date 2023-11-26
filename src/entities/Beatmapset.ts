export interface Beatmapset {
  submitted_date: string;
  nominations_summary: NominationsSummary;
  discussion_locked: boolean;
  artist: string;
  artist_unicode: string;
  video: boolean;
  source: string;
  availability: Availability;
  title: string;
  discussion_enabled: boolean;
  is_scoreable: boolean;
  can_be_hyped: boolean;
  ratings: number[];
  ranked: number;
  id: number;
  legacy_thread_url: string;
  bpm: number;
  covers: Covers;
  creator: string;
  last_updated: string;
  nsfw: boolean;
  play_count: number;
  storyboard: boolean;
  tags: string;
  user_id: number;
  preview_url: string;
  ranked_date: any;
  favourite_count: number;
  hype: any;
  title_unicode: string;
  status: string;
}

interface NominationsSummary {
  required: number;
  current: number;
}

interface Availability {
  download_disabled: boolean;
  more_information: any;
}

interface Covers {
  slimcover: string;
  "cover@2x": string;
  list: string;
  cover: string;
  "list@2x": string;
  "card@2x": string;
  card: string;
  "slimcover@2x": string;
}
