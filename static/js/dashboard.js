// Haal alle verwijder knoppen op zodat we ze klikbaar kunnen maken
const deleteButtons = document.querySelectorAll('.delete-button')
const btnSaved = document.getElementById('btn-saved')
const btnFavorites = document.getElementById('btn-favorites')
const btnMatches = document.getElementById('btn-matches')

// Lees het vacature id van de knop uit en stuur het door naar de verwijder functie
function handleDeleteClick(button) {
  const id = button.dataset.id
  deleteFavorite(id)
}

// Koppel een klik event aan een verwijder knop zodat hij reageert als de gebruiker erop klikt
function addDeleteListener(button) {
  button.addEventListener('click', function handleClick() {
    handleDeleteClick(button)
  })
}

// Koppel het klik event alleen als er verwijder knoppen op de pagina staan
if (deleteButtons.length > 0) {
  deleteButtons.forEach(addDeleteListener)
}

// Laat het sollicitaties tabje zien als de gebruiker daarop klikt
function handleSavedClick() {
  showTab('saved')
}

// Laat het favorieten tabje zien als de gebruiker daarop klikt
function handleFavoritesClick() {
  showTab('favorites')
}

// Laat het matches tabje zien als de gebruiker daarop klikt
function handleMatchesClick() {
  showTab('matches')
}

btnSaved.addEventListener('click', handleSavedClick)
btnFavorites.addEventListener('click', handleFavoritesClick)
btnMatches.addEventListener('click', handleMatchesClick)

// Verberg alle tabjes en laat alleen het gekozen tabje zien
function showTab(tabName) {
  const tabSaved = document.getElementById('tab-saved')
  const tabFavorites = document.getElementById('tab-favorites')
  const tabMatches = document.getElementById('tab-matches')

  // Verberg eerst alle tabjes zodat we daarna alleen het juiste kunnen laten zien
  tabSaved.classList.add('hidden')
  tabFavorites.classList.add('hidden')
  tabMatches.classList.add('hidden')

  // Haal de actieve stijl weg bij alle knoppen zodat alleen de juiste knop actief wordt
  btnSaved.classList.remove('active')
  btnFavorites.classList.remove('active')
  btnMatches.classList.remove('active')

  // Laat het juiste tabje zien en markeer de bijbehorende knop als actief
  if (tabName === 'saved') {
    tabSaved.classList.remove('hidden')
    btnSaved.classList.add('active')
  } else if (tabName === 'favorites') {
    tabFavorites.classList.remove('hidden')
    btnFavorites.classList.add('active')
  } else {
    tabMatches.classList.remove('hidden')
    btnMatches.classList.add('active')
  }
}

// Stuur een verzoek naar de server om de vacature uit de favorieten te verwijderen
async function deleteFavorite(id) {
  try {
    const response = await fetch(`/favorites/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    // Als het verwijderen gelukt is haal dan het kaartje van de pagina
    if (data.success) {
      const card = document.getElementById(`card-${id}`)
      card.remove()

      // Kijk welk tabje momenteel zichtbaar is zodat we daarin kunnen controleren of het leeg is
      const activeTab = document.querySelector('.tab:not(.hidden)')
      const cards = activeTab.querySelectorAll('.vacancy-card')

      // Kies de juiste lege staat tekst op basis van welk tabje open staat
      const isSaved = activeTab.id === 'tab-saved'
      const zeroStateText = isSaved
        ? 'Nog geen opgeslagen vacatures. Ga op zoek naar jouw droombaan!'
        : 'Je lijst is leeg. Tijd om te ontdekken wat er voor jou is!'

      // Als er geen kaartjes meer over zijn laat dan de lege staat zien
      if (cards.length === 0) {
        const grid = activeTab.querySelector('.favorites-grid')
        grid.classList.add('zero-state-container')
        grid.innerHTML = `
          <div class="zero-state">
            <p class="zero-state-text">${zeroStateText}</p>
            <a href="/matching" class="zero-state-button">Zoek vacatures</a>
          </div>
        `
      }
    }
  } catch (err) {
    console.error('Fout bij verwijderen favoriet:', err)
  }
}