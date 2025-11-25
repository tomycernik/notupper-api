import { Package } from "@/domain/models/package.model";
import { IPackageRepository } from "@/domain/repositories/package.repository";

export class PackageService {
    constructor(private packageRepository: IPackageRepository) {
    }

    async getPackageById(id: string): Promise<Package> {
        return this.packageRepository.getPackageById(id);
    }

    async getAllPackages(): Promise<Package[]> {
        return this.packageRepository.getAllPackages();
    }
}