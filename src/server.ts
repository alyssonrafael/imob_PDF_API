import Fastify from "fastify";
import cors from "@fastify/cors";
import { pdfRoutes } from "./routes/pdf.routes";
import rateLimit from "@fastify/rate-limit";

const fastify = Fastify({ logger: false });

async function start() {
  try {
    await fastify.register(cors, { origin: "*" });

    await fastify.register(rateLimit, {
      max: 6,
      timeWindow: "1 minute", 
      errorResponseBuilder: function (request, context) {
        return {
          statusCode: 429,
          error: "Too Many Requests",
          message: "Você gerou muitos documentos recentemente. Aguarde 1 minuto.",
        };
      },
    });
    
    await fastify.register(pdfRoutes, { prefix: "/pdf" });

    // Inicia o servidor
    await fastify.listen({ 
        port: Number(process.env.PORT) || 3333, 
        host: "0.0.0.0" 
    });
    
    console.log("Serviço de PDF rodando na porta 3333");
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
}

start();