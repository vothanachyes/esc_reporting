export type AnimationType =
  | "fade"
  | "slideUp"
  | "slideDown"
  | "slideLeft"
  | "slideRight"
  | "scale"
  | "rotate";

export type ImageAlignment = "left" | "right";

export type ImageLayout = "single" | "grid" | "scrollable";

export type ImageConfig = {
  url: string;
  alt?: string;
  local?: boolean;
};

export type VideoConfig = {
  url: string;
  local?: boolean;
};

export type BackgroundConfig = {
  bgImg?: string;
  bgColor?: string;
  bgOpacity?: number;
};

export type ContentItem = {
  status: "done" | "todo" | "in-progress";
  title: string;
  description?: string;
  points?: string[];
  doneDate?: string;
};

export type TableRow = {
  status: "done" | "todo" | "in-progress";
  title: string;
  description?: string;
  slideTitle: string;
  doneDate?: string;
  points?: string[];
};

export type ContentTable = {
  type: "table";
  rows: TableRow[];
};

export type ContentStats = {
  type: "stats";
  text?: string;
  stats: Array<{ value: string | number; label: string }>;
};

export type SlideCard = {
  title: string;
  subtitle?: string | string[];
  content: string | ContentItem[] | ContentStats | ContentTable;
  images?: ImageConfig[];
  video?: VideoConfig;
  background?: BackgroundConfig;
  imageAlignment?: ImageAlignment;
  /** @deprecated Image container width is now auto-calculated based on screen height and image aspect ratios. This property is kept for backward compatibility but is ignored. */
  imageContainerWidth?: number;
  animationIn: AnimationType[];
  animationOut: AnimationType[];
  pageIndex: number;
  type?: string;
};

export type PersonInfo = {
  name: string;
  avatar?: string;
  role?: string;
  email?: string;
  department?: string;
  location?: string;
};

export type MainWrapperData = {
  title: string;
  handler: PersonInfo;
  teamLeader: PersonInfo;
  period: string;
  statistics?: {
    totalTasks?: number;
    completedTasks?: number;
    features?: number;
    refactorings?: number;
  };
};

export type ReportData = {
  mainWrapper: MainWrapperData;
  slides: SlideCard[];
};

