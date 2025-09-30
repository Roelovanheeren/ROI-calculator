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
    console.log('🎯 Starting branded PDF generation...');
    
    // Generate all 7 branded slides
    const slides = SlideGenerator.generateAllSlides(data);
    
    console.log(`✅ Generated ${slides.length} slide templates`);
    
    console.log('🚀 Launching Puppeteer...');
    
    // Launch Puppeteer with Railway-compatible settings
    browser = await puppeteer.launch({
      headless: 'new',
      executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu',
        '--disable-extensions',
        '--disable-default-apps',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=VizDisplayCompositor'
      ]
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
        
        /* CRITICAL PDF BORDER CLEANUP */
        * {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
          -webkit-user-select: none !important;
          -moz-user-select: none !important;
          -ms-user-select: none !important;
          user-select: none !important;
        }
        
        /* Only allow intentional backgrounds and styling */
        .slide-container {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
        }
        
        /* Remove unwanted borders from all PDF elements */
        .pdf-element,
        .pdf-section,
        .pdf-box,
        .pdf-content,
        .executive-summary,
        .metric-display,
        .savings-breakdown,
        .implementation-section,
        .grid-item,
        .metric-item,
        .chart-container,
        .legend-container,
        .investment-box,
        .tools-container,
        .step-item,
        .cta-container,
        .source-category,
        div[class*="bg-"],
        div[class*="border"],
        .rounded,
        .rounded-lg,
        .rounded-xl,
        .rounded-2xl {
          border: none !important;
          box-shadow: none !important;
          outline: none !important;
        }
        
        /* Preserve only intentional slide backgrounds */
        .slide-container[style*="background-color"] {
          border: none !important;
          box-shadow: none !important;
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
    
    // Wait for any charts or dynamic content to load
    await page.waitForTimeout(2000);
    
    const pdfBuffer = await page.pdf({
      width: '1280px',
      height: '720px',
      printBackground: true,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      preferCSSPageSize: true
    });
    
    await browser.close();
    
    console.log('✅ Branded PDF generated successfully with 7 slides');
    return pdfBuffer;
    
  } catch (error) {
    console.error('💥 PDF generation error:', error);
    if (browser) {
      await browser.close();
    }
    throw error;
  }
}