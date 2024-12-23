import { Injectable, Logger } from '@nestjs/common';
import * as technicalIndicators from 'technicalindicators';

interface MACDResult {
  MACD: number;
  signal: number;
  histogram: number;
}

interface AnalysisConfig {
  timeframe: 'short' | 'medium' | 'long'; // short: days, medium: weeks, long: months
  minDataPoints: number; // Minimum number of data points required
  periods: {
    rsi: number;
    macdFast: number;
    macdSlow: number;
    macdSignal: number;
  };
}

@Injectable()
export class CryptoAnalysisService {
  private readonly logger = new Logger(CryptoAnalysisService.name);
  private config: AnalysisConfig;

  constructor() {
    // Default configuration
    this.config = {
      timeframe: 'medium',
      minDataPoints: 90, // 3 months of daily data
      periods: {
        rsi: 14,
        macdFast: 12,
        macdSlow: 26,
        macdSignal: 9,
      },
    };
  }

  getTimeframe(): 'short' | 'medium' | 'long' {
    return this.config.timeframe;
  }

  setAnalysisConfig(newConfig: Partial<AnalysisConfig>) {
    this.config = { ...this.config, ...newConfig };

    // Adjust periods based on timeframe
    if (this.config.timeframe === 'short') {
      this.config.minDataPoints = 30; // 1 month
      this.config.periods = {
        rsi: 7,
        macdFast: 6,
        macdSlow: 13,
        macdSignal: 4,
      };
    } else if (this.config.timeframe === 'long') {
      this.config.minDataPoints = 365; // 1 year
      this.config.periods = {
        rsi: 21,
        macdFast: 24,
        macdSlow: 52,
        macdSignal: 18,
      };
    }
  }

  async analyzeCryptos(cryptos: any[]) {
    return Promise.all(
      cryptos.map(async (crypto) => {
        const priceHistory = crypto.historicalData?.prices || [
          crypto.quote.USD.price /
            (1 + crypto.quote.USD.percent_change_24h / 100),
          crypto.quote.USD.price,
        ];

        const volumeHistory = crypto.historicalData?.volumes || [
          crypto.quote.USD.volume_24h,
          crypto.quote.USD.volume_24h *
            (1 + crypto.quote.USD.volume_change_24h / 100),
        ];

        const analysis = {
          rsi: this.calculateRSI(priceHistory),
          macd: this.calculateMACD(priceHistory),
          volumeAnalysis: this.analyzeVolume(volumeHistory),
          priceAction: this.analyzePriceAction(priceHistory),
          dataQuality: {
            hasHistoricalData: !!crypto.historicalData,
            dataPoints: priceHistory.length,
            isReliable: priceHistory.length >= this.config.minDataPoints,
          },
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
    if (prices.length < this.config.periods.rsi) {
      return 50;
    }
    const rsiResult = technicalIndicators.RSI.calculate({
      values: prices,
      period: this.config.periods.rsi,
    });

    if (!rsiResult || rsiResult.length === 0) {
      return 50;
    }

    return rsiResult[rsiResult.length - 1];
  }

  private calculateMACD(prices: number[]): MACDResult {
    if (prices.length < this.config.periods.macdSlow) {
      return { MACD: 0, signal: 0, histogram: 0 };
    }
    const macdResult = technicalIndicators.MACD.calculate({
      values: prices,
      fastPeriod: this.config.periods.macdFast,
      slowPeriod: this.config.periods.macdSlow,
      signalPeriod: this.config.periods.macdSignal,
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
    // If we don't have enough historical data, reduce confidence
    const dataQualityMultiplier = !analysis.dataQuality.isReliable ? 0.7 : 1;

    let score = 0;
    const timeframeMultiplier =
      this.config.timeframe === 'short'
        ? 1.5
        : this.config.timeframe === 'medium'
          ? 1
          : 0.7;

    // Apply the two multipliers
    const finalMultiplier = timeframeMultiplier * dataQualityMultiplier;

    // RSI Analysis (adjusted based on timeframe)
    const rsiThreshold =
      this.config.timeframe === 'short'
        ? 30
        : this.config.timeframe === 'medium'
          ? 35
          : 40;
    if (analysis.rsi < rsiThreshold) score += 2 * finalMultiplier;
    else if (analysis.rsi < rsiThreshold + 10) score += 1 * finalMultiplier;

    // MACD Analysis
    if (analysis.macd.histogram > 0 && analysis.macd.signal > 0)
      score += 2 * finalMultiplier;
    else if (analysis.macd.histogram > 0) score += 1 * finalMultiplier;

    // Volume Analysis (adjusted thresholds based on timeframe)
    const volumeRatioThreshold =
      this.config.timeframe === 'short'
        ? 1.5
        : this.config.timeframe === 'medium'
          ? 1.3
          : 1.2;
    if (analysis.volumeAnalysis.volumeRatio > volumeRatioThreshold)
      score += 2 * finalMultiplier;
    else if (analysis.volumeAnalysis.volumeRatio > volumeRatioThreshold - 0.2)
      score += 1 * finalMultiplier;

    // Price Action Analysis
    if (analysis.priceAction.trend.isUptrend) {
      if (analysis.priceAction.trend.strength > 3) score += 2 * finalMultiplier;
      else score += 1 * finalMultiplier;
    }

    // Market Cap Analysis (expanded thresholds)
    const marketCap = crypto.quote.USD.market_cap;
    if (marketCap < 500000000)
      score += 2 * finalMultiplier; // Less than 500M
    else if (marketCap < 1000000000) score += 1 * finalMultiplier; // Less than 1B

    // Additional criteria on recent price change
    const priceChange24h = crypto.quote.USD.percent_change_24h;
    if (priceChange24h > 0 && priceChange24h < 15)
      score += 1 * finalMultiplier; // Moderate increase
    else if (priceChange24h < 0 && priceChange24h > -10)
      score += 1 * finalMultiplier; // Limited decrease

    return {
      score,
      isPotential: score >= 5 * finalMultiplier,
      reasons: this.generateReasons(analysis, crypto),
      reliability: {
        dataQuality: analysis.dataQuality,
        confidence: dataQualityMultiplier * 100,
      },
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

    // Add a note about data quality
    if (!analysis.dataQuality.isReliable) {
      reasons.push(
        `Limited historical data: ${analysis.dataQuality.dataPoints} points available`,
      );
    }

    return reasons;
  }
}
