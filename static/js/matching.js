const cards = document.querySelectorAll(".vacancy-card")
const wisFilters = document.getElementById("wisFilters")

const activeFilters = {
  category: [],
  hours: [],
  contract: []
}

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
  cards.forEach(function checkCard(card) {
    const cardCategory = card.dataset.category || ""
    const cardHours = card.dataset.hours || ""
    const cardContract = card.dataset.contract || ""

    const categoryKlopt = activeFilters.category.length === 0 || activeFilters.category.includes(cardCategory)
    const hoursKlopt = activeFilters.hours.length === 0 || activeFilters.hours.includes(cardHours)
    const contractKlopt = activeFilters.contract.length === 0 || activeFilters.contract.includes(cardContract)

    if (categoryKlopt && hoursKlopt && contractKlopt) {
      card.style.display = "flex"
    } else {
      card.style.display = "none"
    }
  })
}

wisFilters.addEventListener("click", function handleWisFilters() {
  Object.keys(activeFilters).forEach(function resetFilter(key) {
    activeFilters[key] = []
  })

  document.querySelectorAll(".filter-checkbox").forEach(function uncheckAll(cb) {
    cb.checked = false
  })

  cards.forEach(function showAll(card) {
    card.style.display = "flex"
  })
})

async function sendReaction(vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType, card) {
  try {
    const response = await fetch('/match-reaction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vacancyId, vacancyTitle, company, reaction })
    })

    const result = await response.json()

    if (result.success) {
      // Laat de gebruiker zien of de vacature is opgeslagen of overgeslagen
      feedbackMessage.textContent = reaction === 'yes' ? 'Opgeslagen!' : 'Overgeslagen'
      setTimeout(function moveToNext() {
        feedbackMessage.textContent = ''
        goToNext()
      }, 800)
    }
  } catch (error) {
    console.error('Fout bij versturen reactie:', error)
  }
}

previousButton.addEventListener('click', goToPrev)
nextButton.addEventListener('click', goToNext)

document.querySelectorAll('.yes-button, .no-button').forEach(function addReactionListener(button) {
  button.addEventListener('click', function handleReactionClick() {
    const { vacancyId, vacancyTitle, company } = button.dataset
    const reaction = button.classList.contains('yes-button') ? 'yes' : 'no'
    sendReaction(vacancyId, vacancyTitle, company, reaction)
  })
})
document.querySelectorAll('.more-info-button').forEach(function addMoreInfoListener(button) {
  button.addEventListener('click', function handleMoreInfoClick() {
    const card = button.closest('.vacancy-card')
    const popup = card.querySelector('.popup')
    popup.classList.add('active')
  })
})

document.querySelectorAll('.close-button').forEach(function addCloseListener(button) {
  button.addEventListener('click', function handleCloseClick() {
    const popup = button.closest('.popup')
    popup.classList.remove('active')
  })
})
document.querySelectorAll('.favorite-button').forEach(function addFavoriteListener(button) {
  button.addEventListener('click', function handleFavoriteClick() {
    button.classList.toggle('active')
  })
})
showCard(currentIndex)