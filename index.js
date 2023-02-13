const express = require("express");
const morgan = require("morgan");
const path = require("path");
const app = express();

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
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
  {
    Title: "",
    Release: "",
    Genre: {
      Name: "",
    },
    Director: {
      Name: "",
      Birth: 1990,
    },
  },
];

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  res.send("Welcome to my movies");
});

app.get("/movies", (req, res) => {
  res.json(topTenMovies);
});

app.listen(3000, (req, res) => {
  console.log("Your app is listening on port 3000");
});
