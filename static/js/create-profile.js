function updateCounter(length) {
  document.querySelector('.counter').textContent = length + '/200'
}

function cvSelected(input) {
  if (input.files && input.files[0]) {
    document.getElementById('cvFilename').textContent = input.files[0].name
  }
}

function nextStep() {
  const step1 = document.getElementById('step1')
  const inputs = step1.querySelectorAll('input[required]')

  for (const input of inputs) {
    if (!input.value.trim()) {
      input.reportValidity()
      return
    }
  }

  document.getElementById('step1').style.display = 'none'
  document.getElementById('step2').style.display = 'block'
  document.getElementById('progress-bar2').classList.add('active')
  document.querySelector('.account-right').scrollTo({ top: 0, behavior: 'instant' })
}

async function lookupAddress() {
  const zipCode = document.getElementById('zipCode').value
  const houseNumber = document.getElementById('houseNumber').value

  if (!zipCode || !houseNumber) return

  const response = await fetch(`/api/address?zipCode=${zipCode}&houseNumber=${houseNumber}`)
  const data = await response.json()

  if (data.street && data.city) {
    document.getElementById('streetName').value = data.street
    document.getElementById('city').value = data.city
  }
}

function validateForm(e) {
  const sectors = document.querySelectorAll('input[name="sector"]:checked')
  const hours = document.querySelector('input[name="hoursPerWeek"]:checked')
  const education = document.getElementById('education').value
  const experience = document.getElementById('experience').value

  const sectorError = document.getElementById('sector-error')
  const hoursError = document.getElementById('hours-error')
  const educationError = document.getElementById('education-error')
  const experienceError = document.getElementById('experience-error')

  if (sectors.length === 0) {
    e.preventDefault()
    sectorError.hidden = false
    sectorError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (!education) {
    e.preventDefault()
    educationError.hidden = false
    educationError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (!experience) {
    e.preventDefault()
    experienceError.hidden = false
    experienceError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (!hours) {
    e.preventDefault()
    hoursError.hidden = false
    hoursError.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
}

document.getElementById('zipCode').addEventListener('change', lookupAddress)
document.getElementById('houseNumber').addEventListener('change', lookupAddress)
document.querySelector('form').addEventListener('submit', validateForm)

document.querySelectorAll('input[name="sector"]').forEach(function(checkbox) {
  checkbox.addEventListener('change', function() {
    document.getElementById('sector-error').hidden = true
  })
})

document.querySelectorAll('input[name="hoursPerWeek"]').forEach(function(input) {
  input.addEventListener('change', function() {
    document.getElementById('hours-error').hidden = true
  })
})

document.getElementById('education').addEventListener('change', function() {
  document.getElementById('education-error').hidden = true
})

document.getElementById('experience').addEventListener('change', function() {
  document.getElementById('experience-error').hidden = true
})