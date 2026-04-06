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

const leftTitleTexts = {
  user: 'Welkom terug!',
  company: 'Welkom terug!'
}

const leftBodyTexts = {
  user: 'Log in en ontdek vacatures die aansluiten bij jouw ervaring en ambities.',
  company: 'Log in en beheer je vacatures en bekijk wie er heeft gereageerd.'
}

function updateRole() {
  const role = document.querySelector('input[name="role"]:checked').value

  if (role === 'company') {
    slider.classList.add('company')
  } else {
    slider.classList.remove('company')
  }

  subtitle.textContent = subtitleTexts[role]
  registerLink.href = `/register?role=${role}`
  leftTitle.textContent = leftTitleTexts[role]
  leftText.textContent = leftBodyTexts[role]
}

function addRoleEvent(radio) {
  radio.addEventListener('change', updateRole)
}

radios.forEach(addRoleEvent)

updateRole()