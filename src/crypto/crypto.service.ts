import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { CryptoAnalysisService } from './crypto-analysis.service';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly CMC_API_KEY = process.env.CMC_API_KEY;
  private readonly CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';

  constructor(
    private readonly httpService: HttpService,
    private readonly analysisService: CryptoAnalysisService,
  ) {}

  async fetchAndAnalyzeCryptos() {
    try {
      const cryptoData = await this.fetchCryptoData();
      const analyzedData =
        await this.analysisService.analyzeCryptos(cryptoData);
      const potentialCryptos = analyzedData.filter(
        (crypto) => crypto.potentialGain,
      );

      this.logger.log(
        `Found ${potentialCryptos.length} potential cryptocurrencies`,
      );
      return potentialCryptos;
    } catch (error) {
      this.logger.error('Error in crypto analysis:', error);
      throw error;
    }
  }

  async fetchCryptoData() {
    const response = await this.httpService.axiosRef.get(
      `${this.CMC_API_URL}/cryptocurrency/listings/latest`,
      {
        headers: {
          'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
        },
        params: {
          limit: 200,
          convert: 'USD',
        },
      },
    );

    return response.data.data;
  }
}
