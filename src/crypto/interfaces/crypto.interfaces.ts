export interface HistoricalDataParams {
  symbol: string;
  timeframe: 'short' | 'medium' | 'long';
  interval?: '1d' | '1h';
}

export interface HistoricalQuote {
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      timestamp: string;
    };
  };
}

export interface CryptoData {
  symbol: string;
  name: string;
  quote: {
    USD: {
      price: number;
      volume_24h: number;
      percent_change_24h: number;
      volume_change_24h: number;
      market_cap: number;
    };
  };
}

export interface CryptoWithHistory extends CryptoData {
  historicalData?: {
    prices: number[];
    volumes: number[];
  };
  potentialGain?: {
    score: number;
    isPotential: boolean;
    reasons: string[];
    reliability: {
      dataQuality: {
        hasHistoricalData: boolean;
        dataPoints: number;
        isReliable: boolean;
      };
      confidence: number;
    };
  };
  technicalIndicators?: {
    rsi: number;
    macd: {
      MACD: number;
      signal: number;
      histogram: number;
    };
    volumeAnalysis: {
      volumeIncrease: boolean;
      volumeRatio: number;
    };
    priceAction: {
      priceChange: number;
      trend: {
        isUptrend: boolean;
        strength: number;
      };
    };
    dataQuality: {
      hasHistoricalData: boolean;
      dataPoints: number;
      isReliable: boolean;
    };
  };
}
