import"./responsive-ObRzUHcs.js";var e={pantry:`anongUlam.pantry`},t={meat:{label:`Meat`,icon:`🥩`},seafood:{label:`Seafood`,icon:`🐟`},vegetables:{label:`Vegetables`,icon:`🥬`},fruit:{label:`Fruit`,icon:`🍋`},dairy:{label:`Dairy`,icon:`🥛`},condiments:{label:`Condiments`,icon:`🧂`},spices:{label:`Spices`,icon:`🌶️`},pantry:{label:`Pantry`,icon:`🥫`},frozen:{label:`Frozen`,icon:`❄️`}},n={ingredients:[],pantry:new Set,search:``,availableOnly:!1};function r(){try{let t=JSON.parse(localStorage.getItem(e.pantry));Array.isArray(t)&&(n.pantry=new Set(t))}catch{n.pantry=new Set}}function i(){localStorage.setItem(e.pantry,JSON.stringify([...n.pantry]))}function a(e=``){return String(e).trim().toLowerCase()}function o(e){let t=a(n.search);return!t||[e.name,e.id,...e.aliases??[]].some(e=>a(e).includes(t))}function s(e){return!(!o(e)||n.availableOnly&&!n.pantry.has(e.id))}function c(){let e={};return n.ingredients.filter(s).forEach(t=>{let n=t.category;e[n]??=[],e[n].push(t)}),e}function l(e){let t=n.pantry.has(e.id);return`
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

      <span class="ingredient-row__name">
        ${e.name}
      </span>

      <button
        class="ingredient-row__shopping"
        type="button"
        data-add-shopping="${e.id}"
      >
        + Shopping
      </button>

    </label>
  `}function u(e,n){let r=t[e]??{label:e,icon:`🍽️`};return`
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

        <span class="pantry-category__title">
          <span>
            ${r.icon}
          </span>

          <strong>
            ${r.label}
          </strong>
        </span>

        <span class="pantry-category__arrow">
          ▼
        </span>

      </button>


      <div class="pantry-category__items">

        ${n.map(l).join(``)}

      </div>

    </section>
  `}function d(){let e=document.querySelector(`#pantryList`);if(!e)return;let t=c(),n=Object.entries(t);if(n.length===0){e.innerHTML=`
      <div class="empty-state">
        <div class="empty-state__icon">
          🔎
        </div>

        <strong>
          No ingredients found
        </strong>

        <span>
          Try another search.
        </span>
      </div>
    `;return}e.innerHTML=n.map(([e,t])=>u(e,t)).join(``)}function f(e,t){t?n.pantry.add(e):n.pantry.delete(e),i(),d()}function p(e){let t=e.closest(`.pantry-category`);if(!t)return;let n=t.querySelector(`.pantry-category__items`),r=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!r)),n.hidden=r}function m(){let e=document.querySelector(`#pantrySearch`),t=document.querySelector(`#showAvailableOnly`),r=document.querySelector(`#pantryList`);e?.addEventListener(`input`,e=>{n.search=e.target.value,d()}),t?.addEventListener(`change`,e=>{n.availableOnly=e.target.checked,d()}),r?.addEventListener(`change`,e=>{let t=e.target.closest(`[data-ingredient-id]`);t&&f(t.dataset.ingredientId,t.checked)}),r?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-category-toggle]`);if(t){p(t);return}let n=e.target.closest(`[data-add-shopping]`);n&&(e.preventDefault(),console.log(`Add to shopping:`,n.dataset.addShopping))})}async function h(){let e=await fetch(`/data/ingredients.json`);if(!e.ok)throw Error(`Unable to load ingredients.`);n.ingredients=await e.json()}async function g(){r(),m();try{await h(),d()}catch(e){console.error(e)}}document.addEventListener(`DOMContentLoaded`,g);