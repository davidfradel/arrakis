import { Controller, Get, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';
import { CryptoData, CryptoWithHistory } from './interfaces/crypto.interfaces';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  async getCryptocurrencies(): Promise<CryptoData[]> {
    const cryptoData = await this.cryptoService.fetchCryptoData();
    return cryptoData;
  }

  @Get('analysis')
  async getAnalysis(
    @Query('isPotential') isPotential?: string,
    @Query('minScore') minScore?: string,
  ): Promise<CryptoWithHistory[]> {
    const analyzedData = await this.cryptoService.fetchAndAnalyzeCryptos();

    let filteredData = analyzedData;

    if (isPotential === 'true') {
      filteredData = filteredData.filter(
        (crypto) => crypto.potentialGain.isPotential,
      );
    }

    if (minScore) {
      const scoreThreshold = parseInt(minScore);
      if (!isNaN(scoreThreshold)) {
        filteredData = filteredData.filter(
          (crypto) => crypto.potentialGain.score >= scoreThreshold,
        );
      }
    }

    return filteredData;
  }
}
