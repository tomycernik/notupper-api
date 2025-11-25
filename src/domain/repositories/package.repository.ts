import { Package } from "@/domain/models/package.model";

export interface IPackageRepository {
    getPackageById(id: string): Promise<Package>;
    getAllPackages(): Promise<Package[]>;
}