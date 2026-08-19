const advancedToggle =
  document.querySelector("#advancedToggle");

const advancedPanel =
  document.querySelector("#advancedPanel");

const cuisineButtons =
  document.querySelectorAll(".cuisine-card");


function toggleAdvancedSearch() {
  const isOpen =
    advancedToggle.getAttribute("aria-expanded") === "true";

  advancedToggle.setAttribute(
    "aria-expanded",
    String(!isOpen)
  );

  advancedPanel.hidden = isOpen;
}


function selectCuisine(button) {
  button.classList.toggle("is-selected");
}


advancedToggle?.addEventListener(
  "click",
  toggleAdvancedSearch
);


cuisineButtons.forEach((button) => {

  button.addEventListener("click", () => {
    selectCuisine(button);
  });

});