import "reflect-metadata";
import request from "supertest";
import express, { Request, Response, NextFunction } from "express";
import { Interpretation } from "../../src/domain/interfaces/interpretation-dream.interface";
import { DreamNodeController } from "../../src/infrastructure/controllers/dream-node.controller";
import { InterpretationDreamService } from "../../src/application/services/interpretation-dream.service";
import { DreamNodeService } from "../../src/application/services/dream-node.service";
import { IllustrationDreamService } from "../../src/application/services/illustration-dream.service";
import { DreamContextService } from "../../src/application/services/dream-context.service";
import { IDreamContext } from "../../src/domain/interfaces/dream-context.interface";
import { DreamTypeName } from "../../src/domain/models/dream-node.model";
import { MembershipService } from "../../src/application/services/membership.service";

jest.mock("uuid", () => ({
  v4: jest.fn(() => "mocked-uuid-123"),
}));

describe("Dream API Integration Tests", () => {
  let app: express.Application;
  let mockInterpretationService: jest.Mocked<InterpretationDreamService>;
  let mockDreamNodeService: jest.Mocked<DreamNodeService>;
  let mockIllustrationService: jest.Mocked<IllustrationDreamService>;
  let mockDreamContextService: jest.Mocked<DreamContextService>;
  let mockMembershipService: jest.Mocked<MembershipService>;

  beforeAll(async () => {
    mockInterpretationService = {
      interpretDream: jest.fn().mockImplementation((description) => ({
        interpretation: `Interpretation for: ${description}`,
        emotion: 'Felicidad',
        title: 'Dream Interpretation',
        dreamType: 'Lúcido',
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        unlockedBadges: []
      })),
      reinterpretDream: jest.fn().mockImplementation((description) => ({
        interpretation: `Reinterpretation for: ${description}`,
        emotion: 'Felicidad',
        title: 'Dream Reinterpretation',
        dreamType: 'Lúcido',
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        unlockedBadges: []
      })),
    } as any;

    mockDreamNodeService = {
      saveDreamNode: jest.fn(),
      onDreamReinterpreted: jest.fn().mockResolvedValue([]),
    } as any;

    mockIllustrationService = {
      generateIllustration: jest.fn(),
    } as any;

    mockMembershipService = {
      getUserMembership: jest.fn().mockResolvedValue({
        id: 2,
        name: 'plus',
        durations_month: 1
      })
    } as any;

    mockDreamContextService = {
      register: jest.fn(),
      login: jest.fn(),
      getUserDreamContext: jest.fn().mockResolvedValue({
        themes: [],
        people: [],
        locations: [],
        emotions_context: []
      }),
    } as any;

    app = express();
    app.use(express.json());

    app.use((req: Request, _res: Response, next: NextFunction) => {
      (req as any).userId = "mockUserId";
      next();
    });

    const controller = new DreamNodeController(
      mockInterpretationService,
      mockDreamNodeService,
      mockIllustrationService,
      mockDreamContextService,
      mockMembershipService
    );

    app.post("/api/dreams/interpret", (req, res) =>
      controller.interpret(req, res)
    );

    app.post("/api/dreams/illustrate", (req, res) =>
    controller.illustrate(req, res)
  );

    app.post("/api/dreams/reinterpret", (req, res) =>
      controller.reinterpret(req, res)
    );

    app.post("/api/dreams/save", (req, res) => controller.save(req, res));
  });

  afterAll(async () => { });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/dreams/reinterpret", () => {
    it("should successfully reinterpret a dream", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
        previousInterpretation: "Representa tu deseo de libertad",
      };

      const expectedResponse: Interpretation = {
        title: "Nueva Perspectiva: Desafío y Superación",
        interpretation:
          "Volar sobre montañas también puede representar tu capacidad para superar obstáculos grandes...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Lúcido" as DreamTypeName,
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        description: requestBody.description,
        interpretation: expectedResponse.interpretation,
        emotion: 'Felicidad',
        title: expect.any(String),
        dreamType: expect.any(String)
      });
      expect(mockInterpretationService.reinterpretDream).toHaveBeenCalledWith(
        requestBody.description,
        requestBody.previousInterpretation,
        expect.any(Object),
        undefined
      );
    });

    it("should return 500 when interpretation provider fails", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
        previousInterpretation: "Representa tu deseo de libertad",
      };

      mockInterpretationService.reinterpretDream.mockRejectedValue(
        new Error("OpenAI API unavailable")
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(500);

      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toContain("Error al reinterpretar el sueño");
    });

    it("should handle large description inputs", async () => {
      const largeDescription =
        "Soñé que ".repeat(200) + "volaba sobre montañas";

      const requestBody = {
        description: largeDescription,
        previousInterpretation: "Representa tu deseo de libertad",
      };

      const expectedResponseService: Interpretation = {
        title: "Interpretación de Sueño Complejo",
        interpretation: "Tu sueño detallado sugiere...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: [],
        },
        dreamType: "Estandar" as DreamTypeName,
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponseService
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toMatchObject({
        description: requestBody.description,
        interpretation: expect.any(String),
        emotion: 'Felicidad',
        title: expect.any(String),
        dreamType: expect.any(String)
      });
    });

    it("should handle special characters in description", async () => {
      const requestBody = {
        description:
          "Soñé con símbolos extraños: ñáéíóú, emojis 🌟🌙, y caracteres especiales @#$%",
        previousInterpretation: "Representa confusión en tu vida",
      };

      const expectedResponse: Interpretation = {
        title: "Símbolos y Significados",
        interpretation:
          "Los símbolos en los sueños representan aspectos del subconsciente...",
        emotion: "Miedo",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Lucido" as DreamTypeName,
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/reinterpret")
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual(expect.objectContaining({
        description: requestBody.description,
        interpretation: expectedResponse.interpretation,
        title: expectedResponse.title,
        emotion: expectedResponse.emotion,
        dreamType: expectedResponse.dreamType,
        unlockedBadges: expect.any(Array)
      }));
    });
  });

  describe("POST /api/dreams/interpret", () => {
    it("should successfully interpret a dream", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
      };

      const expectedResponseService: Interpretation = {
        title: "Libertad y Trascendencia",
        interpretation:
          "Volar en los sueños generalmente representa el deseo de libertad...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Estandar" as DreamTypeName,
      };

      const expectedResponse = {
        title: "Libertad y Trascendencia",
        interpretation:
          "Volar en los sueños generalmente representa el deseo de libertad...",
        emotion: "Felicidad",
        dreamType: "Estandar" as DreamTypeName,
      };

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponseService
      );

      mockDreamContextService.getUserDreamContext.mockResolvedValue({ themes: [], people: [], locations: [], emotions_context: [] } as IDreamContext);

      const response = await request(app)
        .post("/api/dreams/interpret")
        .set("Authorization", "Bearer mock-jwt-token")
        .send(requestBody)
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        ...expectedResponse
      });

      expect(mockInterpretationService.interpretDream).toHaveBeenCalledWith(
        requestBody.description,
        expect.objectContaining({
          emotions_context: expect.any(Array),
          locations: expect.any(Array),
          people: expect.any(Array),
          themes: expect.any(Array),
        })
      );
    });

    it("should handle large description inputs", async () => {
      const largeDescription =
        "Soñé que ".repeat(200) + "caminaba por un bosque encantado";
      const requestBody = {
        description: largeDescription,
      };

      const expectedResponse: Interpretation = {
        title: "Viaje Interior Profundo",
        interpretation:
          "Tu sueño extenso indica una exploración compleja del subconsciente...",
        emotion: "Tristeza",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Estandar" as DreamTypeName,
      };

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/interpret")
        .send(requestBody)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        interpretation: expectedResponse.interpretation,
        emotion: expectedResponse.emotion,
        title: "Viaje Interior Profundo",
        dreamType: expectedResponse.dreamType,
      });
    });

    it("should handle special characters in description", async () => {
      const requestBody = {
        description:
          "Soñé con criaturas místicas: dragones 🐉, unicornios 🦄, y runas mágicas ∞∆◊",
      };

      const expectedResponse: Interpretation = {
        title: "Mundo Fantástico Interior",
        interpretation:
          "Las criaturas místicas en sueños representan aspectos arquetípicos de tu psique...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Estandar" as DreamTypeName,
      };

      mockInterpretationService.interpretDream.mockResolvedValue(
        expectedResponse
      );

      const response = await request(app)
        .post("/api/dreams/interpret")
        .send(requestBody)
        .set('Authorization', 'Bearer valid-token')
        .expect(200);

      expect(response.body).toEqual({
        description: requestBody.description,
        interpretation: expectedResponse.interpretation,
        emotion: expectedResponse.emotion,
        title: "Mundo Fantástico Interior",
        dreamType: "Estandar",
      });
    });

    it("should handle different types of dream emotions", async () => {
      const testCases = [
        {
          description: "Soñé que ganaba un premio importante",
          expectedEmotion: "Felicidad",
          context: {
            themes: [],
            people: [],
            locations: [],
            emotions_context: []
          },
          dreamType: "Estandar" as DreamTypeName,
        },
        {
          description: "Soñé que hablaba con un ser querido fallecido",
          expectedEmotion: "Tristeza",
          context: {
            themes: [],
            people: [],
            locations: [],
            emotions_context: []
          },
          dreamType: "Estandar" as DreamTypeName,
        }
      ];

      for (const testCase of testCases) {
        const requestBody = {
          description: testCase.description,
        };

        const expectedResponse: Interpretation = {
          emotion: testCase.expectedEmotion,
          title: `Sueño de ${testCase.expectedEmotion}`,
          interpretation: `Este sueño refleja sentimientos de ${testCase.expectedEmotion.toLowerCase()}.`,
          context: testCase.context,
          dreamType: "Estandar" as DreamTypeName,
        };

        mockInterpretationService.interpretDream.mockResolvedValueOnce(
          expectedResponse
        );

        const response = await request(app)
          .post("/api/dreams/interpret")
          .send(requestBody)
          .expect(200);

        expect(response.body).toEqual({
          description: requestBody.description,
          interpretation: expectedResponse.interpretation,
          emotion: expectedResponse.emotion,
          title: expectedResponse.title,
          dreamType: "Estandar",
        });
      }
    });

    it("should handle multiple concurrent requests to reinterpret", async () => {
      const requestBody = {
        description: "Sueño de prueba para concurrencia",
        previousInterpretation: "Interpretación previa",
      };

      const expectedResponseService: Interpretation = {
        title: "Respuesta Concurrente",
        interpretation: "Manejo de múltiples requests...",
        emotion: "Felicidad",
        context: {
          themes: [],
          people: [],
          locations: [],
          emotions_context: []
        },
        dreamType: "Estandar" as DreamTypeName,
      };

      mockInterpretationService.reinterpretDream.mockResolvedValue(
        expectedResponseService
      );

      const promises = Array(3)
        .fill(null)
        .map(() =>
          request(app)
            .post("/api/dreams/reinterpret")
            .send(requestBody)
            .expect(200)
        );

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.body).toEqual(expect.objectContaining({
          description: requestBody.description,
          interpretation: expect.any(String),
          emotion: expect.any(String),
          title: expect.any(String),
          dreamType: expect.any(String),
          unlockedBadges: expect.any(Array)
        }));
      });
    });
  });

  describe("Error handling and edge cases", () => {
    describe("Timeout scenarios", () => {
      it("should handle timeout in reinterpret endpoint", async () => {
        const requestBody = {
          description: "Soñé que volaba sobre montañas",
          previousInterpretation: "Representa tu deseo de libertad",
        };

        mockInterpretationService.reinterpretDream.mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 100)
            )
        );

        const response = await request(app)
          .post("/api/dreams/reinterpret")
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain(
          "Error al reinterpretar el sueño"
        );
      });

      it("should handle timeout in interpret endpoint", async () => {
        const requestBody = {
          description: "Soñé que nadaba en el océano",
        };

        mockInterpretationService.interpretDream.mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Request timeout")), 100)
            )
        );

        const response = await request(app)
          .post("/api/dreams/interpret")
          .send(requestBody)
          .timeout(5000)
          .expect(500);

        expect(response.body.errors).toContain("Error al interpretar el sueño");
      });
    });
  });

  describe("Illustration test", () => {
    it("should return an image url", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
      };

      mockIllustrationService.generateIllustration.mockResolvedValueOnce(
        "https://example.com/illustration.jpg"
      );

      const response = await request(app)
        .post("/api/dreams/illustrate")
        .send(requestBody)
        .expect(200);

      expect(response.body).toHaveProperty("imageUrl");
    });

    it("should return 500 when illustration provider fails", async () => {
      const requestBody = {
        description: "Soñé que volaba sobre montañas",
      };

      mockIllustrationService.generateIllustration.mockRejectedValueOnce(
        new Error("Illustration provider error")
      );

      const response = await request(app)
        .post("/api/dreams/illustrate")
        .send(requestBody)
        .expect(500);

      expect(response.body.errors).toContain("Error al generar ilustración");
    });
  });
});