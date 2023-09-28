import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import { create } from 'express-handlebars';
import * as helpers from 'handlebars-helpers';
import { join } from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));

  const templateExt = '.html';
  const hbs = create({
    extname: templateExt,
    helpers: helpers(),
  });

  app.engine(templateExt, hbs.engine);
  app.setViewEngine(templateExt);

  await app.listen(4000);
}
bootstrap();
