const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
mongoose.set("strictQuery", false);
const Models = require("./models.js");
const app = express();

const Movies = Models.Movie;
const Users = Models.User;

main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(process.env.CONNECTION_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
let allowedOrigins = [
  "http://localhost:8080",
  "http://testsite.com",
  "http://localhost:1234",
  "https://myflix-46b5ae.netlify.app",
  "https://nat-crit20.github.io",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        // If a specific origin isn’t found on the list of allowed origins
        let message =
          "The CORS policy for this application doesn’t allow access from origin " +
          origin;
        return callback(new Error(message), false);
      }
      return callback(null, true);
    },
  })
);
let auth = require("./auth")(app);
const passport = require("passport");
require("./passport");

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Welcome to my app!");
});

app.use("/", express.static("public"));

app.get(
  "/movies",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find()
      .then((movies) => {
        res.status(200).json(movies);
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
);

app.get(
  "/movies/:title",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Movies.find({ Title: req.params.title })
      .then(function (movie) {
        res.json(movie);
      })
      .catch((err) => {
        console.log(err);
        res.json(`Error: ${err}`);
      });
  }
);

app.get(
  "/genre/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { name } = req.params;
    Movies.findOne({ "Genre.Name": name }, { Genre: 1, _id: 0 })
      .then((genre) => {
        res.json(genre);
      })
      .catch((err) => {
        console.log(err);
        res.json(`Error: ${err}`);
      });
  }
);

app.get(
  "/directors/:name",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const { name } = req.params;
    Movies.findOne({ "Director.Name": name }, { Director: 1, _id: 0 })
      .then((person) => {
        res.json(person);
      })
      .catch((err) => {
        console.log(err);
        res.json(`Error: ${err}`);
      });
  }
);

app.post(
  "/users",
  [
    check(
      "Username",
      "Username is required to be greater than 5 char"
    ).isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username })
      .then((user) => {
        if (user) {
          res.status(400).send("Username already exists");
        } else {
          Users.create({
            Username: req.body.Username,
            Password: hashedPassword,
            Email: req.body.Email,
            Birthday: req.body.Birthday,
          })
            .then((user) => {
              res.status(201).json(user);
            })
            .catch((err) => {
              res.json(`Error: ${err}`);
            });
        }
      })
      .catch((err) => {
        res.json(`Error: ${err}`);
      });
  }
);

app.put(
  "/users/:id",
  [
    check("Username", "Username is required").isLength({ min: 5 }),
    check(
      "Username",
      "Username contains non alphanumeric characters - not allowed"
    ).isAlphanumeric(),
    check("Password", "Password is required").not().isEmpty(),
    check("Email", "Email does not appear to be valid").isEmail(),
  ],
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    const hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate(
      { _id: req.params.id },
      {
        $set: {
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday,
        },
      },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.post(
  "/users/:id/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $addToSet: { FavoriteMovies: req.params.movieID } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.delete(
  "/users/:id/movies/:movieID",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndUpdate(
      { _id: req.params.id },
      { $pull: { FavoriteMovies: req.params.movieID } },
      { new: true }
    )
      .then((user) => {
        res.status(200).json(user);
      })
      .catch((err) => {
        res.status(400).json(err);
      });
  }
);

app.delete(
  "/users/:Username",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username })
      .then((user) => {
        if (!user) {
          res.status(400).send(`${req.params.Username} was not found`);
        } else {
          res.send(`${req.params.Username} was found and deleted`);
        }
      })
      .catch((err) => {
        res.status(400).send(err);
      });
  }
);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

let port = process.env.PORT || 3000;

app.listen(port, "0.0.0.0", (req, res) => {
  console.log("Your app is listening on port 3000");
});
