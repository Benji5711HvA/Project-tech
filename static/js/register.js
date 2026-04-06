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

function updateRole() {
  const role = document.querySelector('input[name="role"]:checked').value

  slider.classList.toggle('company', role === 'company')
  subtitle.textContent = subtitleTexts[role]
  leftTitle.textContent = leftTitleTexts[role]
  leftText.textContent = subtitleTexts[role]
  loginLink.href = '/login?role=' + role
}

radios.forEach(function addRoleEvent(radio) {
  radio.addEventListener('change', updateRole)
})

updateRole()