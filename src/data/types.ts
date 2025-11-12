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

export type BackgroundConfig = {
  bgImg?: string;
  bgColor?: string;
  bgOpacity?: number;
};

export type SlideCard = {
  title: string;
  subtitle?: string | string[];
  content: string;
  images?: ImageConfig[];
  background?: BackgroundConfig;
  imageAlignment?: ImageAlignment;
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

