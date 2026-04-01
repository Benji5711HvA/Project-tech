function updateTeller(length) {
  document.querySelector('.teller').textContent = length + '/300'
}

function logoSelected(input) {
  if (input.files && input.files[0]) {
    document.getElementById('logoFilename').textContent = input.files[0].name
  }
}