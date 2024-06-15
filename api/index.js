require("dotenv").config();
const express = require('express');
const cors = require('cors');
const { default: mongoose } = require('mongoose');
const User = require('./models/user');
const Post = require('./models/Post');
const bcrypt = require('bcryptjs');
const app = express();
const jwt = require('jsonwebtoken');
const cokkieParser = require('cookie-parser');
const cookieParser = require('cookie-parser');
const multer = require('multer');
const uploadMiddleware = multer({ dest: 'uploads/' });
const fs = require('fs');


const salt = bcrypt.genSaltSync(10);
const secret = 'akshanth18';

app.use(cors({ credentials: true, origin: 'http://localhost:5173' }));
app.use(express.json());
app.use(cookieParser());
app.use('/uploads',express.static(__dirname+'/uploads'))

mongoose.connect(process.env.MONGODB_URL);

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const userDoc = await User.create({
            username,
            password: bcrypt.hashSync(password, salt),
        });
        res.json(userDoc);
    } catch (e) {
        res.status(400).json(e);
    }
});

app.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const userDoc = await User.findOne({ username });

        if (!userDoc) {
            return res.status(400).json('User not found');
        }

        const passOk = await bcrypt.compare(password, userDoc.password);

        if (passOk) {
            const token = jwt.sign({ username, id: userDoc._id }, secret);
            res.cookie('token', token, { httpOnly: true }).json({
                id: userDoc._id,
                username,
            });
        } else {
            res.status(400).json('Wrong credentials');
        }
    } catch (err) {
        res.status(500).json('Internal Server Error');
    }
});

app.get('/profile', (req, res) => {
    const { token } = req.cookies;
    if (!token) {
        return res.status(403).json({ err: "not authorized" });
    }
    jwt.verify(token, secret, {}, (err, info) => {
        if (err) {
            return res.status(403).json({ err: "token verification failed" });
        }
        res.json(info);
    });
});


app.post('/logout', (req, res) => {
    res.cookie('token', '').json('ok');
})

app.post('/post', uploadMiddleware.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ err: "No file uploaded" });
        }

        const { originalname, path } = req.file;
        const parts = originalname.split('.');
        const ext = parts[parts.length - 1];
        const newPath = path + '.' + ext;

        fs.renameSync(path, newPath);

        const { title, summary, content } = req.body;
        const { token } = req.cookies;

        if (!token) {
            return res.status(401).json({ err: "No token provided" });
        }

        jwt.verify(token, secret, {}, async (err, info) => {
            if (err) {
                return res.status(403).json({ err: "Token verification failed" });
            }

            const postDoc = await Post.create({
                title,
                summary,
                content,
                cover: newPath,
                author: info.id,
            });

            res.json(postDoc);
        });
    } catch (error) {
        console.error("Error in /post route:", error);
        res.status(500).json({ err: "Internal Server Error" });
    }
});

app.put('/post',uploadMiddleware.single('file'), async (req,res) => {
    let newPath = null;
    if (req.file) {
      const {originalname,path} = req.file;
      const parts = originalname.split('.');
      const ext = parts[parts.length - 1];
      newPath = path+'.'+ext;
      fs.renameSync(path, newPath);
    }
  
    const {token} = req.cookies;
    jwt.verify(token, secret, {}, async (err,info) => {
      if (err) throw err;
      const {id,title,summary,content} = req.body;
      const postDoc = await Post.findById(id);
      const isAuthor = JSON.stringify(postDoc.author) === JSON.stringify(info.id);
      if (!isAuthor) {
        return res.status(400).json('you are not the author');
      }
      await postDoc.updateOne({
        title,
        summary,
        content,
        cover: newPath ? newPath : postDoc.cover,
      });
  
      res.json(postDoc);
    });
  
  });

app.get('/post', async (req, res) => {
    const posts = await (Post.find())
    .populate('author', ['username'])
    .sort({createdAt:-1})
    .limit(20)
    res.json(posts)
})
app.get('/post/:id', async (req, res) => {
    const {id} = req.params;
    const postDoc = await Post.findById(id).populate('author', ['username']);
    res.json(postDoc);
  })
app.listen(4000);