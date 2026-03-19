require("dotenv").config()

const express = require("express")
const session = require("express-session")
const bcrypt = require("bcryptjs")
const { MongoClient, ObjectId } = require("mongodb")

// Database setup
const URI = process.env.URI
const client = new MongoClient(URI)
let usersCollection

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

// Middleware - uitgecomment totdat login functionaliteit klaar is
// function isLoggedIn(req, res, next) {
//   if (req.session.user) return next()
//   return res.redirect("/login")
// }

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

app.get("/profile/create", showCreateProfile)

// Mehmet - Favorites
app.get("/favorites", showFavorites)

// Sanna - Matching
app.get("/matching", showMatching)

// Functions
function home(req, res) {
  res.render("pages/index")
}

// Benjamin - Account
function showRegister(req, res) {
  res.render("pages/register")
}

async function handleRegister(req, res) {
  try {
    const { email, password, confirmPassword } = req.body

    const error = validateRegistration(email, password, confirmPassword)
    if (error) return res.status(400).render("pages/register", { error })

    // Voorkom duplicate accounts met hetzelfde emailadres
    const existingUser = await usersCollection.findOne({ email })
    if (existingUser) {
      return res
        .status(400)
        .render("pages/register", { error: "E-mailadres is al in gebruik" })
    }

    // Het is verboden om plain text wachtwoorden op te slaan, dus we hashen het wachtwoord voordat we het in de database opslaan
    const hashedPassword = await hashPassword(password)
    await usersCollection.insertOne({ email, password: hashedPassword })

    res.redirect("/login")
  } catch (err) {
    console.error("Fout bij registreren:", err)
    res
      .status(500)
      .render("pages/register", {
        error: "Er ging iets mis, probeer het opnieuw",
      })
  }
}

function showLogin(req, res) {
  res.render("pages/login")
}

function showCreateProfile(req, res) {
  res.render("pages/createProfile")
}

// Mehmet - Favorites
function showFavorites(req, res) {
  res.render("pages/favorite")
}

// Sanna - Matching
function showMatching(req, res) {
  res.render("pages/matching")
}

// Start server
async function startServer() {
  try {
    await client.connect()
    console.log("Verbonden met MongoDB")

    const db = client.db(process.env.DB_NAME)
    usersCollection = db.collection("users")

    app.listen(3000, () => {
      console.log("Server draait op http://localhost:3000")
    })
  } catch (err) {
    console.error("Database connectie mislukt:", err)
  }
}

startServer()
