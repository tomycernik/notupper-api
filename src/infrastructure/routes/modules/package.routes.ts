import { Router } from "express";
import { PackageRepositorySupabase } from "@/infrastructure/repositories/package.repository.supabase";
import { PackageService } from "@/application/services/package.service";
import { PackageController } from "@/infrastructure/controllers/package.controller";

const packageRepositorySupabase = new PackageRepositorySupabase();
const packageService = new PackageService(packageRepositorySupabase);

const packageController = new PackageController(packageService);

export const packageRouter = Router();

packageRouter.get("/", (req, res) => packageController.getAllPackages(req, res));
