import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { CryptoService } from './crypto.service';
import { CryptoAnalysisService } from './crypto-analysis.service';
import { CryptoController } from './crypto.controller';

@Module({
  imports: [HttpModule],
  providers: [CryptoService, CryptoAnalysisService],
  controllers: [CryptoController],
})
export class CryptoModule {}
