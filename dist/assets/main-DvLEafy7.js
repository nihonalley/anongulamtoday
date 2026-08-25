import{r as e,t}from"./storage-BrWI33b6.js";var n=`/data/recipes.json`,r=null,i={cuisines:[`filipino`,`japanese`,`korean`,`chinese`,`vietnamese`,`european`,`american`,`mediterranean`],cookingStyles:[`fried`,`stew`,`soup`,`grilled`,`baked`,`stir-fry`,`steamed`,`air-fryer`],servingCategories:[`one`,`couple`,`family`,`party`],difficulties:[`Easy`,`Medium`,`Hard`],sourceTypes:[`original`,`web`,`user`],addedBy:[`built-in`,`ai`,`user`]};function a(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function o(e){return typeof e==`string`&&e.trim().length>0}function s(e){return o(e)?e.trim():null}function c(e){return Array.isArray(e)?[...new Set(e.filter(o).map(e=>e.trim()))]:[]}function l(e){if(e==null||e===``)return!0;try{let t=new URL(e);return t.protocol===`http:`||t.protocol===`https:`}catch{return!1}}function u(e){return a(e)?{type:o(e.type)?e.type.trim().toLowerCase():`original`,name:o(e.name)?e.name.trim():`Anong Ulam Today?`,url:s(e.url),retrievedAt:s(e.retrievedAt)}:{type:`original`,name:`Anong Ulam Today?`,url:null,retrievedAt:null}}function ee(e){if(!a(e))return null;let t=e.quantity,n=t==null||t===``?null:Number(t);return{id:o(e.id)?e.id.trim().toLowerCase():``,quantity:Number.isFinite(n)?n:null,unit:s(e.unit),amountText:s(e.amountText),scalable:e.scalable!==!1,required:e.required!==!1,substitutes:c(e.substitutes).map(e=>e.toLowerCase())}}function te(e){return a(e)?{label:o(e.label)?e.label.trim():``,note:o(e.note)?e.note.trim():``}:null}function d(e){if(!a(e))return null;let t=Number(e.baseServings);return{id:o(e.id)?e.id.trim().toLowerCase():``,name:o(e.name)?e.name.trim():``,description:o(e.description)?e.description.trim():``,emoji:o(e.emoji)?e.emoji.trim():`🍽️`,cuisine:o(e.cuisine)?e.cuisine.trim().toLowerCase():``,origin:o(e.origin)?e.origin.trim():``,cookingStyles:c(e.cookingStyles).map(e=>e.toLowerCase()),diet:c(e.diet).map(e=>e.toLowerCase()),timeMinutes:Number(e.timeMinutes),difficulty:o(e.difficulty)?e.difficulty.trim():`Easy`,baseServings:Number.isFinite(t)?t:2,servingCategories:c(e.servingCategories).map(e=>e.toLowerCase()),spicy:e.spicy===!0,ingredients:Array.isArray(e.ingredients)?e.ingredients.map(ee).filter(Boolean):[],flexibleIngredients:Array.isArray(e.flexibleIngredients)?e.flexibleIngredients.map(te).filter(Boolean):[],steps:c(e.steps),notes:c(e.notes),source:u(e.source),addedBy:o(e.addedBy)?e.addedBy.trim().toLowerCase():`built-in`}}function ne(e,t,n){let r=[],i=`${t}.ingredients[${n}]`;return o(e.id)||r.push(`${i}: ingredient id is required.`),e.scalable===!0&&((!Number.isFinite(e.quantity)||e.quantity<=0)&&r.push(`${i}: scalable ingredients require a positive quantity.`),o(e.unit)||r.push(`${i}: scalable ingredients require a unit.`)),e.scalable===!1&&(o(e.amountText)||r.push(`${i}: non-scalable ingredients require amountText.`)),Array.isArray(e.substitutes)||r.push(`${i}: substitutes must be an array.`),e.substitutes?.includes(e.id)&&r.push(`${i}: ingredient cannot substitute itself.`),r}function f(e,t,n){let r=[],i=`${t}.flexibleIngredients[${n}]`;return o(e.label)||r.push(`${i}: label is required.`),o(e.note)||r.push(`${i}: note is required.`),r}function p(e,t){let n=[];return a(e)?(i.sourceTypes.includes(e.type)||n.push(`${t}: invalid source type "${e.type}".`),o(e.name)||n.push(`${t}: source name is required.`),l(e.url)||n.push(`${t}: source URL is invalid.`),e.type===`web`&&!o(e.url)&&n.push(`${t}: web recipes require a source URL.`),n):[`${t}: source is required.`]}function m(e){let t=[];if(!a(e))return[`Recipe must be an object.`];let n=e.id||`unknown-recipe`;if(o(e.id)||t.push(`Recipe id is required.`),o(e.id)&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)&&t.push(`${n}: id must use lowercase kebab-case.`),o(e.name)||t.push(`${n}: name is required.`),o(e.description)||t.push(`${n}: description is required.`),i.cuisines.includes(e.cuisine)||t.push(`${n}: invalid cuisine "${e.cuisine}".`),o(e.origin)||t.push(`${n}: origin is required.`),!Array.isArray(e.cookingStyles)||e.cookingStyles.length===0?t.push(`${n}: at least one cooking style is required.`):e.cookingStyles.forEach(e=>{i.cookingStyles.includes(e)||t.push(`${n}: invalid cooking style "${e}".`)}),(!Number.isFinite(e.timeMinutes)||e.timeMinutes<=0)&&t.push(`${n}: timeMinutes must be greater than 0.`),i.difficulties.includes(e.difficulty)||t.push(`${n}: invalid difficulty "${e.difficulty}".`),(!Number.isFinite(e.baseServings)||e.baseServings<=0)&&t.push(`${n}: baseServings must be greater than 0.`),!Array.isArray(e.servingCategories)||e.servingCategories.length===0?t.push(`${n}: at least one serving category is required.`):e.servingCategories.forEach(e=>{i.servingCategories.includes(e)||t.push(`${n}: invalid serving category "${e}".`)}),!Array.isArray(e.ingredients)||e.ingredients.length===0)t.push(`${n}: at least one ingredient is required.`);else{e.ingredients.forEach((e,r)=>{t.push(...ne(e,n,r))});let r=e.ingredients.map(e=>e.id);new Set(r).size!==r.length&&t.push(`${n}: duplicate ingredient ids found.`)}return Array.isArray(e.flexibleIngredients)?e.flexibleIngredients.forEach((e,r)=>{t.push(...f(e,n,r))}):t.push(`${n}: flexibleIngredients must be an array.`),(!Array.isArray(e.steps)||e.steps.length===0)&&t.push(`${n}: at least one cooking step is required.`),i.addedBy.includes(e.addedBy)||t.push(`${n}: invalid addedBy value "${e.addedBy}".`),t.push(...p(e.source,n)),t}function h(e){if(!Array.isArray(e))return{valid:!1,errors:[`Recipe library must be an array.`]};let t=[],n=[];e.forEach((e,r)=>{m(e).forEach(e=>{t.push(`Recipe ${r+1}: ${e}`)}),o(e.id)&&n.push(e.id)});let r=new Set;return n.forEach(e=>{r.has(e)&&t.push(`Duplicate recipe id: "${e}".`),r.add(e)}),{valid:t.length===0,errors:t}}async function g(){if(r)return r;let e=await fetch(n);if(!e.ok)throw Error(`Unable to load recipes.`);let t=await e.json(),i=Array.isArray(t)?t.map(d).filter(Boolean):t,a=h(i);if(!a.valid)throw console.error(`Recipe library validation failed:`),a.errors.forEach(e=>{console.error(`• ${e}`)}),Error(`Recipe library contains ${a.errors.length} validation error(s). Check the browser console.`);return r=i,r}function _(e){return e.ingredients?.filter(e=>e.required!==!1)??[]}function v(e,t){return t.has(e.id)?!0:e.substitutes?.some(e=>t.has(e))??!1}function y(e,t){let n=t instanceof Set?t:new Set(t??[]),r=_(e),i=[],a=[];r.forEach(e=>{v(e,n)?i.push(e):a.push(e)});let o=r.length,s=o===0?100:Math.round(i.length/o*100);return{total:o,available:i,missing:a,availableCount:i.length,missingCount:a.length,percentage:s,canCook:a.length===0}}function b(e,t){return e.map(e=>({recipe:e,match:y(e,t)})).sort((e,t)=>e.match.canCook===t.match.canCook?e.match.percentage===t.match.percentage?e.match.missingCount===t.match.missingCount?e.recipe.name.localeCompare(t.recipe.name):e.match.missingCount-t.match.missingCount:t.match.percentage-e.match.percentage:Number(t.match.canCook)-Number(e.match.canCook))}function re(e,t){return!t||t.size===0||t.has(e.cuisine)}function ie(e,t){return!t||t.size===0||(e.cookingStyles??[]).some(e=>t.has(e))}function ae(e,t){return!t||t.size===0||[...t].every(t=>t===`spicy`?e.spicy===!0:e.diet?.includes(t)??!1)}function oe(e,t){if(!t||t.size===0)return!0;let n=[...t].map(Number).filter(Number.isFinite);if(n.length===0)return!0;let r=Math.max(...n);return e.timeMinutes<=r}function se(e,t){if(!t||t.size===0)return!0;let n=e.servingCategories??[];return[...t].some(e=>n.includes(e))}function ce(e,t){return e.filter(e=>re(e,t.cuisine)&&ie(e,t.cookingStyle)&&ae(e,t.diet)&&oe(e,t.time)&&se(e,t.servings))}function le(e){return!Array.isArray(e)||e.length===0?null:e[Math.floor(Math.random()*e.length)]}var ue={one:{label:`One`,people:1,emoji:`👤`},couple:{label:`Couple`,people:2,emoji:`👥`},family:{label:`Family`,people:4,emoji:`👨‍👩‍👧‍👦`},party:{label:`Party`,people:8,emoji:`🎉`}};function x(e){return!Number.isFinite(e)||Number.isInteger(e)?e:e<1?Math.round(e*100)/100:Math.round(e*10)/10}var S=[{value:.25,text:`¼`},{value:.33,text:`⅓`},{value:.5,text:`½`},{value:.66,text:`⅔`},{value:.75,text:`¾`}];function C(e){return S.find(t=>Math.abs(e-t.value)<.04)}function w(e){if(e==null)return``;let t=x(e);if(Number.isInteger(t))return String(t);let n=Math.floor(t),r=C(t-n);return r?n===0?r.text:`${n} ${r.text}`:String(t)}var T={g:`g`,kg:`kg`,ml:`ml`,l:`L`,tsp:`tsp`,tbsp:`tbsp`,cup:`cup`,cups:`cups`,piece:`piece`,pieces:`pieces`,clove:`clove`,cloves:`cloves`,slice:`slice`,slices:`slices`,pack:`pack`,packs:`packs`};function E(e,t){if(!e)return``;if(t===1){if(e===`pieces`)return`piece`;if(e===`cloves`)return`clove`;if(e===`slices`)return`slice`;if(e===`cups`)return`cup`;if(e===`packs`)return`pack`}return T[e]??e}function D(e,t){return t===`g`&&e>=1e3?{quantity:e/1e3,unit:`kg`}:t===`ml`&&e>=1e3?{quantity:e/1e3,unit:`l`}:{quantity:e,unit:t}}function O(e,t){let n=Number(e),r=Number(t);return!Number.isFinite(n)||n<=0||!Number.isFinite(r)||r<=0?1:r/n}function k(e,t,n){if(e.scalable===!1||!Number.isFinite(e.quantity))return{...e,displayAmount:e.amountText||``};let r=O(t,n),i=e.quantity*r,a=e.unit,o=D(i,a);i=o.quantity,a=o.unit;let s=w(i),c=E(a,i);return{...e,scaledQuantity:i,scaledUnit:a,displayAmount:[s,c].filter(Boolean).join(` `)}}function A(e,t){let n=e.baseServings||2;return(e.ingredients??[]).map(e=>k(e,n,t))}function j(e){let t=Number(e);return t<=1?`one`:t<=2?`couple`:t<=6?`family`:`party`}function M(e){let t=Number(e);return Number.isFinite(t)?Math.min(20,Math.max(1,Math.round(t))):2}var N=5,P={advancedToggle:`#advancedToggle`,advancedPanel:`#advancedPanel`,filterButtons:`[data-filter-group][data-filter-value]`,resetFiltersButton:`#resetFiltersButton`,activeFilterList:`#activeFilterList`,filterCount:`#filterCount`,recipeContainer:`.recipe-scroll`,surpriseButton:`#surpriseButton`,usePantryCheckbox:`#usePantryCheckbox`,pantryCard:`.quick-card--pantry`,shoppingCard:`.quick-card--shopping`},F={cuisine:{filipino:`Filipino`,japanese:`Japanese`,korean:`Korean`,chinese:`Chinese`,vietnamese:`Vietnamese`,european:`European`,american:`American`,mediterranean:`Mediterranean`},cookingStyle:{fried:`Fried`,stew:`Stew`,soup:`Soup`,grilled:`Grilled`,baked:`Baked`,"stir-fry":`Stir-fry`,steamed:`Steamed`,"air-fryer":`Air Fryer`},diet:{"kid-friendly":`Kid-friendly`,healthy:`Healthy`,"dairy-free":`Dairy-free`,"gluten-free":`Gluten-free`,vegetarian:`Vegetarian`,spicy:`Spicy`},time:{15:`≤ 15 mins`,30:`≤ 30 mins`,45:`≤ 45 mins`,60:`≤ 60 mins`},servings:{one:`One`,couple:`Couple`,family:`Family`,party:`Party`}},I={recipes:[],pantry:new Set,shopping:new Set,filters:{cuisine:new Set,cookingStyle:new Set,diet:new Set,time:new Set,servings:new Set},surpriseRecipeId:null,surpriseUsesPantry:!1,recentSurpriseIds:[],expandedRecipeIds:new Set,servingsByRecipe:{}};function L(e){return document.querySelector(e)}function R(e){return document.querySelectorAll(e)}function z(e=``){return e?e.charAt(0).toUpperCase()+e.slice(1):``}function B(e=``){return e.split(`-`).map(z).join(` `)}function V(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function H(){I.pantry=new Set(e(t.pantry)),I.shopping=new Set(e(t.shopping))}function U(e,t){return F[e]?.[t]??t}function de(e,t){let n=I.filters[e];n&&(n.has(t)?n.delete(t):n.add(t),W())}function W(){I.surpriseRecipeId=null,I.expandedRecipeIds.clear()}function fe(){R(P.filterButtons).forEach(e=>{let t=e.dataset.filterGroup,n=e.dataset.filterValue,r=I.filters[t]?.has(n);e.classList.toggle(`is-selected`,!!r)})}function pe(){let e=[];return Object.entries(I.filters).forEach(([t,n])=>{n.forEach(n=>{e.push({group:t,value:n,label:U(t,n)})})}),e}function G(){let e=L(P.activeFilterList),t=L(P.filterCount);if(!e||!t)return;let n=pe();if(t.textContent=`${n.length} selected`,n.length===0){e.innerHTML=`
      <span class="active-filter-empty">
        No filters selected.
      </span>
    `;return}e.innerHTML=n.map(e=>`
          <span class="active-filter-chip">

            ${V(e.label)}

            <button
              type="button"

              data-remove-filter-group="${V(e.group)}"

              data-remove-filter-value="${V(e.value)}"

              aria-label="Remove ${V(e.label)}"
            >
              ×
            </button>

          </span>
        `).join(``)}function me(){Object.values(I.filters).forEach(e=>e.clear()),W(),$()}function he(e,t){I.filters[e]?.delete(t),W(),$()}function K(){return ce(I.recipes,I.filters)}function ge(){return b(K(),I.pantry)}function _e(e){if(I.pantry.has(e.id))return{type:`available`,substitute:null};let t=e.substitutes?.find(e=>I.pantry.has(e));return t?{type:`substitute`,substitute:t}:{type:`missing`,substitute:null}}function ve(e){return e.total===0||e.canCook?{className:`is-ready`,label:`✓ Ready to cook`}:e.missingCount===1?{className:`is-almost`,label:`Almost there · Missing 1`}:{className:`is-missing`,label:`Missing ${e.missingCount} ingredients`}}function q(e){let t=I.servingsByRecipe[e.id];if(Number.isFinite(t))return M(t);let n=M(e.baseServings??2);return I.servingsByRecipe[e.id]=n,n}function ye(e,t){I.servingsByRecipe[e]=M(t)}function be(e,t){let n=I.recipes.find(t=>t.id===e);n&&(ye(e,q(n)+t),Q())}function xe(e){let t=ue[j(e)];return t?`
    ${t.emoji}
    ${t.label}
  `:``}function Se(e){let t=q(e),n=t<=1,r=t>=20;return`
    <div class="recipe-serving-control">

      <div class="recipe-serving-control__label">
        <strong>
          Servings
        </strong>

        <small>
          ${xe(t)}
        </small>
      </div>

      <div class="recipe-serving-stepper">

        <button
          type="button"

          class="recipe-serving-stepper__button"

          data-serving-change="-1"

          data-serving-recipe="${V(e.id)}"

          aria-label="Decrease servings"

          ${n?`disabled`:``}
        >
          −
        </button>

        <div class="recipe-serving-stepper__value">

          <strong>
            ${t}
          </strong>

          <small>
            ${t===1?`person`:`people`}
          </small>

        </div>

        <button
          type="button"

          class="recipe-serving-stepper__button"

          data-serving-change="1"

          data-serving-recipe="${V(e.id)}"

          aria-label="Increase servings"

          ${r?`disabled`:``}
        >
          +
        </button>

      </div>

    </div>
  `}function Ce(e){if(!e.ingredients||e.ingredients.length===0)return``;let t=q(e),n=A(e,t);return`
    <div class="recipe-detail-section">

      <div class="recipe-detail-heading">

        <h4>
          Ingredients
        </h4>

        <small>
          For ${t}
          ${t===1?`person`:`people`}
        </small>

      </div>

      <ul class="recipe-detail-list">

        ${n.map(e=>{let t=e.substitutes??[],n=_e(e),r=``;I.pantry.size>0&&(n.type===`available`&&(r=`
                    <small
                      class="
                        ingredient-status
                        ingredient-status--available
                      "
                    >
                      ✓ You have this
                    </small>
                  `),n.type===`substitute`&&(r=`
                    <small
                      class="
                        ingredient-status
                        ingredient-status--available
                      "
                    >
                      ✓ You have ${V(B(n.substitute))} as an alternative
                    </small>
                  `),n.type===`missing`&&(r=`
                    <small
                      class="
                        ingredient-status
                        ingredient-status--missing
                      "
                    >
                      Missing
                    </small>
                  `));let i=t.length>0?`
                    <small class="ingredient-alternative">
                      Alternative:
                      ${t.map(B).join(`, `)}
                    </small>
                  `:``;return`
                <li>

                  <div class="recipe-ingredient-row">

                    <strong>
                      ${V(B(e.id))}
                    </strong>

                    <span class="recipe-ingredient-amount">
                      ${V(e.displayAmount||``)}
                    </span>

                  </div>

                  ${r}

                  ${i}

                </li>
              `}).join(``)}

      </ul>

    </div>
  `}function we(e){return!e.flexibleIngredients||e.flexibleIngredients.length===0?``:`
    <div class="recipe-flexible-note">

      ${e.flexibleIngredients.map(e=>`
            <p>

              <strong>
                ${V(e.label)}:
              </strong>

              ${V(e.note)}

            </p>
          `).join(``)}

    </div>
  `}function Te(e){return!e.steps||e.steps.length===0?``:`
    <div class="recipe-detail-section">

      <h4>
        Steps
      </h4>

      <ol class="recipe-step-list">

        ${e.steps.map(e=>`
              <li>
                ${V(e)}
              </li>
            `).join(``)}

      </ol>

    </div>
  `}function Ee(e){return!e.notes||e.notes.length===0?``:`
    <div class="recipe-notes">

      ${e.notes.map(e=>`
            <p>
              💡 ${V(e)}
            </p>
          `).join(``)}

    </div>
  `}function De(e){let t=e.source;return t?t.type===`original`?`
      <div class="recipe-source">
        <span>
          Recipe by
          <strong>
            ${V(t.name)}
          </strong>
        </span>
      </div>
    `:t.type===`web`&&t.url?`
      <div class="recipe-source">

        <span>
          Source:
          <strong>
            ${V(t.name)}
          </strong>
        </span>

        <a
          href="${V(t.url)}"
          target="_blank"
          rel="noopener noreferrer"
        >
          View original recipe ↗
        </a>

      </div>
    `:`
    <div class="recipe-source">
      <span>
        Source:
        <strong>
          ${V(t.name)}
        </strong>
      </span>
    </div>
  `:``}function Oe(e){return I.expandedRecipeIds.has(e.id)?`
    <div class="recipe-card__details">

      <p class="recipe-card__description">
        ${V(e.description??``)}
      </p>

      ${Se(e)}

      ${Ce(e)}

      ${we(e)}

      ${Te(e)}

      ${Ee(e)}

      ${De(e)}

    </div>
  `:``}function ke(e){return I.surpriseRecipeId?I.surpriseUsesPantry?I.pantry.size===0?`
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
    `:``}function J(e,t,n={}){let{surprise:r=!1}=n,i=I.expandedRecipeIds.has(e.id),a=z(e.cuisine),o=ve(t),s=t.total>0?`${t.availableCount}/${t.total} ingredients`:`No required ingredients`;return`
    <article
      class="
        recipe-card
        recipe-card--dynamic
        ${r?`recipe-card--surprise`:``}
      "

      data-recipe-id="${V(e.id)}"
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

          aria-label="Add ${V(e.name)} to favorites"
        >
          ♡
        </button>

      </div>

      <div class="recipe-card__body">

        <h3 class="recipe-card__title">
          ${V(e.name)}
        </h3>

        <div class="recipe-card__meta">

          <span>
            ⏱ ${e.timeMinutes} mins
          </span>

          <span>
            ${V(e.difficulty??`Easy`)}
          </span>

          <span>
            🍽 ${e.baseServings}
            ${e.baseServings===1?`serving`:`servings`}
          </span>

        </div>

        ${ke(t)}

        <div class="recipe-match-row">

          <span
            class="
              recipe-match-badge
              ${o.className}
            "
          >
            ${V(o.label)}
          </span>

          <span class="recipe-match-count">
            ${s}
          </span>

        </div>

        ${t.missingCount>0?`
              <div class="recipe-missing-summary">
                Missing:
                ${t.missing.map(e=>V(B(e.id))).join(`, `)}
              </div>
            `:``}

        <div class="recipe-card__tags">

          <span class="recipe-card__tag">
            ${V(a)}
          </span>

          ${e.origin?`
                <span
                  class="
                    recipe-card__tag
                    recipe-card__tag--soft
                  "
                >
                  ${V(e.origin)}
                </span>
              `:``}

          ${e.cookingStyles?.map(e=>`
                  <span
                    class="
                      recipe-card__tag
                      recipe-card__tag--soft
                    "
                  >
                    ${V(U(`cookingStyle`,e))}
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

            data-view-recipe="${V(e.id)}"
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

        ${Oe(e)}

      </div>

    </article>
  `}function Y(){return`
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
  `}function X(){let e=L(P.recipeContainer);if(!e)return;let t=ge();if(t.length===0){e.innerHTML=Y();return}e.innerHTML=t.map(({recipe:e,match:t})=>J(e,t)).join(``)}function Ae(e){e&&(I.recentSurpriseIds=I.recentSurpriseIds.filter(t=>t!==e),I.recentSurpriseIds.unshift(e),I.recentSurpriseIds=I.recentSurpriseIds.slice(0,N))}function je(e){if(e.length<=1)return e;let t=new Set(I.recentSurpriseIds),n=e.filter(e=>!t.has(e.id));return n.length>0?n:e}function Me(){return K()}function Ne(){let e=K();if(e.length===0)return[];if(I.pantry.size===0)return e;let t=b(e,I.pantry);if(t.length===0)return[];let n=t.filter(e=>e.match.canCook);if(n.length>0)return n.map(e=>e.recipe);let r=Math.min(...t.map(e=>e.match.missingCount));return t.filter(e=>e.match.missingCount===r).map(e=>e.recipe)}function Pe(){return I.surpriseUsesPantry?Ne():Me()}function Z(){H(),I.surpriseUsesPantry=!!L(P.usePantryCheckbox)?.checked;let e=Pe();if(e.length===0){let e=L(P.recipeContainer);e&&(e.innerHTML=Y(),e.scrollIntoView({behavior:`smooth`,block:`nearest`}));return}e=je(e);let t=le(e);t&&(I.surpriseRecipeId=t.id,Ae(t.id),I.expandedRecipeIds.clear(),Number.isFinite(I.servingsByRecipe[t.id])||(I.servingsByRecipe[t.id]=M(t.baseServings??2)),Q(),L(P.recipeContainer)?.scrollIntoView({behavior:`smooth`,block:`nearest`}))}function Fe(){let e=L(P.recipeContainer);if(!e)return;let t=I.recipes.find(e=>e.id===I.surpriseRecipeId);if(!t){I.surpriseRecipeId=null,X();return}e.innerHTML=J(t,y(t,I.pantry),{surprise:!0})}function Q(){if(I.surpriseRecipeId){Fe();return}X()}function Ie(e){I.expandedRecipeIds.has(e)?I.expandedRecipeIds.delete(e):I.expandedRecipeIds.add(e),Q(),document.querySelector(`[data-recipe-id="${e}"]`)?.scrollIntoView({behavior:`smooth`,block:`nearest`})}function Le(){let e=L(P.pantryCard)?.querySelector(`small`);if(e){let t=I.pantry.size;e.textContent=t===1?`1 ingredient available`:`${t} ingredients available`}let t=L(P.shoppingCard)?.querySelector(`small`);if(t){let e=I.shopping.size;t.textContent=e===1?`1 item to buy`:`${e} items to buy`}}function $(){fe(),G(),Le(),Q()}function Re(){let e=L(P.advancedToggle),t=L(P.advancedPanel);e?.addEventListener(`click`,()=>{if(!t)return;let n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!n)),t.hidden=n})}function ze(){R(P.filterButtons).forEach(e=>{e.addEventListener(`click`,()=>{de(e.dataset.filterGroup,e.dataset.filterValue),$()})})}function Be(){L(P.resetFiltersButton)?.addEventListener(`click`,me)}function Ve(){L(P.activeFilterList)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-filter-group]`);t&&he(t.dataset.removeFilterGroup,t.dataset.removeFilterValue)})}function He(){L(P.surpriseButton)?.addEventListener(`click`,Z),L(P.usePantryCheckbox)?.addEventListener(`change`,()=>{I.recentSurpriseIds=[]})}function Ue(){L(P.recipeContainer)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-view-recipe]`);if(t){Ie(t.dataset.viewRecipe);return}if(e.target.closest(`[data-pick-again]`)){Z();return}let n=e.target.closest(`[data-serving-change]`);if(n){let e=n.dataset.servingRecipe,t=Number(n.dataset.servingChange);e&&Number.isFinite(t)&&be(e,t)}})}function We(){window.addEventListener(`storage`,()=>{H(),$()})}function Ge(){Re(),ze(),Be(),Ve(),He(),Ue(),We()}async function Ke(){I.recipes=await g(),I.recipes.forEach(e=>{Number.isFinite(I.servingsByRecipe[e.id])||(I.servingsByRecipe[e.id]=M(e.baseServings??2))})}function qe(){let e=L(P.recipeContainer);e&&(e.innerHTML=`
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
  `)}async function Je(){H(),Ge();try{await Ke(),$()}catch(e){console.error(e),qe()}}document.addEventListener(`DOMContentLoaded`,Je);