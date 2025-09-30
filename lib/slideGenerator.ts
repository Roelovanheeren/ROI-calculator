import { readFileSync } from 'fs';
import { join } from 'path';

interface SlideData {
  // Company Info
  COMPANY_NAME: string;
  EMPLOYEE_COUNT: string;
  CONTACT_NAME: string;
  JOB_TITLE: string;
  INDUSTRY: string;
  IMPLEMENTATION_TIMELINE: string;
  ANALYSIS_DATE: string;
  
  // Financial Metrics
  TOTAL_SAVINGS: string;
  ROI_PERCENTAGE: string;
  NET_SAVINGS: string;
  ANNUAL_PROGRAM_COST: string;
  AFTER_TAX_COST: string;
  
  // Savings Breakdown (amounts)
  SICK_DAYS_SAVINGS: string;
  PRODUCTIVITY_SAVINGS: string;
  HEALTHCARE_SAVINGS: string;
  TURNOVER_SAVINGS: string;
  
  // Savings Breakdown (percentages for chart)
  SICK_DAYS_PERCENTAGE: number;
  PRODUCTIVITY_PERCENTAGE: number;
  HEALTHCARE_PERCENTAGE: number;
  TURNOVER_PERCENTAGE: number;
}

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

export class SlideGenerator {
  private static formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  private static convertLeadDataToSlideData(data: LeadData): SlideData {
    console.log('🔍 Converting data for slides:', JSON.stringify(data, null, 2));
    console.log('🔍 Contact data structure:', data.contactData);
    console.log('🔍 Company name specifically:', data.contactData?.companyName);
    
    // Check if calculations exist and handle missing data gracefully
    const calculations = data.calculations || {};
    const totalSavings = (calculations as any).totalSavings || 0;
    const projectedSavings = (calculations as any).projectedSavings || {};
    
    // Calculate savings breakdown percentages with fallbacks
    const sickDaysSavings = (projectedSavings as any).sickDaysReduction || (totalSavings * 0.25);
    const productivitySavings = (projectedSavings as any).productivityGain || (totalSavings * 0.10);
    const healthcareSavings = (projectedSavings as any).healthcareReduction || (totalSavings * 0.10);
    const turnoverSavings = (projectedSavings as any).turnoverReduction || (totalSavings * 0.15);
    
    // Calculate savings breakdown percentages (cost reductions only)
    // Remove productivity from savings - it's value creation, not cost reduction
    const totalSavingsOnly = sickDaysSavings + healthcareSavings + turnoverSavings;
    const sickDaysPercentage = Math.round((sickDaysSavings / totalSavingsOnly) * 100);
    const healthcarePercentage = Math.round((healthcareSavings / totalSavingsOnly) * 100);
    const turnoverPercentage = Math.round((turnoverSavings / totalSavingsOnly) * 100);
    
    // Productivity is separate value creation, not included in savings breakdown
    const productivityPercentage = 10; // 10% productivity gain (shown separately)
    
    // Debug: Log the company name being used
    console.log('🏢 Company name from data:', data.contactData?.companyName);
    console.log('🏢 Full contact data:', data.contactData);
    
    return {
      // Company Info
      COMPANY_NAME: data.contactData?.companyName || 'TEST COMPANY NAME',
      EMPLOYEE_COUNT: data.calculatorData?.employees || '100',
      CONTACT_NAME: data.contactData?.fullName || 'Contact Name',
      JOB_TITLE: data.contactData?.jobTitle || 'Manager',
      INDUSTRY: data.contactData?.industry || 'Technology',
      IMPLEMENTATION_TIMELINE: data.contactData?.timeline || 'Q1 2025',
      ANALYSIS_DATE: new Date().toLocaleDateString('en-GB', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      
      // Financial Metrics
      TOTAL_SAVINGS: this.formatCurrency(totalSavings),
      ROI_PERCENTAGE: Math.round((calculations as any).roiPercentage || 0).toString(),
      NET_SAVINGS: this.formatCurrency((calculations as any).netSavings || 0),
      ANNUAL_PROGRAM_COST: this.formatCurrency((calculations as any).annualProgramCost || 0),
      AFTER_TAX_COST: this.formatCurrency((calculations as any).afterTaxProgramCost || 0),
      
      // Savings Breakdown (amounts)
      SICK_DAYS_SAVINGS: this.formatCurrency(sickDaysSavings),
      PRODUCTIVITY_SAVINGS: this.formatCurrency(productivitySavings),
      HEALTHCARE_SAVINGS: this.formatCurrency(healthcareSavings),
      TURNOVER_SAVINGS: this.formatCurrency(turnoverSavings),
      
      // Savings Breakdown (percentages for chart)
      SICK_DAYS_PERCENTAGE: sickDaysPercentage,
      PRODUCTIVITY_PERCENTAGE: productivityPercentage,
      HEALTHCARE_PERCENTAGE: healthcarePercentage,
      TURNOVER_PERCENTAGE: turnoverPercentage,
    };
  }

  private static loadSlideTemplate(slideNumber: number): string {
    const slideFiles = [
      'slide-1-title.html',
      'slide-2-executive.html', 
      'slide-3-financial.html',
      'slide-4-program.html',
      'slide-5-measurement.html',
      'slide-6-next-steps.html',
      'slide-7-sources.html',
      'slide-8-thank-you.html'
    ];
    
    const slidePath = join(process.cwd(), 'templates', 'slides', slideFiles[slideNumber - 1]);
    return readFileSync(slidePath, 'utf-8');
  }

  private static populateTemplate(template: string, data: SlideData): string {
    let populatedTemplate = template;
    
    console.log('🔄 Template replacement data:', data);
    console.log('🔄 COMPANY_NAME value:', data.COMPANY_NAME);
    
    // Replace all variables
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{{${key}}}`;
      console.log(`🔄 Replacing ${placeholder} with ${value}`);
      populatedTemplate = populatedTemplate.replace(new RegExp(placeholder, 'g'), value.toString());
    });
    
    return populatedTemplate;
  }

  public static generateSlide(slideNumber: number, leadData: LeadData): string {
    const slideData = this.convertLeadDataToSlideData(leadData);
    const template = this.loadSlideTemplate(slideNumber);
    return this.populateTemplate(template, slideData);
  }

  public static generateAllSlides(leadData: LeadData): string[] {
    const slides: string[] = [];
    
    for (let i = 1; i <= 8; i++) {
      slides.push(this.generateSlide(i, leadData));
    }
    
    return slides;
  }
}
