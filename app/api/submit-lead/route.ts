import { NextRequest, NextResponse } from 'next/server';
import { ReportGenerator } from '../../../lib/reportGenerator';

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
    
    // Generate and send PDF report as email attachment
    const reportResponse = await generateAndSendPDFReport(data);
    
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
  const ghlApiKey = process.env.GHL_API_KEY || process.env.GHLKEY || process.env.GHL_KEY;
  const locationId = process.env.GHL_LOCATION_ID;
  
  console.log('🔧 Environment check:', {
    hasApiKey: !!ghlApiKey,
    apiKeyLength: ghlApiKey?.length || 0,
    hasLocationId: !!locationId,
    locationIdLength: locationId?.length || 0,
    nodeEnv: process.env.NODE_ENV
  });
  
  if (!ghlApiKey || !locationId) {
    console.log('❌ GHL API key or location ID not configured - skipping CRM submission');
    return { success: false, message: 'GHL API key or location ID not configured' };
  }

  try {
    // GHL Contact Creation with correct API format - properly split the full name
    const nameParts = data.contactData.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';
    
    console.log('✅ Name processing:', {
      fullName: data.contactData.fullName,
      firstName: firstName,
      lastName: lastName
    });
    
    const contactPayload = {
      firstName: firstName,
      lastName: lastName,
      email: data.contactData.workEmail,
      phone: data.contactData.phone || '',
      companyName: data.contactData.companyName,
      locationId: locationId,
      source: 'ROI Calculator',
      tags: [
        'ROI Calculator Lead',
        `Timeline: ${data.contactData.timeline}`,
        `Company Size: ${data.contactData.companySize}`,
        `Lead Score: ${data.leadScore}`,
        `ROI: ${Math.round(data.calculations.roiPercentage)}%`
      ]
    };

    console.log('Creating GHL contact with payload:', JSON.stringify(contactPayload, null, 2));

    const response = await fetch('https://services.leadconnectorhq.com/contacts/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ghlApiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });

    const responseText = await response.text();
    console.log('GHL API Response Status:', response.status);
    console.log('GHL API Response:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      const contactId = result.contact?.id;
      console.log('Successfully created GHL contact:', contactId);
      
      // Update contact with custom fields and report (separate API call)
      if (contactId) {
        await updateContactCustomFields(contactId, data, ghlApiKey);
        await generateAndStoreReport(contactId, data, ghlApiKey);
        await createGHLOpportunity(contactId, data, ghlApiKey);
      }
      
      return { success: true, contactId };
    } else if (response.status === 400) {
      // Handle duplicate contact case
      try {
        const errorResult = JSON.parse(responseText);
        if (errorResult.meta?.contactId && errorResult.message?.includes('duplicated contacts')) {
          const existingContactId = errorResult.meta.contactId;
          console.log('📝 Found existing contact, using ID:', existingContactId);
          
          // Update the existing contact with new data
          await updateContactCustomFields(existingContactId, data, ghlApiKey);
          await generateAndStoreReport(existingContactId, data, ghlApiKey);
          
          return { success: true, contactId: existingContactId };
        }
      } catch (parseError) {
        console.error('Error parsing duplicate contact response:', parseError);
      }
      
      console.error('GHL API error:', response.status, responseText);
      return { success: false, error: `${response.status}: ${responseText}` };
    } else {
      console.error('GHL API error:', response.status, responseText);
      return { success: false, error: `${response.status}: ${responseText}` };
    }

  } catch (error) {
    console.error('Error submitting to GHL:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Update contact with custom fields (separate API call)
async function updateContactCustomFields(contactId: string, data: LeadData, apiKey: string) {
  try {
    // Use the actual field IDs we created earlier
    const customFieldsPayload = {
      customFields: [
        // Contact Information (using actual field IDs)
        { id: 'mImncz9WejqJIIYXYqnM', value: data.contactData.jobTitle || '' }, // Job Title
        { id: 'aFc8iFFkvG3I2RPzblGd', value: data.contactData.companySize || '' }, // Company Size
        { id: 'FXmOIo3xSMdQVHR9uDuP', value: data.contactData.timeline || '' }, // Implementation Timeline
        { id: 'pFYlO2CJwJC6sSXCw9ip', value: data.contactData.currentInitiatives || '' }, // Current Wellness Initiatives
        { id: 'FKjEDxH76yY7zQfn7wNZ', value: data.contactData.industry || '' }, // Industry
        
        // Calculator Inputs (using actual field IDs)
        { id: 'eFOo2Vn1TcXqWWNsIscr', value: parseInt(data.calculatorData.employees) || 0 }, // Number of Employees
        { id: 'fjRIicenfLUS4WhwKQkQ', value: parseInt(data.calculatorData.salary) || 0 }, // Average Annual Salary
        { id: '3bAEsY1arNp20SHN0GK1', value: parseFloat(data.calculatorData.sickDays) || 0 }, // Annual Sick Days
        { id: 'lRJryvEdGykHyHSqhhme', value: parseFloat(data.calculatorData.turnoverRate) || 0 }, // Turnover Rate
        { id: 'yX9OmYsGYcMpE6xX7A8Z', value: parseInt(data.calculatorData.healthcareCost) || 0 }, // Healthcare Cost
        { id: 'VBqmiZATGRin87z8ize7', value: parseInt(data.calculatorData.currentWellnessCost) || 0 }, // Current Wellness Spending
        
        // Calculated Results (using actual field IDs)
        { id: 'Z6elcbLfhLy8WuCji8RR', value: Math.round(data.calculations.roiPercentage) || 0 }, // ROI Percentage
        { id: 'byobSrqpMksDkihcgYGx', value: Math.round(data.calculations.totalSavings) || 0 }, // Total Savings
        { id: 'rTkVfyPnic9JMeNQOWcp', value: data.leadScore } // Lead Score
      ]
    };

    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(customFieldsPayload),
    });

    if (response.ok) {
      console.log('Successfully updated contact custom fields');
      return { success: true };
    } else {
      const error = await response.text();
      console.error('Error updating custom fields:', error);
      return { success: false, error };
    }

  } catch (error) {
    console.error('Error updating contact custom fields:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

  // Generate and store both HTML and PDF reports in GHL
  async function generateAndStoreReport(contactId: string, data: LeadData, apiKey: string) {
    try {
      console.log('Generating personalized reports for contact:', contactId);
      
      // Convert lead data to report format
      const reportData = ReportGenerator.convertCalculatorData(data);
      
      // Generate the HTML report
      const reportGenerator = new ReportGenerator();
      const htmlReport = await reportGenerator.generateHTMLReport(reportData);
      
      // Generate PDF slides presentation - simplified approach
      console.log('Generating PDF slides presentation...');
      let pdfFileUrl = '';
      let pdfBase64 = '';
      
      try {
        const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });

        if (pdfResponse.ok) {
          const pdfData = await pdfResponse.json();
          pdfBase64 = pdfData.pdfBuffer;
          console.log('✅ PDF generated successfully, size:', pdfBase64.length);
          
          // Store the base64 data temporarily - we'll create the download URL after contact creation
          // pdfFileUrl will be set after we have the contactId
          console.log('✅ PDF generated successfully, will create download URL after contact creation');
          
        } else {
          console.log('⚠️ PDF generation failed, continuing with HTML only');
        }
      } catch (pdfError) {
        console.log('⚠️ PDF generation error:', pdfError);
      }
      
      // Also generate a text summary for fallback
      const textSummary = reportGenerator.generateTextSummary(reportData);
      
      console.log('Reports generated successfully, storing in GHL...');
      
      // If we have PDF data, create the download URL now that we have contactId
      if (pdfBase64) {
        pdfFileUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/download-pdf/${contactId}`;
        console.log('✅ PDF download URL created:', pdfFileUrl);
      }
      
      // Store both reports in custom fields
      const reportPayload = {
        customFields: [
          { id: 'WvbSUCIDJck8uLSxPkx9', value: htmlReport }, // Generated ROI Report HTML field
          ...(pdfFileUrl ? [{ id: 'sE3ZtfgHJQGykYeQ9fMi', value: pdfFileUrl }] : []) // PDF download URL field (roi_report_pdf_url)
        ]
      };

      const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Version': '2021-07-28',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reportPayload),
      });

      if (response.ok) {
        console.log('Successfully stored personalized reports in GHL');
        return { 
          success: true, 
          htmlReportLength: htmlReport.length,
          pdfGenerated: !!pdfFileUrl,
          pdfFileUrl: pdfFileUrl,
          pdfSize: pdfBase64.length,
          textSummaryLength: textSummary.length 
        };
      } else {
        const error = await response.text();
        console.error('Error storing reports in GHL:', error);
        return { success: false, error };
      }

    } catch (error) {
      console.error('Error generating/storing reports:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// Upload PDF file to GHL Media Library
async function uploadPDFToGHL(pdfBase64: string, fileName: string, contactId: string, apiKey: string) {
  try {
    console.log('📤 Uploading PDF to GHL Media Library:', fileName);
    
    // Convert base64 to buffer
    const pdfBuffer = Buffer.from(pdfBase64, 'base64');
    
    // For Node.js environment, we need to use a different approach for FormData
    const FormData = require('form-data');
    const formData = new FormData();
    
    // Add the PDF file as a buffer
    formData.append('file', pdfBuffer, {
      filename: fileName,
      contentType: 'application/pdf'
    });
    
    // Add the location ID (required for GHL media upload)
    const locationId = process.env.GHL_LOCATION_ID;
    if (locationId) {
      formData.append('locationId', locationId);
    }

    const response = await fetch('https://services.leadconnectorhq.com/medias/upload-file', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
        ...formData.getHeaders(), // Important for multipart/form-data
      },
      body: formData,
    });

    const responseText = await response.text();
    console.log('GHL Media Upload Response Status:', response.status);
    console.log('GHL Media Upload Response:', responseText);

    if (response.ok) {
      const result = JSON.parse(responseText);
      console.log('✅ PDF uploaded to GHL Media Library successfully');
      
      return { 
        success: true, 
        fileUrl: result.url || result.fileUrl || result.downloadUrl || result.presignedUrl,
        fileId: result.id || result.fileId || result.mediaId,
        fileName: fileName
      };
    } else {
      console.error('❌ Error uploading PDF to GHL:', response.status, responseText);
      return { success: false, error: `${response.status}: ${responseText}` };
    }

  } catch (error) {
    console.error('❌ Error in uploadPDFToGHL:', error);
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

    const response = await fetch('https://services.leadconnectorhq.com/opportunities/', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
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

  // Generate and send PDF report via email
  async function generateAndSendPDFReport(data: LeadData) {
    try {
      console.log('Generating and sending PDF report to:', data.contactData.workEmail);
      
      // Generate PDF
      const pdfResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/generate-pdf`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!pdfResponse.ok) {
        console.log('⚠️ PDF generation failed, skipping email');
        return { success: false, message: 'PDF generation failed' };
      }

      const pdfData = await pdfResponse.json();
      
      // Send email with PDF attachment using a simple email service
      const emailResponse = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/send-pdf-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: data.contactData.workEmail,
          subject: `Your Corporate Wellness ROI Analysis - ${data.contactData.companyName}`,
          pdfBuffer: pdfData.pdfBuffer,
          contactData: data.contactData,
          calculations: data.calculations
        }),
      });

      if (emailResponse.ok) {
        console.log('✅ PDF report sent successfully to:', data.contactData.workEmail);
        return { success: true };
      } else {
        console.log('⚠️ Email sending failed, PDF generated but not sent');
        return { success: false, message: 'Email sending failed' };
      }

    } catch (error) {
      console.error('Error generating/sending PDF report:', error);
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
