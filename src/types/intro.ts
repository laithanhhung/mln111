export interface IntroSection {
  type: 'paragraph' | 'bullets' | 'stats' | 'controls';
  heading: string;
  text?: string;
  items?: string[];
  stats?: IntroStat[];
}

export interface IntroStat {
  key: string;
  label: string;
  desc: string;
}

export interface IntroContent {
  title: string;
  sections: IntroSection[];
}
