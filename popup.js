const currencySymbols = Object.fromEntries(currencyList.map(c => [c.code, c.symbol]));

const localeMap = {
  ARS: 'es-AR', AUD: 'en-AU', BRL: 'pt-BR', CAD: 'en-CA', CHF: 'de-CH',
  CLP: 'es-CL', CNY: 'zh-CN', COP: 'es-CO', CZK: 'cs-CZ', EGP: 'ar-EG',
  EUR: 'de-DE', GBP: 'en-GB', HKD: 'en-HK', HUF: 'hu-HU', IDR: 'id-ID',
  INR: 'en-IN', JPY: 'ja-JP', KRW: 'ko-KR', MXN: 'es-MX', MYR: 'ms-MY',
  NOK: 'nb-NO', NZD: 'en-NZ', PEN: 'es-PE', PHP: 'en-PH', PLN: 'pl-PL',
  RON: 'ro-RO', SEK: 'sv-SE', SGD: 'en-SG', THB: 'th-TH', TRY: 'tr-TR',
  USD: 'en-US', UYU: 'es-UY', VND: 'vi-VN', ZAR: 'en-ZA'
};

const fractionDigitsConfig = { JPY: 0, KRW: 0, CLP: 0, VND: 0 };

let lastConversion = null;

function formatCurrency(value, currencyCode) {
  const locale = localeMap[currencyCode] || 'en-US';
  const digits = fractionDigitsConfig[currencyCode] !== undefined ? fractionDigitsConfig[currencyCode] : 2;
  return value.toLocaleString(locale, {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits
  });
}

async function fetchExchangeRate(from, to) {
  const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
  const data = await response.json();
  if (!data.rates || !data.rates[to]) {
    throw new Error('Taxa não encontrada');
  }
  return data.rates[to];
}

async function convert() {
  const amountStr = document.getElementById('amount').value.replace(',', '.');
  const from = document.getElementById('fromCurrency').value;
  const to = document.getElementById('toCurrency').value;
  const resultDiv = document.getElementById('result');
  const saveBtn = document.getElementById('saveBtn');

  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amountStr.trim() === '') {
    resultDiv.textContent = '';
    resultDiv.classList.add('error');
    saveBtn.disabled = true;
    lastConversion = null;
    return;
  }
  resultDiv.classList.remove('error');

  if (from === to) {
    const symbol = currencySymbols[from] || '';
    const formatted = formatCurrency(amount, from);
    resultDiv.textContent = `${symbol} ${formatted}`;
    lastConversion = {
      amount,
      from,
      to,
      fromSymbol: currencySymbols[from],
      toSymbol: currencySymbols[to],
      fromFormatted: formatted,
      toFormatted: formatted
    };
    saveBtn.disabled = false;
    return;
  }

  try {
    const rate = await fetchExchangeRate(from, to);
    const converted = amount * rate;
    const fromFormatted = formatCurrency(amount, from);
    const toFormatted = formatCurrency(converted, to);
    const symbol = currencySymbols[to] || '';
    resultDiv.textContent = `${symbol} ${toFormatted}`;

    lastConversion = {
      amount,
      from,
      to,
      fromSymbol: currencySymbols[from],
      toSymbol: currencySymbols[to],
      fromFormatted,
      toFormatted
    };
    saveBtn.disabled = false;
  } catch (error) {
    resultDiv.textContent = 'Erro ao obter cotação';
    resultDiv.classList.add('error');
    saveBtn.disabled = true;
    lastConversion = null;
    console.error(error);
  }
}

async function saveConversion() {
  if (!lastConversion) return;

  const entry = {
    fromText: `${lastConversion.fromSymbol} ${lastConversion.fromFormatted}`,
    toText: `${lastConversion.toSymbol} ${lastConversion.toFormatted}`,
    timestamp: Date.now()
  };

  chrome.storage.local.get({ history: [] }, (data) => {
    let history = data.history;
    history.unshift(entry);
    if (history.length > 5) history = history.slice(0, 5);
    chrome.storage.local.set({ history }, () => {
      renderHistory(history);
    });
  });
}

function deleteHistoryItem(index) {
  chrome.storage.local.get({ history: [] }, (data) => {
    let history = data.history;
    history.splice(index, 1);
    chrome.storage.local.set({ history }, () => {
      renderHistory(history);
    });
  });
}

function renderHistory(history) {
  const list = document.getElementById('historyList');
  list.innerHTML = '';

  if (!history || history.length === 0) {
    list.innerHTML = '<li style="color:#888; text-align:center;">Nenhuma cotação salva</li>';
    return;
  }

  history.forEach((item, index) => {
    const li = document.createElement('li');
    
    const span = document.createElement('span');
    span.className = 'history-item';
    span.textContent = `${item.fromText} → ${item.toText}`;
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'delete-btn';
    deleteBtn.innerHTML = '✕';
    deleteBtn.title = 'Remover';
    deleteBtn.addEventListener('click', () => deleteHistoryItem(index));

    li.appendChild(span);
    li.appendChild(deleteBtn);
    list.appendChild(li);
  });
}

function savePreferences() {
  chrome.storage.sync.set({
    fromCurrency: document.getElementById('fromCurrency').value,
    toCurrency: document.getElementById('toCurrency').value
  });
}

function populateSelects() {
  const fromSelect = document.getElementById('fromCurrency');
  const toSelect = document.getElementById('toCurrency');

  currencyList.forEach(({ code, name, symbol }) => {
    const text = `${name} (${symbol})`;
    fromSelect.add(new Option(text, code));
    toSelect.add(new Option(text, code));
  });

  fromSelect.value = 'BRL';
  toSelect.value = 'USD';
}

function restorePreferences() {
  chrome.storage.sync.get(['fromCurrency', 'toCurrency'], (data) => {
    if (data.fromCurrency) document.getElementById('fromCurrency').value = data.fromCurrency;
    if (data.toCurrency) document.getElementById('toCurrency').value = data.toCurrency;
  });
}

function loadHistory() {
  chrome.storage.local.get({ history: [] }, (data) => {
    renderHistory(data.history);
  });
}

document.addEventListener('DOMContentLoaded', () => {
  populateSelects();
  restorePreferences();
  loadHistory();

  document.getElementById('amount').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') convert();
  });

  document.getElementById('fromCurrency').addEventListener('change', () => {
    savePreferences();
    convert();
  });

  document.getElementById('toCurrency').addEventListener('change', () => {
    savePreferences();
    convert();
  });

  let debounceTimer;
  document.getElementById('amount').addEventListener('input', () => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(convert, 500);
  });

  document.getElementById('saveBtn').addEventListener('click', saveConversion);
});