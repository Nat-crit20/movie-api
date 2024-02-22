const express = require("express");
const bodyParser = require("body-parser");
//const morgan = require("morgan");
const mongoose = require("mongoose");
const cors = require("cors");
const { check, validationResult } = require("express-validator");
mongoose.set("strictQuery", false);
const Models = require("./models.js");
//const multer = require("multer");
const app = express();
const dotenv = require("dotenv");
// const {
//   S3Client,
//   PutObjectCommand,
//   GetObjectCommand,
//   ListObjectsV2Command,
// } = require("@aws-sdk/client-s3");
//const fs = require("fs");
dotenv.config();

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

app.use(bodyParser.json({ limit: "20mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "20mb" }));
let allowedOrigins = [
  "http://myflix-aws.s3-website.eu-central-1.amazonaws.com",
  "http://localhost:1234",
  "http://3.69.30.141",
  "https://myflix-46b5ae.netlify.app",
  "https://nat-crit20.github.io",
];
/*
// Set up AWS S3 client
const s3Client = new S3Client({
  region: "us-east-1", // Replace with your AWS region
  credentials: {
    accessKeyId: "//AccesseKey", // Replace with your AWS Access Key ID
    secretAccessKey: "///srcAccessKey", // Replace with your AWS Secret Access Key
  },
});
const uploadS3BucketName = "myawsbucket-24";
const imageS3BucketName = "mylambas3bucketdemo";
*/
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
/*
// Endpoint to list all images in a bucket
app.get("/list-images", (req, res) => {
  const listObjectsCommand = new ListObjectsV2Command({
    Bucket: imageS3BucketName,
  });

  s3Client
    .send(listObjectsCommand)
    .then((listObjectsResponse) => {
      res.send(listObjectsResponse);
    })
    .catch((err) => {
      res.status(500).json({ error: "Error listing images" });
    });
});

// Endpoint to upload an image to a bucket
const storage = multer.memoryStorage(); // Store the file in memory
const upload = multer({ storage });

// Endpoint to handle image upload
app.post("/upload", upload.single("image"), async (req, res) => {
  try {
    const { originalname, buffer } = req.file;

    // Specify the S3 bucket and key (object key) for the image
    const objectKey = originalname; // Use the original file name

    // Prepare the parameters for the S3 PUT operation
    const params = {
      Bucket: uploadS3BucketName,
      Key: objectKey,
      Body: buffer,
    };

    // Upload the image to the S3 bucket
    await s3Client.send(new PutObjectCommand(params));

    res.status(200).json({ message: "Image uploaded successfully" });
  } catch (error) {
    console.error("Error uploading image:", error);
    res.status(500).json({ error: "Image upload failed" });
  }
});
// Endpoint to retrieve an image from a bucket
app.get("/view-image/:key", async (req, res) => {
  try {
    const { key } = req.params;

    // Specify the S3 bucket
    const bucketName = "mylambas3bucketdemo";

    // Prepare the parameters for the S3 GET operation
    const params = {
      Bucket: bucketName,
      Key: key,
    };

    // Retrieve the image from S3
    const { Body, ContentType } = await s3Client.send(
      new GetObjectCommand(params)
    );

    // Set the appropriate headers for image response
    res.setHeader("Content-Type", ContentType);

    // Pipe the image data directly to the response
    Body.pipe(res);
  } catch (error) {
    console.error("Error viewing image:", error);
    res.status(500).send("Failed to view image from S3");
  }
});
*/
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
