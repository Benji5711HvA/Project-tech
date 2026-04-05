function updateTeller(length) {
  document.querySelector('.teller').textContent = length + '/300'
}

function logoSelected(input) {
  if (input.files && input.files[0]) {
    document.getElementById('logoFilename').textContent = input.files[0].name
  }
}

function validateForm(e) {
  const sector = document.querySelector('input[name="sector"]:checked')
  const size = document.querySelector('input[name="companySize"]:checked')

  if (!sector) {
    e.preventDefault()
    document.getElementById('sector-error').hidden = false
    document.getElementById('sector-error').scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (!size) {
    e.preventDefault()
    document.getElementById('size-error').hidden = false
    document.getElementById('size-error').scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
}

document.querySelector('form').addEventListener('submit', validateForm)

document.querySelectorAll('input[name="sector"]').forEach(function(input) {
  input.addEventListener('change', function() {
    document.getElementById('sector-error').hidden = true
  })
})

document.querySelectorAll('input[name="companySize"]').forEach(function(input) {
  input.addEventListener('change', function() {
    document.getElementById('size-error').hidden = true
  })
})