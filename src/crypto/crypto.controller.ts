import { Controller, Get, Query } from '@nestjs/common';
import { CryptoService } from './crypto.service';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly cryptoService: CryptoService) {}

  @Get()
  async getCryptocurrencies() {
    const cryptoData = await this.cryptoService.fetchCryptoData();
    return cryptoData;
  }

  @Get('analysis')
  async getAnalysis(@Query('isPotential') isPotential?: string) {
    const analyzedData = await this.cryptoService.fetchAndAnalyzeCryptos();

    if (isPotential === 'true') {
      return analyzedData.filter((crypto) => crypto.potentialGain.isPotential);
    }

    return analyzedData;
  }
}
