import { FastifyInstance } from "fastify";
import { getImobModeloHtml } from "../templates/imobModelo";
import { generatePdfBuffer, isServerOverloaded } from "../services/pdf.service";
import { getImobDocumentHtml } from "../templates/imobDocumet";
import { getImobPreviewHtml } from "../templates/imobPreview";

interface PdfRequestBody {
  htmlContent: string;
}

export async function pdfRoutes(fastify: FastifyInstance) {
  fastify.post<{ Body: PdfRequestBody }>("/model", async (request, reply) => {
    if (isServerOverloaded()) {
      return reply.status(503).send({
        error: "Service Unavailable",
        message:
          "O servidor está gerando outros contratos no momento. Tente novamente em alguns segundos.",
      });
    }

    try {
      const { htmlContent } = request.body;

      if (!htmlContent) {
        return reply.status(400).send({ error: "htmlContent é obrigatório" });
      }

      const fullHtml = getImobModeloHtml(htmlContent);
      const pdfBuffer = await generatePdfBuffer({
        html: fullHtml,
        headerTitle: "Modelo de Documento",
      });

      reply.header("Content-Type", "application/pdf");
      reply.header(
        "Content-Disposition",
        'attachment; filename="modelo-imob-gestao.pdf"',
      );

      return reply.send(pdfBuffer);
    } catch (error) {
      fastify.log.error(error);
      return reply
        .status(500)
        .send({ error: "Falha ao gerar o PDF de modelo" });
    }
  });

  fastify.post<{ Body: PdfRequestBody }>(
    "/document",
    async (request, reply) => {
      if (isServerOverloaded()) {
        return reply.status(503).send({
          error: "Service Unavailable",
          message:
            "O servidor está gerando outros contratos no momento. Tente novamente em alguns segundos.",
        });
      }

      try {
        const { htmlContent } = request.body;

        if (!htmlContent) {
          return reply.status(400).send({ error: "htmlContent é obrigatório" });
        }

        const fullHtml = getImobDocumentHtml(htmlContent);
        const pdfBuffer = await generatePdfBuffer({
          html: fullHtml,
          showBrand: true,
        });
        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          'attachment; filename="imob-gestao-documento.pdf"',
        );

        return reply.send(pdfBuffer);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: "Falha ao gerar o PDF" });
      }
    },
  );

  fastify.post<{ Body: PdfRequestBody }>(
    "/preview",
    async (request, reply) => {
      if (isServerOverloaded()) {
        return reply.status(503).send({
          error: "Service Unavailable",
          message:
          "O servidor está gerando outros contratos no momento. Tente novamente em alguns segundos.",
        });
      }

      try {
        const { htmlContent } = request.body;

        if (!htmlContent) {
          return reply.status(400).send({ error: "htmlContent é obrigatório" });
        }

        const fullHtml = getImobPreviewHtml(htmlContent);
        const pdfBuffer = await generatePdfBuffer({
          html: fullHtml,
          showBrand: true,
        });
        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          'attachment; filename="imob-gestao-documento.pdf"',
        );

        return reply.send(pdfBuffer);
      } catch (error) {
        fastify.log.error(error);
        return reply.status(500).send({ error: "Falha ao gerar o PDF" });
      }
    },
  );
}

