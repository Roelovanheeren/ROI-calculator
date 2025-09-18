import { NextRequest, NextResponse } from 'next/server';

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
  };
  leadScore: number;
}

export async function POST(request: NextRequest) {
  try {
    const data: LeadData = await request.json();
    
    console.log('Received lead submission:', {
      company: data.contactData.companyName,
      contact: data.contactData.fullName,
      email: data.contactData.workEmail,
      leadScore: data.leadScore,
      roi: data.calculations.roiPercentage,
      timeline: data.contactData.timeline
    });

    // TODO: Add GoHighLevel CRM integration
    const ghlResponse = await submitToGHL(data);
    
    // TODO: Generate and send PDF report
    const reportResponse = await generateAndSendReport(data);
    
    // TODO: Add to email nurture sequence
    const emailSequenceResponse = await addToEmailSequence(data);

    return NextResponse.json({ 
      success: true, 
      message: 'Lead submitted successfully',
      ghlResponse,
      reportResponse,
      emailSequenceResponse
    });

  } catch (error) {
    console.error('Error submitting lead:', error);
    return NextResponse.json(
      { success: false, message: 'Error submitting lead' },
      { status: 500 }
    );
  }
}

// GoHighLevel CRM Integration
async function submitToGHL(data: LeadData) {
  const ghlApiKey = process.env.GHL_API_KEY;
  
  if (!ghlApiKey) {
    console.log('GHL API key not configured - skipping CRM submission');
    return { success: false, message: 'GHL API key not configured' };
  }

  try {
    // GHL Contact Creation
    const contactPayload = {
      firstName: data.contactData.fullName.split(' ')[0],
      lastName: data.contactData.fullName.split(' ').slice(1).join(' ') || '',
      email: data.contactData.workEmail,
      phone: data.contactData.phone || '',
      companyName: data.contactData.companyName,
      tags: [
        'ROI Calculator Lead',
        `Timeline: ${data.contactData.timeline}`,
        `Company Size: ${data.contactData.companySize}`,
        `Lead Score: ${data.leadScore}`,
        `ROI: ${Math.round(data.calculations.roiPercentage)}%`
      ],
      customFields: {
        jobTitle: data.contactData.jobTitle,
        industry: data.contactData.industry,
        employees: data.calculatorData.employees,
        currentInitiatives: data.contactData.currentInitiatives,
        calculatedROI: data.calculations.roiPercentage,
        potentialSavings: data.calculations.totalSavings,
        leadScore: data.leadScore,
        programCost: data.calculations.annualProgramCost,
        netBenefit: data.calculations.netSavings
      }
    };

    const response = await fetch('https://rest.gohighlevel.com/v1/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });

    if (response.ok) {
      const contact = await response.json();
      console.log('Successfully created GHL contact:', contact.id);
      
      // Add opportunity/deal
      await createGHLOpportunity(contact.id, data, ghlApiKey);
      
      return { success: true, contactId: contact.id };
    } else {
      const error = await response.text();
      console.error('GHL API error:', error);
      return { success: false, error };
    }

  } catch (error) {
    console.error('Error submitting to GHL:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Create opportunity in GHL
async function createGHLOpportunity(contactId: string, data: LeadData, apiKey: string) {
  try {
    const opportunityPayload = {
      title: `${data.contactData.companyName} - Corporate Wellness Program`,
      contactId: contactId,
      status: 'open',
      monetaryValue: data.calculations.annualProgramCost,
      assignedTo: process.env.GHL_DEFAULT_USER_ID || '',
      pipelineId: process.env.GHL_PIPELINE_ID || '',
      source: 'ROI Calculator',
      notes: `
        Lead Score: ${data.leadScore}/100
        Calculated ROI: ${Math.round(data.calculations.roiPercentage)}%
        Potential Annual Savings: £${data.calculations.totalSavings.toLocaleString()}
        Company Size: ${data.calculatorData.employees} employees
        Timeline: ${data.contactData.timeline}
        Current Initiatives: ${data.contactData.currentInitiatives}
      `
    };

    const response = await fetch('https://rest.gohighlevel.com/v1/opportunities/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(opportunityPayload),
    });

    if (response.ok) {
      const opportunity = await response.json();
      console.log('Successfully created GHL opportunity:', opportunity.id);
      return { success: true, opportunityId: opportunity.id };
    }

  } catch (error) {
    console.error('Error creating GHL opportunity:', error);
  }
}

// Generate and send PDF report
async function generateAndSendReport(data: LeadData) {
  try {
    // Call PDF generation API
    const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (pdfResponse.ok) {
      const { pdfBuffer } = await pdfResponse.json();
      
      // Send email with PDF attachment
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.contactData.workEmail,
          subject: `Your Corporate Wellness ROI Analysis - ${data.contactData.companyName}`,
          pdfBuffer,
          data
        }),
      });

      return { success: emailResponse.ok };
    }

    return { success: false, message: 'PDF generation failed' };

  } catch (error) {
    console.error('Error generating/sending report:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Add to email nurture sequence
async function addToEmailSequence(data: LeadData) {
  try {
    // This would integrate with your email service (SendGrid, Mailgun, etc.)
    // For now, we'll just log it
    console.log('Adding to email sequence:', {
      email: data.contactData.workEmail,
      name: data.contactData.fullName,
      company: data.contactData.companyName,
      leadScore: data.leadScore,
      timeline: data.contactData.timeline
    });

    // TODO: Implement email sequence logic based on lead score and timeline
    let sequenceType = 'standard';
    if (data.leadScore >= 80) {
      sequenceType = 'high-intent';
    } else if (data.leadScore >= 60) {
      sequenceType = 'medium-intent';
    } else {
      sequenceType = 'nurture';
    }

    console.log(`Assigned to ${sequenceType} email sequence`);

    return { success: true, sequenceType };

  } catch (error) {
    console.error('Error adding to email sequence:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
