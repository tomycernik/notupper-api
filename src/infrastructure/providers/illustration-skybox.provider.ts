import { IllustrationProvider } from "@domain/providers/illustration.provider";
import { envs } from "@config/envs";
import { BlockadeLabsSdk } from "@blockadelabs/sdk";
import { IllustrationProviderResponse } from "@/domain/interfaces/illustration-provider-response.interface";

export class IllustrationSkyboxProvider implements IllustrationProvider {
  private client: BlockadeLabsSdk;

  constructor() {
    this.client = new BlockadeLabsSdk({
      api_key: envs.SKYBOX_API_KEY,
    });
  }

  async generateIllustration(dreamText: string): Promise<IllustrationProviderResponse> {
    const request = {
      prompt: dreamText,
      skybox_style_id: 11, // DreamLike style
    };
    console.log('[IllustrationSkyboxProvider] Request:', request);
    try {
      const createResponse = await this.client.generateSkybox(request);
      console.log('[IllustrationSkyboxProvider] Create response:', createResponse);
      const taskId = createResponse.id;
      if (!taskId) {
        throw new Error("No se obtuvo un task ID del SDK de BlockadeLabs");
      }
      let resultUrl: string | undefined;
      let thumbUrl: string | undefined;
      while (!resultUrl) {
        const status = await this.client.getImagineById({ id: taskId });
        console.log('[IllustrationSkyboxProvider] Status response:', status);
        if (status.status === "complete" && status.file_url) {
          resultUrl = status.file_url;
          thumbUrl = status.thumb_url;
          break;
        }
        if (status.status === "error") {
          console.error('[IllustrationSkyboxProvider] Error status:', status);
          throw new Error(
            status.error_message || "Error generando imagen en Blockade Labs"
          );
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      return { file_url: resultUrl, thumb_url: thumbUrl! };
    } catch (err: any) {
      console.error('[IllustrationSkyboxProvider] Caught error:', err);
      throw err;
    }
  }
}
