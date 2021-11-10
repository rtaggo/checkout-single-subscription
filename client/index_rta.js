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

const fetch_config = () => {
  /* Fetch prices and update the form */
  fetch('/config')
    .then((r) => r.json())
    .then((data) => {
      $('#plan-list')
        .empty()
        .append(
          $(`
    <fieldset class="slds-form-element">
      <legend class="slds-form-element__legend slds-form-element__label">Select a plan</legend>
      <div class="slds-form-element__control">
        <div class="slds-visual-picker slds-visual-picker_medium">
            <input type="radio" id="freemium_plan" value="freemium_plan" name="product_price_id" />
            <label for="freemium_plan">
              <span class="slds-visual-picker__figure slds-visual-picker__text slds-align_absolute-center">
                <span>
                  <span class="slds-text-heading_large">Free</span>
                  <span class="slds-text-title">&nbsp;</span>
                </span>
              </span>
              <span class="slds-visual-picker__body">
                <span class="slds-text-heading_small">Freemium</span>
                <span class="slds-text-title">Easypoint freemium plan</span>
              </span>
              <span class="slds-icon_container slds-visual-picker__text-check">
                <svg class="slds-icon slds-icon-text-check slds-icon_x-small" aria-hidden="true">
                  <use xlink:href="/css/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
                </svg>
              </span>
            </label>
          </div>
    ${data.prices
      .map((price) => {
        return `
        <div class="slds-visual-picker slds-visual-picker_medium">
          <input type="radio" id="${price.id}" value="${price.id}" name="product_price_id" />
          <label for="${price.id}">
            <span class="slds-visual-picker__figure slds-visual-picker__text slds-align_absolute-center">
              <span>
                <span class="slds-text-heading_large">${format_currency(price.unit_amount / 100, price.currency)}</span>
                <span class="slds-text-title">per ${price.recurring.interval}</span>
              </span>
            </span>
            <span class="slds-visual-picker__body">
              <span class="slds-text-heading_small">${price.product.name}</span>
              <span class="slds-text-title">${price.product.description}</span>
            </span>
            <span class="slds-icon_container slds-visual-picker__text-check">
              <svg class="slds-icon slds-icon-text-check slds-icon_x-small" aria-hidden="true">
                <use xlink:href="/css/slds/assets/icons/utility-sprite/svg/symbols.svg#check"></use>
              </svg>
            </span>
          </label>
        </div>
      `;
      })
      .join('')}
        </div>
      </fieldset>
    `)
        );
      setuplisteners();
      fetch_user_subscriptions();
    });
};

let subscriptions_data = [];
let current_subscription = {
  plan: {
    id: 'freemium_plan',
  },
};
const fetch_user_subscriptions = async () => {
  const { subscriptions } = await fetch('/subscriptions').then((r) => r.json());
  subscriptions_data = subscriptions.data.filter((s) => s.status === 'active');
  if (subscriptions_data.length === 0) {
    $('#freemium_plan').attr('checked', true);
    return;
  }
  const sub = subscriptions_data[0];
  $(`#${sub.plan.id}`).attr('checked', true);
  current_subscription = sub;

  debugger;
};

const setuplisteners = () => {
  $('#actions-buttons .slds-button')
    .on('click', (e) => {
      const action = $(e.currentTarget).data('action');
      if (action === 'cancel') {
        alert('TODO: back to profile page');
        return;
      }
      check_subscription_changed($('#plan-list input:checked').val());
    })
    .attr('disabled', false);
};

const check_subscription_changed = async (priceId) => {
  if (priceId !== current_subscription.plan.id) {
    if (current_subscription.plan.id !== 'freemium_plan') {
      const { subscription } = await fetch('/cancel-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subscriptionId: current_subscription.id,
        }),
      }).then((response) => response.json());
      debugger;
    }
    if (priceId === 'freemium_plan') {
      debugger;
      /**
       * TODO:
       * - clear previous subscription
       */
      return;
    }
    post_checkout(priceId);
  }
};

const post_checkout = (priceId) => {
  const submit_form = $(`
  <form action="/create-checkout-session" method="POST">
    <input type="hidden" id="basicPrice" name="priceId" value="${priceId}"/>
  </form>`);
  $('body').append(submit_form);
  submit_form.submit();
};

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

fetch_config();
