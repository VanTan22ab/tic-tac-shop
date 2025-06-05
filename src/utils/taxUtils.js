export function calculateTotalCost(costs) {
  // costs có: quantity, price
  return costs.reduce((sum, item) => sum + (item.price || 0), 0);
}

export function calculateTotalRevenue(revenues) {
  // revenues có: quantity, price
  return revenues.reduce((sum, item) => sum + (item.price || 0), 0);
}

export function calculateVatTax(totalRevenue, rate = 0.1) {
  return totalRevenue * rate;
}

export function calculateProfit(totalRevenue, totalCost, vatTax) {
  return totalRevenue - totalCost - vatTax;
}
