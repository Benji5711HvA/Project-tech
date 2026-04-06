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
let companiesCollection
let reactionsCollection
let vacanciesCollection

// App setup
const app = express()

app.set("view engine", "ejs")
app.set("trust proxy", 1) 
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

const pageTitles = {
  "/": "Home | Collego",
  "/register": "Registreren | Collego",
  "/login": "Inloggen | Collego",
  "/create-profile": "Profiel aanmaken | Collego",
  "/create-company-profile": "Bedrijfsprofiel aanmaken | Collego",
  "/add-vacancy": "Vacature toevoegen | Collego",
  "/dashboard": "Dashboard | Collego",
  "/matching": "Vacatures ontdekken | Collego",
  "/company-matches": "Match reacties | Collego",
  "/company-matching": "Kandidaten | Collego",
}

function setLocals(req, res, next) {
  res.locals.user = req.session.user
  res.locals.pageTitle = pageTitles[req.path] || "Collego"
  next()
}

app.use(setLocals)

function isLoggedIn(req, res, next) {
  if (req.session.user) return next()
    return res.redirect("/login")
}

function isUser(req, res, next) {
  if (req.session.user && req.session.user.role === 'user') return next()
    return res.redirect('/')
}

function isCompany(req, res, next) {
  if (req.session.user && req.session.user.role === 'company') return next()
    return res.redirect('/')
}

// Routes
app.get("/", home)

// Benjamin - Account
app.get("/register", showRegister)
app.post("/register", handleRegister)
app.get("/login", showLogin)
app.post("/login", handleLogin)
app.post("/logout", handleLogout)

app.get("/create-profile", isLoggedIn, isUser, showCreateProfile)
app.post(
  "/create-profile",
  isLoggedIn,
  upload.single("cv"),
  handleCreateProfile,
)

app.get("/create-company-profile", isLoggedIn, isCompany, showCreateCompanyProfile)
app.post(
  "/create-company-profile",
  isLoggedIn,
  handleCreateCompanyProfile,
)


app.get("/add-vacancy", isLoggedIn, isCompany, showAddVacancy)
app.post("/add-vacancy", isLoggedIn, isCompany, handleAddVacancy)

app.get("/api/salary-hint", isLoggedIn, getSalaryHint)
app.get("/api/address", isLoggedIn, handleAddressLookup)

// Mehmet - Dashboard
app.get("/dashboard", isLoggedIn, showDashboard)
app.delete("/favorites/:id", isLoggedIn, deleteFavorite)

// Sanna - Matching
app.get("/matching", isLoggedIn, isUser, showMatching)
app.post("/match-reaction", isLoggedIn, isUser, handleMatchReaction)
app.get("/company-matches", isLoggedIn, isCompany, showCompanyMatches)
app.post("/update-status", isLoggedIn, updateMatchStatus)
app.get("/company-matching", isLoggedIn, isCompany, showCompanyMatching)
app.post("/company-like", isLoggedIn, isCompany, handleCompanyLike)

// Mehmet - Home
// Haal 3 willekeurige vacatures op voor de trending sectie
async function home(req, res) {
  try {
    const allVacancies = await vacanciesCollection.find({}).toArray()

    const shuffled = allVacancies.sort(function shuffleVacancies() {
      return Math.random() - 0.5
    })

    const trendingVacancies = shuffled.slice(0, 3)

    res.render("pages/index", { trendingVacancies })
  } catch (err) {
    console.error("Fout bij ophalen vacatures:", err)
    res.render("pages/index", { trendingVacancies: [] })
  }
}

// Benjamin - Account
function showRegister(req, res) {
  res.render("pages/register", {
    error: undefined,
    email: undefined,
    role: req.query.role || "user",
  })
}

async function handleRegister(req, res) {
  try {
    const { email, password, confirmPassword, role } = req.body

    const error = validateRegistration(email, password, confirmPassword)
    if (error)
      return res.status(400).render("pages/register", { error, email, role })

    const existingUser = await usersCollection.findOne({ email })
    const existingCompany = await companiesCollection.findOne({ email })
    if (existingUser || existingCompany) {
      return res.status(400).render("pages/register", {
        error: "E-mailadres is al in gebruik",
        email,
        role,
      })
    }

    const hashedPassword = await hashPassword(password)

    // Hier willen we checken of het account dat wordt geregistreerd een bedrijf is of een gewone gebruiker, en op basis daarvan willen we het in de juiste collectie opslaan
    if (role === "company") {
      await companiesCollection.insertOne({ email, password: hashedPassword })
    } else {
      await usersCollection.insertOne({ email, password: hashedPassword })
    }

    res.redirect(`/login?role=${role}`)
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
  res.render("pages/login", {
    error: undefined,
    email: undefined,
    role: req.query.role || "user",
  })
}

async function handleLogin(req, res) {
  try {
    const { email, password, role } = req.body

    const collection =
      role === "company" ? companiesCollection : usersCollection
    const user = await collection.findOne({ email })
    if (!user) {
      return res.status(400).render("pages/login", {
        error: "Verkeerd e-mailadres of wachtwoord",
        email,
        role,
      })
    }

    const passwordMatches = await verifyPassword(password, user.password)
    if (!passwordMatches) {
      return res.status(400).render("pages/login", {
        error: "Verkeerd e-mailadres of wachtwoord",
        email,
        role,
      })
    }

    req.session.user = {
      id: user._id.toString(),
      email: user.email,
      role: role,
      companyName: user.companyName || null,
    }

    if (role === "company") {
      if (!user.companyName) {
        res.redirect("/create-company-profile")
      } else {
        res.redirect("/company-matching")
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
      role,
    })
  }
}

function handleLogout(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Fout bij uitloggen:", err)
      return res.status(500).send("Er ging iets mis bij het uitloggen")
    }
    res.redirect("/")
  })
}

async function showCreateProfile(req, res) {
  const user = await usersCollection.findOne({ _id: new ObjectId(req.session.user.id) })

  if (user.firstName) {
    return res.redirect("/matching")
  }

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

    const cv = req.file ? req.file.filename : null

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
          cv,
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

async function showCreateCompanyProfile(req, res) {
  const company = await companiesCollection.findOne({ _id: new ObjectId(req.session.user.id) })

  if (company.companyName) {
    return res.redirect("/add-vacancy")
  }

  res.render("pages/create-company-profile")
}

async function handleCreateCompanyProfile(req, res) {
  try {
    const { companyName, sector, companySize, website, description } = req.body

    await companiesCollection.updateOne(
      { _id: new ObjectId(req.session.user.id) },
      {
        $set: {
          companyName,
          sector,
          companySize,
          website,
          description,
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
      workForm,
      description,
    } = req.body

    const company = await companiesCollection.findOne({ _id: new ObjectId(req.session.user.id) })

    await vacanciesCollection.insertOne({
      companyId: req.session.user.id,
      company: company.companyName,
      title,
      category,
      location,
      salary,
      hoursPerWeek,
      contractType,
      workForm,
      description,
      createdAt: new Date(),
    })

    res.redirect("/company-matching")
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

// Mehmet - Dashboard
async function showDashboard(req, res) {
  try {
    const userId = req.session.user.id


   const savedVacancies = await reactionsCollection
  .find({ userId: userId, reaction: "yes", type: "user-reaction", status: { $ne: "matched" } })
  .toArray()
    const favoriteVacancies = await reactionsCollection
      .find({
        userId: userId,
        reaction: "favorite",
        type: "user-reaction",
        status: { $ne: "matched" }
      })
      .toArray()

    // alleen user-reactions met status matched, want company-reactions hebben geen vacaturedata
    const matchedVacancies = await reactionsCollection
      .find({ userId: userId, type: "user-reaction", status: "matched" })
      .toArray()
    res.render("pages/dashboard", { savedVacancies, favoriteVacancies, matchedVacancies })
  } catch (err) {
    console.error("Fout bij ophalen favorieten:", err)
    res.status(500).render("pages/dashboard", { savedVacancies: [], favoriteVacancies: [], matchedVacancies: [] })
  }
}

async function deleteFavorite(req, res) {
  try {
    // Haal het vacature id op uit de url parameters
    const vacancyId = req.params.id

    await reactionsCollection.deleteOne({
      _id: new ObjectId(vacancyId),
      userId: req.session.user.id,
    })

    res.json({ success: true })
  } catch (err) {
    console.error("Fout bij verwijderen favoriet:", err)
    res.status(500).json({ success: false })
  }
}

// Sanna - Matching
// Haal alle vacatures op die de gebruiker nog niet heeft gezien en voeg de bedrijfsbeschrijving toe
async function showMatching(req, res) {
  try {
    const userId = req.session.user.id
    const user = await usersCollection.findOne({ _id: new ObjectId(userId) })

    const existingReactions = await reactionsCollection
      .find({ userId: userId, type: "user-reaction" })
      .toArray()

    const seenIds = existingReactions
      .map(function toObjectId(r) {
        try { return new ObjectId(r.vacancyId) } catch (e) { return null }
      })
      .filter(Boolean)

    const vacancies = await vacanciesCollection
      .find({ _id: { $nin: seenIds } })
      .toArray()

    // bedrijven ophalen zodat we de beschrijving kunnen tonen
    const companyIds = vacancies.map(function (v) { return v.companyId })
    const companies = await companiesCollection
      .find({ _id: { $in: companyIds.map(function (id) { try { return new ObjectId(id) } catch (e) { return null } }).filter(Boolean) } })
      .toArray()

    vacancies.forEach(function formatVacancy(vacancy) {
      vacancy.categoryLabel = vacancy.category || ""
      vacancy.educationLabel = vacancy.education || ""

      const contractArr = Array.isArray(vacancy.contractType)
        ? vacancy.contractType
        : (vacancy.contractType ? vacancy.contractType.split(",") : [])
      vacancy.contractLabels = contractArr

      const workFormArr = Array.isArray(vacancy.workForm)
        ? vacancy.workForm
        : (vacancy.workForm ? vacancy.workForm.split(",") : [])
      vacancy.workFormLabels = workFormArr

      // bedrijfsbeschrijving toevoegen aan vacature
      const company = companies.find(function (c) { return c._id.toString() === vacancy.companyId })
      vacancy.companyDescription = company ? company.description : ""
    })

    res.render("pages/matching", { vacancies: vacancies, user: user })
  } catch (err) {
    console.error("Fout bij ophalen vacatures:", err)
    res.status(500).render("pages/matching", { vacancies: [], user: null })
  }
}

async function showCompanyMatches(req, res) {
  try {
    const companyId = req.session.user.id
    const vacancies = await vacanciesCollection.find({ companyId }).toArray()

    const vacancyIds = vacancies.map(function getVacancyId(vacancy) {
      return vacancy._id.toString()
    })

    const reactions = await reactionsCollection
      .find({ vacancyId: { $in: vacancyIds } })
      .toArray()

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
      { $set: { status } },
    )
    res.json({ success: true })
  } catch (err) {
    console.error("Fout bij updaten status:", err)
    res.status(500).json({ success: false })
  }
}

function mapCandidate(user) {
  const sectorArr = Array.isArray(user.sector) ? user.sector : (user.sector ? [user.sector] : [])
  const contractArr = Array.isArray(user.contractType) ? user.contractType : (user.contractType ? [user.contractType] : [])
  const workFormArr = Array.isArray(user.workForm) ? user.workForm : (user.workForm ? [user.workForm] : [])

  return {
    _id: user._id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    city: user.city,
    bio: user.bio,
    cv: user.cv,
    initialen: (user.firstName?.[0] || "") + (user.lastName?.[0] || ""),
    educationLabel: user.education || "",
    sectorLabels: sectorArr,
    contractLabels: contractArr,
    workFormLabels: workFormArr,
    hoursPerWeek: user.hoursPerWeek || "",
    salary: user.salary || "",
  }
}

async function showCompanyMatching(req, res) {
  try {
    const companyId = req.session.user.id

    const myReactions = await reactionsCollection
      .find({ companyId: companyId, type: "company-reaction" })
      .toArray()

    const seenUserIds = new Set(
      myReactions.map(function getId(r) { return r.userId })
    )

    const pendingUserIds = new Set(
      myReactions
        .filter(function isWaiting(r) {
          return r.reaction === "yes" && r.status !== "matched"
        })
        .map(function getId(r) { return r.userId })
    )

    const matchedUserIds = new Set(
      myReactions
        .filter(function isMatched(r) {
          return r.reaction === "yes" && r.status === "matched"
        })
        .map(function getId(r) { return r.userId })
    )

    function toObjectIds(idSet) {
      return Array.from(idSet)
        .map(function convert(id) {
          try {
            return new ObjectId(id)
          } catch (e) {
            return null
          }
        })
        .filter(Boolean)
    }

    const seenObjectIds = toObjectIds(seenUserIds)
    const pendingObjectIds = toObjectIds(pendingUserIds)
    const matchedObjectIds = toObjectIds(matchedUserIds)
    const browseUsers = await usersCollection
      .find({
        firstName: { $exists: true, $ne: "" },
        _id: { $nin: seenObjectIds },
      })
      .toArray()

    let pendingUsers = []
    let matchedUsers = []

    if (pendingObjectIds.length > 0) {
      pendingUsers = await usersCollection
        .find({ _id: { $in: pendingObjectIds } })
        .toArray()
    }

    if (matchedObjectIds.length > 0) {
      matchedUsers = await usersCollection
        .find({ _id: { $in: matchedObjectIds } })
        .toArray()
    }

    const browseCandidates = browseUsers.map(mapCandidate)
    const pendingCandidates = pendingUsers.map(mapCandidate)
    const matchedCandidates = matchedUsers.map(mapCandidate)

    res.render("pages/company-matching", {
      browseCandidates: browseCandidates,
      pendingCandidates: pendingCandidates,
      matchedCandidates: matchedCandidates,
      totalMatches: matchedCandidates.length,
      user: req.session.user,
    })
  } catch (err) {
    console.error("Fout bij ophalen kandidaten:", err)
    res.status(500).render("pages/company-matching", {
  browseCandidates: [],
  pendingCandidates: [],
  matchedCandidates: [],
      totalMatches: 0,
      user: req.session.user,
    })
  }
}



async function handleCompanyLike(req, res) {
  try {
    const companyId = req.session.user.id.toString()
    const userId = req.body.userId
    const reaction = req.body.reaction || "yes"

    if (!userId) {
      return res.status(400).json({ success: false, error: "userId ontbreekt" })
    }

    const candidate = await usersCollection.findOne({ _id: new ObjectId(userId) })
    if (!candidate) {
      return res.status(404).json({ success: false, error: "Kandidaat niet gevonden" })
    }

    const existingReaction = await reactionsCollection.findOne({
      companyId: companyId,
      userId: userId,
      type: "company-reaction",
    })

    if (existingReaction) {
      return res.json({
        success: true,
        alreadyReacted: true,
        matched: existingReaction.status === "matched",
        kandidaat: mapCandidate(candidate),
      })
    }

    const status = reaction === "yes" ? "In behandeling" : "skipped"

    await reactionsCollection.insertOne({
      companyId: companyId,
      userId: userId,
      reaction: reaction,
      type: "company-reaction",
      status: status,
      createdAt: new Date(),
    })

    if (reaction === "yes") {
      const userLikedCompany = await reactionsCollection.findOne({
        userId: userId,
        companyId: companyId,
        type: "user-reaction",
        reaction: "yes",
      })

      if (userLikedCompany) {
        await reactionsCollection.updateMany(
          {
            $or: [
              {
                userId: userId,
                companyId: companyId,
                type: "user-reaction",
                reaction: "yes",
              },
              {
                companyId: companyId,
                userId: userId,
                type: "company-reaction",
                reaction: "yes",
              },
            ],
          },
          { $set: { status: "matched" } },
        )

        return res.json({
          success: true,
          matched: true,
          kandidaat: mapCandidate(candidate),
        })
      }

      return res.json({
        success: true,
        matched: false,
        kandidaat: mapCandidate(candidate),
      })
    }

    res.json({
      success: true,
      matched: false,
      skipped: true,
      kandidaat: mapCandidate(candidate),
    })
  } catch (err) {
    console.error("Fout bij company reactie:", err)
    res.status(500).json({ success: false })
  }
}

async function handleMatchReaction(req, res) {
  try {
    const userId = req.session.user.id
    const vacancyId = req.body.vacancyId
    const vacancyTitle = req.body.vacancyTitle
    const company = req.body.company
    const reaction = req.body.reaction
    const location = req.body.location
    const salary = req.body.salary
    const hoursPerWeek = req.body.hoursPerWeek
    const contractType = req.body.contractType

    // kijken of de gebruiker al eerder gereageerd heeft op deze vacature
    const existingReaction = await reactionsCollection.findOne({
      userId: userId,
      vacancyId: vacancyId,
      type: "user-reaction",
    })

    if (existingReaction) {
      return res.json({ success: true, alreadyReacted: true })
    }

    // vacature ophalen om het bedrijfsid te vinden
    const vacancy = await vacanciesCollection.findOne({ _id: new ObjectId(vacancyId) })
    if (!vacancy) {
      return res.status(404).json({ success: false, error: "Vacature niet gevonden" })
    }

    const companyId = vacancy.companyId.toString()
    const status = reaction === "yes" ? "In behandeling" : ""

    // reactie opslaan in de database
    await reactionsCollection.insertOne({
      userId: userId,
      vacancyId: vacancyId,
      vacancyTitle: vacancyTitle,
      company: company,
      companyId: companyId,
      location: location,
      salary: salary,
      hoursPerWeek: hoursPerWeek,
      contractType: contractType,
      reaction: reaction,
      type: "user-reaction",
      status: status,
      createdAt: new Date(),
    })

    // kijken of het bedrijf al interesse heeft getoond in deze gebruiker
    if (reaction === "yes") {
      const companyLikedUser = await reactionsCollection.findOne({
        companyId: companyId,
        userId: userId,
        type: "company-reaction",
        reaction: "yes",
      })

      // als beide partijen ja hebben gezegd is het een match
      if (companyLikedUser) {
        await reactionsCollection.updateMany(
          {
            $or: [
              { userId: userId, vacancyId: vacancyId, type: "user-reaction" },
              { companyId: companyId, userId: userId, type: "company-reaction" },
            ],
          },
          { $set: { status: "matched" } },
        )
        return res.json({ success: true, matched: true })
      }
    }

    res.json({ success: true, matched: false })
  } catch (err) {
    console.error("Fout bij opslaan reactie:", err)
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
    companiesCollection = db.collection("companies")
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