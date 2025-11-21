import { IllustrationProvider } from "@domain/providers/illustration.provider";
import { envs } from "@config/envs";
import { BlockadeLabsSdk } from "@blockadelabs/sdk";

export class IllustrationSkyboxProvider implements IllustrationProvider {
  private client: BlockadeLabsSdk;

  constructor() {
    this.client = new BlockadeLabsSdk({
      api_key: envs.SKYBOX_API_KEY,
    });
  }

  async generateIllustration(dreamText: string): Promise<Buffer> {
    const request = {
      prompt: dreamText,
      skybox_style_id: 11, // DreamLike style
    };

    const createResponse = await this.client.generateSkybox(request);

    const taskId = createResponse.id;
    if (!taskId) {
      throw new Error("No se obtuvo un task ID del SDK de BlockadeLabs");
    }

    let resultUrl: string | undefined;

    while (!resultUrl) {
      const status = await this.client.getImagineById({ id: taskId });

      if (status.status === "complete" && status.file_url) {
        resultUrl = status.file_url;
        break;
      }

      await new Promise((r) => setTimeout(r, 2000));
    }

    const response = await fetch(resultUrl!, {
      redirect: "follow",
      headers: {
        "User-Agent": "Mozilla/5.0",
      },
    });

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }
}
