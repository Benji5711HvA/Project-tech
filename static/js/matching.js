// alle kaarten ophalen
const cards = document.querySelectorAll(".vacancy-card")
const clearFiltersBtn = document.getElementById("wisFilters")
const preferencesBtn = document.getElementById("voorkeurenFilter")

// actieve filters bijhouden
const activeFilters = {
  category: [],
  hours: [],
  contract: [],
  education: []
}

let preferencesActive = false

// gebruikersvoorkeuren laden in de filters
function loadUserPreferences() {
  const prefs = document.getElementById("user-prefs")
  if (!prefs) return

  const sector = prefs.dataset.sector
  const education = prefs.dataset.education
  const hours = prefs.dataset.hours
  const contract = prefs.dataset.contract

  if (sector) {
    activeFilters.category.push(sector)
    const cb = document.querySelector(`.filter-checkbox[data-filter="category"][value="${sector}"]`)
    if (cb) cb.checked = true
  }
  if (education) {
    activeFilters.education.push(education)
    const cb = document.querySelector(`.filter-checkbox[data-filter="education"][value="${education}"]`)
    if (cb) cb.checked = true
  }
  if (hours) {
    activeFilters.hours.push(hours)
    const cb = document.querySelector(`.filter-checkbox[data-filter="hours"][value="${hours}"]`)
    if (cb) cb.checked = true
  }
  if (contract) {
    activeFilters.contract.push(contract)
    const cb = document.querySelector(`.filter-checkbox[data-filter="contract"][value="${contract}"]`)
    if (cb) cb.checked = true
  }

  applyFilters()
}

// mijn voorkeuren knop aan/uitzetten
preferencesBtn.addEventListener("click", function handlePreferencesClick() {
  preferencesActive = !preferencesActive
  preferencesBtn.classList.toggle("active", preferencesActive)

  if (preferencesActive) {
    loadUserPreferences()
  } else {
    Object.keys(activeFilters).forEach(function resetKey(key) {
      activeFilters[key] = []
    })
    document.querySelectorAll(".filter-checkbox").forEach(function uncheck(cb) {
      cb.checked = false
    })
    applyFilters()
  }
})

// filter dropdowns openen en sluiten
document.querySelectorAll(".filter-btn").forEach(function addDropdownListener(btn) {
  btn.addEventListener("click", function handleDropdownClick() {
    const filterKey = btn.dataset.filter
    const dropdown = document.getElementById("dropdown-" + filterKey)

    document.querySelectorAll(".filter-dropdown").forEach(function closeOthers(el) {
      if (el !== dropdown) {
        el.classList.remove("active")
      }
    })

    dropdown.classList.toggle("active")
  })
})

// dropdown sluiten als je erbuiten klikt
document.addEventListener("click", function handleOutsideClick(event) {
  const clickedInsideFilter = event.target.closest(".filter-group")
  if (!clickedInsideFilter) {
    document.querySelectorAll(".filter-dropdown").forEach(function closeDropdown(el) {
      el.classList.remove("active")
    })
  }
})

// filter aanvinken of uitvinken
document.querySelectorAll(".filter-checkbox").forEach(function addCheckboxListener(checkbox) {
  checkbox.addEventListener("change", function handleCheckboxChange() {
    const filterKey = checkbox.dataset.filter
    const value = checkbox.value

    if (checkbox.checked) {
      activeFilters[filterKey].push(value)
    } else {
      activeFilters[filterKey] = activeFilters[filterKey].filter(function removeValue(v) {
        return v !== value
      })
    }

    applyFilters()
  })
})

// kaarten tonen of verbergen op basis van filters
function applyFilters() {
  const noActiveFilters =
    activeFilters.category.length === 0 &&
    activeFilters.hours.length === 0 &&
    activeFilters.contract.length === 0 &&
    activeFilters.education.length === 0

  cards.forEach(function checkCard(card) {
    const cardCategory = card.dataset.category || ""
    const cardHours = card.dataset.hours || ""
    const cardContract = card.dataset.contract || ""
    const cardEducation = card.dataset.education || ""

    if (noActiveFilters) {
      card.style.display = "flex"
    } else if (preferencesActive) {
      // bij voorkeuren: kaart tonen als minstens 1 ding overeenkomt
      const hasMatch =
        activeFilters.category.includes(cardCategory) ||
        activeFilters.hours.includes(cardHours) ||
        activeFilters.contract.includes(cardContract) ||
        activeFilters.education.includes(cardEducation)

      card.style.display = hasMatch ? "flex" : "none"
    } else {
      // bij losse filters: alles moet kloppen
      const categoryMatches = activeFilters.category.length === 0 || activeFilters.category.includes(cardCategory)
      const hoursMatches = activeFilters.hours.length === 0 || activeFilters.hours.includes(cardHours)
      const contractMatches = activeFilters.contract.length === 0 || activeFilters.contract.includes(cardContract)

      card.style.display = categoryMatches && hoursMatches && contractMatches ? "flex" : "none"
    }

    // tags oranje maken als ze overeenkomen met een filter
    card.querySelectorAll(".card-tag").forEach(function updateTag(tag) {
      const type = tag.dataset.filterType
      const value = tag.dataset.filterValue
      if (activeFilters[type] && activeFilters[type].includes(value)) {
        tag.classList.add("active-filter")
      } else {
        tag.classList.remove("active-filter")
      }
    })
  })
}

// alle filters wissen
clearFiltersBtn.addEventListener("click", function handleClearFilters() {
  preferencesActive = false
  preferencesBtn.classList.remove("active")

  Object.keys(activeFilters).forEach(function resetFilter(key) {
    activeFilters[key] = []
  })

  document.querySelectorAll(".filter-checkbox").forEach(function uncheckAll(cb) {
    cb.checked = false
  })

  document.querySelectorAll(".vacancy-card").forEach(function showAll(card) {
    card.style.display = "flex"
    card.querySelectorAll(".card-tag").forEach(function resetTag(tag) {
      tag.classList.remove("active-filter")
    })
  })
})

// toast melding tonen
function showToast(title, message) {
  const toast = document.getElementById("toast")
  document.getElementById("toast-title").textContent = title
  document.getElementById("toast-message").textContent = message
  toast.classList.add("visible")
  setTimeout(function hideToast() {
    toast.classList.remove("visible")
  }, 4000)
}

// reactie sturen naar de server
async function sendReaction(vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType, card) {
  try {
    const response = await fetch("/match-reaction", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType })
    })
    const result = await response.json()
    if (result.success) {
      if (reaction === "yes") {
        showToast(
          "Aanvraag verstuurd!",
          `Je hebt gereageerd op de vacature ${vacancyTitle} bij ${company}. Je kunt de status volgen via je dashboard.`
        )
        card.classList.add("disappear")
        setTimeout(function removeCard() {
          card.remove()
        }, 400)
      } else if (reaction === "no") {
        showToast(
          "Vacature overgeslagen",
          `Je hebt de vacature ${vacancyTitle} bij ${company} overgeslagen.`
        )
        card.classList.add("disappear")
        setTimeout(function removeCard() {
          card.remove()
        }, 400)
      } else if (reaction === "favorite") {
        showToast(
          "Toegevoegd aan favorieten!",
          `${vacancyTitle} bij ${company} is opgeslagen in je favorieten.`
        )
      }
    }
  } catch (error) {
    console.error("Fout bij versturen reactie:", error)
  }
}

// ja of nee knop klikken
document.querySelectorAll(".yes-button, .no-button").forEach(function addReactionListener(button) {
  button.addEventListener("click", function handleReactionClick() {
    const { vacancyId, vacancyTitle, company, location, salary, hoursPerWeek, contractType } = button.dataset
    const reaction = button.classList.contains("yes-button") ? "yes" : "no"
    const card = button.closest(".vacancy-card")
    sendReaction(vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType, card)
  })
})

// meer info knop opent de popup met hetzelfde vacancy id
document.querySelectorAll(".more-info-button").forEach(function addMoreInfoListener(button) {
  button.addEventListener("click", function handleMoreInfoClick() {
    const vacancyId = button.dataset.vacancyId
    const popup = document.getElementById("popup-" + vacancyId)
    popup.classList.add("active")
  })
})

// sluit knop in popup
document.querySelectorAll(".close-button").forEach(function addCloseListener(button) {
  button.addEventListener("click", function handleCloseClick() {
    const popup = button.closest(".popup")
    popup.classList.remove("active")
  })
})

// klik op de donkere achtergrond sluit ook de popup
document.querySelectorAll(".popup").forEach(function addOverlayListener(popup) {
  popup.addEventListener("click", function handleOverlayClick(e) {
    if (e.target === popup) {
      popup.classList.remove("active")
    }
  })
})

// favoriet knop aan/uitzetten
document.querySelectorAll(".favorite-button").forEach(function addFavoriteListener(button) {
  button.addEventListener("click", function handleFavoriteClick() {
    const { vacancyId, vacancyTitle, company, location, salary, hoursPerWeek, contractType } = button.dataset
    const card = button.closest(".vacancy-card")
    button.classList.toggle("active")
    sendReaction(vacancyId, vacancyTitle, company, "favorite", location, salary, hoursPerWeek, contractType, card)
  })
})