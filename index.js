const express = require("express");
const bodyParser = require("body-parser");
const morgan = require("morgan");
const mongoose = require("mongoose");
const Models = require("./models.js");
const path = require("path");
const app = express();

const Movies = Models.Movie;
const Users = Models.User;
mongoose.connect("mongodb:://localhost:27017/myFlixDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const topTenMovies = [
  {
    Title: "Avengers: Endgame",
    Release: 2019,
    Genre: ["Action", "Adventure", "Superhero", "Science fiction", "Fantasy"],
    Director: [
      {
        Name: "Anthony Russo",
        Birth: 1970,
      },
      {
        Name: "Joe Russo",
        Birth: 1970,
      },
    ],
  },
  {
    Title: "Sonic 2",
    Release: 2022,
    Genre: ["Action", "Fantasy", "Comedy", "Adventure", "Animation"],
    Director: {
      Name: "Jeff Fowler",
      Birth: 1978,
    },
  },
];

app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  console.log("Hello World");
  res.send("Welcome to my app!");
});

app.use("/", express.static("public"));

app.get("/movies", (req, res) => {
  res.json(topTenMovies);
});

app.get("/movies/:title", (req, res) => {
  const { title } = req.params;
  const movie = topTenMovies.find((element) => {
    return element.Title === title;
  });
  res.send(movie);
});

app.get("/genre/:name", (req, res) => {
  res.send("Successful GET of movie genre");
});

app.get("/directors/:name", (req, res) => {
  res.send("Successful GET of director");
});

app.post("/users", (req, res) => {
  res.send("Successful creation of user");
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
