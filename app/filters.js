// Pure deal math and filtering for Deal Beacon. Nothing here touches the
// page: views.js renders what these functions return, and app.js wires the
// controls to them. Keeping the rules pure makes them easy to test from the
// console: import the module and call filterDeals with any state.
import { DEALS } from './data.js';

export function discountPct(deal) {
  if (!deal.usual || deal.usual <= 0) return 0;
  return Math.round((1 - deal.sale / deal.usual) * 100);
}

export function savings(deal) {
  return Math.round((deal.usual - deal.sale) * 100) / 100;
}

export function money(amount) {
  return '$' + amount.toFixed(2).replace(/\.00$/, '');
}

export function verdictLabel(verdict) {
  if (verdict === 'true') return 'True deal';
  if (verdict === 'strong') return 'Strong price';
  return 'Routine sale';
}

// The filter state the page controls build: a search string, one category,
// one store, a minimum discount, and whether to show true deals only.
export function emptyFilter() {
  return { q: '', category: 'All', store: 'All', minDiscount: 0, trueOnly: false };
}

export function filterDeals(deals, state) {
  const q = state.q.trim().toLowerCase();
  return deals.filter((deal) => {
    if (state.trueOnly && deal.verdict !== 'true') return false;
    if (state.category !== 'All' && deal.category !== state.category) return false;
    if (state.store !== 'All' && deal.store !== state.store) return false;
    if (discountPct(deal) < state.minDiscount) return false;
    if (q) {
      const hay = (deal.product + ' ' + deal.store + ' ' + deal.category).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

// sortKey: 'discount' (biggest % first), 'savings' (most dollars first),
// 'price-low', 'price-high'. Ties fall back to the bigger saving.
export function sortDeals(deals, sortKey) {
  const rows = deals.slice();
  rows.sort((a, b) => {
    if (sortKey === 'price-low') return a.sale - b.sale || savings(b) - savings(a);
    if (sortKey === 'price-high') return b.sale - a.sale || savings(b) - savings(a);
    if (sortKey === 'savings') return savings(b) - savings(a);
    return discountPct(b) - discountPct(a) || savings(b) - savings(a);
  });
  return rows;
}

export function findDeal(id) {
  return DEALS.find((deal) => deal.id === id) || null;
}

export function stats(deals) {
  const total = deals.reduce((sum, deal) => sum + savings(deal), 0);
  const best = deals.reduce((top, deal) => (discountPct(deal) > discountPct(top) ? deal : top), deals[0]);
  const trueCount = deals.filter((deal) => deal.verdict === 'true').length;
  return { count: deals.length, totalSavings: Math.round(total), best, trueCount };
}
