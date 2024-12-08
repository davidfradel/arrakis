import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { AxiosResponse } from 'axios';

@Injectable()
export class CoinMarketCapService {
  private readonly apiUrl = 'https://pro-api.coinmarketcap.com/v1';
  private readonly apiKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    const apiKey = this.configService.get<string>('COINMARKETCAP_API_KEY');
    if (!apiKey) {
      throw new Error('COINMARKETCAP_API_KEY is not defined');
    }
    this.apiKey = apiKey;
  }

  async getCryptocurrencies(): Promise<AxiosResponse<any>> {
    const headers = {
      'X-CMC_PRO_API_KEY': this.apiKey,
    };
    try {
      const response = await this.httpService.axiosRef.get(
        `${this.apiUrl}/cryptocurrency/listings/latest`,
        { headers },
      );
      return response.data;
    } catch (error) {
      throw new HttpException(
        'Error while fetching cryptocurrencies',
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}
