const express = require('express');
const { MongoClient } = require('mongodb');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Express
const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// MongoDB connect
const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME;

let db;

async function run() {
  try {
    await client.connect();
    console.log("Successfully connected to local MongoDB!");
    db = client.db(dbName);
    
    app.listen(port, () => {
      console.log(`Server is running on port: ${port}`);
    });

  } catch (err) {
    console.error("Failed to connect to MongoDB", err);
    process.exit(1);
  }
}

run().catch(console.dir);

//====================
//    API Endpoint
//====================

// [GET] /api/posts
app.get("/api/posts", async (req, res) => {
  try {
    const posts = await db.collection("posts").find({}).sort({ createdAt: -1 }).toArray();
    res.json(posts);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// [POST] /api/register
app.post("/api/register", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    // 이미 존재하는 사용자인지 확인
    const existingUser = await db.collection("users").findOne({ username: username });
    if (existingUser) {
      return res.status(409).json({ message: "Username already exists." });
    }

    const newUser = {
      username: username,
      password: password, 
      isAdmin: false,
      createdAt: new Date(),
    };

    await db.collection("users").insertOne(newUser);
    res.status(201).json({ message: "User registered successfully!" });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// [POST] /api/login - 로그인 API
app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    // 입력값 검증
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

    const user = await db.collection("users").findOne({
      username: username,
      password: password,
    });

    if (user) {
      // 로그인 성공 - TODO: JWT Token
      res.status(200).json({
        message: "Login successful!",
        user: {
          id: user._id,
          username: user.username,
          isAdmin: user.isAdmin,
        },
      });
    } else {
      // 로그인 실패
      res.status(401).json({ message: "Invalid username or password." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// [GET] /api/admin/users
app.get("/api/admin/users", async (req, res) => {
  try {
    // 보안을 위해 password 필드를 제외하고 모든 사용자를 조회합니다.
    const users = await db.collection("users").find({}, { projection: { password: 0 } }).toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// [DELETE] /api/admin/users/:id
app.delete("/api/admin/users/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const result = await db.collection("users").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "User deleted successfully" });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// [DELETE] /api/admin/posts/:id
app.delete("/api/admin/posts/:id", async (req, res) => {
  try {
    const { id } = req.params;
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid post ID format" });
    }

    const result = await db.collection("posts").deleteOne({ _id: new ObjectId(id) });

    if (result.deletedCount === 1) {
      res.status(200).json({ message: "Post deleted successfully" });
    } else {
      res.status(404).json({ message: "Post not found" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete post" });
  }
});

// [POST] /api/posts
app.post("/api/posts", async (req, res) => {
  try {
    const { title, content, authorId, authorUsername } = req.body;

    if (!title || !content || !authorId || !authorUsername) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const newPost = {
      title,
      content,
      authorId,
      authorUsername,
      createdAt: new Date(),
    };

    const result = await db.collection("posts").insertOne(newPost);
    res.status(201).json({ message: "Post created successfully!"});

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

// Catch-All route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist', 'index.html'));
});