const radios = document.querySelectorAll('input[name="role"]')
const slider = document.getElementById('roleSlider')
const subtitle = document.querySelector('.subtitle')
const loginLink = document.getElementById('loginLink')
const leftTitle = document.querySelector('.account-left h2')
const leftText = document.querySelector('.account-left p')


const subtitleTexts = {
  user: 'Maak een gratis account aan en ontdek vacatures die bij jou passen.',
  company: 'Maak een gratis account aan en plaats vacatures voor jouw bedrijf.'
}

const leftTitleTexts = {
  user: 'Klaar voor een nieuwe stap?',
  company: 'Vind jouw volgende collega.'
}

const leftBodyTexts = {
  user: 'Maak een account aan en vind vacatures die passen bij jouw ervaring en ambities.',
  company: 'Maak een account aan en plaats vacatures voor jouw bedrijf.'
}

function updateRole() {
  const role = document.querySelector('input[name="role"]:checked').value

  if (role === 'company') {
    slider.classList.add('company')
  } else {
    slider.classList.remove('company')
  }

  subtitle.textContent = subtitleTexts[role]
  loginLink.href = `/login?role=${role}`
  leftTitle.textContent = leftTitleTexts[role]
  leftText.textContent = leftBodyTexts[role]
}

function addRoleEvent(radio) {
  radio.addEventListener('change', updateRole)
}

radios.forEach(addRoleEvent)

updateRole()