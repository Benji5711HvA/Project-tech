function updateCounter(length) {
  document.querySelector(".counter").textContent = length + "/200"
}

function logoSelected(input) {
  if (input.files && input.files[0]) {
    document.getElementById("logoFilename").textContent = input.files[0].name
  }
}