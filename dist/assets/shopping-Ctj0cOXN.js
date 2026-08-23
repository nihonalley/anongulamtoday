import"./responsive-BIKCJs_0.js";import{i as e,r as t,t as n}from"./storage-CDiBwFzA.js";var r={meat:{label:`Meat`,icon:`🥩`},seafood:{label:`Seafood`,icon:`🐟`},vegetables:{label:`Vegetables`,icon:`🥬`},fruit:{label:`Fruit`,icon:`🍋`},dairy:{label:`Dairy`,icon:`🥛`},condiments:{label:`Condiments`,icon:`🧂`},spices:{label:`Spices`,icon:`🌶️`},pantry:{label:`Pantry`,icon:`🥫`},frozen:{label:`Frozen`,icon:`❄️`},other:{label:`Other`,icon:`🛍️`}},i={ingredients:[],shopping:new Set,pantry:new Set,search:``};function a(e=``){return String(e).trim().toLowerCase()}function o(){i.shopping=new Set(t(n.shopping)),i.pantry=new Set(t(n.pantry))}function s(){e(n.shopping,i.shopping)}function c(){e(n.pantry,i.pantry)}function l(e){return i.ingredients.find(t=>t.id===e)}function u(e){let t=a(i.search);return!t||[e.name,e.id,...e.aliases??[]].some(e=>a(e).includes(t))}function d(){return[...i.shopping].map(l).filter(Boolean).filter(u)}function f(e){return e.reduce((e,t)=>{let n=t.category||`other`;return e[n]??=[],e[n].push(t),e},{})}function p(e){let t=i.pantry.has(e.id);return`
    <div
      class="
        shopping-row
        ${t?`is-owned`:``}
      "
      data-shopping-id="${e.id}"
    >

      <label
        class="shopping-row__have"
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

        <strong
          class="shopping-row__name"
        >
          ${e.name}
        </strong>

        <span
          class="shopping-row__status"
        >
          ${t?`You have this`:`Need to buy`}
        </span>

      </div>


      <button
        class="shopping-row__remove"
        type="button"
        data-remove-shopping="${e.id}"
        aria-label="Remove ${e.name} from shopping list"
      >
        ×
      </button>

    </div>
  `}function m(e,t){let n=r[e]??r.other;return`
    <section
      class="shopping-category"
    >

      <div
        class="shopping-category__header"
      >

        <span>
          ${n.icon}
        </span>

        <strong>
          ${n.label}
        </strong>

      </div>


      <div
        class="shopping-category__items"
      >

        ${t.map(p).join(``)}

      </div>

    </section>
  `}function h(){let e=document.querySelector(`#shoppingList`);if(!e)return;let t=d();if(t.length===0){e.innerHTML=`
      <div
        class="empty-state"
      >

        <div
          class="empty-state__icon"
        >
          🛒
        </div>

        <strong>
          Shopping list is empty
        </strong>

        <span>
          Add ingredients from your Pantry.
        </span>

      </div>
    `;return}let n=f(t);e.innerHTML=Object.entries(n).map(([e,t])=>m(e,t)).join(``)}function g(e,t){t?i.pantry.add(e):i.pantry.delete(e),c(),h()}function _(e){i.shopping.delete(e),s(),h()}function v(){i.shopping.clear(),s(),h()}function y(){let e=document.querySelector(`#shoppingSearch`),t=document.querySelector(`#shoppingList`),n=document.querySelector(`#clearShoppingButton`);e?.addEventListener(`input`,e=>{i.search=e.target.value,h()}),t?.addEventListener(`change`,e=>{let t=e.target.closest(`[data-have-ingredient]`);t&&g(t.dataset.haveIngredient,t.checked)}),t?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-shopping]`);t&&_(t.dataset.removeShopping)}),n?.addEventListener(`click`,v)}async function b(){let e=await fetch(`/data/ingredients.json`);if(!e.ok)throw Error(`Unable to load ingredients.`);i.ingredients=await e.json()}async function x(){o(),y();try{await b(),h()}catch(e){console.error(e)}}document.addEventListener(`DOMContentLoaded`,x);