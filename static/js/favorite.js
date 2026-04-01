// Haal alle verwijder knoppen op zodat we ze klikbaar kunnen maken
const deleteButtons = document.querySelectorAll('.verwijder-knop')
const btnOpgeslagen = document.getElementById('btn-opgeslagen')
const btnFavorieten = document.getElementById('btn-favorieten')

// Voeg een klik event toe aan elke verwijder knop alleen als er knoppen zijn
if (deleteButtons.length > 0) {
  deleteButtons.forEach(function addDeleteListener(button) {
    button.addEventListener('click', function handleDeleteClick() {
      const id = button.dataset.id
      deleteFavorite(id)
    })
  })
}

// Voeg klik events toe aan de toggle knoppen
btnOpgeslagen.addEventListener('click', function handleOpgeslagenClick() {
  showTab('opgeslagen')
})

btnFavorieten.addEventListener('click', function handleFavorietenClick() {
  showTab('favorieten')
})

// Wissel het zichtbare tabje op basis van wat de gebruiker aanklikt
function showTab(tabName) {
  const tabOpgeslagen = document.getElementById('tab-opgeslagen')
  const tabFavorieten = document.getElementById('tab-favorieten')

  // Verberg eerst alles zodat we daarna alleen het juiste tabje kunnen laten zien
  tabOpgeslagen.classList.add('verborgen')
  tabFavorieten.classList.add('verborgen')

  // Haal de actieve stijl weg zodat alleen de juiste knop oranje wordt
  btnOpgeslagen.classList.remove('actief')
  btnFavorieten.classList.remove('actief')

  // Laat het juiste tabje zien en maak de bijbehorende knop oranje
  if (tabName === 'opgeslagen') {
    tabOpgeslagen.classList.remove('verborgen')
    btnOpgeslagen.classList.add('actief')
  } else {
    tabFavorieten.classList.remove('verborgen')
    btnFavorieten.classList.add('actief')
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
      const card = document.getElementById(`kaart-${id}`)
      card.remove()

      // Controleer of er nog kaartjes over zijn in de actieve tab
      const actieveTab = document.querySelector('.tab:not(.verborgen)')
      const kaartjes = actieveTab.querySelectorAll('.vacature-kaart')

      // Bepaal de juiste tekst op basis van welke tab actief is
      const isOpgeslagen = actieveTab.id === 'tab-opgeslagen'
      const zeroStateTekst = isOpgeslagen
        ? 'Nog geen opgeslagen vacatures. Ga op zoek naar jouw droombaan!'
        : 'Je lijst is leeg. Tijd om te ontdekken wat er voor jou is!'

      // Als er geen kaartjes meer zijn toon dan de zero state gecentreerd
      if (kaartjes.length === 0) {
        const grid = actieveTab.querySelector('.favorites-grid')
        grid.style.display = 'flex'
        grid.style.flexDirection = 'column'
        grid.style.alignItems = 'center'
        grid.innerHTML = `
          <div class="zero-state">
            <p class="zero-state-tekst">${zeroStateTekst}</p>
            <a href="/matching" class="zero-state-knop">Zoek vacatures</a>
          </div>
        `
      }
    }
  } catch (err) {
    console.error('Fout bij verwijderen favoriet:', err)
  }
}