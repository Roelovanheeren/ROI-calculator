// Quick test to check PDF generation
const sampleData = {
  calculatorData: {
    employees: "150",
    salary: "55000",
    sickDays: "7",
    turnoverRate: "15",
    healthcareCost: "2000",
    currentWellnessCost: "0"
  },
  contactData: {
    fullName: "Roelof van Heeren",
    workEmail: "roelof818@gmail.com",
    companyName: "Apple",
    jobTitle: "Manager",
    companySize: "50-200",
    industry: "Technology",
    currentInitiatives: "None",
    timeline: "Immediate",
    phone: ""
  },
  calculations: {
    totalSavings: 127500,
    roiPercentage: 162.75,
    netSavings: 85500,
    annualProgramCost: 36000,
    afterTaxProgramCost: 27000,
    projectedSavings: {
      sickDaysReduction: 31875,
      turnoverReduction: 31875,
      healthcareReduction: 25500,
      productivityGain: 38250
    }
  },
  leadScore: 80
};

console.log('Testing PDF generation with sample data...');
console.log('Data structure:', JSON.stringify(sampleData, null, 2));

// Test the API
fetch('http://localhost:3000/api/generate-pdf', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(sampleData)
})
.then(response => response.json())
.then(data => {
  console.log('API Response:', data);
})
.catch(error => {
  console.error('Error:', error);
});
