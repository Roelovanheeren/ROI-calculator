# GHL Setup Instructions for PDF Email Attachments

## Overview
Your ROI Calculator now generates professional PDF slide presentations and uploads them to GHL's Media Library for email attachment.

## How It Works
1. **Form Submitted** → Contact created in GHL with tags and custom fields
2. **PDF Generated** → Professional 4-slide presentation created
3. **PDF Uploaded** → File stored in GHL Media Library
4. **File URL Stored** → PDF file URL saved in contact custom field
5. **Email Triggered** → Your "ROI Calculator Email" template sends with PDF attachment

## Setup Required in GHL

### 1. Create Custom Field for PDF File URL
- Go to **Settings → Custom Fields**
- Create new field:
  - **Name**: "ROI Report PDF URL"
  - **Type**: "Text"
  - **Field Key**: Note down the ID (you'll need this)

### 2. Update Your "ROI Calculator Email" Template
Your existing template needs to reference the uploaded PDF file for attachment.

#### Option A: Automatic Attachment (Recommended)
- Edit your "ROI Calculator Email" template
- In the email builder, click "Add Attachment"
- Instead of uploading a static file, you'll need to reference the dynamic PDF
- Use the custom field with the PDF URL

#### Option B: Download Link in Email
Add this to your email template:
```html
<a href="{{custom.PDF_FILE_URL_FIELD_ID}}" download>
  📎 Download Your ROI Analysis (PDF)
</a>
```

### 3. Workflow Trigger
Ensure your workflow triggers on the tag: **"ROI Calculator Lead"**

## Custom Field IDs Currently Used
- `WvbSUCIDJck8uLSxPkx9` - HTML Report Content
- `TEMP_PDF_URL_FIELD` - PDF File URL (you need to create this and get the real ID)

## Testing
1. Submit the ROI Calculator form
2. Check the terminal logs for:
   - `"📤 Uploading PDF to GHL Media Library"`
   - `"✅ PDF uploaded to GHL Media Library successfully"`
3. Verify in GHL:
   - Contact is created
   - Custom fields are populated
   - PDF file appears in Media Library
   - Email automation triggers

## PDF Content
The generated PDF includes:
- **Slide 1**: Professional cover page + executive summary
- **Slide 2**: Financial breakdown with visual charts
- **Slide 3**: Implementation roadmap and timeline
- **Slide 4**: Next steps and contact information

## File Naming Convention
PDFs are named: `{CompanyName}_ROI_Analysis_{Date}.pdf`
Example: `Apple_ROI_Analysis_2025-09-18.pdf`

## Troubleshooting
- Check GHL API scopes include "Edit Medias" and "View Medias"
- Verify the PDF file URL custom field ID is correct
- Ensure the location ID is set in environment variables
- Check terminal logs for upload errors
