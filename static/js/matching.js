const cards = document.querySelectorAll(".vacancy-card")
const wisFilters = document.getElementById("wisFilters")
const voorkeurenBtn = document.getElementById("voorkeurenFilter")

const activeFilters = {
  category: [],
  hours: [],
  contract: [],
  education: []
}

let voorkeurenActief = false

function laadGebruikersVoorkeuren() {
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

voorkeurenBtn.addEventListener("click", function handleVoorkeurenClick() {
  voorkeurenActief = !voorkeurenActief
  voorkeurenBtn.classList.toggle("active", voorkeurenActief)

  if (voorkeurenActief) {
    laadGebruikersVoorkeuren()
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

document.addEventListener("click", function handleOutsideClick(event) {
  const clickedInsideFilter = event.target.closest(".filter-group")
  if (!clickedInsideFilter) {
    document.querySelectorAll(".filter-dropdown").forEach(function closeDropdown(el) {
      el.classList.remove("active")
    })
  }
})

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

function applyFilters() {
  const geenFiltersActief =
    activeFilters.category.length === 0 &&
    activeFilters.hours.length === 0 &&
    activeFilters.contract.length === 0 &&
    activeFilters.education.length === 0

  cards.forEach(function checkCard(card) {
    const cardCategory = card.dataset.category || ""
    const cardHours = card.dataset.hours || ""
    const cardContract = card.dataset.contract || ""
    const cardEducation = card.dataset.education || ""

    if (geenFiltersActief) {
      card.style.display = "flex"
    } else if (voorkeurenActief) {
      const eenMatch =
        activeFilters.category.includes(cardCategory) ||
        activeFilters.hours.includes(cardHours) ||
        activeFilters.contract.includes(cardContract) ||
        activeFilters.education.includes(cardEducation)

      card.style.display = eenMatch ? "flex" : "none"
    } else {
      const categoryKlopt = activeFilters.category.length === 0 || activeFilters.category.includes(cardCategory)
      const hoursKlopt = activeFilters.hours.length === 0 || activeFilters.hours.includes(cardHours)
      const contractKlopt = activeFilters.contract.length === 0 || activeFilters.contract.includes(cardContract)

      card.style.display = categoryKlopt && hoursKlopt && contractKlopt ? "flex" : "none"
    }

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

wisFilters.addEventListener("click", function handleWisFilters() {
  voorkeurenActief = false
  voorkeurenBtn.classList.remove("active")

  Object.keys(activeFilters).forEach(function resetFilter(key) {
    activeFilters[key] = []
  })

  document.querySelectorAll(".filter-checkbox").forEach(function uncheckAll(cb) {
    cb.checked = false
  })

  cards.forEach(function showAll(card) {
    card.style.display = "flex"
    card.querySelectorAll(".card-tag").forEach(function resetTag(tag) {
      tag.classList.remove("active-filter")
    })
  })
})

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