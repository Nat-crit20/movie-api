const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");
const app = express();

const Movies = Models.Movie;
const Users = Models.User;

main()
  .then(() => console.log("Connected to database"))
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/myFlixDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Welcome to my app!");
});

app.use("/", express.static("public"));

app.get("/movies", (req, res) => {
  Movies.find()
    .then((movies) => {
      res.status(200).json(movies);
    })
    .catch((err) => {
      res.status(400).send(err);
    });
});

app.get("/movies/:title", async (req, res) => {
  Movies.find({ Title: req.params.title })
    .then(function (movie) {
      res.json(movie);
    })
    .catch((err) => {
      console.log(err);
      res.json(`Error: ${err}`);
    });
});

app.get("/genre/:name", (req, res) => {
  const { name } = req.params;
  Movies.findOne({ "Genre.Name": name }, { Genre: 1, _id: 0 })
    .then((genre) => {
      res.json(genre);
    })
    .catch((err) => {
      console.log(err);
      res.json(`Error: ${err}`);
    });
});

app.get("/directors/:name", (req, res) => {
  const { name } = req.params;
  Movies.findOne({ "Director.Name": name }, { Director: 1, _id: 0 })
    .then((person) => {
      res.json(person);
    })
    .catch((err) => {
      console.log(err);
      res.json(`Error: ${err}`);
    });
});

app.post("/users", (req, res) => {
  res.send("Updated users");
});

app.put("/users/:id", (req, res) => {
  res.send("Successful updated user");
});

app.post("/users/:id/:movies/:favorites", (req, res) => {
  res.send("Successfully add movie to favorite");
});

app.delete("/users/:id/:movies/:favorites", (req, res) => {
  res.send("Successfully deleted movie from favorites");
});

app.delete("/users/:id", (req, res) => {
  res.send("Successfully deleted yourself");
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something broke!");
});

app.listen(3000, (req, res) => {
  console.log("Your app is listening on port 3000");
});
