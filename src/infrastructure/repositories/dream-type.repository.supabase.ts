import { DreamTypeRepository } from "@/domain/repositories/dream-type.repository";
import { supabase } from "@/config/supabase";

export class DreamTypeRepositorySupabase implements DreamTypeRepository {
    async getAllByName(): Promise<string[]> {
        const { data, error } = await supabase
            .from("dream_type")
            .select("dream_type_name");
        if (error) {
            throw new Error(`Error fetching dream types: ${error.message}`);
        }
        return data ? data.map((item: { dream_type_name: string }) => item.dream_type_name) : [];
    }
}