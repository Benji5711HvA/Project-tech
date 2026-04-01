function updateTeller(length) {
  document.querySelector(".teller").textContent = length + "/200"
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