export const formatLakhs = (annualAmount = 0) => {
  if (annualAmount >= 10000000) {
    return `₹${(annualAmount / 10000000).toFixed(2)} Cr`;
  }
  if (annualAmount >= 100000) {
    return `₹${(annualAmount / 100000).toFixed(2)} Lakhs`;
  }
  return `₹${annualAmount.toLocaleString('en-IN')}`;
};

export const getComponentCategory = (componentName = '') => {
  if (componentName.includes('Basic') || componentName.includes('HRA')) {
    return 'Core Fixed';
  }
  if (componentName.includes('Bonus') || componentName.includes('LTA')) {
    return 'Variable Benefits';
  }
  if (componentName.includes('Deduction') || componentName.includes('Tax')) {
    return 'Deductions';
  }
  return 'Allowances';
};
