const express = require("express");
// const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

var corsOptions = {
  origin: "http://localhost:8081"
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./app/models");// Required for JWT
const jwt = require('jsonwebtoken');

// JWT Authentication Middleware
function authenticateJWT(req, res, next) {
  const token = req.header('Authorization');
  if (token) {
    jwt.verify(token, 'your_secret_key', (err, user) => {
      if (err) {
        return res.sendStatus(403);
      }
      req.user = user;
      next();
    });
  } else {
    res.sendStatus(401);
  }
}

// Login Route
app.post('/login', (req, res) => {
  // Dummy user validation. In a real-world scenario, you would validate against a database.
  const { username, password } = req.body;
  if (username === 'admin' && password === 'password') {
    // User authenticated successfully, generate and return a token
    const token = jwt.sign({ username }, 'your_secret_key', { expiresIn: '1h' });
    res.json({ token });
  } else {
    res.sendStatus(403);
  }
});

// Sample Protected Route
app.get('/protected', authenticateJWT, (req, res) => {
  res.json({ message: 'This is a protected route.' });
});

db.sequelize.sync();
// // drop the table if it already exists
// db.sequelize.sync({ force: true }).then(() => {
//   console.log("Drop and re-sync db.");
// });

// simple route
app.get("/", (req, res) => {
  res.json({ message: "Bienvenidos a la aplicacion de la UTM." });
});

require("./app/routes/turorial.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
