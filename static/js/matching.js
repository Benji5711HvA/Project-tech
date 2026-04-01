const cards = document.querySelectorAll('.vacancy-card')
const previousButton = document.querySelector('.previous-button')
const nextButton = document.querySelector('.next-button')
const feedbackMessage = document.getElementById('feedbackMessage')
let currentIndex = 0

function showCard(index) {
  cards.forEach(function hideCard(card) {
    card.style.display = 'none'
  })
  cards[index].style.display = 'flex'
}

function goToPrev() {
  if (currentIndex > 0) {
    currentIndex = currentIndex - 1
    showCard(currentIndex)
  }
}
function goToNext() {
  if (currentIndex < cards.length - 1) {
    currentIndex = currentIndex + 1
    showCard(currentIndex)
  } else {
    cards.forEach(function hideCard(card) {
      card.style.display = 'none'
    })
    document.querySelector('.end-card').style.display = 'flex'
  }
}
async function sendReaction(vacancyId, vacancyTitle, company, reaction) {
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