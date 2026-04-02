require("dotenv").config()

const express = require("express")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const multer = require("multer")
const upload = multer({ dest: "static/upload/" })
const { MongoClient, ObjectId } = require("mongodb")

// Database setup
const URI = process.env.URI
const client = new MongoClient(URI)
let usersCollection
let reactionsCollection
let vacanciesCollection

// App setup
const app = express()

app.set("view engine", "ejs")
app.use(express.static("static"))
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 1000 * 60 * 60 * 2,
    },
  }),
)

function setLocals(req, res, next) {
  res.locals.user = req.session.user
  next()
}

app.use(setLocals)

function isLoggedIn(req, res, next) {
  if (req.session.user) return next()
  return res.redirect("/login")
}

// Hulp functies
async function hashPassword(password) {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword)
}

function validateRegistration(email, password, confirmPassword) {
  if (!email || !password || !confirmPassword) return "Vul alles in"
  if (password !== confirmPassword) return "Wachtwoorden komen niet overeen"
  if (password.length < 8) return "Wachtwoord moet minimaal 8 tekens zijn"
  return null
}

// Routes
app.get("/", home)

// Benjamin - Account
app.get("/register", showRegister)
app.post("/register", handleRegister)
app.get("/login", showLogin)
app.post("/login", handleLogin)
app.post("/logout", handleLogout)

app.get("/create-profile", isLoggedIn, showCreateProfile)
app.post("/create-profile", isLoggedIn, handleCreateProfile)

app.get("/create-company-profile", isLoggedIn, showCreateCompanyProfile)
app.post(
  "/create-company-profile",
  isLoggedIn,
  upload.single("logo"),
  handleCreateCompanyProfile,
)

app.get("/add-vacancy", isLoggedIn, showAddVacancy)
app.post("/add-vacancy", isLoggedIn, handleAddVacancy)

app.get("/api/salary-hint", isLoggedIn, getSalaryHint)
app.get("/api/address", isLoggedIn, handleAddressLookup)

// Mehmet - Favorites
app.get("/favorites", isLoggedIn, showFavorites)
app.delete("/favorites/:id", isLoggedIn, deleteFavorite)

// Sanna - Matching
app.get("/matching", isLoggedIn, showMatching)
app.post("/match-reaction", isLoggedIn, handleMatchReaction)
app.get("/company-matches", isLoggedIn, showCompanyMatches)
app.post("/update-status", isLoggedIn, updateMatchStatus)

// Functions
function home(req, res) {
  res.render("pages/index")
}

// Benjamin - Account
function showRegister(req, res) {
  res.render("pages/register", {
    error: undefined,
    email: undefined,
    role: undefined,
  })
}

async function handleRegister(req, res) {
  try {
    const { email, password, confirmPassword, role } = req.body

    const error = validateRegistration(email, password, confirmPassword)
    if (error)
      return res.status(400).render("pages/register", { error, email, role })

    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res.status(400).render("pages/register", {
        error: "E-mailadres is al in gebruik",
        email,
        role,
      })
    }

    const hashedPassword = await hashPassword(password)
    await usersCollection.insertOne({ email, password: hashedPassword, role })

    res.redirect("/login")
  } catch (err) {
    console.error("Fout bij registreren:", err)
    res.status(500).render("pages/register", {
      error: "Er ging iets mis, probeer het opnieuw",
      email,
      role,
    })
  }
}

function showLogin(req, res) {
  res.render("pages/login", { error: undefined, email: undefined })
}

async function handleLogin(req, res) {
  try {
    const { email, password } = req.body

    const user = await usersCollection.findOne({ email })
    if (!user) {
      return res.status(400).render("pages/login", {
        error: "Verkeerd e-mailadres of wachtwoord",
        email,
      })
    }

    const passwordMatches = await verifyPassword(password, user.password)
    if (!passwordMatches) {
      return res.status(400).render("pages/login", {
        error: "Verkeerd e-mailadres of wachtwoord",
        email,
      })
    }

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: user.role,
      companyName: user.companyName || null,
    }

    if (user.role === "company") {
      if (!user.companyName) {
        res.redirect("/create-company-profile")
      } else {
        res.redirect("/add-vacancy")
      }
    } else {
      if (!user.firstName) {
        res.redirect("/create-profile")
      } else {
        res.redirect("/matching")
      }
    }
  } catch (err) {
    console.error("Fout bij inloggen:", err)
    res.status(500).render("pages/login", {
      error: "Er ging iets mis, probeer het opnieuw",
      email,
    })
  }
}

function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fout bij uitloggen:", err)
      return res.status(500).send("Er ging iets mis bij het uitloggen")
    }
    res.redirect("/login")
  })
}

function showCreateProfile(req, res) {
  res.render("pages/create-profile")
}

async function handleCreateProfile(req, res) {
  try {
    const {
      firstName,
      lastName,
      birthDate,
      streetName,
      houseNumber,
      houseAddition,
      zipCode,
      city,
      bio,
      sector,
      location,
      salary,
      education,
      experience,
      hoursPerWeek,
      contractType,
      workForm,
    } = req.body

    await usersCollection.updateOne(
      { _id: new ObjectId(req.session.user.id) },
      {
        $set: {
          firstName,
          lastName,
          birthDate,
          streetName,
          houseNumber,
          houseAddition,
          zipCode,
          city,
          bio,
          sector,
          location,
          salary,
          education,
          experience,
          hoursPerWeek,
          contractType,
          workForm,
        },
      },
    )

    res.redirect("/matching")
  } catch (err) {
    console.error("Fout bij profiel aanmaken:", err)
    res.status(500).render("pages/create-profile", {
      error: "Er ging iets mis, probeer het opnieuw",
    })
  }
}

function showCreateCompanyProfile(req, res) {
  res.render("pages/create-company-profile")
}

async function handleCreateCompanyProfile(req, res) {
  try {
    const { companyName, sector, companySize, website, description } = req.body
    const logo = req.file ? req.file.filename : null

    await usersCollection.updateOne(
      { _id: new ObjectId(req.session.user.id) },
      {
        $set: {
          companyName,
          sector,
          companySize,
          website,
          description,
          logo,
        },
      },
    )

    res.redirect("/add-vacancy")
  } catch (err) {
    console.error("Fout bij bedrijfsprofiel aanmaken:", err)
    res.status(500).render("pages/create-company-profile", {
      error: "Er ging iets mis, probeer het opnieuw",
    })
  }
}

function showAddVacancy(req, res) {
  res.render("pages/add-vacancy")
}

async function handleAddVacancy(req, res) {
  try {
    const {
      title,
      category,
      location,
      salary,
      hoursPerWeek,
      contractType,
      description,
    } = req.body

    await vacanciesCollection.insertOne({
      companyId: req.session.user.id,
      company: req.session.user.companyName,
      title,
      category,
      location,
      salary,
      hoursPerWeek,
      contractType,
      description,
      createdAt: new Date(),
    })

    res.redirect("/add-vacancy")
  } catch (err) {
    console.error("Fout bij vacature toevoegen:", err)
    res.status(500).render("pages/add-vacancy", {
      error: "Er ging iets mis, probeer het opnieuw",
    })
  }
}

async function getSalaryHint(req, res) {
  try {
    const { category } = req.query
    const response = await fetch(
      `https://api.adzuna.com/v1/api/jobs/nl/search/1?app_id=${process.env.ADZUNA_APP_ID}&app_key=${process.env.ADZUNA_APP_KEY}&category=${category}&results_per_page=1`,
    )
    const data = await response.json()
    const monthlySalary = Math.round(data.mean / 12)
    res.json({ salaryPerMonth: monthlySalary })
  } catch (err) {
    console.error("Fout bij ophalen salary hint:", err)
    res.json({ salaryPerMonth: null })
  }
}

async function handleAddressLookup(req, res) {
  try {
    const { zipCode, houseNumber } = req.query

    if (!zipCode || !houseNumber) {
      return res.status(400).json({ error: "Postcode en huisnummer zijn verplicht" })
    }

    const response = await fetch(
      `https://postcode.tech/api/v1/postcode/full?postcode=${zipCode}&number=${houseNumber}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.POSTCODE_API_TOKEN}`,
        },
      },
    )

    if (!response.ok) {
      return res.status(response.status).json({ error: "Adres niet gevonden" })
    }

    const data = await response.json()
    res.json(data)
  } catch (err) {
    console.error("Fout bij ophalen adres:", err)
    res.status(500).json({ error: "Er ging iets mis bij het ophalen" })
  }
}

// Mehmet - Favorieten
async function showFavorites(req, res) {
  try {
    const userId = req.session.user.id

    const savedVacancies = await reactionsCollection
      .find({ userId: userId, reaction: "yes" })
      .toArray()

    const favoriteVacancies = await reactionsCollection
      .find({ userId: userId, reaction: "favorite" })
      .toArray()

    res.render("pages/favorites", { savedVacancies, favoriteVacancies })
  } catch (err) {
    console.error("Fout bij ophalen favorieten:", err)
    res.status(500).render("pages/favorites", { savedVacancies: [], favoriteVacancies: [] })
  }
}

async function deleteFavorite(req, res) {
  try {
    const vacatureId = req.params.id

    await reactionsCollection.deleteOne({
      _id: new ObjectId(vacatureId),
      userId: req.session.user.id,
    })

    res.json({ success: true })
  } catch (err) {
    console.error("Fout bij verwijderen favoriet:", err)
    res.status(500).json({ success: false })
  }
}

// Sanna - Matching
async function showMatching(req, res) {
  try {
    const user = await usersCollection.findOne({
      _id: new ObjectId(req.session.user.id)
    })

    const vacancies = await vacanciesCollection.find({}).toArray()

    const labels = {
      category: {
        "it-jobs": "ICT & Tech",
        "healthcare-nursing-jobs": "Zorg & Welzijn",
        "admin-jobs": "Administratie",
        "retail-jobs": "Retail & Verkoop",
        "hospitality-catering-jobs": "Horeca & Toerisme",
        "teaching-jobs": "Onderwijs",
        "logistics-warehouse-jobs": "Logistiek",
        "pr-advertising-marketing-jobs": "Marketing & Comm.",
        "manufacturing-jobs": "Techniek & Industrie",
        "accounting-finance-jobs": "Finance & Juridisch",
        "trade-construction-jobs": "Bouw & Infra"
      },
      contract: {
        "permanent": "Vast contract",
        "temporary": "Tijdelijk contract",
        "freelance": "Freelance / ZZP",
        "internship": "Stage"
      },
      education: {
        "vmbo": "Middelbaar onderwijs",
        "mbo12": "MBO niveau 1 of 2",
        "mbo34": "MBO niveau 3 of 4",
        "hbo": "HBO Bachelor",
        "wo": "WO Bachelor",
        "master": "HBO/WO Master"
      }
    }

    vacancies.forEach(function vertaalVacature(vacancy) {
      vacancy.categoryLabel = labels.category[vacancy.category] || vacancy.category
      vacancy.contractLabel = labels.contract[vacancy.contractType] || vacancy.contractType
      vacancy.educationLabel = labels.education[vacancy.education] || vacancy.education
    })

    res.render("pages/matching", { vacancies, user })
  } catch (err) {
    console.error("Fout bij ophalen vacatures:", err)
    res.status(500).render("pages/matching", { vacancies: [], user: null })
  }
}

async function handleMatchReaction(req, res) {
  try {
    const userId = req.session.user.id
    const { vacancyId, vacancyTitle, company, reaction, location, salary, hoursPerWeek, contractType } = req.body

    if (reaction === "yes" || reaction === "favorite") {
      const bestaandeReactie = await reactionsCollection.findOne({ userId, vacancyId, reaction })
      if (bestaandeReactie) {
        return res.json({ success: true })
      }

      await reactionsCollection.insertOne({
        userId,
        vacancyId,
        vacancyTitle,
        company,
        location,
        salary,
        hoursPerWeek,
        contractType,
        reaction,
        status: "in behandeling",
      })
    }

    res.json({ success: true })
  } catch (err) {
    console.error("Fout bij opslaan reactie:", err)
    res.status(500).json({ success: false })
  }
}

async function showCompanyMatches(req, res) {
  try {
    const companyId = req.session.user.id

    const vacancies = await vacanciesCollection.find({ companyId }).toArray()

    const vacancyIds = vacancies.map(function getVacancyId(vacancy) {
      return vacancy._id.toString()
    })

    const reactions = await reactionsCollection.find({
      vacancyId: { $in: vacancyIds }
    }).toArray()

    res.render("pages/company-matches", { vacancies, reactions })
  } catch (err) {
    console.error("Fout bij ophalen matches:", err)
    res.status(500).render("pages/company-matches", { vacancies: [], reactions: [] })
  }
}

async function updateMatchStatus(req, res) {
  try {
    const { reactionId, status } = req.body

    await reactionsCollection.updateOne(
      { _id: new ObjectId(reactionId) },
      { $set: { status } }
    )

    res.json({ success: true })
  } catch (err) {
    console.error("Fout bij updaten status:", err)
    res.status(500).json({ success: false })
  }
}

// Start server
async function startServer() {
  try {
    await client.connect()
    console.log("Verbonden met MongoDB")

    const db = client.db(process.env.DB_NAME)
    usersCollection = db.collection("users")
    reactionsCollection = db.collection("reactions")
    vacanciesCollection = db.collection("vacancies")

    app.listen(3000, () => {
      console.log("Server draait op http://localhost:3000")
    })
  } catch (err) {
    console.error("Database connectie mislukt:", err)
  }
}

startServer()