import{r as e,t}from"./storage-D1nLyvOY.js";var n=`/data/recipes.json`,r=null;async function i(){if(r)return r;let e=await fetch(n);if(!e.ok)throw Error(`Unable to load recipes.`);return r=await e.json(),r}function a(e){return e.ingredients?.filter(e=>e.required!==!1)??[]}function o(e,t){return t.has(e.id)?!0:e.substitutes?.some(e=>t.has(e))??!1}function s(e,t){let n=t instanceof Set?t:new Set(t),r=a(e),i=[],s=[];r.forEach(e=>{o(e,n)?i.push(e):s.push(e)});let c=r.length,l=c===0?100:Math.round(i.length/c*100);return{total:c,available:i,missing:s,availableCount:i.length,missingCount:s.length,percentage:l,canCook:s.length===0}}function c(e,t){return e.map(e=>({recipe:e,match:s(e,t)})).sort((e,t)=>e.match.canCook===t.match.canCook?e.match.percentage===t.match.percentage?e.match.missingCount-t.match.missingCount:t.match.percentage-e.match.percentage:Number(t.match.canCook)-Number(e.match.canCook))}function l(e,t){return!t||t.size===0||t.has(e.cuisine)}function u(e,t){return!t||t.size===0||[...e.cookingStyles??[]].some(e=>t.has(e))}function d(e,t){return!t||t.size===0||[...t].every(t=>t===`spicy`?e.spicy===!0:e.diet?.includes(t)??!1)}function f(e,t){if(!t||t.size===0)return!0;let n=[...t].map(Number).filter(Number.isFinite);if(n.length===0)return!0;let r=Math.max(...n);return e.timeMinutes<=r}function p(e,t){return!t||t.size===0||t.has(e.servings)}function m(e,t){return e.filter(e=>l(e,t.cuisine)&&u(e,t.cookingStyle)&&d(e,t.diet)&&f(e,t.time)&&p(e,t.servings))}function h(e){return!e||e.length===0?null:e[Math.floor(Math.random()*e.length)]}var g=5,_={advancedToggle:`#advancedToggle`,advancedPanel:`#advancedPanel`,filterButtons:`[data-filter-group][data-filter-value]`,resetFiltersButton:`#resetFiltersButton`,activeFilterList:`#activeFilterList`,filterCount:`#filterCount`,recipeContainer:`.recipe-scroll`,surpriseButton:`#surpriseButton`,usePantryCheckbox:`#usePantryCheckbox`,pantryCard:`.quick-card--pantry`,shoppingCard:`.quick-card--shopping`},ee={cuisine:{filipino:`Filipino`,japanese:`Japanese`,korean:`Korean`,chinese:`Chinese`,vietnamese:`Vietnamese`,european:`European`,american:`American`,mediterranean:`Mediterranean`},cookingStyle:{fried:`Fried`,stew:`Stew`,soup:`Soup`,grilled:`Grilled`,baked:`Baked`,"stir-fry":`Stir-fry`,steamed:`Steamed`,"air-fryer":`Air Fryer`},diet:{"kid-friendly":`Kid-friendly`,healthy:`Healthy`,"dairy-free":`Dairy-free`,"gluten-free":`Gluten-free`,vegetarian:`Vegetarian`,spicy:`Spicy`},time:{15:`≤ 15 mins`,30:`≤ 30 mins`,45:`≤ 45 mins`,60:`≤ 60 mins`},servings:{one:`One`,couple:`Couple`,family:`Family`,party:`Party`}},v={recipes:[],pantry:new Set,shopping:new Set,filters:{cuisine:new Set,cookingStyle:new Set,diet:new Set,time:new Set,servings:new Set},surpriseRecipeId:null,surpriseUsesPantry:!1,recentSurpriseIds:[],expandedRecipeIds:new Set};function y(e){return document.querySelector(e)}function b(e){return document.querySelectorAll(e)}function x(e=``){return e?e.charAt(0).toUpperCase()+e.slice(1):``}function S(e=``){return e.split(`-`).map(x).join(` `)}function C(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function w(){v.pantry=new Set(e(t.pantry)),v.shopping=new Set(e(t.shopping))}function T(e,t){return ee[e]?.[t]??t}function te(e,t){let n=v.filters[e];n&&(n.has(t)?n.delete(t):n.add(t),E())}function E(){v.surpriseRecipeId=null,v.expandedRecipeIds.clear()}function D(){b(_.filterButtons).forEach(e=>{let t=e.dataset.filterGroup,n=e.dataset.filterValue,r=v.filters[t]?.has(n);e.classList.toggle(`is-selected`,!!r)})}function O(){let e=[];return Object.entries(v.filters).forEach(([t,n])=>{n.forEach(n=>{e.push({group:t,value:n,label:T(t,n)})})}),e}function k(){let e=y(_.activeFilterList),t=y(_.filterCount);if(!e||!t)return;let n=O();if(t.textContent=`${n.length} selected`,n.length===0){e.innerHTML=`
      <span class="active-filter-empty">
        No filters selected.
      </span>
    `;return}e.innerHTML=n.map(e=>`
          <span class="active-filter-chip">

            ${C(e.label)}

            <button
              type="button"
              data-remove-filter-group="${C(e.group)}"
              data-remove-filter-value="${C(e.value)}"
              aria-label="Remove ${C(e.label)}"
            >
              ×
            </button>

          </span>
        `).join(``)}function A(){Object.values(v.filters).forEach(e=>e.clear()),E(),Q()}function j(e,t){v.filters[e]?.delete(t),E(),Q()}function M(){return m(v.recipes,v.filters)}function N(){return c(M(),v.pantry)}function P(e){if(v.pantry.has(e.id))return{type:`available`,substitute:null};let t=e.substitutes?.find(e=>v.pantry.has(e));return t?{type:`substitute`,substitute:t}:{type:`missing`,substitute:null}}function F(e){return e.total===0||e.canCook?{className:`is-ready`,label:`✓ Ready to cook`}:e.missingCount===1?{className:`is-almost`,label:`Almost there · Missing 1`}:{className:`is-missing`,label:`Missing ${e.missingCount} ingredients`}}function I(e){return!e.ingredients||e.ingredients.length===0?``:`
    <div class="recipe-detail-section">

      <h4>
        Ingredients
      </h4>

      <ul class="recipe-detail-list">

        ${e.ingredients.map(e=>{let t=e.substitutes??[],n=P(e),r=``;v.pantry.size>0&&(n.type===`available`&&(r=`
                    <small class="ingredient-status ingredient-status--available">
                      ✓ You have this
                    </small>
                  `),n.type===`substitute`&&(r=`
                    <small class="ingredient-status ingredient-status--available">
                      ✓ You have ${C(S(n.substitute))} as an alternative
                    </small>
                  `),n.type===`missing`&&(r=`
                    <small class="ingredient-status ingredient-status--missing">
                      Missing
                    </small>
                  `));let i=t.length>0?`
                    <small>
                      Alternative:
                      ${t.map(S).join(`, `)}
                    </small>
                  `:``;return`
                <li>

                  <span>
                    <strong>
                      ${C(S(e.id))}
                    </strong>

                    ${e.amount?` — ${C(e.amount)}`:``}
                  </span>

                  ${r}

                  ${i}

                </li>
              `}).join(``)}

      </ul>

    </div>
  `}function L(e){return!e.flexibleIngredients||e.flexibleIngredients.length===0?``:`
    <div class="recipe-flexible-note">

      ${e.flexibleIngredients.map(e=>`
            <p>

              <strong>
                ${C(e.label)}:
              </strong>

              ${C(e.note)}

            </p>
          `).join(``)}

    </div>
  `}function R(e){return!e.steps||e.steps.length===0?``:`
    <div class="recipe-detail-section">

      <h4>
        Steps
      </h4>

      <ol class="recipe-step-list">

        ${e.steps.map(e=>`
              <li>
                ${C(e)}
              </li>
            `).join(``)}

      </ol>

    </div>
  `}function z(e){return!e.notes||e.notes.length===0?``:`
    <div class="recipe-notes">

      ${e.notes.map(e=>`
            <p>
              💡 ${C(e)}
            </p>
          `).join(``)}

    </div>
  `}function B(e){return v.expandedRecipeIds.has(e.id)?`
    <div class="recipe-card__details">

      <p class="recipe-card__description">
        ${C(e.description??``)}
      </p>

      ${I(e)}

      ${L(e)}

      ${R(e)}

      ${z(e)}

    </div>
  `:``}function V(e){return v.surpriseRecipeId?v.surpriseUsesPantry?v.pantry.size===0?`
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--full
        "
      >
        🎲 Pantry empty · Full Surprise used
      </div>
    `:e.canCook?`
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--pantry
        "
      >
        🧺 Ready with what you have
      </div>
    `:`
    <div
      class="
        recipe-surprise-mode
        recipe-surprise-mode--pantry
      "
    >
      🧺 Closest Pantry Match
    </div>
  `:`
      <div
        class="
          recipe-surprise-mode
          recipe-surprise-mode--full
        "
      >
        🎲 Full Surprise
      </div>
    `:``}function H(e,t,n={}){let{surprise:r=!1}=n,i=v.expandedRecipeIds.has(e.id),a=x(e.cuisine),o=F(t),s=t.total>0?`${t.availableCount}/${t.total} ingredients`:`No required ingredients`;return`
    <article
      class="
        recipe-card
        recipe-card--dynamic
        ${r?`recipe-card--surprise`:``}
      "
      data-recipe-id="${C(e.id)}"
    >

      <div class="recipe-card__image">

        <span
          class="recipe-card__emoji"
          aria-hidden="true"
        >
          ${e.emoji??`🍽️`}
        </span>

        ${r?`
              <span class="recipe-surprise-badge">
                🎲 Surprise Pick
              </span>
            `:``}

        <button
          class="recipe-card__favorite"
          type="button"
          aria-label="Add ${C(e.name)} to favorites"
        >
          ♡
        </button>

      </div>

      <div class="recipe-card__body">

        <h3 class="recipe-card__title">
          ${C(e.name)}
        </h3>

        <div class="recipe-card__meta">

          <span>
            ⏱ ${e.timeMinutes} mins
          </span>

          <span>
            ${C(e.difficulty??`Easy`)}
          </span>

        </div>

        ${V(t)}

        <div class="recipe-match-row">

          <span
            class="
              recipe-match-badge
              ${o.className}
            "
          >
            ${C(o.label)}
          </span>

          <span class="recipe-match-count">
            ${s}
          </span>

        </div>

        ${t.missingCount>0?`
              <div class="recipe-missing-summary">
                Missing:
                ${t.missing.map(e=>C(S(e.id))).join(`, `)}
              </div>
            `:``}

        <div class="recipe-card__tags">

          <span class="recipe-card__tag">
            ${C(a)}
          </span>

          ${e.cookingStyles?.map(e=>`
                  <span
                    class="
                      recipe-card__tag
                      recipe-card__tag--soft
                    "
                  >
                    ${C(T(`cookingStyle`,e))}
                  </span>
                `).join(``)??``}

        </div>

        <div class="recipe-card__actions">

          <button
            class="
              recipe-card__action
              recipe-card__action--primary
            "
            type="button"
            data-view-recipe="${C(e.id)}"
          >
            ${i?`Hide Recipe`:`View Recipe`}
          </button>

          ${r?`
                <button
                  class="recipe-card__action"
                  type="button"
                  data-pick-again
                >
                  🎲 Pick Again
                </button>
              `:``}

        </div>

        ${B(e)}

      </div>

    </article>
  `}function U(){return`
    <div class="recipe-empty-state">

      <div class="recipe-empty-state__icon">
        🍳
      </div>

      <strong>
        No recipes match
      </strong>

      <p>
        Try removing one or more filters.
      </p>

    </div>
  `}function W(){let e=y(_.recipeContainer);if(!e)return;let t=N();if(t.length===0){e.innerHTML=U();return}e.innerHTML=t.map(({recipe:e,match:t})=>H(e,t)).join(``)}function G(e){e&&(v.recentSurpriseIds=v.recentSurpriseIds.filter(t=>t!==e),v.recentSurpriseIds.unshift(e),v.recentSurpriseIds=v.recentSurpriseIds.slice(0,g))}function ne(e){if(e.length<=1)return e;let t=new Set(v.recentSurpriseIds),n=e.filter(e=>!t.has(e.id));return n.length>0?n:e}function K(){return M()}function q(){let e=M();if(e.length===0)return[];if(v.pantry.size===0)return e;let t=c(e,v.pantry);if(t.length===0)return[];let n=t.filter(e=>e.match.canCook);if(n.length>0)return n.map(e=>e.recipe);let r=Math.min(...t.map(e=>e.match.missingCount));return t.filter(e=>e.match.missingCount===r).map(e=>e.recipe)}function J(){return v.surpriseUsesPantry?q():K()}function Y(){w(),v.surpriseUsesPantry=!!y(_.usePantryCheckbox)?.checked;let e=J();if(e.length===0){let e=y(_.recipeContainer);e&&(e.innerHTML=U(),e.scrollIntoView({behavior:`smooth`,block:`nearest`}));return}e=ne(e);let t=h(e);t&&(v.surpriseRecipeId=t.id,G(t.id),v.expandedRecipeIds.clear(),Z(),y(_.recipeContainer)?.scrollIntoView({behavior:`smooth`,block:`nearest`}))}function X(){let e=y(_.recipeContainer);if(!e)return;let t=v.recipes.find(e=>e.id===v.surpriseRecipeId);if(!t){v.surpriseRecipeId=null,W();return}e.innerHTML=H(t,s(t,v.pantry),{surprise:!0})}function Z(){if(v.surpriseRecipeId){X();return}W()}function re(e){v.expandedRecipeIds.has(e)?v.expandedRecipeIds.delete(e):v.expandedRecipeIds.add(e),Z(),document.querySelector(`[data-recipe-id="${e}"]`)?.scrollIntoView({behavior:`smooth`,block:`nearest`})}function ie(){let e=y(_.pantryCard)?.querySelector(`small`);if(e){let t=v.pantry.size;e.textContent=t===1?`1 ingredient available`:`${t} ingredients available`}let t=y(_.shoppingCard)?.querySelector(`small`);if(t){let e=v.shopping.size;t.textContent=e===1?`1 item to buy`:`${e} items to buy`}}function Q(){D(),k(),ie(),Z()}function ae(){let e=y(_.advancedToggle),t=y(_.advancedPanel);e?.addEventListener(`click`,()=>{if(!t)return;let n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!n)),t.hidden=n})}function oe(){b(_.filterButtons).forEach(e=>{e.addEventListener(`click`,()=>{te(e.dataset.filterGroup,e.dataset.filterValue),Q()})})}function $(){y(_.resetFiltersButton)?.addEventListener(`click`,A)}function se(){y(_.activeFilterList)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-filter-group]`);t&&j(t.dataset.removeFilterGroup,t.dataset.removeFilterValue)})}function ce(){y(_.surpriseButton)?.addEventListener(`click`,Y),y(_.usePantryCheckbox)?.addEventListener(`change`,()=>{v.recentSurpriseIds=[]})}function le(){y(_.recipeContainer)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-view-recipe]`);if(t){re(t.dataset.viewRecipe);return}e.target.closest(`[data-pick-again]`)&&Y()})}function ue(){window.addEventListener(`storage`,()=>{w(),Q()})}function de(){ae(),oe(),$(),se(),ce(),le(),ue()}async function fe(){v.recipes=await i()}function pe(){let e=y(_.recipeContainer);e&&(e.innerHTML=`
    <div class="recipe-empty-state">

      <div class="recipe-empty-state__icon">
        ⚠️
      </div>

      <strong>
        Unable to load recipes
      </strong>

      <p>
        Refresh the page and try again.
      </p>

    </div>
  `)}async function me(){w(),de();try{await fe(),Q()}catch(e){console.error(e),pe()}}document.addEventListener(`DOMContentLoaded`,me);