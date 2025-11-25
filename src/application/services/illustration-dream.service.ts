import { envs } from "@/config/envs";
import { IllustrationProviderResponse } from "@/domain/interfaces/illustration-provider-response.interface";
import { supabase } from "@config/supabase";
import { IllustrationProvider } from "@domain/providers/illustration.provider";

export class IllustrationDreamService {
  constructor(private illustrationProvider: IllustrationProvider) {}

  async generateIllustration(
    dreamText: string
  ): Promise<IllustrationProviderResponse> {
    const illustrationResponse =
      await this.illustrationProvider.generateIllustration(dreamText);
    return illustrationResponse;
  }

  async saveIllustrationFromUrl(imageTitle: string, imageUrl: string): Promise<string> {
    try {
      const fileName = `dream_${imageTitle}.jpg`;
      const filePath = `dreams/${fileName}`;

      const finalUrl = `${envs.SUPABASE_URL}/storage/v1/object/public/dreams/dreams/${filePath}`;

      const response = await fetch(imageUrl, {
        redirect: "follow",
        headers: {
          "User-Agent": "Mozilla/5.0",
        },
      });

      if (!response.ok) {
        throw new Error(`Error descargando imagen: ${response.statusText}`);
      }

      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      supabase.storage.from("dreams").upload(filePath, buffer, {
        contentType: "image/jpeg",
        upsert: true,
      });

      return finalUrl;
    } catch (error) {
      console.error("Error en saveIllustrationFromUrl:", error);
      throw error;
    }
  }

}
