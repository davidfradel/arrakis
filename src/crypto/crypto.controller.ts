import { Controller, Get } from '@nestjs/common';
import { CoinMarketCapService } from '../coinmarketcap/coinmarketcap.service';

@Controller('crypto')
export class CryptoController {
  constructor(private readonly coinMarketCapService: CoinMarketCapService) {}

  @Get()
  async getCryptocurrencies() {
    const response = await this.coinMarketCapService.getCryptocurrencies();
    return response.data;
  }
}
