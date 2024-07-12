const express = require("express");
require("dotenv").config();
const mongoose = require("mongoose");
const UserAuth = require("./Model/AuthSchema");
const bcrypt = require("bcryptjs");
const userAuth = require("./Model/AuthSchema");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const app = express();

async function connectingDb() {
  try {
    await mongoose.connect(process.env.DB_CONNECTION);
    console.log("connected to DB..");
  } catch (error) {
    console.log(`Error occurred: ${error.message}`);
  }
}
connectingDb();

app.use(express.json());
app.use(cookieParser("secretCOoki@"));
app.use(cors());

app.get('/',(req,res)=>{
  res.send("hello world")
})

app.post("/api/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    //hashing password
    const myEncPassword = await bcrypt.hash(password, 10);
    console.log(`hashed password is ${myEncPassword}`);

    // checking all the required form
    if (!(username && password)) {
      res.json({ message: "username and password required" });
    }

    // checking existing users
    const existingUser = await userAuth.findOne({ username });
    if (existingUser) {
      res.json({ message: "user already exist please try unique" });
    }

    // registering user without frontend
    const user = await UserAuth.create({
      username,
      password: myEncPassword,
    });
    console.log(user);
    res.status(200).json({ message: "registered success" });
  } catch (error) {
    console.log(error.message);
    res.status(400).json({ message: "error occurred while registering" });
  }
});

app.post("/api/login", async (req, res) => {
  const { username, password } = req.body;
  try {
    const findUser = await UserAuth.findOne({ username });
    if (!findUser) throw "user not found";

    const comparePassword = await bcrypt.compare(password, findUser.password);
    if (!comparePassword) throw "Invalid credentials";

    const payload = {
      username: findUser.username,
      id: findUser._id,
    };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      maxAge: 3600000,
    });

    res.json({ message: "Login successful" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: `${error}` });
  }
});

const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`server running PORT ${PORT}`);
});
