import { SlideGenerator } from './slideGenerator';
import puppeteer from 'puppeteer';

interface LeadData {
  contactData: {
    fullName: string;
    workEmail: string;
    companyName: string;
    jobTitle: string;
    companySize: string;
    industry: string;
    currentInitiatives: string;
    timeline: string;
    phone: string;
  };
  calculatorData: {
    employees: string;
    salary: string;
    sickDays: string;
    turnoverRate: string;
    healthcareCost: string;
    currentWellnessCost: string;
  };
  calculations: {
    totalSavings: number;
    roiPercentage: number;
    netSavings: number;
    paybackMonths: number;
    annualProgramCost: number;
    afterTaxProgramCost: number;
    projectedSavings: {
      sickDaysReduction: number;
      turnoverReduction: number;
      healthcareReduction: number;
      productivityGain: number;
    };
  };
  leadScore: number;
}

export async function generateBrandedROIReport(data: LeadData): Promise<Buffer> {
  let browser;
  try {
    console.log('🎨 Generating all slide templates...');
    
    // Generate all 7 branded slides
    const slides = SlideGenerator.generateAllSlides(data);
    
    console.log(`✅ Generated ${slides.length} slide templates`);
    
    console.log('🚀 Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set to slide dimensions for better PDF generation
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('📄 Creating multi-page PDF...');
    
    // Prepare combined HTML for all slides
    let combinedHTML = '';
    
    for (let i = 0; i < slides.length; i++) {
      console.log(`Processing slide ${i + 1}/7...`);
      
      // Add page break for all slides except the first
      const slideHTML = slides[i].replace(
        '<body>',
        `<body style="margin: 0; padding: 0; ${i > 0 ? 'page-break-before: always;' : ''}">`
      );
      
      // Extract body content for combining
      combinedHTML += slideHTML.replace('<!DOCTYPE html>', '').replace('<html lang="en">', '').replace('</html>', '').replace('<head>', '').replace('</head>', '').replace('<body', '<div').replace('</body>', '</div>');
    }
    
    // Create final combined HTML document
    const finalHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="utf-8"/>
      <meta content="width=device-width, initial-scale=1.0" name="viewport"/>
      <title>ROI Report</title>
      ${slides[0].match(/<head>([\s\S]*?)<\/head>/)?.[1] || ''}
      <style>
        @page { 
          size: 1280px 720px;
          margin: 0;
        }
        .slide-container {
          page-break-after: always;
          width: 1280px;
          height: 720px;
        }
        .slide-container:last-child {
          page-break-after: avoid;
        }
      </style>
    </head>
    <body>
      ${combinedHTML}
    </body>
    </html>`;
    
    await page.setContent(finalHTML, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    const pdfBuffer = await page.pdf({
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      pageRanges: '1-7'
    });
    
    await browser.close();
    
    console.log('✅ Branded PDF generated successfully with 7 slides');
    return pdfBuffer;
    
  } catch (error) {
    if (browser) {
      await browser.close();
    }
    console.error('❌ Error generating branded PDF:', error);
    throw error;
  }
}
