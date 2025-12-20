export const formatNumber = (amount: number, decimals: number = 2) => {
  return new Intl.NumberFormat("en-US", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(amount);
};
