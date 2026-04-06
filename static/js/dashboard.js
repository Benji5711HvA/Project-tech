// Haal alle verwijder knoppen op zodat we ze klikbaar kunnen maken
const deleteButtons = document.querySelectorAll('.delete-button')
const btnSaved = document.getElementById('btn-saved')
const btnFavorites = document.getElementById('btn-favorites')
const btnMatches = document.getElementById('btn-matches') 
// Verwijder de favoriet op basis van het id van de knop
function handleDeleteClick(button) {
  const id = button.dataset.id
  deleteFavorite(id)
}

// Voeg een klik event toe aan een knop
function addDeleteListener(button) {
  button.addEventListener('click', function handleClick() {
    handleDeleteClick(button)
  })
}

// Voeg een klik event toe aan elke verwijder knop alleen als er knoppen zijn
if (deleteButtons.length > 0) {
  deleteButtons.forEach(addDeleteListener)
}

// Laat het opgeslagen tabje zien als de gebruiker daarop klikt
function handleSavedClick() {
  showTab('saved')
}

// Laat het favorieten tabje zien als de gebruiker daarop klikt
function handleFavoritesClick() {
  showTab('favorites')
}

btnSaved.addEventListener('click', handleSavedClick)
btnFavorites.addEventListener('click', handleFavoritesClick)
btnMatches.addEventListener('click', function handleMatchesClick() {
  showTab('matches')
})
// Wissel het zichtbare tabje op basis van wat de gebruiker aanklikt
function showTab(tabName) {
  const tabSaved = document.getElementById('tab-saved')
  const tabFavorites = document.getElementById('tab-favorites')
const tabMatches = document.getElementById('tab-matches')
  // Verberg eerst alles zodat we daarna alleen het juiste tabje kunnen laten zien
  tabSaved.classList.add('hidden')
  tabFavorites.classList.add('hidden')
tabMatches.classList.add('hidden')

  // Haal de actieve stijl weg zodat alleen de juiste knop oranje wordt
  btnSaved.classList.remove('active')
  btnFavorites.classList.remove('active')
  btnMatches.classList.remove('active')

  // Laat het juiste tabje zien en maak de bijbehorende knop actief
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

// Stuur een verzoek naar de server om de favoriet te verwijderen
async function deleteFavorite(id) {
  try {
    const response = await fetch(`/favorites/${id}`, {
      method: 'DELETE'
    })

    const data = await response.json()

    // Als het gelukt is haal het kaartje van de pagina
    if (data.success) {
      const card = document.getElementById(`card-${id}`)
      card.remove()

      // Controleer of er nog kaartjes over zijn in de actieve tab
      const activeTab = document.querySelector('.tab:not(.hidden)')
      const cards = activeTab.querySelectorAll('.vacancy-card')

      // Bepaal de juiste tekst op basis van welke tab actief is
      const isSaved = activeTab.id === 'tab-saved'
      const zeroStateText = isSaved
        ? 'Nog geen opgeslagen vacatures. Ga op zoek naar jouw droombaan!'
        : 'Je lijst is leeg. Tijd om te ontdekken wat er voor jou is!'

      // Als er geen kaartjes meer zijn toon dan de zero state
      if (cards.length === 0) {
        const grid = activeTab.querySelector('.favorites-grid')
        grid.style.display = 'flex'
        grid.style.flexDirection = 'column'
        grid.style.alignItems = 'center'
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