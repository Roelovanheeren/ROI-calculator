import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface EmailData {
  to: string;
  subject: string;
  pdfBuffer: string;
  data: {
    contactData: {
      fullName: string;
      companyName: string;
      jobTitle: string;
    };
    calculations: {
      totalSavings: number;
      roiPercentage: number;
      netSavings: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const emailData: EmailData = await request.json();
    
    const emailSent = await sendROIReport(emailData);
    
    if (emailSent.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'Email sent successfully' 
      });
    } else {
      return NextResponse.json(
        { success: false, message: emailSent.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Error sending email' },
      { status: 500 }
    );
  }
}

async function sendROIReport(emailData: EmailData) {
  try {
    // Configure email transporter (using Gmail SMTP as example)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
      },
    });

    // Alternative configuration for other SMTP services
    // const transporter = nodemailer.createTransporter({
    //   host: process.env.SMTP_HOST,
    //   port: parseInt(process.env.SMTP_PORT || '587'),
    //   secure: false,
    //   auth: {
    //     user: process.env.SMTP_USER,
    //     pass: process.env.SMTP_PASSWORD,
    //   },
    // });

    const formatCurrency = (amount: number): string => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
      }).format(amount);
    };

    // Email HTML template
    const htmlTemplate = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Your Corporate Wellness ROI Analysis</title>
        <style>
            body {
                font-family: Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                max-width: 600px;
                margin: 0 auto;
                padding: 20px;
            }
            .header {
                background: linear-gradient(135deg, #16a34a, #2563eb);
                color: white;
                padding: 30px 20px;
                text-align: center;
                border-radius: 10px 10px 0 0;
            }
            .header h1 {
                margin: 0;
                font-size: 24px;
            }
            .content {
                background: #ffffff;
                padding: 30px 20px;
                border: 1px solid #e5e7eb;
                border-radius: 0 0 10px 10px;
            }
            .highlight-box {
                background: #f0fdf4;
                border: 2px solid #16a34a;
                padding: 20px;
                border-radius: 8px;
                margin: 20px 0;
                text-align: center;
            }
            .roi-stat {
                font-size: 32px;
                font-weight: bold;
                color: #16a34a;
                margin: 10px 0;
            }
            .stat-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 15px;
                margin: 20px 0;
            }
            .stat-item {
                background: #f9fafb;
                padding: 15px;
                border-radius: 6px;
                text-align: center;
            }
            .stat-value {
                font-size: 20px;
                font-weight: bold;
                color: #1f2937;
            }
            .stat-label {
                font-size: 12px;
                color: #6b7280;
                margin-top: 5px;
            }
            .cta-button {
                display: inline-block;
                background: linear-gradient(135deg, #16a34a, #2563eb);
                color: white;
                text-decoration: none;
                padding: 15px 30px;
                border-radius: 8px;
                font-weight: bold;
                margin: 10px;
                text-align: center;
            }
            .footer {
                text-align: center;
                color: #6b7280;
                font-size: 12px;
                margin-top: 30px;
                padding: 20px;
                border-top: 1px solid #e5e7eb;
            }
            @media (max-width: 600px) {
                .stat-grid {
                    grid-template-columns: 1fr;
                }
            }
        </style>
    </head>
    <body>
        <div class="header">
            <h1>🎯 Your Corporate Wellness ROI Analysis</h1>
            <p>Prepared exclusively for ${emailData.data.contactData.companyName}</p>
        </div>
        
        <div class="content">
            <p>Dear ${emailData.data.contactData.fullName},</p>
            
            <p>Thank you for using our ROI calculator! We've prepared a comprehensive analysis showing the potential financial impact of implementing a corporate wellness program at ${emailData.data.contactData.companyName}.</p>
            
            <div class="highlight-box">
                <h2 style="margin-top: 0; color: #16a34a;">Your Key Results</h2>
                <div class="roi-stat">${formatCurrency(emailData.data.calculations.totalSavings)}</div>
                <p style="margin: 5px 0;">Potential Annual Savings</p>
                
                <div class="stat-grid">
                    <div class="stat-item">
                        <div class="stat-value">${Math.round(emailData.data.calculations.roiPercentage)}%</div>
                        <div class="stat-label">Return on Investment</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-value">${formatCurrency(emailData.data.calculations.netSavings)}</div>
                        <div class="stat-label">Net Annual Benefit</div>
                    </div>
                </div>
            </div>
            
            <h3>📊 What's Included in Your Detailed Report:</h3>
            <ul>
                <li><strong>Executive Summary</strong> - Key findings and recommendations</li>
                <li><strong>Financial Breakdown</strong> - Detailed cost and savings analysis</li>
                <li><strong>Implementation Roadmap</strong> - Step-by-step rollout plan</li>
                <li><strong>Industry Benchmarks</strong> - How your results compare to peers</li>
                <li><strong>Next Steps</strong> - Clear action items to move forward</li>
            </ul>
            
            <p>Your comprehensive 4-page report is attached to this email as a PDF. This document is ready to share with your leadership team and provides all the data needed to make an informed decision.</p>
            
            <div style="text-align: center; margin: 30px 0;">
                <a href="https://calendly.com/barn-gym/consultation" class="cta-button">
                    📞 Book Free Consultation
                </a>
                <a href="mailto:guy@barn-gym.com?subject=Free Trial Request - ${emailData.data.contactData.companyName}" class="cta-button">
                    🚀 Start Free Trial
                </a>
            </div>
            
            <h3>🎯 What Happens Next?</h3>
            <ol>
                <li><strong>Review your report</strong> - Share with your team and stakeholders</li>
                <li><strong>Book a consultation</strong> - Let's discuss your specific needs (30 minutes, completely free)</li>
                <li><strong>Start your pilot</strong> - Begin with a 3-month trial to see results firsthand</li>
            </ol>
            
            <p>I'm here to answer any questions about your analysis or discuss how we can customize our approach for ${emailData.data.contactData.companyName}. Feel free to reply to this email or book a time that works for you.</p>
            
            <p>Looking forward to helping you create a healthier, more productive workplace!</p>
            
            <p>Best regards,<br>
            <strong>Guy from Barn Gym</strong><br>
            guy@barn-gym.com<br>
            <a href="https://calendly.com/barn-gym/consultation">Book a call</a></p>
            
            <hr style="margin: 30px 0; border: none; border-top: 1px solid #e5e7eb;">
            
            <p style="font-size: 12px; color: #6b7280;">
                <strong>P.S.</strong> Corporate wellness programs are typically tax-deductible business expenses, which means your actual investment cost could be 25% lower than calculated. This makes your ROI even better!
            </p>
        </div>
        
        <div class="footer">
            <p>© 2024 Barn Gym. All rights reserved.</p>
            <p>This analysis is based on industry benchmarks and your provided data. Actual results may vary.</p>
            <p>If you no longer wish to receive emails about corporate wellness, please reply with "UNSUBSCRIBE".</p>
        </div>
    </body>
    </html>
    `;

    // Plain text version
    const textTemplate = `
    Your Corporate Wellness ROI Analysis - ${emailData.data.contactData.companyName}
    
    Dear ${emailData.data.contactData.fullName},
    
    Thank you for using our ROI calculator! Here are your key results:
    
    Potential Annual Savings: ${formatCurrency(emailData.data.calculations.totalSavings)}
    Return on Investment: ${Math.round(emailData.data.calculations.roiPercentage)}%
    Net Annual Benefit: ${formatCurrency(emailData.data.calculations.netSavings)}
    
    Your detailed 4-page report is attached as a PDF and includes:
    - Executive Summary with key findings
    - Detailed financial breakdown
    - Implementation roadmap
    - Industry benchmarks
    - Next steps and recommendations
    
    Ready to move forward?
    - Book a free consultation: https://calendly.com/barn-gym/consultation
    - Start a free trial: guy@barn-gym.com
    
    I'm here to answer any questions about your analysis.
    
    Best regards,
    Guy from Barn Gym
    guy@barn-gym.com
    `;

    // Convert base64 PDF buffer back to buffer
    const pdfBuffer = Buffer.from(emailData.pdfBuffer, 'base64');

    // Email options
    const mailOptions = {
      from: `"Barn Gym ROI Calculator" <${process.env.EMAIL_USER}>`,
      to: emailData.to,
      subject: emailData.subject,
      text: textTemplate,
      html: htmlTemplate,
      attachments: [
        {
          filename: `${emailData.data.contactData.companyName}_Wellness_ROI_Analysis.pdf`,
          content: pdfBuffer,
          contentType: 'application/pdf'
        }
      ]
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', info.messageId);
    
    return { success: true, messageId: info.messageId };

  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}
