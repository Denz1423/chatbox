require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const connectDB = require("./db/db");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const ws = require("ws");

const User = require("./models/user");
const Message = require("./models/messages");

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

async function getUserDataFromRequest(req) {
  return new Promise((resolve, reject) => {
    const token = req.cookies?.token;
    if (token) {
      jwt.verify(token, jwbSecret, {}, (err, userData) => {
        if (err) {
          console.log(err);
          next();
        }
        resolve(userData);
      });
    } else {
      reject("No token");
      next();
    }
  });
}

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

app.get("/messages/:userId", async (req, res) => {
  const { userId } = req.params;
  const userData = await getUserDataFromRequest(req);
  const ourUserId = userData.userId;
  const messages = await Message.find({
    sender: { $in: [userId, ourUserId] },
    recipient: { $in: [userId, ourUserId] },
  }).sort({ createdAt: 1 });
  res.json(messages);
});

app.get("/people", async (req, res) => {
  const users = await User.find({}, {'_id': 1, username: 1});
  res.json(users);
})

app.post("/login", async (req, res, next) => {
  const { username, password } = req.body;
  try {
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
    } else {
      res.status(400).json({ error: "Invalid" });
    }
  } catch (err) {
    res.status(500).json({ error: err });
  }
});

app.post("/register", async (req, res, next) => {
  const { username, password } = req.body;

  try {
    const foundUser = await User.findOne({ username });

    if (!foundUser) {
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
    } else {
      res
        .status(409)
        .json({ success: false, error: "Username already exist!" });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500);
    next();
  }
});

connectDB();

const server = app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

const wss = new ws.WebSocketServer({ server });

wss.on("connection", (connection, req) => {
  //Read username and id from the cookie for current connection
  const cookies = req.headers.cookie;
  if (cookies) {
    const tokenCookieString = cookies
      .split(";")
      .find((str) => str.startsWith("token="));
    if (tokenCookieString) {
      const token = tokenCookieString.split("=")[1];
      if (token) {
        jwt.verify(token, jwbSecret, {}, (err, userData) => {
          if (err) {
            console.log(err);
          }
          const { userId, user } = userData;
          connection.userId = userId;
          connection.username = user;
        });
      }
    }
  }

  connection.on("message", async (message) => {
    const messageData = JSON.parse(message.toString());
    const { recipient, text } = messageData;

    if (recipient && text) {
      const messageDoc = await Message.create({
        sender: connection.userId,
        recipient,
        text,
      });

      [...wss.clients]
        .filter((client) => client.userId === recipient)
        .forEach((client) =>
          client.send(
            JSON.stringify({
              text,
              sender: connection.userId,
              recipient: recipient,
              _id: messageDoc._id,
            })
          )
        );
    }
  });

  //Notify everyone about online people (when someone connects)
  [...wss.clients].forEach((client) => {
    client.send(
      JSON.stringify({
        online: [...wss.clients].map((c) => ({
          userId: c.userId,
          username: c.username,
        })),
      })
    );
  });
});
