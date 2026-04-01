function updateCounter(length) {
  document.querySelector(".counter").textContent = length + "/200"
}

function nextStep() {
  const step1 = document.getElementById("step1")
  const inputs = step1.querySelectorAll("input[required]")

  for (const input of inputs) {
    if (!input.value.trim()) {
      input.reportValidity()
      return
    }
  }

  document.getElementById("step1").style.display = "none"
  document.getElementById("step2").style.display = "block"
  document.getElementById("progress-bar2").classList.add("active")
}

async function lookupAddress() {
  const zipCode = document.getElementById("zipCode").value
  const houseNumber = document.getElementById("houseNumber").value

  if (!zipCode || !houseNumber) return

  const response = await fetch(`/api/address?zipCode=${zipCode}&houseNumber=${houseNumber}`)
  const data = await response.json()

  if (data.street && data.city) {
    document.getElementById("streetName").value = data.street
    document.getElementById("city").value = data.city
  }
}

function addAddressLookup(input) {
  input.addEventListener("change", lookupAddress)
}

addAddressLookup(document.getElementById("zipCode"))
addAddressLookup(document.getElementById("houseNumber"))