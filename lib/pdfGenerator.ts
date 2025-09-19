import { jsPDF } from 'jspdf';

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
    paybackMonths: number;
    netSavings: number;
    annualProgramCost: number;
    projectedSavings: {
      sickDaysReduction: number;
      turnoverReduction: number;
      healthcareReduction: number;
      productivityGain: number;
    };
  };
}

export async function generateBrandedROIReport(data: LeadData): Promise<Buffer> {
  try {
    console.log('🎯 Starting PDF generation with jsPDF...');
    
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'mm',
      format: 'a4'
    });

    // Set up colors
    const primaryGreen = '#007559';
    const lightGreen = '#E6F4F1';

    // Helper function to format currency
    const formatCurrency = (amount: number) => {
      return new Intl.NumberFormat('en-GB', {
        style: 'currency',
        currency: 'GBP',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      }).format(amount);
    };

    // Page 1: Title Slide
    pdf.setFillColor(0, 117, 89); // Primary green background
    pdf.rect(0, 0, 297, 210, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(36);
    pdf.setFont('helvetica', 'bold');
    pdf.text('CORPORATE WELLNESS', 148.5, 80, { align: 'center' });
    pdf.text('ROI ANALYSIS', 148.5, 100, { align: 'center' });
    
    pdf.setFontSize(24);
    pdf.text(`Prepared for ${data.contactData.companyName}`, 148.5, 130, { align: 'center' });
    
    pdf.setFontSize(14);
    pdf.text('September 19, 2025', 148.5, 180, { align: 'center' });
    pdf.text('contact@barngym.com', 148.5, 190, { align: 'center' });

    // Page 2: Executive Overview
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');
    
    pdf.setTextColor(0, 117, 89);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Executive Overview', 148.5, 30, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('Key Performance Metrics', 148.5, 45, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text('Based on our analysis, your corporate wellness program delivers exceptional value:', 148.5, 60, { align: 'center' });

    // Metric boxes
    const metrics = [
      { title: 'Total Annual Savings', value: formatCurrency(data.calculations.totalSavings), x: 50, y: 90 },
      { title: 'ROI Percentage', value: `${Math.round(data.calculations.roiPercentage)}%`, x: 148.5, y: 90 },
      { title: 'Months to Payback', value: `${data.calculations.paybackMonths}`, x: 247, y: 90 }
    ];

    metrics.forEach(metric => {
      // Green background box
      pdf.setFillColor(0, 117, 89);
      pdf.rect(metric.x - 35, metric.y - 15, 70, 40, 'F');
      
      // White text
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text(metric.value, metric.x, metric.y, { align: 'center' });
      
      pdf.setFontSize(10);
      pdf.text(metric.title, metric.x, metric.y + 10, { align: 'center' });
    });

    // Page 3: Financial Breakdown
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');
    
    pdf.setTextColor(0, 117, 89);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Projected Cost Savings Breakdown', 148.5, 30, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text('Our corporate wellness program delivers savings across four critical business areas:', 148.5, 50, { align: 'center' });

    // Savings breakdown
    const savings = [
      { category: 'Absenteeism', amount: data.calculations.projectedSavings.sickDaysReduction, percentage: Math.round((data.calculations.projectedSavings.sickDaysReduction / data.calculations.totalSavings) * 100) },
      { category: 'Productivity', amount: data.calculations.projectedSavings.productivityGain, percentage: Math.round((data.calculations.projectedSavings.productivityGain / data.calculations.totalSavings) * 100) },
      { category: 'Healthcare', amount: data.calculations.projectedSavings.healthcareReduction, percentage: Math.round((data.calculations.projectedSavings.healthcareReduction / data.calculations.totalSavings) * 100) },
      { category: 'Turnover', amount: data.calculations.projectedSavings.turnoverReduction, percentage: Math.round((data.calculations.projectedSavings.turnoverReduction / data.calculations.totalSavings) * 100) }
    ];

    let yPos = 80;
    savings.forEach(item => {
      pdf.setTextColor(0, 117, 89);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(`${item.category}: ${formatCurrency(item.amount)} (${item.percentage}%)`, 50, yPos);
      yPos += 15;
    });

    // Investment details
    pdf.setFillColor(0, 117, 89);
    pdf.rect(200, 70, 80, 80, 'F');
    
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Investment Details', 240, 85, { align: 'center' });
    
    pdf.setFontSize(12);
    pdf.text(`Annual Cost: ${formatCurrency(data.calculations.annualProgramCost)}`, 240, 105, { align: 'center' });
    pdf.text(`Cost per employee: £175/month`, 240, 115, { align: 'center' });
    pdf.text(`Total Savings: ${formatCurrency(data.calculations.totalSavings)}`, 240, 130, { align: 'center' });
    pdf.text(`Net Benefit: ${formatCurrency(data.calculations.netSavings)}`, 240, 140, { align: 'center' });

    // Page 4: Program Inclusions
    pdf.addPage();
    pdf.setFillColor(255, 255, 255);
    pdf.rect(0, 0, 297, 210, 'F');
    
    pdf.setTextColor(0, 117, 89);
    pdf.setFontSize(32);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Program Inclusions', 148.5, 30, { align: 'center' });
    
    pdf.setFontSize(18);
    pdf.text('What You Get', 148.5, 45, { align: 'center' });
    
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(12);
    pdf.text('Our comprehensive wellness solution includes these key components:', 148.5, 60, { align: 'center' });

    const inclusions = [
      { title: 'Training Plans', description: 'Customized fitness programs tailored to employee fitness levels and goals' },
      { title: 'Nutrition Guidance', description: 'Evidence-based dietary advice and meal planning support' },
      { title: 'Accountability', description: 'Progress tracking and professional coaching to maintain momentum' },
      { title: 'Community & Culture', description: 'Team challenges and social support to build lasting wellness habits' }
    ];

    let inclusionY = 80;
    inclusions.forEach(item => {
      pdf.setTextColor(0, 117, 89);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text(item.title, 50, inclusionY);
      
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const lines = pdf.splitTextToSize(item.description, 200);
      pdf.text(lines, 50, inclusionY + 8);
      inclusionY += 25;
    });

    // Convert to buffer
    const pdfBuffer = Buffer.from(pdf.output('arraybuffer'));
    
    console.log('✅ PDF generated successfully with jsPDF');
    return pdfBuffer;
    
  } catch (error) {
    console.error('💥 PDF generation error:', error);
    throw error;
  }
}