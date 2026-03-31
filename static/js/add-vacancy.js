function updateCounter(length) {
  document.querySelector(".counter").textContent = length + "/1000"
}

const categoryCards = document.querySelectorAll(".sector-card input[type='radio']")
const salaryHint = document.getElementById("salaryHint")

async function fetchSalaryHint(event) {
  const category = event.target.value

  salaryHint.textContent = "Salaris ophalen..."

  const response = await fetch("/api/salary-hint?category=" + category)
  const data = await response.json()

  if (data.salaryPerMonth) {
    const salary = "€ " + data.salaryPerMonth.toLocaleString("nl-NL") + " per maand"
    salaryHint.innerHTML = "Gemiddeld salaris in dit vakgebied: <span>" + salary + "</span>"
  }
}

function addEventToCard(card) {
  card.addEventListener("change", fetchSalaryHint)
}

categoryCards.forEach(addEventToCard)