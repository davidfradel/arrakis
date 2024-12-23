import { Injectable, Logger } from '@nestjs/common';
import * as technicalIndicators from 'technicalindicators';

interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

@Injectable()
export class CryptoAnalysisService {
  private readonly logger = new Logger(CryptoAnalysisService.name);

  async analyzeCryptos(cryptos: any[]) {
    return Promise.all(
      cryptos.map(async (crypto) => {
        // Use data from the last 24h/7d for analysis
        const priceHistory = [
          crypto.quote.USD.price /
            (1 + crypto.quote.USD.percent_change_24h / 100),
          crypto.quote.USD.price,
        ];

        const volumeHistory = [
          crypto.quote.USD.volume_24h,
          crypto.quote.USD.volume_24h *
            (1 + crypto.quote.USD.volume_change_24h / 100),
        ];

        const analysis = {
          rsi: this.calculateRSI(priceHistory),
          macd: this.calculateMACD(priceHistory),
          volumeAnalysis: this.analyzeVolume(volumeHistory),
          priceAction: this.analyzePriceAction(priceHistory),
        };

        return {
          ...crypto,
          technicalIndicators: analysis,
          potentialGain: this.evaluatePotential(analysis, crypto),
        };
      }),
    );
  }

  private calculateRSI(prices: number[]): number {
    if (prices.length < 14) {
      return 50;
    }
    const rsiResult = technicalIndicators.RSI.calculate({
      values: prices,
      period: 14,
    });

    if (!rsiResult || rsiResult.length === 0) {
      return 50;
    }

    return rsiResult[rsiResult.length - 1];
  }

  private calculateMACD(prices: number[]): MACDResult {
    if (prices.length < 26) {
      return { MACD: 0, signal: 0, histogram: 0 };
    }
    const macdResult = technicalIndicators.MACD.calculate({
      values: prices,
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    }) as MACDResult[];

    if (!macdResult || macdResult.length === 0) {
      return { MACD: 0, signal: 0, histogram: 0 };
    }

    return macdResult[macdResult.length - 1];
  }

  private analyzeVolume(volumes: number[]) {
    const avgVolume = volumes.reduce((a, b) => a + b, 0) / volumes.length;
    const recentVolume = volumes[volumes.length - 1];
    return {
      volumeIncrease: recentVolume > avgVolume,
      volumeRatio: recentVolume / avgVolume,
    };
  }

  private analyzePriceAction(prices: number[]) {
    const recentPrice = prices[prices.length - 1];
    const previousPrice = prices[0];
    return {
      priceChange: ((recentPrice - previousPrice) / previousPrice) * 100,
      trend: this.identifyTrend(prices),
    };
  }

  private identifyTrend(prices: number[]) {
    if (prices.length < 2) {
      return { isUptrend: false, strength: 0 };
    }
    const latestPrice = prices[prices.length - 1];
    const firstPrice = prices[0];
    const trendStrength = ((latestPrice - firstPrice) / firstPrice) * 100;

    return {
      isUptrend: trendStrength > 0,
      strength: Math.abs(trendStrength),
    };
  }

  private evaluatePotential(analysis: any, crypto: any) {
    let score = 0;

    // RSI Analysis (less strict on oversold condition)
    if (analysis.rsi < 35) score += 2;
    else if (analysis.rsi < 45) score += 1;

    // MACD Analysis (added less strict condition)
    if (analysis.macd.histogram > 0 && analysis.macd.signal > 0) score += 2;
    else if (analysis.macd.histogram > 0) score += 1; // Positive trend even if signal not yet positive

    // Volume Analysis (lower threshold for volume ratio)
    if (analysis.volumeAnalysis.volumeRatio > 1.3) score += 2;
    else if (analysis.volumeAnalysis.volumeRatio > 1.1) score += 1;

    // Price Action Analysis
    if (analysis.priceAction.trend.isUptrend) {
      if (analysis.priceAction.trend.strength > 3) score += 2;
      else score += 1;
    }

    // Market Cap Analysis (expanded thresholds)
    const marketCap = crypto.quote.USD.market_cap;
    if (marketCap < 500000000)
      score += 2; // Less than 500M
    else if (marketCap < 1000000000) score += 1; // Less than 1B

    // Additional criteria on recent price change
    const priceChange24h = crypto.quote.USD.percent_change_24h;
    if (priceChange24h > 0 && priceChange24h < 15)
      score += 1; // Moderate increase
    else if (priceChange24h < 0 && priceChange24h > -10) score += 1; // Limited decrease

    return {
      score,
      isPotential: score >= 5, // Threshold lowered from 6 to 5
      reasons: this.generateReasons(analysis, crypto),
    };
  }

  private generateReasons(analysis: any, crypto: any) {
    const reasons = [];

    if (analysis.rsi < 35) {
      reasons.push('RSI indicates potential oversold condition');
    }

    if (analysis.macd.histogram > 0) {
      if (analysis.macd.signal > 0) {
        reasons.push('Strong MACD momentum with positive signal');
      } else {
        reasons.push('Positive MACD histogram showing potential momentum');
      }
    }

    if (analysis.volumeAnalysis.volumeRatio > 1.1) {
      reasons.push(
        `Volume increase: ${(analysis.volumeAnalysis.volumeRatio - 1) * 100}%`,
      );
    }

    if (analysis.priceAction.trend.isUptrend) {
      reasons.push(
        `Upward trend with ${analysis.priceAction.trend.strength.toFixed(1)}% strength`,
      );
    }

    const marketCap = crypto.quote.USD.market_cap;
    if (marketCap < 500000000) {
      reasons.push(`Small market cap: $${(marketCap / 1000000).toFixed(1)}M`);
    }

    const priceChange24h = crypto.quote.USD.percent_change_24h;
    if (priceChange24h > 0 && priceChange24h < 15) {
      reasons.push(
        `Moderate price increase: +${priceChange24h.toFixed(1)}% in 24h`,
      );
    } else if (priceChange24h < 0 && priceChange24h > -10) {
      reasons.push(
        `Limited price decrease: ${priceChange24h.toFixed(1)}% in 24h`,
      );
    }

    return reasons;
  }
}
