import"./responsive-BIKCJs_0.js";import{i as e,n as t,r as n,t as r}from"./storage-CDiBwFzA.js";var i={meat:{label:`Meat`,icon:`🥩`},seafood:{label:`Seafood`,icon:`🐟`},vegetables:{label:`Vegetables`,icon:`🥬`},fruit:{label:`Fruit`,icon:`🍋`},dairy:{label:`Dairy`,icon:`🥛`},condiments:{label:`Condiments`,icon:`🧂`},spices:{label:`Spices`,icon:`🌶️`},pantry:{label:`Pantry`,icon:`🥫`},frozen:{label:`Frozen`,icon:`❄️`},other:{label:`Other`,icon:`🍽️`}},a={ingredients:[],pantry:new Set,shopping:new Set,search:``,availableOnly:!1};function o(e=``){return String(e).trim().toLowerCase()}function s(){a.pantry=new Set(n(r.pantry)),a.shopping=new Set(n(r.shopping))}function c(){e(r.pantry,a.pantry)}function l(e){let t=o(a.search);return!t||[e.name,e.id,...e.aliases??[]].some(e=>o(e).includes(t))}function u(e){return!(!l(e)||a.availableOnly&&!a.pantry.has(e.id))}function d(){let e={};return a.ingredients.filter(u).forEach(t=>{let n=t.category||`other`;e[n]??=[],e[n].push(t)}),e}function f(e){let t=a.pantry.has(e.id),n=a.shopping.has(e.id);return`
    <label
      class="
        ingredient-row
        ${t?`is-available`:`is-unavailable`}
      "
    >

      <input
        class="ingredient-row__checkbox"
        type="checkbox"
        data-ingredient-id="${e.id}"
        ${t?`checked`:``}
      >

      <span
        class="ingredient-row__name"
      >
        ${e.name}
      </span>

      <button
        class="ingredient-row__shopping"
        type="button"
        data-add-shopping="${e.id}"
        ${n?`disabled`:``}
      >
        ${n?`Added ✓`:`+ Shopping`}
      </button>

    </label>
  `}function p(e,t){let n=i[e]??i.other;return`
    <section
      class="pantry-category"
      data-category="${e}"
    >

      <button
        class="pantry-category__header"
        type="button"
        data-category-toggle
        aria-expanded="true"
      >

        <span
          class="pantry-category__title"
        >

          <span>
            ${n.icon}
          </span>

          <strong>
            ${n.label}
          </strong>

        </span>


        <span
          class="pantry-category__arrow"
        >
          ▼
        </span>

      </button>


      <div
        class="pantry-category__items"
      >

        ${t.map(f).join(``)}

      </div>

    </section>
  `}function m(){let e=document.querySelector(`#pantryList`);if(!e)return;let t=d(),n=Object.entries(t);if(n.length===0){e.innerHTML=`
      <div
        class="empty-state"
      >

        <div
          class="empty-state__icon"
        >
          🔎
        </div>

        <strong>
          No ingredients found
        </strong>

        <span>
          Try another search.
        </span>

      </div>
    `;return}e.innerHTML=n.map(([e,t])=>p(e,t)).join(``)}function h(e,t){t?a.pantry.add(e):a.pantry.delete(e),c(),m()}function g(e){a.shopping.has(e)||(a.shopping.add(e),t(r.shopping,e),m())}function _(e){let t=e.closest(`.pantry-category`);if(!t)return;let n=t.querySelector(`.pantry-category__items`),r=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!r)),n.hidden=r}function v(){document.querySelector(`#pantrySearch`)?.addEventListener(`input`,e=>{a.search=e.target.value,m()})}function y(){document.querySelector(`#showAvailableOnly`)?.addEventListener(`change`,e=>{a.availableOnly=e.target.checked,m()})}function b(){let e=document.querySelector(`#pantryList`);e?.addEventListener(`change`,e=>{let t=e.target.closest(`[data-ingredient-id]`);t&&h(t.dataset.ingredientId,t.checked)}),e?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-category-toggle]`);if(t){_(t);return}let n=e.target.closest(`[data-add-shopping]`);n&&(e.preventDefault(),g(n.dataset.addShopping))})}function x(){v(),y(),b()}async function S(){let e=await fetch(`/data/ingredients.json`);if(!e.ok)throw Error(`Unable to load ingredients.`);a.ingredients=await e.json()}async function C(){s(),x();try{await S(),m()}catch(e){console.error(e);let t=document.querySelector(`#pantryList`);t&&(t.innerHTML=`
        <div
          class="empty-state"
        >

          <div
            class="empty-state__icon"
          >
            ⚠️
          </div>

          <strong>
            Unable to load ingredients
          </strong>

          <span>
            Please refresh the page.
          </span>

        </div>
      `)}}document.addEventListener(`DOMContentLoaded`,C);