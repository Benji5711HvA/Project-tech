// Tab wisselen tussen browsen en matches
function activateTab(tabName) {
  document.querySelectorAll(".toggle-btn").forEach(function deactivate(btn) {
    btn.classList.remove("active")
  })
  document.querySelectorAll(".vacancies-list").forEach(function hideAll(section) {
    section.classList.add("hidden")
  })
  document.querySelector(".toggle-btn[data-tab='" + tabName + "']").classList.add("active")
  document.getElementById("tab-" + tabName).classList.remove("hidden")
}

document.querySelectorAll(".toggle-btn").forEach(function addTabListener(btn) {
  btn.addEventListener("click", function handleTabClick() {
    activateTab(btn.dataset.tab)
  })
})

document.querySelectorAll(".zero-state-btn[data-tab]").forEach(function addZeroStateListener(btn) {
  btn.addEventListener("click", function handleZeroStateClick() {
    activateTab(btn.dataset.tab)
  })
})

// Toast melding tonen
function showToast(title, message) {
  const toast = document.getElementById("toast")
  document.getElementById("toast-title").textContent = title
  document.getElementById("toast-message").textContent = message
  toast.classList.add("visible")
  setTimeout(function hideToast() {
    toast.classList.remove("visible")
  }, 4000)
}

// Like versturen naar de server en opslaan in de database
async function sendLike(userId, name, card) {
  try {
    const response = await fetch("/company-like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId: userId })
    })
    const result = await response.json()

    if (result.success) {
      if (result.matched) {
        showToast(
          "Het is een match!",
          "Jullie hebben elkaar geliked. Je kunt " + name + " nu contacteren via de Matches tab."
        )
      } else {
        showToast(
          "Like verstuurd!",
          "Je hebt interesse getoond in " + name + ". Je ziet een match zodra de kandidaat ook interesse toont."
        )
      }
      card.classList.add("disappear")
      setTimeout(function removeCard() {
        card.remove()
      }, 400)
    }
  } catch (error) {
    console.error("Fout bij versturen like:", error)
  }
}

// Klik op ja-knop: like opslaan in database
document.querySelectorAll(".yes-btn").forEach(function addYesListener(button) {
  button.addEventListener("click", function handleYesClick() {
    const userId = button.dataset.userId
    const name = button.dataset.name
    const card = button.closest(".candidate-card")
    sendLike(userId, name, card)
  })
})

// Klik op nee-knop: kandidaat overslaan (wordt niet opgeslagen in database)
document.querySelectorAll(".no-btn").forEach(function addNoListener(button) {
  button.addEventListener("click", function handleNoClick() {
    const name = button.dataset.name
    const card = button.closest(".candidate-card")
    showToast("Kandidaat overgeslagen", "Je hebt " + name + " overgeslagen.")
    card.classList.add("disappear")
    setTimeout(function removeCard() {
      card.remove()
    }, 400)
  })
})

// Popup openen
document.querySelectorAll(".more-info-btn").forEach(function addMoreInfoListener(button) {
  button.addEventListener("click", function handleMoreInfoClick() {
    const card = button.closest(".candidate-card")
    const popup = card.querySelector(".popup")
    popup.classList.add("active")
  })
})

// Popup sluiten
document.querySelectorAll(".close-btn").forEach(function addCloseListener(button) {
  button.addEventListener("click", function handleCloseClick() {
    const popup = button.closest(".popup")
    popup.classList.remove("active")
  })
})