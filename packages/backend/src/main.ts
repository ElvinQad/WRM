/**
 * This is not a production server yet!
 * This is only a minimal backend to get started.
 */

// Load environment variables from .env file
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts";
await load({ export: true, envPath: "../../.env" });

import process from "node:process";
import 'npm:reflect-metadata';
import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';
import { SwaggerModule, OpenAPIObject } from '@nestjs/swagger';
import { AppModule } from './app/app.module.ts';
import * as yaml from 'js-yaml';
import { Deno as fs } from "@deno/shim-deno"; // Use Deno's fs shim

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );
  const globalPrefix = 'api';
  app.setGlobalPrefix(globalPrefix);

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }));

  // Enable CORS
  app.enableCors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // --- SWAGGER SETUP ---
  // Load the static OpenAPI document
  const fileContents = await fs.readTextFile('./src/open-api.yaml');
  const document = yaml.load(fileContents) as OpenAPIObject;

  // Setup Swagger UI
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
    },
    customSiteTitle: 'WRM API Documentation',
  });

  const port = process.env.PORT || 8000; // Changed default from 3000 to 8000
  await app.listen(port, '0.0.0.0');
  Logger.log(
    `🚀 Application is running on: http://localhost:${port}/${globalPrefix}`
  );
  Logger.log(
    `📚 Swagger documentation available at: http://localhost:${port}/docs`
  );
}

bootstrap();