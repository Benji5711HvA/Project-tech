const cards = document.querySelectorAll(".vacancy-card")
const wisFilters = document.getElementById("wisFilters")

async function sendReaction(vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType, card) {
  try {
    const response = await fetch("/match-reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType })
    })
    const result = await response.json()
    if (result.success) {
      const feedback = card.querySelector(".feedback-message")
      feedback.textContent = reaction === "yes" ? "Opgeslagen!" : reaction === "favorite" ? "Favoriet!" : "Overgeslagen"
      setTimeout(function clearFeedback() {
        feedback.textContent = ""
      }, 800)
    }
  } catch (error) {
    console.error("Fout bij versturen reactie:", error)
  }
}

document.querySelectorAll(".yes-button, .no-button").forEach(function addReactionListener(button) {
  button.addEventListener("click", function handleReactionClick() {
    const { vacancyId, vacancyTitle, company, location, salary, hoursPerWeek, contractType } = button.dataset
    const reaction = button.classList.contains("yes-button") ? "yes" : "no"
    const card = button.closest(".vacancy-card")
    sendReaction(vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType, card)
  })
})

document.querySelectorAll(".more-info-button").forEach(function addMoreInfoListener(button) {
  button.addEventListener("click", function handleMoreInfoClick() {
    const card = button.closest(".vacancy-card")
    const popup = card.querySelector(".popup")
    popup.classList.add("active")
  })
})

document.querySelectorAll(".close-button").forEach(function addCloseListener(button) {
  button.addEventListener("click", function handleCloseClick() {
    const popup = button.closest(".popup")
    popup.classList.remove("active")
  })
})

document.querySelectorAll(".favorite-button").forEach(function addFavoriteListener(button) {
  button.addEventListener("click", function handleFavoriteClick() {
    const { vacancyId, vacancyTitle, company, location, salary, hoursPerWeek, contractType } = button.dataset
    const card = button.closest(".vacancy-card")
    button.classList.toggle("active")
    sendReaction(vacancyId, vacancyTitle, company, "favorite", location, salary, hoursPerWeek, contractType, card)
  })
})