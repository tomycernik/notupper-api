export type DreamTypeName =
  | "Lucido"
  | "Pesadilla"
  | "Recurrente"
  | "Estandar"
  | "Premonitorio"
  | "Vivido";
export type DreamPrivacy = "Publico" | "Privado" | "Anonimo";
export type DreamState = "Activo" | "Archivado";
export type Emotion =
  | "Alegría"
  | "Tristeza"
  | "Miedo"
  | "Enojo"
  | "Frustracion"
  | "Verguenza"
  | "Sorpresa"
  | "Celos"
  | "Nostalgia"
  | "Confusion";

export interface IDreamNode {
  id?: string;
  creationDate: Date;
  title: string;
  dream_description: string;
  interpretation: string;
  imageUrl?: string | undefined;
  privacy: DreamPrivacy;
  state: DreamState;
  emotion: Emotion;
  emotionColor?: string;
  type: DreamTypeName;
  likeCount?: number;
  likedByMe?: boolean;
  emotion_context?: string[];
  location_context?: string[];
  people_context?: string[];
  theme_context?: string[];
}

export type EmotionOption = { id: number; label: Emotion };

export class DreamNode implements IDreamNode {
  creationDate: Date;
  title: string;
  dream_description: string;
  interpretation: string;
  imageUrl?: string;
  privacy: DreamPrivacy;
  state: DreamState;
  emotion: Emotion;
  type: DreamTypeName;
  likeCount?: number;
  likedByMe?: boolean;

  private constructor(
    creationDate: Date,
    title: string,
    dream_description: string,
    interpretation: string,
    privacy: DreamPrivacy,
    state: DreamState,
    emotion: Emotion,
    type: DreamTypeName,
    imageUrl?: string
  ) {
    this.creationDate = creationDate;
    this.title = title;
    this.dream_description = dream_description;
    this.interpretation = interpretation;
    this.imageUrl = imageUrl ?? "";
    this.privacy = privacy;
    this.state = state;
    this.emotion = emotion;
    this.type = type;
  }
}
