const usd = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' });
const compact = new Intl.NumberFormat('en-US', { notation: 'compact', maximumFractionDigits: 1 });
const integer = new Intl.NumberFormat('en-US');

export const formatCurrency = (value: number) => usd.format(value);
export const formatCompact = (value: number) => compact.format(value);
export const formatNumber = (value: number) => integer.format(value);
export const formatPercent = (value: number, digits = 1) => `${value.toFixed(digits)}%`;
