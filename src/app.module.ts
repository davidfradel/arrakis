import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HttpModule } from '@nestjs/axios';
import { validate } from './../env.validation';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CoinMarketCapService } from './coinmarketcap/coinmarketcap.service';
import { CryptoController } from './crypto/crypto.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    HttpModule,
  ],
  controllers: [AppController, CryptoController],
  providers: [AppService, CoinMarketCapService],
})
export class AppModule {}
