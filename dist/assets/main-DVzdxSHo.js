import{r as e,t}from"./storage-BrWI33b6.js";var n=`/data/recipes.json`,r=null,i={cuisines:[`filipino`,`japanese`,`korean`,`chinese`,`vietnamese`,`european`,`american`,`mediterranean`],cookingStyles:[`fried`,`stew`,`soup`,`grilled`,`baked`,`stir-fry`,`steamed`,`air-fryer`],servingCategories:[`one`,`couple`,`family`,`party`],difficulties:[`Easy`,`Medium`,`Hard`],sourceTypes:[`original`,`web`,`user`],addedBy:[`built-in`,`ai`,`user`]},a={chicken:[`chicken`,`chicken-breast`,`chicken-thigh`,`chicken-wings`,`chicken-leg`],pork:[`pork`,`pork-belly`,`pork-chop`,`pork-ribs`,`ground-pork`,`bacon`,`ham`],beef:[`beef`,`ground-beef`,`beef-steak`,`beef-ribs`,`beef-brisket`],fish:[`fish`,`salmon`,`tuna`,`tilapia`,`bangus`,`milkfish`,`cod`,`mackerel`,`sardines`],seafood:[`shrimp`,`prawn`,`prawns`,`crab`,`squid`,`mussels`,`clams`,`scallops`,`lobster`,`octopus`],lamb:[`lamb`,`lamb-chop`,`lamb-chops`,`ground-lamb`],tofu:[`tofu`],egg:[`egg`,`eggs`]},o=new Set(`ampalaya.bitter-melon.broccoli.cauliflower.cabbage.pechay.bok-choy.kangkong.spinach.eggplant.talong.okra.squash.kalabasa.zucchini.carrot.carrots.green-beans.sitaw.string-beans.mushroom.mushrooms.potato.potatoes.sweet-potato.kamote.corn.sayote.chayote.radish.labanos.bean-sprouts.togue.bell-pepper`.split(`.`));function s(e){return typeof e==`object`&&!!e&&!Array.isArray(e)}function c(e){return typeof e==`string`&&e.trim().length>0}function l(e){return c(e)?e.trim():null}function u(e){return Array.isArray(e)?[...new Set(e.filter(c).map(e=>e.trim()))]:[]}function ee(e){if(e==null||e===``)return!0;try{let t=new URL(e);return t.protocol===`http:`||t.protocol===`https:`}catch{return!1}}function te(e){return s(e)?{type:c(e.type)?e.type.trim().toLowerCase():`original`,name:c(e.name)?e.name.trim():`Anong Ulam Today?`,url:l(e.url),retrievedAt:l(e.retrievedAt)}:{type:`original`,name:`Anong Ulam Today?`,url:null,retrievedAt:null}}function ne(e){if(!s(e))return null;let t=e.quantity,n=t==null||t===``?null:Number(t);return{id:c(e.id)?e.id.trim().toLowerCase():``,quantity:Number.isFinite(n)?n:null,unit:l(e.unit),amountText:l(e.amountText),scalable:e.scalable!==!1,required:e.required!==!1,substitutes:u(e.substitutes).map(e=>e.toLowerCase())}}function d(e){return s(e)?{label:c(e.label)?e.label.trim():``,note:c(e.note)?e.note.trim():``}:null}function f(e){if(!s(e))return null;let t=Number(e.baseServings);return{id:c(e.id)?e.id.trim().toLowerCase():``,name:c(e.name)?e.name.trim():``,description:c(e.description)?e.description.trim():``,emoji:c(e.emoji)?e.emoji.trim():`🍽️`,cuisine:c(e.cuisine)?e.cuisine.trim().toLowerCase():``,origin:c(e.origin)?e.origin.trim():``,cookingStyles:u(e.cookingStyles).map(e=>e.toLowerCase()),diet:u(e.diet).map(e=>e.toLowerCase()),timeMinutes:Number(e.timeMinutes),difficulty:c(e.difficulty)?e.difficulty.trim():`Easy`,baseServings:Number.isFinite(t)?t:2,servingCategories:u(e.servingCategories).map(e=>e.toLowerCase()),spicy:e.spicy===!0,ingredients:Array.isArray(e.ingredients)?e.ingredients.map(ne).filter(Boolean):[],flexibleIngredients:Array.isArray(e.flexibleIngredients)?e.flexibleIngredients.map(d).filter(Boolean):[],steps:u(e.steps),notes:u(e.notes),source:te(e.source),addedBy:c(e.addedBy)?e.addedBy.trim().toLowerCase():`built-in`}}function p(e,t,n){let r=[],i=`${t}.ingredients[${n}]`;return c(e.id)||r.push(`${i}: ingredient id is required.`),e.scalable===!0&&((!Number.isFinite(e.quantity)||e.quantity<=0)&&r.push(`${i}: scalable ingredients require a positive quantity.`),c(e.unit)||r.push(`${i}: scalable ingredients require a unit.`)),e.scalable===!1&&(c(e.amountText)||r.push(`${i}: non-scalable ingredients require amountText.`)),Array.isArray(e.substitutes)||r.push(`${i}: substitutes must be an array.`),e.substitutes?.includes(e.id)&&r.push(`${i}: ingredient cannot substitute itself.`),r}function m(e,t,n){let r=[],i=`${t}.flexibleIngredients[${n}]`;return c(e.label)||r.push(`${i}: label is required.`),c(e.note)||r.push(`${i}: note is required.`),r}function h(e,t){let n=[];return s(e)?(i.sourceTypes.includes(e.type)||n.push(`${t}: invalid source type "${e.type}".`),c(e.name)||n.push(`${t}: source name is required.`),ee(e.url)||n.push(`${t}: source URL is invalid.`),e.type===`web`&&!c(e.url)&&n.push(`${t}: web recipes require a source URL.`),n):[`${t}: source is required.`]}function g(e){let t=[];if(!s(e))return[`Recipe must be an object.`];let n=e.id||`unknown-recipe`;if(c(e.id)||t.push(`Recipe id is required.`),c(e.id)&&!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(e.id)&&t.push(`${n}: id must use lowercase kebab-case.`),c(e.name)||t.push(`${n}: name is required.`),c(e.description)||t.push(`${n}: description is required.`),i.cuisines.includes(e.cuisine)||t.push(`${n}: invalid cuisine "${e.cuisine}".`),c(e.origin)||t.push(`${n}: origin is required.`),!Array.isArray(e.cookingStyles)||e.cookingStyles.length===0?t.push(`${n}: at least one cooking style is required.`):e.cookingStyles.forEach(e=>{i.cookingStyles.includes(e)||t.push(`${n}: invalid cooking style "${e}".`)}),(!Number.isFinite(e.timeMinutes)||e.timeMinutes<=0)&&t.push(`${n}: timeMinutes must be greater than 0.`),i.difficulties.includes(e.difficulty)||t.push(`${n}: invalid difficulty "${e.difficulty}".`),(!Number.isFinite(e.baseServings)||e.baseServings<=0)&&t.push(`${n}: baseServings must be greater than 0.`),!Array.isArray(e.servingCategories)||e.servingCategories.length===0?t.push(`${n}: at least one serving category is required.`):e.servingCategories.forEach(e=>{i.servingCategories.includes(e)||t.push(`${n}: invalid serving category "${e}".`)}),!Array.isArray(e.ingredients)||e.ingredients.length===0)t.push(`${n}: at least one ingredient is required.`);else{e.ingredients.forEach((e,r)=>{t.push(...p(e,n,r))});let r=e.ingredients.map(e=>e.id);new Set(r).size!==r.length&&t.push(`${n}: duplicate ingredient ids found.`)}return Array.isArray(e.flexibleIngredients)?e.flexibleIngredients.forEach((e,r)=>{t.push(...m(e,n,r))}):t.push(`${n}: flexibleIngredients must be an array.`),(!Array.isArray(e.steps)||e.steps.length===0)&&t.push(`${n}: at least one cooking step is required.`),i.addedBy.includes(e.addedBy)||t.push(`${n}: invalid addedBy value "${e.addedBy}".`),t.push(...h(e.source,n)),t}function re(e){if(!Array.isArray(e))return{valid:!1,errors:[`Recipe library must be an array.`]};let t=[],n=[];e.forEach((e,r)=>{g(e).forEach(e=>{t.push(`Recipe ${r+1}: ${e}`)}),c(e.id)&&n.push(e.id)});let r=new Set;return n.forEach(e=>{r.has(e)&&t.push(`Duplicate recipe id: "${e}".`),r.add(e)}),{valid:t.length===0,errors:t}}async function ie(){if(r)return r;let e=await fetch(n);if(!e.ok)throw Error(`Unable to load recipes.`);let t=await e.json(),i=Array.isArray(t)?t.map(f).filter(Boolean):t,a=re(i);if(!a.valid)throw console.error(`Recipe library validation failed:`),a.errors.forEach(e=>{console.error(`• ${e}`)}),Error(`Recipe library contains ${a.errors.length} validation error(s). Check the browser console.`);return r=i,r}function ae(e){return e.ingredients?.filter(e=>e.required!==!1)??[]}function oe(e){let t=new Set((e.ingredients??[]).map(e=>e.id?.trim().toLowerCase()).filter(Boolean)),n=new Set;return Object.entries(a).forEach(([e,r])=>{r.some(e=>t.has(e))&&n.add(e)}),n.size===0&&[...t].some(e=>o.has(e))&&n.add(`vegetable`),[...n]}function se(e,t){return t.has(e.id)?!0:e.substitutes?.some(e=>t.has(e))??!1}function _(e,t){let n=t instanceof Set?t:new Set(t??[]),r=ae(e),i=[],a=[];r.forEach(e=>{se(e,n)?i.push(e):a.push(e)});let o=r.length,s=o===0?100:Math.round(i.length/o*100);return{total:o,available:i,missing:a,availableCount:i.length,missingCount:a.length,percentage:s,canCook:a.length===0}}function v(e,t){return e.map(e=>({recipe:e,match:_(e,t)})).sort((e,t)=>e.match.canCook===t.match.canCook?e.match.percentage===t.match.percentage?e.match.missingCount===t.match.missingCount?e.recipe.name.localeCompare(t.recipe.name):e.match.missingCount-t.match.missingCount:t.match.percentage-e.match.percentage:Number(t.match.canCook)-Number(e.match.canCook))}function ce(e,t){return!t||t.size===0||t.has(e.cuisine)}function le(e,t){return!t||t.size===0||oe(e).some(e=>t.has(e))}function ue(e,t){return!t||t.size===0||(e.cookingStyles??[]).some(e=>t.has(e))}function de(e,t){return!t||t.size===0||[...t].every(t=>t===`spicy`?e.spicy===!0:e.diet?.includes(t)??!1)}function fe(e,t){if(!t||t.size===0)return!0;let n=[...t].map(Number).filter(Number.isFinite);if(n.length===0)return!0;let r=Math.max(...n);return e.timeMinutes<=r}function pe(e,t){if(!t||t.size===0)return!0;let n=e.servingCategories??[];return[...t].some(e=>n.includes(e))}function me(e,t){return e.filter(e=>ce(e,t.cuisine)&&le(e,t.mainIngredient)&&ue(e,t.cookingStyle)&&de(e,t.diet)&&fe(e,t.time)&&pe(e,t.servings))}function y(e){return!Array.isArray(e)||e.length===0?null:e[Math.floor(Math.random()*e.length)]}var b={one:{label:`One`,people:1,emoji:`👤`},couple:{label:`Couple`,people:2,emoji:`👥`},family:{label:`Family`,people:4,emoji:`👨‍👩‍👧‍👦`},party:{label:`Party`,people:8,emoji:`🎉`}};function x(e){return!Number.isFinite(e)||Number.isInteger(e)?e:e<1?Math.round(e*100)/100:Math.round(e*10)/10}var S=[{value:.25,text:`¼`},{value:.33,text:`⅓`},{value:.5,text:`½`},{value:.66,text:`⅔`},{value:.75,text:`¾`}];function C(e){return S.find(t=>Math.abs(e-t.value)<.04)}function w(e){if(e==null)return``;let t=x(e);if(Number.isInteger(t))return String(t);let n=Math.floor(t),r=C(t-n);return r?n===0?r.text:`${n} ${r.text}`:String(t)}var T={g:`g`,kg:`kg`,ml:`ml`,l:`L`,tsp:`tsp`,tbsp:`tbsp`,cup:`cup`,cups:`cups`,piece:`piece`,pieces:`pieces`,clove:`clove`,cloves:`cloves`,slice:`slice`,slices:`slices`,pack:`pack`,packs:`packs`};function E(e,t){if(!e)return``;if(t===1){if(e===`pieces`)return`piece`;if(e===`cloves`)return`clove`;if(e===`slices`)return`slice`;if(e===`cups`)return`cup`;if(e===`packs`)return`pack`}return T[e]??e}function D(e,t){return t===`g`&&e>=1e3?{quantity:e/1e3,unit:`kg`}:t===`ml`&&e>=1e3?{quantity:e/1e3,unit:`l`}:{quantity:e,unit:t}}function O(e,t){let n=Number(e),r=Number(t);return!Number.isFinite(n)||n<=0||!Number.isFinite(r)||r<=0?1:r/n}function k(e,t,n){if(e.scalable===!1||!Number.isFinite(e.quantity))return{...e,displayAmount:e.amountText||``};let r=O(t,n),i=e.quantity*r,a=e.unit,o=D(i,a);i=o.quantity,a=o.unit;let s=w(i),c=E(a,i);return{...e,scaledQuantity:i,scaledUnit:a,displayAmount:[s,c].filter(Boolean).join(` `)}}function A(e,t){let n=e.baseServings||2;return(e.ingredients??[]).map(e=>k(e,n,t))}function j(e){let t=Number(e);return t<=1?`one`:t<=2?`couple`:t<=6?`family`:`party`}function M(e){let t=Number(e);return Number.isFinite(t)?Math.min(20,Math.max(1,Math.round(t))):2}var N=5,P={advancedToggle:`#advancedToggle`,advancedPanel:`#advancedPanel`,filterButtons:`[data-filter-group][data-filter-value]`,resetFiltersButton:`#resetFiltersButton`,activeFilterList:`#activeFilterList`,filterCount:`#filterCount`,recipeContainer:`.recipe-scroll`,surpriseButton:`#surpriseButton`,usePantryCheckbox:`#usePantryCheckbox`,pantryCard:`.quick-card--pantry`,shoppingCard:`.quick-card--shopping`},F={cuisine:{filipino:`Filipino`,japanese:`Japanese`,korean:`Korean`,chinese:`Chinese`,vietnamese:`Vietnamese`,european:`European`,american:`American`,mediterranean:`Mediterranean`},mainIngredient:{chicken:`Chicken`,pork:`Pork`,beef:`Beef`,fish:`Fish`,seafood:`Seafood`,lamb:`Lamb`,vegetable:`Vegetable`,tofu:`Tofu`,egg:`Egg`},cookingStyle:{fried:`Fried`,stew:`Stew`,soup:`Soup`,grilled:`Grilled`,baked:`Baked`,"stir-fry":`Stir-fry`,steamed:`Steamed`,"air-fryer":`Air Fryer`},diet:{"kid-friendly":`Kid-friendly`,healthy:`Healthy`,"dairy-free":`Dairy-free`,"gluten-free":`Gluten-free`,vegetarian:`Vegetarian`,spicy:`Spicy`},time:{15:`≤ 15 mins`,30:`≤ 30 mins`,45:`≤ 45 mins`,60:`≤ 60 mins`},servings:{one:`One`,couple:`Couple`,family:`Family`,party:`Party`}},I={recipes:[],pantry:new Set,shopping:new Set,filters:{mainIngredient:new Set,cuisine:new Set,cookingStyle:new Set,diet:new Set,time:new Set,servings:new Set},surpriseRecipeId:null,surpriseUsesPantry:!1,recentSurpriseIds:[],expandedRecipeIds:new Set,servingsByRecipe:{}};function L(e){return document.querySelector(e)}function R(e){return document.querySelectorAll(e)}function z(e=``){return e?e.charAt(0).toUpperCase()+e.slice(1):``}function B(e=``){return e.split(`-`).map(z).join(` `)}function V(e=``){return String(e).replaceAll(`&`,`&amp;`).replaceAll(`<`,`&lt;`).replaceAll(`>`,`&gt;`).replaceAll(`"`,`&quot;`).replaceAll(`'`,`&#039;`)}function H(){I.pantry=new Set(e(t.pantry)),I.shopping=new Set(e(t.shopping))}function U(e,t){return F[e]?.[t]??t}function he(e,t){let n=I.filters[e];n&&(n.has(t)?n.delete(t):n.add(t),W())}function W(){I.surpriseRecipeId=null,I.expandedRecipeIds.clear()}function ge(){R(P.filterButtons).forEach(e=>{let t=e.dataset.filterGroup,n=e.dataset.filterValue,r=I.filters[t]?.has(n);e.classList.toggle(`is-selected`,!!r)})}function _e(){let e=[];return Object.entries(I.filters).forEach(([t,n])=>{n.forEach(n=>{e.push({group:t,value:n,label:U(t,n)})})}),e}function ve(){let e=L(P.activeFilterList),t=L(P.filterCount);if(!e||!t)return;let n=_e();if(t.textContent=`${n.length} selected`,n.length===0){e.innerHTML=`
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
        `).join(``)}function ye(){Object.values(I.filters).forEach(e=>e.clear()),W(),$()}function G(e,t){I.filters[e]?.delete(t),W(),$()}function K(){return me(I.recipes,I.filters)}function be(){return v(K(),I.pantry)}function xe(e){if(I.pantry.has(e.id))return{type:`available`,substitute:null};let t=e.substitutes?.find(e=>I.pantry.has(e));return t?{type:`substitute`,substitute:t}:{type:`missing`,substitute:null}}function Se(e){return e.total===0||e.canCook?{className:`is-ready`,label:`✓ Ready to cook`}:e.missingCount===1?{className:`is-almost`,label:`Almost there · Missing 1`}:{className:`is-missing`,label:`Missing ${e.missingCount} ingredients`}}function q(e){let t=I.servingsByRecipe[e.id];if(Number.isFinite(t))return M(t);let n=M(e.baseServings??2);return I.servingsByRecipe[e.id]=n,n}function Ce(e,t){I.servingsByRecipe[e]=M(t)}function we(e,t){let n=I.recipes.find(t=>t.id===e);n&&(Ce(e,q(n)+t),Q())}function Te(e){let t=b[j(e)];return t?`
    ${t.emoji}
    ${t.label}
  `:``}function Ee(e){let t=q(e),n=t<=1,r=t>=20;return`
    <div class="recipe-serving-control">

      <div class="recipe-serving-control__label">
        <strong>
          Servings
        </strong>

        <small>
          ${Te(t)}
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
  `}function De(e){if(!e.ingredients||e.ingredients.length===0)return``;let t=q(e),n=A(e,t);return`
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

        ${n.map(e=>{let t=e.substitutes??[],n=xe(e),r=``;I.pantry.size>0&&(n.type===`available`&&(r=`
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
  `}function Oe(e){return!e.flexibleIngredients||e.flexibleIngredients.length===0?``:`
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
  `}function ke(e){return!e.steps||e.steps.length===0?``:`
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
  `}function Ae(e){return!e.notes||e.notes.length===0?``:`
    <div class="recipe-notes">

      ${e.notes.map(e=>`
            <p>
              💡 ${V(e)}
            </p>
          `).join(``)}

    </div>
  `}function je(e){let t=e.source;return t?t.type===`original`?`
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
  `:``}function Me(e){return I.expandedRecipeIds.has(e.id)?`
    <div class="recipe-card__details">

      <p class="recipe-card__description">
        ${V(e.description??``)}
      </p>

      ${Ee(e)}

      ${De(e)}

      ${Oe(e)}

      ${ke(e)}

      ${Ae(e)}

      ${je(e)}

    </div>
  `:``}function Ne(e){return I.surpriseRecipeId?I.surpriseUsesPantry?I.pantry.size===0?`
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
    `:``}function J(e,t,n={}){let{surprise:r=!1}=n,i=I.expandedRecipeIds.has(e.id),a=z(e.cuisine),o=Se(t),s=t.total>0?`${t.availableCount}/${t.total} ingredients`:`No required ingredients`;return`
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

        ${Ne(t)}

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

        ${Me(e)}

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
  `}function X(){let e=L(P.recipeContainer);if(!e)return;let t=be();if(t.length===0){e.innerHTML=Y();return}e.innerHTML=t.map(({recipe:e,match:t})=>J(e,t)).join(``)}function Pe(e){e&&(I.recentSurpriseIds=I.recentSurpriseIds.filter(t=>t!==e),I.recentSurpriseIds.unshift(e),I.recentSurpriseIds=I.recentSurpriseIds.slice(0,N))}function Fe(e){if(e.length<=1)return e;let t=new Set(I.recentSurpriseIds),n=e.filter(e=>!t.has(e.id));return n.length>0?n:e}function Ie(){return K()}function Le(){let e=K();if(e.length===0)return[];if(I.pantry.size===0)return e;let t=v(e,I.pantry);if(t.length===0)return[];let n=t.filter(e=>e.match.canCook);if(n.length>0)return n.map(e=>e.recipe);let r=Math.min(...t.map(e=>e.match.missingCount));return t.filter(e=>e.match.missingCount===r).map(e=>e.recipe)}function Re(){return I.surpriseUsesPantry?Le():Ie()}function Z(){H(),I.surpriseUsesPantry=!!L(P.usePantryCheckbox)?.checked;let e=Re();if(e.length===0){let e=L(P.recipeContainer);e&&(e.innerHTML=Y(),e.scrollIntoView({behavior:`smooth`,block:`nearest`}));return}e=Fe(e);let t=y(e);t&&(I.surpriseRecipeId=t.id,Pe(t.id),I.expandedRecipeIds.clear(),Number.isFinite(I.servingsByRecipe[t.id])||(I.servingsByRecipe[t.id]=M(t.baseServings??2)),Q(),L(P.recipeContainer)?.scrollIntoView({behavior:`smooth`,block:`nearest`}))}function ze(){let e=L(P.recipeContainer);if(!e)return;let t=I.recipes.find(e=>e.id===I.surpriseRecipeId);if(!t){I.surpriseRecipeId=null,X();return}e.innerHTML=J(t,_(t,I.pantry),{surprise:!0})}function Q(){if(I.surpriseRecipeId){ze();return}X()}function Be(e){I.expandedRecipeIds.has(e)?I.expandedRecipeIds.delete(e):I.expandedRecipeIds.add(e),Q(),document.querySelector(`[data-recipe-id="${e}"]`)?.scrollIntoView({behavior:`smooth`,block:`nearest`})}function Ve(){let e=L(P.pantryCard)?.querySelector(`small`);if(e){let t=I.pantry.size;e.textContent=t===1?`1 ingredient available`:`${t} ingredients available`}let t=L(P.shoppingCard)?.querySelector(`small`);if(t){let e=I.shopping.size;t.textContent=e===1?`1 item to buy`:`${e} items to buy`}}function $(){ge(),ve(),Ve(),Q()}function He(){let e=L(P.advancedToggle),t=L(P.advancedPanel);e?.addEventListener(`click`,()=>{if(!t)return;let n=e.getAttribute(`aria-expanded`)===`true`;e.setAttribute(`aria-expanded`,String(!n)),t.hidden=n})}function Ue(){R(P.filterButtons).forEach(e=>{e.addEventListener(`click`,()=>{he(e.dataset.filterGroup,e.dataset.filterValue),$()})})}function We(){L(P.resetFiltersButton)?.addEventListener(`click`,ye)}function Ge(){L(P.activeFilterList)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-remove-filter-group]`);t&&G(t.dataset.removeFilterGroup,t.dataset.removeFilterValue)})}function Ke(){L(P.surpriseButton)?.addEventListener(`click`,Z),L(P.usePantryCheckbox)?.addEventListener(`change`,()=>{I.recentSurpriseIds=[]})}function qe(){L(P.recipeContainer)?.addEventListener(`click`,e=>{let t=e.target.closest(`[data-view-recipe]`);if(t){Be(t.dataset.viewRecipe);return}if(e.target.closest(`[data-pick-again]`)){Z();return}let n=e.target.closest(`[data-serving-change]`);if(n){let e=n.dataset.servingRecipe,t=Number(n.dataset.servingChange);e&&Number.isFinite(t)&&we(e,t)}})}function Je(){window.addEventListener(`storage`,()=>{H(),$()})}function Ye(){He(),Ue(),We(),Ge(),Ke(),qe(),Je()}async function Xe(){I.recipes=await ie(),I.recipes.forEach(e=>{Number.isFinite(I.servingsByRecipe[e.id])||(I.servingsByRecipe[e.id]=M(e.baseServings??2))})}function Ze(){let e=L(P.recipeContainer);e&&(e.innerHTML=`
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
  `)}async function Qe(){H(),Ye();try{await Xe(),$()}catch(e){console.error(e),Ze()}}document.addEventListener(`DOMContentLoaded`,Qe);