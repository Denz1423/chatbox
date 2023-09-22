require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./db/db");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");

const User = require("./models/user");

const port = process.env.PORT || 4040;
const jwbSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);

app.use(
  cors({
    credentials: true,
    origin: process.env.CLIENT_URL,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/profile", (req, res, next) => {
  const token = req.cookies?.token;
  if (token) {
    jwt.verify(token, jwbSecret, {}, (err, userData) => {
      if (err) {
        console.log(err);
        next();
      }
      res.json(userData);
    });
  } else {
    res.status(401).json("No token");
    next();
  }
});

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  const foundUser = await User.findOne({ username });
  if (foundUser) {
    const authorized = bcrypt.compareSync(password, foundUser.password);
    if (authorized) {
      jwt.sign(
        { userId: foundUser._id, user: username },
        jwbSecret,
        {},
        (err, token) => {
          if (err) {
            console.log(err);
            res.status(500);
            next();
          }
          res.cookie("token", token).json({ id: foundUser._id });
        }
      );
    }
  }
});

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;
  try {
    const hashPassword = bcrypt.hashSync(password, bcryptSalt);
    const createdUser = await User.create({
      username: username,
      password: hashPassword,
    });
    jwt.sign(
      { userId: createdUser._id, user: username },
      jwbSecret,
      {},
      (err, token) => {
        if (err) {
          console.log(err);
          res.status(500);
          next();
        }
        res.cookie("token", token).status(201).json({ id: createdUser._id });
      }
    );
  } catch (error) {
    console.log(error);
    res.status(500);
    next();
  }
});

connectDB();

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
