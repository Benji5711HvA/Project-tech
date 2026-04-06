const radios = document.querySelectorAll('input[name="role"]')
const slider = document.getElementById('roleSlider')
const subtitle = document.querySelector('.subtitle')
const registerLink = document.getElementById('registerLink')
const leftTitle = document.querySelector('.account-left h2')
const leftText = document.querySelector('.account-left p')

const subtitleTexts = {
  user: 'Log in en ontdek vacatures die aansluiten bij jouw ervaring en ambities.',
  company: 'Log in en beheer je vacatures en bekijk wie er heeft gereageerd.'
}

function updateRole() {
  const role = document.querySelector('input[name="role"]:checked').value

  slider.classList.toggle('company', role === 'company')
  subtitle.textContent = subtitleTexts[role]
  leftTitle.textContent = 'Welkom terug!'
  leftText.textContent = subtitleTexts[role]
  registerLink.href = '/register?role=' + role
}

radios.forEach(function addRoleEvent(radio) {
  radio.addEventListener('change', updateRole)
})

updateRole()