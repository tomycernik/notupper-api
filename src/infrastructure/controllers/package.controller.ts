import { PackageService } from "@/application/services/package.service";
import { Request, Response } from "express";

export class PackageController {
  private packageService: PackageService;
  constructor(packageService: PackageService) {
    this.packageService = packageService;
  }

  async getAllPackages(req: Request, res: Response) {
    try {
      const packages = await this.packageService.getAllPackages();
      res.status(200).json(packages);
    } catch (error: any) {
      console.error("Error al obtener los paquetes:", error);
      res.status(500).json({ message: "Error al obtener los paquetes" });
    }
  }
}
