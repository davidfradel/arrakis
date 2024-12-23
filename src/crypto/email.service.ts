import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async sendDailyReport(cryptos: any[]) {
    const potentialCryptos = cryptos.filter(
      (crypto) => crypto.potentialGain.isPotential,
    );

    if (potentialCryptos.length === 0) {
      this.logger.log('No potential cryptocurrencies found today');
      return;
    }

    const htmlContent = this.generateEmailContent(potentialCryptos);

    const mailOptions = {
      from: process.env.SMTP_USER,
      to: process.env.RECIPIENT_EMAIL,
      subject: `Crypto Trading Opportunities - ${new Date().toLocaleDateString()}`,
      html: htmlContent,
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log('Daily report email sent successfully');
    } catch (error) {
      this.logger.error('Error sending email:', error);
    }
  }

  private generateEmailContent(cryptos: any[]): string {
    let content = `
      <h2>Crypto Trading Opportunities</h2>
      <p>Here are today's most promising cryptocurrencies based on technical analysis:</p>
      <table style="width: 100%; border-collapse: collapse;">
        <tr style="background-color: #f2f2f2;">
          <th style="padding: 8px; border: 1px solid #ddd;">Symbol</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Name</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Price (USD)</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Market Cap</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Score</th>
          <th style="padding: 8px; border: 1px solid #ddd;">Reasons</th>
        </tr>
    `;

    cryptos.forEach((crypto) => {
      content += `
        <tr>
          <td style="padding: 8px; border: 1px solid #ddd;">${crypto.symbol}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${crypto.name}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${crypto.quote.USD.price.toFixed(4)}</td>
          <td style="padding: 8px; border: 1px solid #ddd;">$${(crypto.quote.USD.market_cap / 1000000).toFixed(2)}M</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${crypto.potentialGain.score}/10</td>
          <td style="padding: 8px; border: 1px solid #ddd;">${crypto.potentialGain.reasons.join('<br>')}</td>
        </tr>
      `;
    });

    content += `
      </table>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        Note: This is an automated analysis based on technical indicators. 
        Always do your own research before making investment decisions.
      </p>
    `;

    return content;
  }
}
