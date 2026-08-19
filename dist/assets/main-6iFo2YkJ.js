import"./responsive-ObRzUHcs.js";var e={advancedToggle:`#advancedToggle`,advancedPanel:`#advancedPanel`,filterButtons:`[data-filter-group][data-filter-value]`,resetFiltersButton:`#resetFiltersButton`,activeFilterList:`#activeFilterList`,filterCount:`#filterCount`},t={cuisine:{filipino:`Filipino`,japanese:`Japanese`,korean:`Korean`,chinese:`Chinese`,vietnamese:`Vietnamese`,european:`European`,american:`American`,mediterranean:`Mediterranean`},cookingStyle:{fried:`Fried`,stew:`Stew`,soup:`Soup`,grilled:`Grilled`,baked:`Baked`,"stir-fry":`Stir-fry`,steamed:`Steamed`,"air-fryer":`Air Fryer`},diet:{"kid-friendly":`Kid-friendly`,healthy:`Healthy`,"dairy-free":`Dairy-free`,"gluten-free":`Gluten-free`,vegetarian:`Vegetarian`,spicy:`Spicy`},time:{15:`≤ 15 mins`,30:`≤ 30 mins`,45:`≤ 45 mins`,60:`≤ 60 mins`},servings:{one:`One`,couple:`Couple`,family:`Family`,party:`Party`}},n={cuisine:new Set,cookingStyle:new Set,diet:new Set,time:new Set,servings:new Set};function r(e){return document.querySelector(e)}function i(e){return document.querySelectorAll(e)}function a({trigger:e,target:t}){if(!e||!t)return;let n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!n)),t.hidden=n}function o(e,n){return t[e]?.[n]??n}function s(e,t){let r=n[e];if(r){if(r.has(t)){r.delete(t);return}r.add(t)}}function c(){i(e.filterButtons).forEach(e=>{let t=e.dataset.filterGroup,r=e.dataset.filterValue,i=n[t]?.has(r);e.classList.toggle(`is-selected`,!!i)})}function l(){let e=[];return Object.entries(n).forEach(([t,n])=>{n.forEach(n=>{e.push({group:t,value:n,label:o(t,n)})})}),e}function u(){let t=r(e.activeFilterList),n=r(e.filterCount);if(!t||!n)return;let i=l();if(n.textContent=`${i.length} selected`,i.length===0){t.innerHTML=`
      <span class="active-filter-empty">
        No filters selected.
      </span>
    `;return}t.innerHTML=i.map(e=>`
          <span class="active-filter-chip">

            ${e.label}

            <button
              type="button"
              data-remove-filter-group="${e.group}"
              data-remove-filter-value="${e.value}"
              aria-label="Remove ${e.label}"
            >
              ×
            </button>

          </span>
        `).join(``)}function d(){c(),u()}function f(){Object.values(n).forEach(e=>{e.clear()}),d()}function p(e,t){n[e]?.delete(t),d()}function m(){let t=r(e.advancedToggle),n=r(e.advancedPanel);t?.addEventListener(`click`,()=>{a({trigger:t,target:n})})}function h(){i(e.filterButtons).forEach(e=>{e.addEventListener(`click`,()=>{let t=e.dataset.filterGroup,n=e.dataset.filterValue;s(t,n),d()})})}function g(){r(e.resetFiltersButton)?.addEventListener(`click`,f)}function _(){r(e.activeFilterList)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-filter-group]`);t&&p(t.dataset.removeFilterGroup,t.dataset.removeFilterValue)})}function v(){m(),h(),g(),_(),d()}document.addEventListener(`DOMContentLoaded`,v);