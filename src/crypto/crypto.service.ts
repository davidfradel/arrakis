import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError } from 'axios';
import { CryptoAnalysisService } from './crypto-analysis.service';
import {
  HistoricalDataParams,
  HistoricalQuote,
  CryptoData,
  CryptoWithHistory,
} from './interfaces/crypto.interfaces';

@Injectable()
export class CryptoService {
  private readonly logger = new Logger(CryptoService.name);
  private readonly CMC_API_URL = 'https://pro-api.coinmarketcap.com/v1';
  private readonly CMC_API_KEY = process.env.CMC_API_KEY;

  constructor(
    private readonly httpService: HttpService,
    private readonly analysisService: CryptoAnalysisService,
  ) {}

  async fetchCryptoData(): Promise<CryptoData[]> {
    try {
      this.logger.log('Fetching crypto data from CoinMarketCap...');
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

      this.logger.log(
        `Successfully fetched ${response.data.data.length} cryptocurrencies`,
      );
      return response.data.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      this.logger.error(
        'Error fetching crypto data:',
        axiosError.response?.data || axiosError.message,
      );
      throw error;
    }
  }

  async fetchHistoricalData({
    symbol,
    timeframe,
    interval = '1d',
  }: HistoricalDataParams): Promise<HistoricalQuote[] | null> {
    const count =
      timeframe === 'short' ? 30 : timeframe === 'medium' ? 90 : 365;

    try {
      const response = await this.httpService.axiosRef.get(
        `${this.CMC_API_URL}/cryptocurrency/quotes/historical`,
        {
          headers: {
            'X-CMC_PRO_API_KEY': this.CMC_API_KEY,
          },
          params: {
            symbol,
            interval,
            count,
            convert: 'USD',
          },
        },
      );

      return response.data.data[symbol];
    } catch (error) {
      this.logger.error(`Error fetching historical data for ${symbol}:`, error);
      return null;
    }
  }

  async fetchAndAnalyzeCryptos() {
    try {
      const cryptoData = await this.fetchCryptoData();

      // Fetch historical data for each crypto
      const cryptosWithHistory = await Promise.all(
        cryptoData.map(async (crypto) => {
          const historicalData = await this.fetchHistoricalData({
            symbol: crypto.symbol,
            timeframe: this.analysisService.getTimeframe(),
          });

          if (historicalData) {
            const priceHistory = historicalData.map(
              (quote) => quote.quote.USD.price,
            );
            const volumeHistory = historicalData.map(
              (quote) => quote.quote.USD.volume_24h,
            );

            return {
              ...crypto,
              historicalData: {
                prices: priceHistory,
                volumes: volumeHistory,
              },
            } as CryptoWithHistory;
          }

          return crypto as CryptoWithHistory;
        }),
      );

      const analyzedData =
        await this.analysisService.analyzeCryptos(cryptosWithHistory);
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
}
