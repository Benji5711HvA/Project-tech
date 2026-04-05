const ADZUNA_CATEGORY_MAP = {
  'ICT & Tech': 'it-jobs',
  'Zorg & Welzijn': 'healthcare-nursing-jobs',
  'Administratie': 'admin-jobs',
  'Retail & Verkoop': 'retail-jobs',
  'Horeca & Toerisme': 'hospitality-catering-jobs',
  'Onderwijs': 'teaching-jobs',
  'Logistiek': 'logistics-warehouse-jobs',
  'Marketing & Communicatie': 'pr-advertising-marketing-jobs',
  'Techniek & Industrie': 'manufacturing-jobs',
  'Finance & Juridisch': 'accounting-finance-jobs',
  'Bouw & Infra': 'trade-construction-jobs'
}

function updateCounter(length) {
  document.querySelector(".counter").textContent = length + "/1000"
}

const categoryCards = document.querySelectorAll(".sector-card input[type='radio']")
const salaryHint = document.getElementById("salaryHint")

async function fetchSalaryHint(event) {
  const selectedCategory = event.target.value
  const adzunaCategory = ADZUNA_CATEGORY_MAP[selectedCategory]

  salaryHint.textContent = "Salaris ophalen..."

  const response = await fetch("/api/salary-hint?category=" + adzunaCategory)
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

function validateForm(e) {
  const category = document.querySelector('input[name="category"]:checked')
  const hours = document.querySelector('input[name="hoursPerWeek"]:checked')

  if (!category) {
    e.preventDefault()
    const errorEl = document.getElementById('category-error')
    errorEl.hidden = false
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }

  if (!hours) {
    e.preventDefault()
    const errorEl = document.getElementById('hours-error')
    errorEl.hidden = false
    errorEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
    return
  }
}

function hideCategoryError() {
  document.getElementById('category-error').hidden = true
}

function hideHoursError() {
  document.getElementById('hours-error').hidden = true
}

document.getElementById('vacancy-form').addEventListener('submit', validateForm)
document.querySelectorAll('input[name="category"]').forEach(function(input) {
  input.addEventListener('change', hideCategoryError)
})
document.querySelectorAll('input[name="hoursPerWeek"]').forEach(function(input) {
  input.addEventListener('change', hideHoursError)
})