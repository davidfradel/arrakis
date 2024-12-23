import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CryptoAnalysisService } from './crypto/crypto-analysis.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Configuration of crypto analysis
  const analysisService = app.get(CryptoAnalysisService);

  // Use environment variable or default value
  const timeframe = process.env.CRYPTO_ANALYSIS_TIMEFRAME || 'medium';

  // Configure the service with the desired period
  analysisService.setAnalysisConfig({
    timeframe: timeframe as 'short' | 'medium' | 'long',
  });

  await app.listen(3000); // Changed port to 3000
}
bootstrap();
