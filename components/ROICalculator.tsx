'use client';

import React, { useState } from 'react';
import { Download, Mail, Phone, Building, Users, Calculator, TrendingUp, FileText, CheckCircle, AlertCircle, Star, Shield, Clock, Award } from 'lucide-react';

interface CalculatorData {
  employees: string;
  salary: string;
  sickDays: string;
  turnoverRate: string;
  healthcareCost: string;
  currentWellnessCost: string;
}

interface ContactData {
  fullName: string;
  workEmail: string;
  companyName: string;
  jobTitle: string;
  companySize: string;
  industry: string;
  currentInitiatives: string;
  timeline: string;
  phone: string;
}

interface Calculations {
  currentCosts: {
    sickDays: number;
    turnover: number;
    healthcare: number;
    productivity: number;
  };
  projectedSavings: {
    sickDaysReduction: number;
    turnoverReduction: number;
    healthcareReduction: number;
    productivityGain: number;
  };
  annualProgramCost: number;
  afterTaxProgramCost: number;
  totalCurrentCosts: number;
  totalSavings: number;
  netSavings: number;
  roiPercentage: number;
  paybackMonths: number;
}

const ROICalculator = () => {
  const [step, setStep] = useState<'calculator' | 'results' | 'gate' | 'report'>('calculator');
  const [calculatorData, setCalculatorData] = useState<CalculatorData>({
    employees: '200',
    salary: '55000',
    sickDays: '7',
    turnoverRate: '20',
    healthcareCost: '2500',
    currentWellnessCost: '0'
  });
  
  const [contactData, setContactData] = useState<ContactData>({
    fullName: '',
    workEmail: '',
    companyName: '',
    jobTitle: '',
    companySize: '',
    industry: '',
    currentInitiatives: '',
    timeline: '',
    phone: ''
  });

  const [calculations, setCalculations] = useState<Calculations>({} as Calculations);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Calculate ROI metrics
  const calculateROI = (): Calculations => {
    const employees = parseFloat(calculatorData.employees) || 0;
    const salary = parseFloat(calculatorData.salary) || 35000;
    const sickDays = parseFloat(calculatorData.sickDays) || 7.8;
    const turnoverRate = parseFloat(calculatorData.turnoverRate) || 15;
    const healthcareCost = parseFloat(calculatorData.healthcareCost) || 2000;
    const currentWellnessCost = parseFloat(calculatorData.currentWellnessCost) || 0;

    // Daily salary calculation (260 working days)
    const dailySalary = salary / 260;
    
    // Current costs
    const currentCosts = {
      sickDays: employees * sickDays * dailySalary,
      turnover: employees * (turnoverRate / 100) * (salary * 0.75), // 75% of salary replacement cost
      healthcare: employees * healthcareCost,
      productivity: employees * salary * 0.15 // 15% productivity loss estimate
    };

    // Projected savings (based on industry benchmarks)
    const projectedSavings = {
      sickDaysReduction: currentCosts.sickDays * 0.25, // 25% reduction
      turnoverReduction: currentCosts.turnover * 0.20, // 20% reduction
      healthcareReduction: currentCosts.healthcare * 0.15, // 15% reduction
      productivityGain: currentCosts.productivity * 0.10 // 10% improvement
    };

    // Barn Gym Corporate Wellness Investment (£175 per employee per month)
    const monthlyProgramCost = employees * 175;
    const annualProgramCost = monthlyProgramCost * 12;
    
    const totalCurrentCosts = Object.values(currentCosts).reduce((sum, cost) => sum + cost, 0);
    const totalSavings = Object.values(projectedSavings).reduce((sum, saving) => sum + saving, 0);
    
    // Calculate after-tax cost (25% UK corporation tax relief)
    const afterTaxProgramCost = annualProgramCost * 0.75; // 75% after 25% tax relief
    const netSavings = totalSavings - afterTaxProgramCost;
    const roiPercentage = afterTaxProgramCost > 0 ? ((netSavings / afterTaxProgramCost) * 100) : 0;
    // Monthly costs and savings
    const monthlyProgramCostAfterTax = (monthlyProgramCost * 0.75); // 25% tax relief
    const monthlySavings = totalSavings / 12;
    
    // For monthly payment model: payback = when monthly savings > monthly cost
    // If monthly savings exceed monthly costs, payback is 1 month (immediate positive cash flow)
    // If not, calculate how many months of savings needed to cover monthly cost
    const paybackMonths = monthlySavings >= monthlyProgramCostAfterTax ? 1 : Math.ceil(monthlyProgramCostAfterTax / monthlySavings);

    const results: Calculations = {
      currentCosts,
      projectedSavings,
      annualProgramCost,
      afterTaxProgramCost,
      totalCurrentCosts,
      totalSavings,
      netSavings,
      roiPercentage,
      paybackMonths
    };

    setCalculations(results);
    return results;
  };

  // Handle calculator form submission
  const handleCalculatorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with data:', calculatorData);
    
    // Validate required fields
    if (!calculatorData.employees || !calculatorData.salary || !calculatorData.sickDays || !calculatorData.turnoverRate) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }
    
    const results = calculateROI();
    console.log('Calculated results:', results);
    
    // Scroll to top and show results
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep('results');
  };

  // Handle contact form submission
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Contact form submitted:', contactData);
    
    // Validate required fields
    if (!contactData.fullName || !contactData.workEmail || !contactData.companyName || !contactData.jobTitle) {
      alert('Please fill in all required fields (marked with *)');
      return;
    }
    
    setIsGeneratingReport(true);

    try {
      // Send data to API
      const response = await fetch('/api/submit-lead', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          calculatorData,
          contactData,
          calculations,
          leadScore: calculateLeadScore()
        }),
      });

      if (response.ok) {
        console.log('Lead submitted successfully');
        setStep('report');
      } else {
        console.error('Error submitting lead');
        alert('There was an error submitting your information. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting lead:', error);
      alert('There was an error submitting your information. Please try again.');
    } finally {
      setIsGeneratingReport(false);
    }
  };

  // Lead scoring function
  const calculateLeadScore = (): number => {
    let score = 0;
    
    // Company size scoring
    const sizeScores: { [key: string]: number } = { 
      '50-200': 10, 
      '200-500': 20, 
      '500-1000': 30, 
      '1000+': 40 
    };
    score += sizeScores[contactData.companySize] || 0;
    
    // Timeline scoring
    const timelineScores: { [key: string]: number } = { 
      'Immediate': 40, 
      '3 months': 30, 
      '6 months': 20, 
      'Just researching': 10 
    };
    score += timelineScores[contactData.timeline] || 0;
    
    // Current initiatives scoring (less = more opportunity)
    const initiativeScores: { [key: string]: number } = { 
      'None': 30, 
      'Basic EAP': 20, 
      'Gym Discounts': 15, 
      'Comprehensive': 5 
    };
    score += initiativeScores[contactData.currentInitiatives] || 0;
    
    // ROI potential scoring
    if (calculations.roiPercentage > 300) score += 20;
    else if (calculations.roiPercentage > 200) score += 15;
    else if (calculations.roiPercentage > 100) score += 10;
    
    return Math.min(score, 100);
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-GB', {
      style: 'currency',
      currency: 'GBP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  };

  // Calculator Step
  if (step === 'calculator') {
    return (
      <div className="min-h-screen bg-barn-accent py-barn-section px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://res.cloudinary.com/dlsvq9des/image/upload/v1753153130/Barn_Gym_Logo_transparent_jxvivr.png" 
                alt="Barn Gym Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl font-headline font-bold text-barn-primary mb-3">
              Calculate Your Wellness ROI
            </h1>
            <p className="text-xl font-body text-barn-tertiary max-w-2xl mx-auto mb-6">
              Discover the financial impact of investing in employee wellness. 
              Get a personalized analysis in under 2 minutes.
            </p>
            
            {/* Trust Indicators */}
            <div className="flex flex-wrap justify-center gap-6 mb-6 text-sm text-barn-tertiary">
              <div className="flex items-center">
                <Shield className="w-6 h-6 text-barn-primary mr-2" />
                <span className="font-body">100% Confidential</span>
              </div>
              <div className="flex items-center">
                <Clock className="w-6 h-6 text-barn-primary mr-2" />
                <span className="font-body">2 Minutes to Complete</span>
              </div>
              <div className="flex items-center">
                <Award className="w-6 h-6 text-barn-primary mr-2" />
                <span className="font-body">Industry-Leading Results</span>
              </div>
            </div>
            
            {/* Sweet Spot Guidance */}
            <div className="bg-barn-secondary border border-barn-accent rounded-barn p-barn-content mb-barn-section max-w-3xl mx-auto shadow-barn">
              <h3 className="font-headline font-semibold text-barn-primary mb-3 flex items-center justify-center">
                <Star className="w-6 h-6 mr-2" />
                💡 Best Results For:
              </h3>
              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="text-center bg-barn-accent p-3 rounded-barn">
                  <div className="font-body font-semibold text-barn-tertiary">Mid-Senior Professionals</div>
                  <div className="font-body text-barn-tertiary">Average salary £55k+</div>
                </div>
                <div className="text-center bg-barn-accent p-3 rounded-barn">
                  <div className="font-body font-semibold text-barn-tertiary">Growth Companies</div>
                  <div className="font-body text-barn-tertiary">20%+ annual turnover</div>
                </div>
                <div className="text-center bg-barn-accent p-3 rounded-barn">
                  <div className="font-body font-semibold text-barn-tertiary">Established Teams</div>
                  <div className="font-body text-barn-tertiary">100+ employees</div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculator Form */}
          <div className="barn-content-box">
            <form onSubmit={handleCalculatorSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Number of Employees */}
                <div>
                  <label className="block text-sm font-body font-semibold text-barn-tertiary mb-2">
                    <Users className="inline w-6 h-6 mr-2 text-barn-primary" />
                    Number of Employees *
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={calculatorData.employees}
                    onChange={(e) => setCalculatorData({...calculatorData, employees: e.target.value})}
                    className="w-full px-4 py-3 border border-barn-accent rounded-barn focus:ring-2 focus:ring-barn-primary focus:border-barn-primary transition-all duration-200 font-body"
                    placeholder="e.g., 200 (sweet spot: 100+)"
                  />
                </div>

                {/* Average Annual Salary */}
                <div>
                  <label className="block text-sm font-body font-semibold text-barn-tertiary mb-2">
                    <TrendingUp className="inline w-6 h-6 mr-2 text-barn-primary" />
                    Average Annual Salary (GBP) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={calculatorData.salary}
                    onChange={(e) => setCalculatorData({...calculatorData, salary: e.target.value})}
                    className="w-full px-4 py-3 border border-barn-accent rounded-barn focus:ring-2 focus:ring-barn-primary focus:border-barn-primary transition-all duration-200 font-body"
                    placeholder="e.g., 55000 (sweet spot: £55k+)"
                  />
                </div>

                {/* Annual Sick Days */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <FileText className="inline w-4 h-4 mr-2 text-barn-primary" />
                    Average Annual Sick Days per Employee *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.1"
                    value={calculatorData.sickDays}
                    onChange={(e) => setCalculatorData({...calculatorData, sickDays: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 7.8 (UK average)"
                  />
                </div>

                {/* Turnover Rate */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calculator className="inline w-4 h-4 mr-2 text-barn-primary" />
                    Current Turnover Rate (%) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    max="100"
                    step="0.1"
                    value={calculatorData.turnoverRate}
                    onChange={(e) => setCalculatorData({...calculatorData, turnoverRate: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 20 (sweet spot: 20%+)"
                  />
                </div>

                {/* Healthcare Cost */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Building className="inline w-4 h-4 mr-2 text-barn-primary" />
                    Average Annual Healthcare Cost per Employee (GBP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calculatorData.healthcareCost}
                    onChange={(e) => setCalculatorData({...calculatorData, healthcareCost: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 2500"
                  />
                </div>

                {/* Current Wellness Spending */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    <Calculator className="inline w-4 h-4 mr-2 text-barn-primary" />
                    Current Annual Wellness Spending (GBP)
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={calculatorData.currentWellnessCost}
                    onChange={(e) => setCalculatorData({...calculatorData, currentWellnessCost: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., 5000 (enter 0 if none)"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  className="w-full bg-barn-primary hover:bg-barn-green-600 text-barn-secondary font-headline font-bold py-4 px-8 rounded-barn transition-all duration-200 flex items-center justify-center text-lg shadow-barn hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Calculator className="mr-3 w-6 h-6" />
                  Calculate My Wellness ROI
                </button>
              </div>
            </form>
          </div>

          {/* Trust Indicators */}
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-4">Trusted by companies across the UK</p>
            <div className="flex justify-center space-x-8 text-gray-400 text-xs">
              <span>95% see positive ROI</span>
              <span>Average 100%+ return on investment</span>
              <span>20% higher employee retention</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Results Step (shows immediate value)
  if (step === 'results') {
    return (
      <div className="min-h-screen bg-barn-accent py-barn-section px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header with Results */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <img 
                src="https://res.cloudinary.com/dlsvq9des/image/upload/v1753153130/Barn_Gym_Logo_transparent_jxvivr.png" 
                alt="Barn Gym Logo" 
                className="h-16 w-auto"
              />
            </div>
            <h1 className="text-4xl font-headline font-bold text-barn-primary mb-3">
              Your Wellness ROI Results
            </h1>
            <p className="text-xl font-body text-barn-tertiary max-w-2xl mx-auto mb-6">
              Here's what a corporate wellness program could save your company annually
            </p>
            
            {/* Top CTA for Detailed Report */}
            <div className="bg-gradient-to-r from-barn-primary to-black rounded-2xl p-6 mb-8 text-white shadow-barn">
              <h2 className="text-2xl font-headline font-bold mb-3">
                📊 Want a Detailed Report for Your Board?
              </h2>
              <p className="text-lg font-body mb-4 opacity-90">
                Get a comprehensive business case with industry benchmarks, implementation roadmap, 
                and presentation-ready slides sent directly to your inbox.
              </p>
              <button
                onClick={() => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                  setStep('gate');
                }}
                className="bg-barn-secondary text-barn-primary font-headline font-bold py-3 px-8 rounded-barn hover:bg-barn-accent transition-colors duration-200 inline-flex items-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Mail className="mr-2" />
                Get My Free Detailed Report
              </button>
              <p className="text-sm font-body mt-3 opacity-80">
                Transform these numbers into a presentation your CFO will approve
              </p>
            </div>
          </div>

          {/* ROI Guidance for Low/Negative Results */}
          {calculations.roiPercentage < 10 && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-8 shadow-md">
              <div className="flex items-start">
                <AlertCircle className="w-6 h-6 text-amber-600 mr-3 mt-1 flex-shrink-0" />
                <div>
                  <h3 className="font-semibold text-amber-800 mb-3">💡 Optimize Your Results</h3>
                  <p className="text-amber-700 mb-4">
                    Your current profile shows a lower ROI. Corporate wellness programs work best for companies with:
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <TrendingUp className="w-4 h-4 text-amber-600 mr-2" />
                        <span>Higher average salaries (£55k+)</span>
                      </div>
                      <div className="flex items-center">
                        <Users className="w-4 h-4 text-amber-600 mr-2" />
                        <span>Larger teams (100+ employees)</span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center">
                        <Calculator className="w-4 h-4 text-amber-600 mr-2" />
                        <span>Higher turnover rates (18%+)</span>
                      </div>
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-amber-600 mr-2" />
                        <span>More sick days (8+ per year)</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-amber-700 mt-4 text-sm">
                    <strong>Still interested?</strong> Our detailed report will show you other benefits beyond just ROI, 
                    including improved employee satisfaction, reduced stress, and better company culture.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main Results Grid */}
          <div className="grid lg:grid-cols-2 gap-8 mb-8">
            {/* Left Column: Company Information */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
              <h2 className="text-2xl font-headline font-bold mb-6 text-barn-primary flex items-center">
                <Building className="w-6 h-6 mr-2" />
                Your Company Information
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Number of Employees:</span>
                  <span className="font-semibold">{calculatorData.employees}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Average Annual Salary:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(calculatorData.salary))}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Annual Sick Days per Employee:</span>
                  <span className="font-semibold">{calculatorData.sickDays}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Current Turnover Rate:</span>
                  <span className="font-semibold">{calculatorData.turnoverRate}%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Healthcare Cost per Employee:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(calculatorData.healthcareCost) || 2000)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Current Wellness Spending:</span>
                  <span className="font-semibold">{formatCurrency(parseFloat(calculatorData.currentWellnessCost) || 0)}</span>
                </div>
              </div>
            </div>

            {/* Right Column: Results */}
            <div className="bg-white rounded-2xl shadow-md p-6 border border-green-100">
              <h2 className="text-2xl font-headline font-bold mb-6 text-barn-primary flex items-center">
                <TrendingUp className="w-6 h-6 mr-2" />
                Your Estimated Results
              </h2>
              
              <div className="space-y-4">
                {/* Absenteeism Savings */}
                <div className="bg-barn-secondary rounded-barn p-4 border-l-4 border-barn-primary shadow-sm">
                  <div className="text-2xl font-headline font-bold text-barn-primary mb-2">
                    {formatCurrency(calculations.projectedSavings?.sickDaysReduction || 0)}
                  </div>
                  <h3 className="font-body font-semibold text-barn-tertiary mb-1">Estimated Annual Savings from Reduced Absenteeism</h3>
                  <p className="text-sm font-body text-barn-tertiary">25% reduction in sick days through improved employee wellness</p>
                </div>
                
                {/* Productivity Value */}
                <div className="bg-barn-secondary rounded-barn p-4 border-l-4 border-barn-primary shadow-sm">
                  <div className="text-2xl font-headline font-bold text-barn-primary mb-2">
                    {formatCurrency(calculations.projectedSavings?.productivityGain || 0)}
                  </div>
                  <h3 className="font-body font-semibold text-barn-tertiary mb-1">Estimated Annual Value from Increased Productivity</h3>
                  <p className="text-sm font-body text-barn-tertiary">10% productivity boost from enhanced employee engagement and health</p>
                </div>
                
                {/* Healthcare Savings */}
                <div className="bg-barn-secondary rounded-barn p-4 border-l-4 border-barn-primary shadow-sm">
                  <div className="text-2xl font-headline font-bold text-barn-primary mb-2">
                    {formatCurrency(calculations.projectedSavings?.healthcareReduction || 0)}
                  </div>
                  <h3 className="font-body font-semibold text-barn-tertiary mb-1">Estimated Annual Savings from Reduced Healthcare Costs</h3>
                  <p className="text-sm font-body text-barn-tertiary">15% reduction in healthcare expenses through preventive wellness measures</p>
                </div>
                
                {/* Turnover Savings */}
                <div className="bg-barn-secondary rounded-barn p-4 border-l-4 border-barn-primary shadow-sm">
                  <div className="text-2xl font-headline font-bold text-barn-primary mb-2">
                    {formatCurrency(calculations.projectedSavings?.turnoverReduction || 0)}
                  </div>
                  <h3 className="font-body font-semibold text-barn-tertiary mb-1">Estimated Annual Savings from Reduced Turnover</h3>
                  <p className="text-sm font-body text-barn-tertiary">20% reduction in employee turnover through improved workplace satisfaction</p>
                </div>
                
                {/* Total Impact */}
                <div className="bg-barn-accent rounded-barn p-6 border-2 border-barn-primary shadow-barn">
                  <div className="text-3xl font-headline font-bold mb-2 text-barn-primary">
                    {formatCurrency(calculations.totalSavings || 0)}
                  </div>
                  <h3 className="font-body font-semibold text-barn-tertiary mb-1">Total Estimated Annual Financial Impact</h3>
                  <p className="text-sm font-body text-barn-tertiary mb-3">Combined financial benefit from your comprehensive wellness program</p>
                  
                  {/* Program Cost Breakdown */}
                  <div className="bg-barn-secondary rounded-barn p-4 mb-3 text-sm shadow-inner">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-body text-barn-tertiary">Barn Gym Corporate Wellness Investment:</span>
                      <span className="font-body font-semibold text-barn-tertiary">-{formatCurrency(calculations.annualProgramCost || 0)}</span>
                    </div>
                    <div className="text-xs font-body text-barn-tertiary mb-3">
                      £175* per employee per month ({calculatorData.employees} employees × £175 × 12 months)
                    </div>
                    
                    {/* Tax Deduction Info */}
                    <div className="bg-barn-accent border border-barn-primary rounded-barn p-3 mb-3">
                      <div className="flex justify-between items-center text-xs mb-1">
                        <span className="font-body text-barn-primary">Less: Tax Relief (25% Corp Tax):</span>
                        <span className="font-body font-semibold text-barn-primary">+{formatCurrency((calculations.annualProgramCost || 0) * 0.25)}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs border-t border-barn-primary pt-2 mt-2">
                        <span className="font-body font-semibold text-barn-primary">Net After-Tax Cost:</span>
                        <span className="font-body font-bold text-barn-primary">-{formatCurrency((calculations.annualProgramCost || 0) * 0.75)}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center border-t border-barn-accent pt-3 mt-3">
                      <span className="font-body font-semibold text-barn-tertiary">Net Annual Benefit:</span>
                      <span className="font-body font-bold text-barn-primary">{formatCurrency((calculations.totalSavings || 0) - ((calculations.annualProgramCost || 0) * 0.75))}</span>
                    </div>
                  </div>
                  
                  {/* ROI Percentage */}
                  <div className="mt-3 pt-3 border-t border-barn-accent">
                    <div className="text-lg font-headline font-semibold text-barn-primary">
                      ROI: {calculations.roiPercentage ? Math.round(calculations.roiPercentage) : 0}%
                    </div>
                    <p className="text-xs font-body text-barn-tertiary">Return on Investment after 25% UK Corporation Tax Relief (Net cost: £{Math.round((parseFloat(calculatorData.employees) * 175 * 12) * 0.75).toLocaleString()}/year)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Calculation Benchmarks */}
          <div className="bg-barn-secondary rounded-barn border border-barn-accent p-6 mb-barn-section shadow-barn">
            <h4 className="font-headline font-semibold text-barn-primary mb-4 text-center flex items-center justify-center">
              <Award className="w-6 h-6 mr-2" />
              Calculation Benchmarks
            </h4>
            <div className="grid md:grid-cols-4 gap-4 text-center">
              <div className="bg-barn-accent p-4 rounded-barn">
                <div className="text-2xl font-headline font-bold text-barn-primary">25%</div>
                <div className="text-sm font-body text-barn-tertiary">Absenteeism Reduction</div>
              </div>
              <div className="bg-barn-accent p-4 rounded-barn">
                <div className="text-2xl font-headline font-bold text-barn-primary">10%</div>
                <div className="text-sm font-body text-barn-tertiary">Productivity Increase</div>
              </div>
              <div className="bg-barn-accent p-4 rounded-barn">
                <div className="text-2xl font-headline font-bold text-barn-primary">15%</div>
                <div className="text-sm font-body text-barn-tertiary">Healthcare Cost Reduction</div>
              </div>
              <div className="bg-barn-accent p-4 rounded-barn">
                <div className="text-2xl font-headline font-bold text-barn-primary">20%</div>
                <div className="text-sm font-body text-barn-tertiary">Turnover Reduction</div>
              </div>
            </div>
          </div>

          {/* Gate to Detailed Report */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100 text-center">
            <FileText className="mx-auto w-16 h-16 text-barn-primary mb-4" />
            <h2 className="text-3xl font-headline font-bold text-barn-primary mb-3">
              Want a Detailed Report for Your Board?
            </h2>
            <p className="text-xl text-gray-600 mb-6 max-w-3xl mx-auto">
              These numbers look great, but you'll need more than basic calculations to present to your leadership team. 
              Get a comprehensive analysis with industry benchmarks, implementation roadmap, and presentation-ready slides 
              that will help you build a bulletproof business case.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-3">Your detailed report will include:</h3>
              <div className="grid md:grid-cols-2 gap-4 text-left">
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Executive summary with key findings</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Detailed cost breakdown analysis</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Industry benchmark comparisons</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Peer company case studies</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Implementation timeline & roadmap</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Risk mitigation strategies</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Presentation-ready slides</span>
                  </div>
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-barn-primary mr-2" />
                    <span className="text-sm text-gray-700">Free trial offer details</span>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                window.scrollTo({ top: 0, behavior: 'smooth' });
                setStep('gate');
              }}
              className="bg-gradient-to-r from-barn-primary to-black hover:from-barn-green-600 hover:to-gray-900 text-barn-secondary font-headline font-bold py-4 px-8 rounded-barn transition-all duration-200 flex items-center justify-center text-lg mx-auto shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <Download className="mr-2" />
              Get My Detailed Business Case Report (Free)
            </button>
            
            <p className="text-sm text-gray-500 mt-4">
              Transform these numbers into a presentation your CFO will approve
            </p>
          </div>

          {/* Disclaimer */}
          <div className="mt-6 bg-yellow-50 rounded-lg border border-yellow-200 p-4">
            <p className="text-xs text-gray-600 text-center">
              <strong>Note:</strong> These calculations are estimates based on industry benchmarks and should be used for planning purposes only. 
              Actual results may vary based on your specific circumstances and program implementation. 
              <strong>Corporate wellness programs are typically tax-deductible business expenses.</strong> 
              Consult your accountant for specific tax implications.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Email Gate Step
  if (step === 'gate') {
    return (
      <div className="min-h-screen bg-barn-accent py-barn-section px-4">
        <div className="max-w-4xl mx-auto">
          {/* Results Preview */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4 gradient-text">
              Your Initial Results Are Ready!
            </h1>
            <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
              <div className="text-6xl font-bold text-barn-primary mb-2">
                {formatCurrency(calculations.totalSavings || 0)}
              </div>
              <p className="text-xl text-gray-700 mb-4">Potential Annual Savings</p>
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="text-2xl font-bold text-barn-primary">
                    {calculations.roiPercentage ? Math.round(calculations.roiPercentage) : 0}%
                  </div>
                  <div className="text-sm text-gray-600">ROI</div>
                </div>
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="text-2xl font-bold text-blue-600">
                    {calculations.paybackMonths || 0}
                  </div>
                  <div className="text-sm text-gray-600">Months to Payback</div>
                </div>
                <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                  <div className="text-2xl font-bold text-purple-600">
                    {formatCurrency(calculations.netSavings || 0)}
                  </div>
                  <div className="text-sm text-gray-600">Net Annual Benefit</div>
                </div>
              </div>
            </div>
          </div>

          {/* Email Gate */}
          <div className="bg-white rounded-2xl shadow-xl p-8 border-2 border-green-100">
            <div className="text-center mb-6">
              <FileText className="mx-auto w-16 h-16 text-barn-primary mb-4" />
              <h2 className="text-3xl font-headline font-bold text-barn-primary mb-3">
                Want the Full Analysis?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Get your comprehensive ROI report including cost breakdowns, implementation timeline, 
                and presentation-ready slides for your leadership team.
              </p>
            </div>

            <form onSubmit={handleContactSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactData.fullName}
                    onChange={(e) => setContactData({...contactData, fullName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="John Smith"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Work Email *
                  </label>
                  <input
                    type="email"
                    required
                    value={contactData.workEmail}
                    onChange={(e) => setContactData({...contactData, workEmail: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="john@company.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactData.companyName}
                    onChange={(e) => setContactData({...contactData, companyName: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="Your Company Ltd"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Job Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={contactData.jobTitle}
                    onChange={(e) => setContactData({...contactData, jobTitle: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="HR Director"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Company Size
                  </label>
                  <select
                    value={contactData.companySize}
                    onChange={(e) => setContactData({...contactData, companySize: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select size</option>
                    <option value="50-200">50-200 employees</option>
                    <option value="200-500">200-500 employees</option>
                    <option value="500-1000">500-1000 employees</option>
                    <option value="1000+">1000+ employees</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Implementation Timeline
                  </label>
                  <select
                    value={contactData.timeline}
                    onChange={(e) => setContactData({...contactData, timeline: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select timeline</option>
                    <option value="Immediate">Immediate (within 1 month)</option>
                    <option value="3 months">Within 3 months</option>
                    <option value="6 months">Within 6 months</option>
                    <option value="Just researching">Just researching</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Current Wellness Initiatives
                  </label>
                  <select
                    value={contactData.currentInitiatives}
                    onChange={(e) => setContactData({...contactData, currentInitiatives: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                  >
                    <option value="">Select current initiatives</option>
                    <option value="None">None</option>
                    <option value="Basic EAP">Basic EAP only</option>
                    <option value="Gym Discounts">Gym discounts/memberships</option>
                    <option value="Comprehensive">Comprehensive wellness program</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Industry
                  </label>
                  <input
                    type="text"
                    value={contactData.industry}
                    onChange={(e) => setContactData({...contactData, industry: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                    placeholder="e.g., Technology, Finance, Healthcare"
                  />
                </div>
              </div>

              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isGeneratingReport}
                  className="w-full bg-gradient-to-r from-barn-primary to-black hover:from-barn-green-600 hover:to-gray-900 disabled:bg-gray-400 text-barn-secondary font-headline font-bold py-4 px-8 rounded-barn transition-all duration-200 flex items-center justify-center text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 disabled:transform-none"
                >
                  {isGeneratingReport ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Generating Your Report...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2" />
                      Get My Free ROI Report
                    </>
                  )}
                </button>
              </div>
            </form>

            <p className="text-xs text-gray-500 text-center mt-4">
              We respect your privacy. Your information will only be used to send your report and relevant wellness insights.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Report/Success Step
  if (step === 'report') {
    const leadScore = calculateLeadScore();
    
    return (
      <div className="min-h-screen bg-barn-accent py-barn-section px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <CheckCircle className="mx-auto w-20 h-20 text-barn-primary mb-4" />
            <h1 className="text-4xl font-bold text-gray-900 mb-4 gradient-text">
              Your Report is Ready!
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              We've sent your comprehensive ROI analysis to {contactData.workEmail}
            </p>
          </div>

          {/* Report Summary */}
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-8 border border-green-100">
            <h2 className="text-2xl font-headline font-bold text-barn-primary mb-6 text-center">
              Executive Summary for {contactData.companyName}
            </h2>
            
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-green-50 p-6 rounded-lg text-center border border-green-200">
                <div className="text-3xl font-bold text-barn-primary mb-2">
                  {formatCurrency(calculations.totalSavings)}
                </div>
                <div className="text-sm text-gray-700">Total Annual Savings</div>
              </div>
              
              <div className="bg-blue-50 p-6 rounded-lg text-center border border-blue-200">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {Math.round(calculations.roiPercentage)}%
                </div>
                <div className="text-sm text-gray-700">ROI Percentage</div>
              </div>
              
              <div className="bg-purple-50 p-6 rounded-lg text-center border border-purple-200">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {calculations.paybackMonths}
                </div>
                <div className="text-sm text-gray-700">Months to Payback</div>
              </div>
            </div>

            {/* Call to Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button 
                onClick={() => window.open('https://calendly.com/barn-gym/consultation', '_blank')}
                className="bg-barn-primary hover:bg-barn-green-600 text-barn-secondary font-headline font-bold py-3 px-8 rounded-barn transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Phone className="mr-2 w-4 h-4" />
                Book Free Consultation
              </button>
              
              <button 
                onClick={() => window.open('mailto:guy@barn-gym.com?subject=Free Trial Request - ' + contactData.companyName, '_blank')}
                className="bg-barn-primary hover:bg-barn-green-600 text-barn-secondary font-headline font-bold py-3 px-8 rounded-barn transition-all duration-200 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <Mail className="mr-2 w-4 h-4" />
                Start Free Trial
              </button>
            </div>
          </div>

          {/* What's Next */}
          <div className="bg-white rounded-xl p-6 shadow-md border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4 text-center">What's Next?</h3>
            <div className="grid md:grid-cols-3 gap-4 text-center text-sm">
              <div className="flex flex-col items-center">
                <Mail className="w-8 h-8 text-blue-600 mb-2" />
                <span className="font-medium">Check Your Email</span>
                <span className="text-gray-600">Your detailed report is on its way</span>
              </div>
              <div className="flex flex-col items-center">
                <Phone className="w-8 h-8 text-barn-primary mb-2" />
                <span className="font-medium">Book a Call</span>
                <span className="text-gray-600">Discuss your specific needs</span>
              </div>
              <div className="flex flex-col items-center">
                <Star className="w-8 h-8 text-purple-600 mb-2" />
                <span className="font-medium">Start Your Trial</span>
                <span className="text-gray-600">Experience the benefits firsthand</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default ROICalculator;
