export type SharedSymbolType =
  | "person"
  | "location"
  | "theme"
  | "emotion_context";

export interface MapDreamNode {
  id: string;
  type: "dream";
  title: string;
  label: string;
  date: string | null;
  image_url: string | null;

  emotion: string | null;
  emotionColor: string | null;

  people: string[];
  places: string[];
  themes: string[];
  emotion_context: string[];
}

export interface SharedSymbol {
  label: string;
  type: SharedSymbolType;
}

export interface DreamEdge {
  id: string;
  from: string;
  to: string;
  source: string;
  target: string;

  shared: SharedSymbol[];
  sharedSummary: string[];
  weight: number;
}

export interface DreamGraphResponse {
  nodes: MapDreamNode[];
  edges: DreamEdge[];
}