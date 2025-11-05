import { ContextItem } from '@domain/interfaces/dream-context-item.interface';

export interface DreamContext {
  themes: ContextItem[];
  people: ContextItem[];
  locations: ContextItem[];
  emotions_context: ContextItem[];
}

export type IDreamContext = DreamContext;