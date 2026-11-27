// Deal Beacon's controller: reads the hash route, keeps the filter state,
// and re-renders the page. Routes are '#/' for the deal list and
// '#/deal/<id>' for one deal's page. Everything runs from the files in app/:
// no request leaves the browser.
import { CATEGORIES, CHECKED_AT, CHECKED_NOTE, DEALS, STORES } from './data.js';
import { emptyFilter, filterDeals, findDeal, sortDeals } from './filters.js';
import { detailView, listView, statsBar } from './views.js';

const main = document.getElementById('main');
const countLine = document.getElementById('count-line');
const searchBox = document.getElementById('search');
const categoryBox = document.getElementById('category');
const storeBox = document.getElementById('store');
const discountBox = document.getElementById('min-discount');
const discountLabel = document.getElementById('min-discount-label');
const sortBox = document.getElementById('sort');
const trueOnlyBox = document.getElementById('true-only');
const controls = document.getElementById('controls');

const state = emptyFilter();
let sortKey = 'discount';

function fillSelect(box, values) {
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    box.appendChild(option);
  });
}

function readState() {
  state.q = searchBox.value;
  state.category = categoryBox.value;
  state.store = storeBox.value;
  state.minDiscount = Number(discountBox.value);
  state.trueOnly = trueOnlyBox.checked;
  sortKey = sortBox.value;
  discountLabel.textContent = state.minDiscount === 0 ? 'Any discount' : state.minDiscount + '% off or more';
}

function render() {
  readState();
  const hash = window.location.hash || '#/';
  const match = hash.match(/^#\/deal\/([\w-]+)$/);
  if (match) {
    const deal = findDeal(match[1]);
    controls.hidden = true;
    if (!deal) {
      main.innerHTML = '<p class="empty">That deal is not on the list. <a href="#/">Back to all deals</a>.</p>';
      countLine.textContent = '';
    } else {
      main.innerHTML = detailView(deal);
      countLine.textContent = deal.product + ' at ' + deal.store;
      document.title = deal.product + ' — Deal Beacon';
    }
  } else {
    controls.hidden = false;
    const rows = sortDeals(filterDeals(DEALS, state), sortKey);
    main.innerHTML = statsBar(DEALS) + listView(rows);
    countLine.textContent =
      rows.length + ' of ' + DEALS.length + ' deals shown. Prices checked ' + CHECKED_AT + '.';
    document.title = 'Deal Beacon — Black Friday 2026 deals, checked';
  }
  // The screenshot helper waits for this flag before it captures the page.
  window.__shotReady = true;
}

fillSelect(categoryBox, CATEGORIES);
fillSelect(storeBox, STORES);
searchBox.addEventListener('input', render);
categoryBox.addEventListener('change', render);
storeBox.addEventListener('change', render);
discountBox.addEventListener('input', render);
sortBox.addEventListener('change', render);
trueOnlyBox.addEventListener('change', render);
window.addEventListener('hashchange', render);

// A screenshot can ask for a filtered view with a query on the hash:
// '#/?store=Target&true=1' applies the filters, then shows the list.
function applyHashQuery() {
  const query = (window.location.hash.split('?')[1] || '');
  const params = new URLSearchParams(query);
  if (params.get('store')) storeBox.value = params.get('store');
  if (params.get('category')) categoryBox.value = params.get('category');
  if (params.get('min')) discountBox.value = params.get('min');
  if (params.get('sort')) sortBox.value = params.get('sort');
  if (params.get('true') === '1') trueOnlyBox.checked = true;
  if (params.get('q')) searchBox.value = params.get('q');
}

applyHashQuery();
render();
