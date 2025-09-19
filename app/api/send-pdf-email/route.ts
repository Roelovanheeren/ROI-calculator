import { NextRequest, NextResponse } from 'next/server';

interface PDFEmailData {
  to: string;
  subject: string;
  pdfBuffer: string;
  contactData: {
    fullName: string;
    companyName: string;
    jobTitle: string;
  };
  calculations: {
    totalSavings: number;
    roiPercentage: number;
    netSavings: number;
    paybackMonths: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const emailData: PDFEmailData = await request.json();
    
    // For development/testing - log the email details
    console.log('📧 PDF Email Request:', {
      to: emailData.to,
      subject: emailData.subject,
      company: emailData.contactData.companyName,
      pdfSize: emailData.pdfBuffer.length,
    });

    // Option 1: Use a simple email service (recommended for production)
    const emailSent = await sendPDFEmail(emailData);
    
    if (emailSent.success) {
      return NextResponse.json({ 
        success: true, 
        message: 'PDF email sent successfully' 
      });
    } else {
      return NextResponse.json(
        { success: false, message: emailSent.error },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error sending PDF email:', error);
    return NextResponse.json(
      { success: false, message: 'Error sending PDF email' },
      { status: 500 }
    );
  }
}

async function sendPDFEmail(emailData: PDFEmailData) {
  try {
    // For now, we'll simulate sending the email successfully
    // In production, you would integrate with:
    // - SendGrid
    // - Mailgun
    // - AWS SES
    // - Postmark
    // - etc.
    
    console.log('📧 Simulating PDF email send...');
    console.log('✅ To:', emailData.to);
    console.log('✅ Subject:', emailData.subject);
    console.log('✅ Company:', emailData.contactData.companyName);
    console.log('✅ ROI:', Math.round(emailData.calculations.roiPercentage) + '%');
    console.log('✅ PDF Size:', emailData.pdfBuffer.length, 'bytes');
    
    // Simulate success for development
    return { 
      success: true, 
      message: 'Email simulated successfully (development mode)' 
    };

    /* 
    // Example integration with SendGrid:
    
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    const msg = {
      to: emailData.to,
      from: 'hello@barn-gym.com',
      subject: emailData.subject,
      html: generateEmailHTML(emailData),
      attachments: [
        {
          content: emailData.pdfBuffer,
          filename: `${emailData.contactData.companyName}_ROI_Analysis.pdf`,
          type: 'application/pdf',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
    return { success: true };
    */

  } catch (error) {
    console.error('Error in sendPDFEmail:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

function generateEmailHTML(emailData: PDFEmailData): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #007559; color: white; padding: 20px; text-align: center; }
            .content { padding: 20px; }
            .cta { background: #007559; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0; }
            .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>Your Corporate Wellness ROI Analysis</h1>
            </div>
            
            <div class="content">
                <p>Dear ${emailData.contactData.fullName},</p>
                
                <p>Thank you for using our ROI Calculator! We've prepared a comprehensive analysis for <strong>${emailData.contactData.companyName}</strong>.</p>
                
                <p><strong>Key Results:</strong></p>
                <ul>
                    <li>Potential Annual Savings: £${emailData.calculations.totalSavings.toLocaleString()}</li>
                    <li>Return on Investment: ${Math.round(emailData.calculations.roiPercentage)}%</li>
                    <li>Net Annual Benefit: £${emailData.calculations.netSavings.toLocaleString()}</li>
                    <li>Payback Period: ${emailData.calculations.paybackMonths} months</li>
                </ul>
                
                <p>Please find attached your professional 4-slide presentation that you can share with your leadership team.</p>
                
                <a href="https://calendar.barn-gym.com" class="cta">Schedule Your Free Consultation</a>
                
                <p>We're excited to help you transform your workplace wellness program!</p>
            </div>
            
            <div class="footer">
                <p>Best regards,<br>
                The Barn Gym Team<br>
                Email: hello@barn-gym.com<br>
                Website: www.barn-gym.com</p>
            </div>
        </div>
    </body>
    </html>
  `;
}
