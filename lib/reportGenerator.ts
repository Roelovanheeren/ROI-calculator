import fs from 'fs';
import path from 'path';

interface ReportData {
  // Contact Information
  contactName: string;
  companyName: string;
  industry: string;
  implementationTimeline: string;
  
  // Calculator Inputs
  employeeCount: number;
  averageSalary: number;
  sickDays: number;
  turnoverRate: number;
  healthcareCost: number;
  currentWellnessSpending: number;
  
  // Calculated Results
  totalSavings: number;
  netBenefit: number;
  roiPercentage: number;
  annualProgramCost: number;
  afterTaxProgramCost: number;
  leadScore: number;
  
  // Savings Breakdown
  absenteeismSavings: number;
  productivitySavings: number;
  healthcareSavings: number;
  turnoverSavings: number;
}

export class ReportGenerator {
  private templatePath: string;
  
  constructor() {
    this.templatePath = path.join(process.cwd(), 'templates', 'report-template.html');
  }
  
  /**
   * Generate a personalized HTML report
   */
  public async generateHTMLReport(data: ReportData): Promise<string> {
    try {
      // Read the template file
      const template = fs.readFileSync(this.templatePath, 'utf-8');
      
      // Prepare all the replacement variables
      const variables = this.prepareTemplateVariables(data);
      
      // Replace all placeholders in the template
      let htmlReport = template;
      
      Object.entries(variables).forEach(([key, value]) => {
        const placeholder = `{{${key}}}`;
        htmlReport = htmlReport.replace(new RegExp(placeholder, 'g'), value);
      });
      
      return htmlReport;
      
    } catch (error) {
      console.error('Error generating HTML report:', error);
      throw new Error('Failed to generate HTML report');
    }
  }
  
  /**
   * Prepare all template variables with proper formatting
   */
  private prepareTemplateVariables(data: ReportData): Record<string, string> {
    return {
      // Contact & Company Info
      CONTACT_NAME: data.contactName,
      COMPANY_NAME: data.companyName,
      INDUSTRY: data.industry || 'Not specified',
      IMPLEMENTATION_TIMELINE: data.implementationTimeline,
      
      // Employee Metrics
      EMPLOYEE_COUNT: data.employeeCount.toLocaleString(),
      AVERAGE_SALARY: this.formatCurrency(data.averageSalary),
      SICK_DAYS: data.sickDays.toString(),
      TURNOVER_RATE: data.turnoverRate.toString(),
      
      // Financial Results
      ROI_PERCENTAGE: Math.round(data.roiPercentage).toString(),
      TOTAL_SAVINGS: this.formatCurrency(data.totalSavings),
      NET_BENEFIT: this.formatCurrency(data.netBenefit),
      PROGRAM_COST: this.formatCurrency(data.annualProgramCost),
      GROSS_PROGRAM_COST: this.formatCurrency(data.annualProgramCost),
      NET_PROGRAM_COST: this.formatCurrency(data.afterTaxProgramCost),
      
      // Savings Breakdown
      ABSENTEEISM_SAVINGS: this.formatCurrency(data.absenteeismSavings),
      PRODUCTIVITY_SAVINGS: this.formatCurrency(data.productivitySavings),
      HEALTHCARE_SAVINGS: this.formatCurrency(data.healthcareSavings),
      TURNOVER_SAVINGS: this.formatCurrency(data.turnoverSavings),
      
      // Meta Information
      LEAD_SCORE: data.leadScore.toString(),
      REPORT_DATE: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    };
  }
  
  /**
   * Format currency values
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }
  
  /**
   * Generate a plain text summary for email/SMS
   */
  public generateTextSummary(data: ReportData): string {
    return `
🎯 CORPORATE WELLNESS ROI ANALYSIS - ${data.companyName}

💰 KEY RESULTS:
• ROI: ${Math.round(data.roiPercentage)}%
• Annual Savings: ${this.formatCurrency(data.totalSavings)}
• Net Benefit: ${this.formatCurrency(data.netBenefit)}

📊 SAVINGS BREAKDOWN:
• Reduced Absenteeism: ${this.formatCurrency(data.absenteeismSavings)}
• Increased Productivity: ${this.formatCurrency(data.productivitySavings)}
• Lower Healthcare Costs: ${this.formatCurrency(data.healthcareSavings)}
• Reduced Turnover: ${this.formatCurrency(data.turnoverSavings)}

💼 YOUR COMPANY PROFILE:
• Employees: ${data.employeeCount.toLocaleString()}
• Average Salary: ${this.formatCurrency(data.averageSalary)}
• Implementation Timeline: ${data.implementationTimeline}
• Lead Score: ${data.leadScore}/100

🎁 TAX BENEFITS:
Your investment of ${this.formatCurrency(data.annualProgramCost)}/year becomes ${this.formatCurrency(data.afterTaxProgramCost)}/year after 25% UK Corporation Tax relief.

📞 NEXT STEPS:
Ready to transform your workplace? Schedule your free consultation: https://calendar.barn-gym.com

Generated on ${new Date().toLocaleDateString('en-GB')} for ${data.contactName}
    `.trim();
  }
  
  /**
   * Convert calculator data to report data format
   */
  public static convertCalculatorData(leadData: any): ReportData {
    const { contactData, calculatorData, calculations, leadScore } = leadData;
    
    // Use the pre-calculated savings if available, otherwise calculate them
    let absenteeismSavings, productivitySavings, healthcareSavings, turnoverSavings;
    
    if (calculations.projectedSavings) {
      // Use existing calculations from the calculator
      absenteeismSavings = calculations.projectedSavings.sickDaysReduction || 0;
      productivitySavings = calculations.projectedSavings.productivityGain || 0;
      healthcareSavings = calculations.projectedSavings.healthcareReduction || 0;
      turnoverSavings = calculations.projectedSavings.turnoverReduction || 0;
    } else {
      // Fallback: calculate them manually
      const employees = parseInt(calculatorData.employees) || 0;
      const salary = parseInt(calculatorData.salary) || 0;
      const sickDays = parseFloat(calculatorData.sickDays) || 0;
      const turnoverRate = parseFloat(calculatorData.turnoverRate) || 0;
      const healthcareCost = parseInt(calculatorData.healthcareCost) || 0;
      
      const dailySalary = salary / 260;
      
      const currentCosts = {
        sickDays: employees * sickDays * dailySalary,
        turnover: employees * (turnoverRate / 100) * (salary * 0.75),
        healthcare: employees * healthcareCost,
        productivity: employees * salary * 0.15
      };
      
      absenteeismSavings = currentCosts.sickDays * 0.25;
      productivitySavings = currentCosts.productivity * 0.10;
      healthcareSavings = currentCosts.healthcare * 0.15;
      turnoverSavings = currentCosts.turnover * 0.20;
    }
    
    return {
      // Contact Information
      contactName: contactData.fullName || '',
      companyName: contactData.companyName || '',
      industry: contactData.industry || '',
      implementationTimeline: contactData.timeline || '',
      
      // Calculator Inputs
      employeeCount: parseInt(calculatorData.employees) || 0,
      averageSalary: parseInt(calculatorData.salary) || 0,
      sickDays: parseFloat(calculatorData.sickDays) || 0,
      turnoverRate: parseFloat(calculatorData.turnoverRate) || 0,
      healthcareCost: parseInt(calculatorData.healthcareCost) || 0,
      currentWellnessSpending: parseInt(calculatorData.currentWellnessCost) || 0,
      
      // Calculated Results
      totalSavings: calculations.totalSavings || 0,
      netBenefit: calculations.netSavings || 0,
      roiPercentage: calculations.roiPercentage || 0,
      annualProgramCost: calculations.annualProgramCost || 0,
      afterTaxProgramCost: calculations.afterTaxProgramCost || 0,
      leadScore: leadScore || 0,
      
      // Savings Breakdown
      absenteeismSavings: absenteeismSavings,
      productivitySavings: productivitySavings,
      healthcareSavings: healthcareSavings,
      turnoverSavings: turnoverSavings
    };
  }
}

export default ReportGenerator;
