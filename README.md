# Arrakis - Intelligent Crypto Analysis Bot

<div align="center">
  <img src="docs/assets/logo.jpeg" alt="Arrakis Logo" width="200"/>
  
  *"The spice must flow" - Frank Herbert, Dune*
</div>

## Overview

Arrakis is a sophisticated cryptocurrency analysis bot built with NestJS that helps identify potential trading opportunities using technical analysis and market indicators. Named after the desert planet from Dune, Arrakis sifts through the vast cryptocurrency market to find valuable opportunities, just as the planet's inhabitants harvest the precious spice.

## Features

- **Real-time Market Analysis**: Fetches and analyzes data for the top 200 cryptocurrencies
- **Technical Indicators**:
  - RSI (Relative Strength Index)
  - MACD (Moving Average Convergence Divergence)
  - Volume Analysis
  - Price Action Trends
- **Smart Filtering**: Identifies potential opportunities based on multiple criteria:
  - Market capitalization thresholds
  - Volume increases
  - Price momentum
  - Technical indicator combinations
- **Detailed Reporting**: Provides comprehensive analysis with specific reasons for each recommendation

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- CoinMarketCap API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/arrakis.git
cd arrakis
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
CMC_API_KEY=your_coinmarketcap_api_key_here
```

4. Start the development server:
```bash
npm run start:dev
```

## API Endpoints

### GET /crypto
Returns raw data for the top 200 cryptocurrencies.

### GET /crypto/analysis
Returns analyzed cryptocurrency data with technical indicators and potential signals.

Query Parameters:
- `isPotential=true`: Filter to show only cryptocurrencies with high potential based on analysis

## Technical Analysis Criteria

The bot evaluates cryptocurrencies based on multiple factors:

1. **RSI Analysis**
   - Oversold conditions (RSI < 35)
   - Moderate oversold (RSI < 45)

2. **MACD Analysis**
   - Positive histogram and signal
   - Early momentum detection

3. **Volume Analysis**
   - Significant volume increases (>30%)
   - Moderate volume increases (>10%)

4. **Market Cap Considerations**
   - Small cap opportunities (<$500M)
   - Medium cap potential (<$1B)

5. **Price Action**
   - Trend strength and direction
   - Recent price changes

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Disclaimer

This bot is for educational and research purposes only. Always conduct your own research and never invest more than you can afford to lose in cryptocurrency markets.

---

Built with ❤️ using NestJS and TypeScript
