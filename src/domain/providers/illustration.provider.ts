import { IllustrationProviderResponse } from "@domain/interfaces/illustration-provider-response.interface";

export interface IllustrationProvider {
    generateIllustration(dreamText: string): Promise<IllustrationProviderResponse>;
}