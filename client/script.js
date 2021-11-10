const currency_formatters = {
  usd: new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }),
  eur: new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }),
};
const format_currency = (amount, currency) => {
  if (currency_formatters[currency]) {
    return currency_formatters[currency].format(amount);
  }
  return `${amount} ${currency}`;
};

/* Fetch prices and update the form */
fetch('/config')
  .then((r) => r.json())
  .then((data) => {
    $('#plan-list')
      .empty()
      .append(
        $(`
    ${data.prices
      .map((price) => {
        return `
      <section>
        <form action="/create-checkout-session" method="POST">
          <input type="hidden" id="${price.id}" name="priceId" value="${price.id}">          
          <div class="name">${price.product.name}</div>
          <div class="price">${format_currency(price.unit_amount / 100, price.currency)}</div>
          <div class="duration">per ${price.recurring.interval}</div>
          <button id="${price.id}-plan-btn">Select</button>
        </form>
      </section>`;
      })
      .join('')}
    `)
      );
    /*
    const basicPriceInput = document.querySelector('#basicPrice');
    basicPriceInput.value = basicPrice;
    const proPriceInput = document.querySelector('#proPrice');
    proPriceInput.value = proPrice;
    */
  });

// If a fetch error occurs, log it to the console and show it in the UI.
var handleFetchResult = function (result) {
  if (!result.ok) {
    return result
      .json()
      .then(function (json) {
        if (json.error && json.error.message) {
          throw new Error(result.url + ' ' + result.status + ' ' + json.error.message);
        }
      })
      .catch(function (err) {
        showErrorMessage(err);
        throw err;
      });
  }
  return result.json();
};

var showErrorMessage = function (message) {
  var errorEl = document.getElementById('error-message');
  errorEl.textContent = message;
  errorEl.style.display = 'block';
};
