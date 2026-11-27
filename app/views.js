// Page HTML for Deal Beacon, built as strings from the deal data. The list
// view shows one card per deal with its prices, discount, verdict badge and
// store link; the detail view shows one deal whole, with its source and the
// time its price was checked. No markup is fetched from anywhere else.
import { CHECKED_AT, CHECKED_NOTE } from './data.js';
import { discountPct, money, savings, stats, verdictLabel } from './filters.js';

function esc(text) {
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function statsBar(deals) {
  const s = stats(deals);
  return (
    '<section class="stats" aria-label="Sale summary">' +
    '<div><strong>' + s.count + '</strong><span>deals checked</span></div>' +
    '<div><strong>' + s.trueCount + '</strong><span>true deals</span></div>' +
    '<div><strong>$' + s.totalSavings.toLocaleString('en-US') + '</strong><span>total savings</span></div>' +
    '<div><strong>' + discountPct(s.best) + '% off</strong><span>best cut: ' + esc(s.best.product) + '</span></div>' +
    '</section>'
  );
}

export function dealCard(deal) {
  const pct = discountPct(deal);
  return (
    '<article class="card verdict-' + deal.verdict + '">' +
    '<div class="card-top"><span class="badge">' + verdictLabel(deal.verdict) + '</span>' +
    '<span class="pct">-' + pct + '%</span></div>' +
    '<h3><a href="#/deal/' + deal.id + '">' + esc(deal.product) + '</a></h3>' +
    '<p class="meta">' + esc(deal.category) + ' &middot; ' + esc(deal.store) + '</p>' +
    '<p class="prices"><span class="sale">' + money(deal.sale) + '</span> ' +
    '<span class="usual">' + money(deal.usual) + '</span> ' +
    '<span class="save">save ' + money(savings(deal)) + '</span></p>' +
    '<p class="note">' + esc(deal.note) + '</p>' +
    '<p class="card-foot"><a class="store-link" href="' + esc(deal.link) + '" target="_blank" rel="noopener">View at ' + esc(deal.store) + ' &rarr;</a>' +
    '<span class="checked">Checked ' + esc(CHECKED_AT) + '</span></p>' +
    '</article>'
  );
}

export function listView(deals) {
  if (!deals.length) {
    return '<p class="empty">No deals match those filters. Clear the search or lower the minimum discount.</p>';
  }
  return '<div class="grid">' + deals.map(dealCard).join('') + '</div>';
}

export function detailView(deal) {
  const pct = discountPct(deal);
  return (
    '<article class="detail verdict-' + deal.verdict + '">' +
    '<p><a class="back" href="#/">&larr; All deals</a></p>' +
    '<span class="badge big">' + verdictLabel(deal.verdict) + '</span>' +
    '<h2>' + esc(deal.product) + '</h2>' +
    '<p class="meta">' + esc(deal.category) + ' &middot; ' + esc(deal.store) + '</p>' +
    '<p class="prices big"><span class="sale">' + money(deal.sale) + '</span> ' +
    '<span class="usual">' + money(deal.usual) + '</span></p>' +
    '<p class="save-line">You save ' + money(savings(deal)) + ' (' + pct + '% off the usual price).</p>' +
    '<p class="note">' + esc(deal.note) + '</p>' +
    '<dl class="facts">' +
    '<dt>Store</dt><dd>' + esc(deal.store) + '</dd>' +
    '<dt>Sale price</dt><dd>' + money(deal.sale) + '</dd>' +
    '<dt>Usual price</dt><dd>' + money(deal.usual) + '</dd>' +
    '<dt>Discount</dt><dd>' + pct + '%</dd>' +
    '<dt>Price checked</dt><dd>' + esc(CHECKED_AT) + '</dd>' +
    '<dt>Price source</dt><dd><a href="' + esc(deal.sourceUrl) + '" target="_blank" rel="noopener">' + esc(deal.source) + '</a></dd>' +
    '</dl>' +
    '<p><a class="store-link big" href="' + esc(deal.link) + '" target="_blank" rel="noopener">View this deal at ' + esc(deal.store) + ' &rarr;</a></p>' +
    '<p class="fine">' + esc(CHECKED_NOTE) + '</p>' +
    '</article>'
  );
}
