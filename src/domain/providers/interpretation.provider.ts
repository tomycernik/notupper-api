import { IDreamContext } from "@domain/interfaces/dream-context.interface";
import { Interpretation } from "@domain/interfaces/interpretation-dream.interface";

export interface InterpretationProvider {
  interpretDream(
    dreamText: string,
    dreamContext?: IDreamContext | null
  ): Promise<Interpretation>;
  reinterpretDream(
    dreamText: string,
    previousInterpretation: string,
    dreamContext?: IDreamContext | null
  ): Promise<Interpretation>;
}
