import { NextRequest, NextResponse } from 'next/server';
import { generateBrandedROIReport } from '../../../lib/pdfGenerator';

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

  } catch (error: any) {
    console.error('💥 PDF generation error:', error);
    return NextResponse.json(
      { success: false, message: 'Error generating PDF', error: error.message },
      { status: 500 }
    );
  }
}