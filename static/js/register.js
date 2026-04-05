const radios = document.querySelectorAll('input[name="role"]')
const slider = document.getElementById('roleSlider')

function updateSlider() {
  if (this.value === 'company') {
    slider.classList.add('company')
  } else {
    slider.classList.remove('company')
  }
}

function addSliderEvent(radio) {
  radio.addEventListener('change', updateSlider)
}

radios.forEach(addSliderEvent)

const selectedRole = document.querySelector('input[name="role"]:checked')
if (selectedRole && selectedRole.value === 'company') {
  slider.classList.add('company')
}