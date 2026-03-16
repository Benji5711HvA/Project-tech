require("dotenv").config()

const express = require("express")
const session = require("express-session")
const { MongoClient, ObjectId } = require("mongodb")

// Database setup
const uri = process.env.URI
const client = new MongoClient(uri)
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
  })
)

// Middleware
function isLoggedIn(req, res, next) {
  if (req.session.user) return next()
  return res.redirect("/login")
}

// Routes
app.get("/", home)

// Benjamin - Account
app.get("/login", showLogin)
app.get("/register", showRegister)
app.get("/profile/create", isLoggedIn, showCreateProfile)

// Mehmet - Favorites
app.get("/favorites", isLoggedIn, showFavorites)

// Sanna - Matching
app.get("/matching", isLoggedIn, showMatching)


// Functions
function home(req, res) {
  res.render("pages/index")
}

// Benjamin - Account
function showLogin(req, res) {
  res.render("pages/login")
}

function showRegister(req, res) {
  res.render("pages/register")
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