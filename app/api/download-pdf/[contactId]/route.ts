import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: { contactId: string } }
) {
  try {
    const contactId = params.contactId;
    const apiKey = process.env.GHL_API_KEY;

    if (!apiKey || !contactId) {
      return new NextResponse('Missing parameters', { status: 400 });
    }

    // Get the contact to retrieve the PDF data
    const response = await fetch(`https://services.leadconnectorhq.com/contacts/${contactId}`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Version': '2021-07-28',
      },
    });

    if (!response.ok) {
      return new NextResponse('Contact not found', { status: 404 });
    }

    const contactData = await response.json();
    
    // Regenerate PDF from contact data instead of storing it
    console.log('Regenerating PDF for contact:', contactId);
    
    // Extract the data needed to regenerate the PDF
    const customFields = contactData.contact.customFields;
    const employees = customFields?.find((f: any) => f.id === 'eFOo2Vn1TcXqWWNsIscr')?.value || 100;
    const salary = customFields?.find((f: any) => f.id === 'fjRIicenfLUS4WhwKQkQ')?.value || 50000;
    const sickDays = customFields?.find((f: any) => f.id === '3bAEsY1arNp20SHN0GK1')?.value || 7;
    const turnoverRate = customFields?.find((f: any) => f.id === 'lRJryvEdGykHyHSqhhme')?.value || 15;
    const healthcareCost = customFields?.find((f: any) => f.id === 'yX9OmYsGYcMpE6xX7A8Z')?.value || 2000;
    const totalSavings = customFields?.find((f: any) => f.id === 'byobSrqpMksDkihcgYGx')?.value || 100000;
    const roiPercentage = customFields?.find((f: any) => f.id === 'Z6elcbLfhLy8WuCji8RR')?.value || 50;
    const leadScore = customFields?.find((f: any) => f.id === 'rTkVfyPnic9JMeNQOWcp')?.value || 50;

    // Create the data structure needed for PDF generation
    const leadData = {
      calculatorData: {
        employees: employees.toString(),
        salary: salary.toString(),
        sickDays: sickDays.toString(),
        turnoverRate: turnoverRate.toString(),
        healthcareCost: healthcareCost.toString(),
        currentWellnessCost: '0'
      },
      contactData: {
        fullName: contactData.contact.firstName + ' ' + (contactData.contact.lastName || ''),
        workEmail: contactData.contact.email,
        companyName: contactData.contact.companyName,
        jobTitle: customFields?.find((f: any) => f.id === 'mImncz9WejqJIIYXYqnM')?.value || 'Manager',
        companySize: customFields?.find((f: any) => f.id === 'aFc8iFFkvG3I2RPzblGd')?.value || '50-200',
        industry: customFields?.find((f: any) => f.id === 'FKjEDxH76yY7zQfn7wNZ')?.value || 'Technology',
        currentInitiatives: customFields?.find((f: any) => f.id === 'pFYlO2CJwJC6sSXCw9ip')?.value || 'None',
        timeline: customFields?.find((f: any) => f.id === 'FXmOIo3xSMdQVHR9uDuP')?.value || 'Immediate',
        phone: contactData.contact.phone || ''
      },
      calculations: {
        totalSavings: totalSavings,
        roiPercentage: roiPercentage,
        netSavings: totalSavings - (parseInt(employees) * 175 * 12 * 0.75),
        paybackMonths: 6,
        annualProgramCost: parseInt(employees) * 175 * 12,
        afterTaxProgramCost: parseInt(employees) * 175 * 12 * 0.75,
        projectedSavings: {
          sickDaysReduction: totalSavings * 0.2,
          turnoverReduction: totalSavings * 0.3,
          healthcareReduction: totalSavings * 0.2,
          productivityGain: totalSavings * 0.3
        }
      },
      leadScore: leadScore
    };

    // Generate PDF directly using the shared utility
    const { generateBrandedROIReport } = await import('../../../../lib/pdfGenerator');
    
    console.log('📄 Generating branded PDF directly...');
    const pdfBuffer = await generateBrandedROIReport(leadData);
    console.log('✅ PDF generated, size:', pdfBuffer.length, 'bytes');

    // Get company name for filename
    const companyName = contactData.contact.companyName || 'Company';
    const safeCompanyName = companyName.replace(/[^a-zA-Z0-9]/g, '_');
    const filename = `${safeCompanyName}_ROI_Analysis.pdf`;

    // Return the PDF file
    return new NextResponse(pdfBuffer as unknown as BodyInit, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
      },
    });

  } catch (error) {
    console.error('Error serving PDF:', error);
    return new NextResponse('Error serving PDF', { status: 500 });
  }
}
