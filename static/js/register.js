const radios = document.querySelectorAll('input[name="role"]')
const slider = document.getElementById('roleSlider')

function updateSlider() {
  if (this.value === 'company') {
    slider.classList.add('company')
  } else {
    slider.classList.remove('company')
  }
}

radios.forEach(radio => {
  radio.addEventListener('change', updateSlider)
})