import"./responsive-A1jkOC6g.js";import{a as e,i as t,o as n,r,t as i}from"./storage-B7ZZLbK0.js";var a={meat:{label:`Meat`,icon:`🥩`},seafood:{label:`Seafood`,icon:`🐟`},vegetables:{label:`Vegetables`,icon:`🥬`},fruit:{label:`Fruit`,icon:`🍋`},dairy:{label:`Dairy`,icon:`🥛`},condiments:{label:`Condiments`,icon:`🧂`},spices:{label:`Spices`,icon:`🌶️`},pantry:{label:`Pantry`,icon:`🥫`},frozen:{label:`Frozen`,icon:`❄️`},custom:{label:`Other Items`,icon:`🛍️`},other:{label:`Other`,icon:`🛒`}},o={ingredients:[],shopping:new Set,pantry:new Set,customIngredients:{},shoppingMeta:{},search:``,history:[],future:[]};function s(e=``){return String(e).trim().toLowerCase()}function c(e){return s(e).replace(/[^a-z0-9]+/g,`-`).replace(/^-+|-+$/g,``)}function l(){return{shopping:[...o.shopping],pantry:[...o.pantry],customIngredients:structuredClone(o.customIngredients),shoppingMeta:structuredClone(o.shoppingMeta)}}function u(e){o.shopping=new Set(e.shopping),o.pantry=new Set(e.pantry),o.customIngredients=structuredClone(e.customIngredients),o.shoppingMeta=structuredClone(e.shoppingMeta),p(),w()}function d(){o.history.push(l()),o.history.length>30&&o.history.shift(),o.future=[],F()}function f(){o.shopping=new Set(r(i.shopping)),o.pantry=new Set(r(i.pantry)),o.customIngredients=t(i.customIngredients),o.shoppingMeta=t(i.shoppingMeta)}function p(){e(i.shopping,o.shopping),e(i.pantry,o.pantry),n(i.customIngredients,o.customIngredients),n(i.shoppingMeta,o.shoppingMeta)}function m(e){return o.ingredients.find(t=>t.id===e)||(o.customIngredients[e]??null)}function h(e){return o.shoppingMeta[e]??={quantity:``,note:``},o.shoppingMeta[e]}function g(e){let t=s(o.search);if(!t)return!0;let n=h(e.id);return[e.name,e.id,e.category,n.quantity,n.note,...e.aliases??[]].some(e=>s(e).includes(t))}function _(){return[...o.shopping].map(m).filter(Boolean).filter(g)}function v(e){return e.reduce((e,t)=>{let n=t.category||`other`;return e[n]??=[],e[n].push(t),e},{})}function y(e){let t=o.pantry.has(e.id),n=h(e.id);return`
    <article
      class="
        shopping-row
        ${t?`is-owned`:``}
      "
      data-shopping-id="${e.id}"
    >

      <label
        class="shopping-row__have"
        title="I have this"
      >

        <input
          type="checkbox"
          data-have-ingredient="${e.id}"
          ${t?`checked`:``}
        >

        <span
          class="shopping-row__checkbox"
        >
          ✓
        </span>

      </label>


      <div
        class="shopping-row__content"
      >

        <div
          class="shopping-row__heading"
        >

          <strong
            class="shopping-row__name"
          >
            ${e.name}
          </strong>

          <span
            class="
              shopping-row__status
              ${t?`is-owned`:``}
            "
          >
            ${t?`Have`:`Need`}
          </span>

        </div>


        <div
          class="shopping-row__details"
        >

          <label
            class="shopping-detail-field"
          >

            <span>
              Qty
            </span>

            <input
              type="text"
              value="${b(n.quantity)}"
              placeholder="1"
              maxlength="30"
              data-shopping-quantity="${e.id}"
            >

          </label>


          <label
            class="
              shopping-detail-field
              shopping-detail-field--note
            "
          >

            <span>
              Note
            </span>

            <input
              type="text"
              value="${b(n.note)}"
              placeholder="Optional"
              maxlength="100"
              data-shopping-note="${e.id}"
            >

          </label>

        </div>

      </div>


      <button
        class="shopping-row__remove"
        type="button"
        data-remove-shopping="${e.id}"
        aria-label="Remove ${e.name}"
      >
        ×
      </button>

    </article>
  `}function b(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`"`,`&quot;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`)}function x(e,t){let n=a[e]??a.other;return`
    <section
      class="shopping-category"
    >

      <div
        class="shopping-category__header"
      >

        <span
          class="shopping-category__icon"
        >
          ${n.icon}
        </span>

        <strong>
          ${n.label}
        </strong>

        <span
          class="shopping-category__count"
        >
          ${t.length}
        </span>

      </div>


      <div
        class="shopping-category__items"
      >
        ${t.map(y).join(``)}
      </div>

    </section>
  `}function S(){let e=document.querySelector(`#shoppingList`);if(!e)return;let t=_();if(t.length===0){let t=o.shopping.size>0;e.innerHTML=`
      <div class="empty-state">

        <div
          class="empty-state__icon"
        >
          ${t?`🔎`:`🛒`}
        </div>

        <strong>
          ${t?`No matching items`:`Shopping list is empty`}
        </strong>

        <span>
          ${t?`Try another search.`:`Add ingredients from Pantry or add something above.`}
        </span>

      </div>
    `;return}let n=v(t);e.innerHTML=Object.entries(n).map(([e,t])=>x(e,t)).join(``)}function C(){let e=document.querySelector(`#shoppingCount`);if(!e)return;let t=o.shopping.size;e.textContent=`${t} ${t===1?`item`:`items`}`}function w(){S(),C(),F()}function T(e){let t=s(e);return o.ingredients.find(e=>s(e.name)===t||e.aliases?.some(e=>s(e)===t))||Object.values(o.customIngredients).find(e=>s(e.name)===t)}function E(e){let t=c(e)||`item`,n=`custom-${t}`,r=2;for(;o.customIngredients[n];)n=`custom-${t}-${r}`,r+=1;let i={id:n,name:e.trim(),category:`custom`,aliases:[]};return o.customIngredients[n]=i,i}function D(e){let t=e.trim();if(!t)return;let n=T(t)??E(t);o.shopping.has(n.id)||(d(),o.shopping.add(n.id),h(n.id),p(),w())}function O(e,t){d(),t?o.pantry.add(e):o.pantry.delete(e),p(),w()}function k(e,t){let n=h(e);n.quantity=t.trim(),p()}function A(e,t){let n=h(e);n.note=t.trim(),p()}function j(e){d(),o.shopping.delete(e),delete o.shoppingMeta[e],e.startsWith(`custom-`)&&delete o.customIngredients[e],p(),w()}function M(){o.shopping.size!==0&&window.confirm(`Clear the entire shopping list?`)&&(d(),[...o.shopping].filter(e=>e.startsWith(`custom-`)).forEach(e=>{delete o.customIngredients[e]}),o.shopping.clear(),o.shoppingMeta={},p(),w())}function N(){o.history.length!==0&&(o.future.push(l()),u(o.history.pop()))}function P(){o.future.length!==0&&(o.history.push(l()),u(o.future.pop()))}function F(){let e=document.querySelector(`#undoButton`),t=document.querySelector(`#redoButton`);e&&(e.disabled=o.history.length===0),t&&(t.disabled=o.future.length===0)}function I(){let e=document.querySelector(`#shoppingAddForm`),t=document.querySelector(`#shoppingItemName`);e?.addEventListener(`submit`,e=>{e.preventDefault(),t&&(D(t.value),t.value=``,t.focus())})}function L(){document.querySelector(`#shoppingSearch`)?.addEventListener(`input`,e=>{o.search=e.target.value,S()})}function R(){let e=document.querySelector(`#shoppingList`);e?.addEventListener(`change`,e=>{let t=e.target.closest(`[data-have-ingredient]`);t&&O(t.dataset.haveIngredient,t.checked)}),e?.addEventListener(`input`,e=>{let t=e.target.closest(`[data-shopping-quantity]`);if(t){k(t.dataset.shoppingQuantity,t.value);return}let n=e.target.closest(`[data-shopping-note]`);n&&A(n.dataset.shoppingNote,n.value)}),e?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-shopping]`);t&&j(t.dataset.removeShopping)})}function z(){document.querySelector(`#undoButton`)?.addEventListener(`click`,N),document.querySelector(`#redoButton`)?.addEventListener(`click`,P),document.querySelector(`#clearShoppingButton`)?.addEventListener(`click`,M)}function B(){I(),L(),R(),z()}async function V(){let e=await fetch(`/data/ingredients.json`);if(!e.ok)throw Error(`Unable to load ingredients.`);o.ingredients=await e.json()}async function H(){f(),B();try{await V(),w()}catch(e){console.error(e);let t=document.querySelector(`#shoppingList`);t&&(t.innerHTML=`
        <div class="empty-state">

          <div
            class="empty-state__icon"
          >
            ⚠️
          </div>

          <strong>
            Unable to load Shopping
          </strong>

          <span>
            Refresh the page and try again.
          </span>

        </div>
      `)}}document.addEventListener(`DOMContentLoaded`,H);