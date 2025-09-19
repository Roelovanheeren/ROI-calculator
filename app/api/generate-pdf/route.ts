import { NextRequest, NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { SlideGenerator } from '../../../lib/slideGenerator';
import puppeteer from 'puppeteer';

interface LeadData {
  calculatorData: {
    employees: string;
    salary: string;
    sickDays: string;
    turnoverRate: string;
    healthcareCost: string;
    currentWellnessCost: string;
  };
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

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();
    
    console.log('📄 Generating branded PDF slides...');
    
    // Generate branded PDF using your beautiful slide templates
    const pdfBuffer = await generateBrandedROIReport(data);
    
    return NextResponse.json({ 
      success: true,
      pdfBuffer: pdfBuffer.toString('base64')
    });

  } catch (error) {
    console.error('💥 PDF generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Error generating PDF', error: error.message },
      { status: 500 }
    );
  }
}

// New branded PDF generation using your beautiful slide templates
export async function generateBrandedROIReport(data: LeadData): Promise<Buffer> {
  let browser;
  try {
    console.log('🎨 Generating all slide templates...');
    
    // Generate all 7 branded slides
    const slides = SlideGenerator.generateAllSlides(data);
    
    console.log(`✅ Generated ${slides.length} slide templates`);
    
    // Launch Puppeteer to convert HTML slides to PDF
    console.log('🚀 Launching Puppeteer...');
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    
    // Set page size to slide dimensions (1280x720 landscape)
    await page.setViewport({ width: 1280, height: 720 });
    
    console.log('📄 Creating multi-page PDF...');
    
    // Create a single PDF with multiple pages instead of merging separate PDFs
    let isFirstPage = true;
    const pdfPages = [];
    
    // Generate all slides and combine into one HTML document for PDF
    let combinedHTML = '';
    
    for (let i = 0; i < slides.length; i++) {
      console.log(`Processing slide ${i + 1}/7...`);
      
      // Add page break styling for multi-page PDF
      const slideHTML = slides[i].replace(
        '<body>',
        `<body style="margin: 0; padding: 0; ${i > 0 ? 'page-break-before: always;' : ''}">`
      );
      
      combinedHTML += slideHTML.replace('<!DOCTYPE html>', '').replace('<html lang="en">', '').replace('</html>', '').replace('<head>', '').replace('</head>', '').replace('<body', '<div').replace('</body>', '</div>');
    }
    
    // Wrap in proper HTML structure
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
    
    // Set the combined HTML
    await page.setContent(finalHTML, { 
      waitUntil: 'networkidle0',
      timeout: 60000 
    });
    
    // Generate single PDF with all slides
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

// Function to merge multiple PDF buffers into one
async function mergePDFs(pdfBuffers: Buffer[]): Promise<Buffer> {
  // For now, we'll return the first buffer
  // In production, you'd use a library like pdf-lib to properly merge PDFs
  // But for MVP, Puppeteer generates a single PDF anyway when we use multiple pages
  
  // Simple concatenation approach - each slide becomes a page
  const doc = new jsPDF('landscape', 'px', [1280, 720]);
  
  // Add each slide as a page (this is a simplified approach)
  // In production, you'd properly merge the PDF buffers
  
  return pdfBuffers[0]; // Return first for now - will implement proper merging if needed
}

// Legacy function (keeping for fallback)
async function generateROIReport(data: LeadData): Promise<jsPDF> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const pageHeight = doc.internal.pageSize.height;
  
  // Helper function to format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Helper function to add new page if needed
  let currentY = 20;
  const addNewPageIfNeeded = (spaceNeeded: number) => {
    if (currentY + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      currentY = 20;
    }
  };

  // Page 1: Cover Page
  doc.setFillColor(22, 163, 74); // Green color
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(24);
  doc.setFont(undefined, 'bold');
  doc.text('Corporate Wellness ROI Analysis', pageWidth / 2, 30, { align: 'center' });
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'normal');
  doc.text(`Prepared for ${data.contactData.companyName}`, pageWidth / 2, 45, { align: 'center' });
  
  // Company details
  doc.setTextColor(0, 0, 0);
  currentY = 80;
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Executive Summary', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const summaryText = [
    `Company: ${data.contactData.companyName}`,
    `Contact: ${data.contactData.fullName}, ${data.contactData.jobTitle}`,
    `Employees: ${data.calculatorData.employees}`,
    `Industry: ${data.contactData.industry || 'Not specified'}`,
    `Analysis Date: ${new Date().toLocaleDateString('en-GB')}`,
    '',
    'Key Findings:',
    `• Total Potential Annual Savings: ${formatCurrency(data.calculations.totalSavings)}`,
    `• Return on Investment: ${Math.round(data.calculations.roiPercentage)}%`,
    `• Net Annual Benefit: ${formatCurrency(data.calculations.netSavings)}`,
    `• Payback Period: ${data.calculations.paybackMonths} months`,
    `• Annual Investment: ${formatCurrency(data.calculations.annualProgramCost)}`,
    `• After-Tax Cost: ${formatCurrency(data.calculations.afterTaxProgramCost)}`
  ];
  
  summaryText.forEach(line => {
    if (line.startsWith('•')) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    doc.text(line, 20, currentY);
    currentY += 7;
  });

  // ROI Visualization (simple text-based chart)
  addNewPageIfNeeded(80);
  currentY += 10;
  
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Financial Impact Breakdown', 20, currentY);
  currentY += 15;
  
  // Create a simple bar chart representation
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  // Calculate savings breakdown if not provided
  const employees = parseInt(data.calculatorData.employees) || 0;
  const salary = parseInt(data.calculatorData.salary) || 0;
  const sickDays = parseFloat(data.calculatorData.sickDays) || 0;
  const turnoverRate = parseFloat(data.calculatorData.turnoverRate) || 0;
  const healthcareCost = parseInt(data.calculatorData.healthcareCost) || 0;
  
  const dailySalary = salary / 260;
  
  const currentCosts = {
    sickDays: employees * sickDays * dailySalary,
    turnover: employees * (turnoverRate / 100) * (salary * 0.75),
    healthcare: employees * healthcareCost,
    productivity: employees * salary * 0.15
  };
  
  const sickDaysReduction = data.calculations.projectedSavings?.sickDaysReduction || (currentCosts.sickDays * 0.25);
  const productivityGain = data.calculations.projectedSavings?.productivityGain || (currentCosts.productivity * 0.10);
  const healthcareReduction = data.calculations.projectedSavings?.healthcareReduction || (currentCosts.healthcare * 0.15);
  const turnoverReduction = data.calculations.projectedSavings?.turnoverReduction || (currentCosts.turnover * 0.20);
  
  const savings = [
    { label: 'Reduced Absenteeism', amount: sickDaysReduction, color: [34, 197, 94] },
    { label: 'Increased Productivity', amount: productivityGain, color: [59, 130, 246] },
    { label: 'Reduced Healthcare Costs', amount: healthcareReduction, color: [147, 51, 234] },
    { label: 'Reduced Turnover', amount: turnoverReduction, color: [249, 115, 22] }
  ];
  
  savings.forEach((item, index) => {
    const barWidth = (item.amount / data.calculations.totalSavings) * 120;
    
    doc.setFillColor(item.color[0], item.color[1], item.color[2]);
    doc.rect(20, currentY - 5, barWidth, 8, 'F');
    
    doc.setTextColor(0, 0, 0);
    doc.text(`${item.label}: ${formatCurrency(item.amount)}`, 150, currentY);
    currentY += 15;
  });

  // Page 2: Detailed Analysis
  doc.addPage();
  currentY = 20;
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Detailed Financial Analysis', 20, currentY);
  currentY += 20;
  
  // Current State Analysis
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Current State Analysis', 20, currentY);
  currentY += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  const currentStateText = [
    `Based on your company data, we estimate the following annual costs:`,
    '',
    `• Employee Absenteeism: ${data.calculatorData.employees} employees × ${data.calculatorData.sickDays} sick days`,
    `• Turnover Rate: ${data.calculatorData.turnoverRate}% annually`,
    `• Healthcare Costs: ${formatCurrency(parseFloat(data.calculatorData.healthcareCost))} per employee`,
    `• Current Wellness Investment: ${formatCurrency(parseFloat(data.calculatorData.currentWellnessCost))}`,
    '',
    'These factors represent significant hidden costs to your organization.'
  ];
  
  currentStateText.forEach(line => {
    doc.text(line, 20, currentY);
    currentY += 6;
  });
  
  currentY += 10;
  
  // Proposed Solution
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Barn Gym Corporate Wellness Solution', 20, currentY);
  currentY += 10;
  
  doc.setFontSize(11);
  doc.setFont(undefined, 'normal');
  
  const solutionText = [
    'Our comprehensive corporate wellness program addresses these challenges through:',
    '',
    '• Preventive Health Programs - Reducing sick days and healthcare costs',
    '• Employee Engagement Initiatives - Improving productivity and job satisfaction', 
    '• Retention Programs - Reducing costly employee turnover',
    '• Mental Health Support - Enhancing overall wellbeing',
    '',
    'Investment Details:',
    `• Monthly Cost: £200 per employee (${data.calculatorData.employees} employees)`,
    `• Annual Investment: ${formatCurrency(data.calculations.annualProgramCost)}`,
    `• After Tax Relief (25%): ${formatCurrency(data.calculations.afterTaxProgramCost)}`,
    `• Net Monthly Cost: ${formatCurrency(data.calculations.afterTaxProgramCost / 12)}`
  ];
  
  solutionText.forEach(line => {
    doc.text(line, 20, currentY);
    currentY += 6;
  });

  // Page 3: Implementation & Next Steps
  doc.addPage();
  currentY = 20;
  
  doc.setFontSize(18);
  doc.setFont(undefined, 'bold');
  doc.text('Implementation Roadmap', 20, currentY);
  currentY += 20;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const implementationText = [
    'Phase 1: Foundation (Month 1)',
    '• Employee wellness assessment and baseline metrics',
    '• Program customization based on your specific needs',
    '• Launch communication and employee onboarding',
    '',
    'Phase 2: Core Programs (Months 2-3)',
    '• Fitness and nutrition programs rollout',
    '• Mental health and stress management workshops',
    '• Workplace ergonomics and safety training',
    '',
    'Phase 3: Advanced Features (Months 4-6)',
    '• Health coaching and personalized plans',
    '• Team challenges and engagement activities',
    '• Advanced analytics and reporting',
    '',
    'Phase 4: Optimization (Months 7-12)',
    '• Program refinement based on employee feedback',
    '• ROI measurement and reporting',
    '• Continuous improvement initiatives',
    '',
    'Expected Timeline for ROI Realization:',
    `• Payback Period: ${data.calculations.paybackMonths} months`,
    '• First measurable improvements: 3-6 months',
    '• Full ROI realization: 12-18 months'
  ];
  
  implementationText.forEach(line => {
    if (line.startsWith('Phase') || line.startsWith('Expected')) {
      doc.setFont(undefined, 'bold');
    } else {
      doc.setFont(undefined, 'normal');
    }
    doc.text(line, 20, currentY);
    currentY += 6;
    
    addNewPageIfNeeded(10);
  });

  // Page 4: Call to Action
  doc.addPage();
  currentY = 20;
  
  doc.setFillColor(59, 130, 246); // Blue color
  doc.rect(0, 0, pageWidth, 40, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont(undefined, 'bold');
  doc.text('Ready to Transform Your Workplace?', pageWidth / 2, 25, { align: 'center' });
  
  doc.setTextColor(0, 0, 0);
  currentY = 60;
  
  doc.setFontSize(14);
  doc.setFont(undefined, 'bold');
  doc.text('Next Steps', 20, currentY);
  currentY += 15;
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  
  const nextStepsText = [
    '1. Free Consultation Call',
    '   Schedule a 30-minute discovery call to discuss your specific needs',
    '   and customize our approach for your organization.',
    '',
    '2. Pilot Program',
    '   Start with a 3-month pilot program to demonstrate value',
    '   and gather employee feedback.',
    '',
    '3. Full Implementation',
    '   Roll out the complete wellness program across your organization',
    '   with ongoing support and optimization.',
    '',
    'Contact Information:',
    '',
    'Email: guy@barn-gym.com',
    'Phone: [Your Phone Number]',
    'Website: www.barn-gym.com',
    '',
    'Book your free consultation:',
    'https://calendly.com/barn-gym/consultation'
  ];
  
  nextStepsText.forEach(line => {
    if (line.match(/^\d+\./)) {
      doc.setFont(undefined, 'bold');
    } else if (line.includes('@') || line.includes('http') || line.includes('www.')) {
      doc.setFont(undefined, 'bold');
      doc.setTextColor(59, 130, 246);
    } else {
      doc.setFont(undefined, 'normal');
      doc.setTextColor(0, 0, 0);
    }
    doc.text(line, 20, currentY);
    currentY += 7;
  });
  
  // Footer
  doc.setTextColor(128, 128, 128);
  doc.setFontSize(8);
  doc.setFont(undefined, 'normal');
  doc.text('This analysis is based on industry benchmarks and your provided data. Actual results may vary.', 
           pageWidth / 2, pageHeight - 10, { align: 'center' });
  
  return doc;
}
