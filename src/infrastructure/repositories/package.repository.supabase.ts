import { Package } from "@/domain/models/package.model";
import { IPackageRepository } from "@/domain/repositories/package.repository";
import { supabase } from "@/config/supabase";

export class PackageRepositorySupabase implements IPackageRepository {
  async getPackageById(id: string): Promise<Package> {
    const { data, error } = await supabase
      .from("packages")
      .select("*")
      .eq("id", id)
      .single();
    if (error) throw new Error(error.message);
    return data as Package;
  }

  async getAllPackages(): Promise<Package[]> {
    const { data, error } = await supabase.from("packages").select("*");
    if (error) throw new Error(error.message);
    return data as Package[];
  }
}
