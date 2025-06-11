const express = require("express");
const router = express.Router();
const prisma = require("../prismaClient");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { auth } = require("../middlewares/auth");
router.get("/users", async (req, res) => {
  try {
    const data = await prisma.user.findMany({
      include: { posts: true, comments: true },
      orderBy: { id: "desc" },
      take: 20,
    });
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});

router.get("/users/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await prisma.user.findFirst({
      where: { id: Number(id) },
      include: { posts: true, comments: true },
    });
    if (!data) {
      return res.status(404).json({ error: "User not found" });
    }
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message || "Server error" });
  }
});
router.post("/users", async (req, res) => {
  console.log("req.body:", req.body);
  const { name, username, bio, password } = req.body;
  if (!name || !username || !password) {
    return res
      .status(400)
      .json({ msg: "name, username and password required" });
  }
  const hash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { name, username, password: hash, bio },
  });
  res.json(user);
});
router.post("/login", async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ msg: "username and password required" });
  }
  const user = await prisma.user.findUnique({
    where: { username },
  });
  if (user) {
    if (bcrypt.compare(password, user.password)) {
      const token = jwt.sign(user, process.env.JWT_SECRET);
      return res.json({ token, user });
    }
  }
  res.status(401).json({ msg: "incorrect username or password" });
});
router.get("/verify", auth, async (req, res) => {
  const user = res.locals.user;
  res.json(user);
});
module.exports = { userRouter: router };
