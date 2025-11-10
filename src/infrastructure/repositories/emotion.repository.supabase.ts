import { EmotionRepository } from "@/domain/repositories/emotion.repository";
import { supabase } from "@/config/supabase";

export class EmotionRepositorySupabase implements EmotionRepository {
  async getAllByName(): Promise<string[]> {
    const { data, error } = await supabase
      .from("emotion")
      .select("emotion");

    if (error) {
      throw new Error(`Error fetching emotions: ${error.message}`);
    }
    return data ? data.map((item: { emotion: string }) => item.emotion) : [];
  }
}
