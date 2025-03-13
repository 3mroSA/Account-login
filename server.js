const NeDB = require('nedb');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');
const express = require('express');
const rateLimit = require("express-rate-limit");
const cors = require('cors');



const usersDb = new NeDB({ filename: './users.db', autoload: true });
const msgsDB = new NeDB({ filename: './msgs.db', autoload: true });

const secret = 'verysecret';
const app = express();
const port = 3000






const globalLimiter = rateLimit({
  windowMs: 2 * 60 * 1000,
  max: 30,               
  message: { error: 'Too many requests, please try again in a bit.' },  
});


app.use(cors());
app.use(globalLimiter);




app.use(express.json());

const getuser = (username) => {
  return new Promise((resolve, reject) => {
    usersDb.findOne({ username: username.trim().toLowerCase() }, (err, user) => {
      if (err) {
        reject(err);
      } else {
        resolve(user);
      }
    });
  });
};

const findemail = (emailModify) => {
  return new Promise((resolve, reject) => {
    usersDb.findOne({ email: emailModify }, (err, user) => {
      if (err) {
        reject(err);  
      } else {
        resolve(user);  
      }
    });
  });
};


const saveUser = (user) => {
  return new Promise((resolve, reject) => {
    usersDb.insert(user, (err, newUser) => {
      if (err) {
        reject(err);
      } else {
        resolve(newUser);
      }
    });
  });
};

const savemsg = (msg) => {
  return new Promise((resolve, reject) => {
    msgsDB.insert(msg, (err, newMsg) => {
      if (err) {
        reject(err);
      } else {
        resolve(newMsg);
      }
    });
  });
};

app.post('/api/signup', async (req, res) => {
  const { username, password, email } = req.body;

  if (!username || !password || !email) {
    return res.status(400).json({ message: 'Missing password, username, or email.' });
  }


  const userModify = username.toLowerCase();
  const emailModify = email.toLowerCase();
     if (userModify.length < 3) {
       return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
     }
     if (userModify.length > 20){
       return res.status(400).json({ message: 'Username must not exceed 20 characters.' });
     }
     if (userModify == password){
       return res.status(400).json({ message: 'Username and password cannot be the same.' });
     }

     if (password.length > 50) {
       return res.status(400).json({ message: 'Password must not exceed 50 characters.' });
     }
     if (email.length > 50){
       return res.status(400).json({ message: 'Invalid email. Try another email.' });
     }
     if (password.length < 8) {
       return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
     }
     if (!/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(emailModify)) {
       return res.status(400).json({ message: 'Invalid email format.' });
     }
    
     if (!/^[A-Za-z0-9_]+$/.test(userModify)){
       return res.status(400).json({ message: 'Invalid username format. It should only contain alphanumeric characters, underscores and hyphens.' });
     }


  try {

    const user = await getuser(userModify);
    
    if (user) {
      return res.status(409).json({ message: 'Username already in use.' });
    }

     const existingEmail = await findemail(emailModify);

    
  

    if (existingEmail) {
      return res.status(409).json({ message: 'Email is already in use.' });
    }

    const hashedPassword = await bcryptjs.hash(password, 12);

    const authtoken = jwt.sign({ username: userModify, email: emailModify }, secret, { expiresIn: '7d' });

    const newUser = {
      username: userModify,
      password: hashedPassword,
      email: emailModify,
      profile: {description: "Just a user!", picture: "https://cdn.discordapp.com/attachments/1320118073654640744/1344698084516560896/Untitled_design_1.png?ex=67c1db2e&is=67c089ae&hm=76eb4dd9bfd30da50999af8feddc634be3d633e18e2c66f5feee9c9cdb065a94&"}
    };

    await saveUser(newUser);

    res.status(201).json({ message: 'User created successfully', auth: authtoken, username: newUser.username, description: newUser.profile.description, picture: newUser.profile.picture });

  } catch (error) {
    console.log('Unexpected error:', error);
    return res.status(500).json({ message: 'An unknown error occurred: ' + error });
  }
});


app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Missing password or username.' });
  }

  try {
    const user = await getuser(username);

    if (!user) {
      return res.status(401).json({ message: 'Password or username incorrect.' });
    }

    bcryptjs.compare(password, user.password, (err, result) => {
      if (err) {
        console.log(err);
        return res.status(500).json({ message: 'An unknown error occurred: ' + err });
      }

      if (!result) {
        return res.status(401).json({ message: 'Password or username incorrect.' });
      }

      const authtoken = jwt.sign({ username: user.username, email: user.email }, secret, { expiresIn: '7d' });
      res.status(200).json({ message: 'Logged in successfully', auth: authtoken, username: user.username });

    });
  } catch (error) {
    console.log('Unexpected error:', error);
    return res.status(500).json({ message: 'An unknown error occurred: ' + error });
  }
});


app.post('/api/verify', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: 'Token is invalid' });
  }

  jwt.verify(token, secret, (err, decoded) => {
      if (err) {
          return res.status(403).json({ message: 'Invalid token' });
      }

      res.status(200).json({ message: 'Token verified', decoded: decoded });
  });
});


app.get('/api/data', async (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) {
      return res.status(401).json({ message: 'Token is invalid' });
  }

  try {
      const decoded = jwt.verify(token, secret); 

      const user = await getuser(decoded.username);

    const userobj = {
      "username": user.username,
      "description": user.profile.description,
      "picture": user.profile.picture,
      "email": user.email,
      "id": user._id

    }

      res.status(200).json({ message: 'Token verified', userobj });
  } catch (err) {
      res.status(403).json({ message: 'Invalid token' });
  }
});


app.post('/api/userchange', (req, res) => {
  const token = req.headers['authorization']?.split(' ')[1];
  const newuname = req.body.newname;

  if (!newuname) {
    return res.status(400).json({ message: 'No new username provided.' });
  }

  if (!token) {
    return res.status(401).json({ message: 'Token is invalid' });
  }

  jwt.verify(token, secret, async (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: 'Invalid token' });
    }

    const userModify = newuname.toLowerCase();

    if (userModify.length < 3) {
      return res.status(400).json({ message: 'Username must be at least 3 characters long.' });
    }
    if (userModify.length > 20) {
      return res.status(400).json({ message: 'Username must not exceed 20 characters.' });
    }
    if (!/^[A-Za-z0-9_]+$/.test(userModify)) {
      return res.status(400).json({ message: 'Invalid username format. It should only contain alphanumeric characters, underscores, and hyphens.' });
    }

    try {
      const user = await getuser(decoded.username);

      if (!user) {
        return res.status(404).json({ message: 'User not found.'});
      }

      if (userModify === decoded.username) {
        return res.status(400).json({ message: 'Username cannot be the same as current username.' });
      }

      usersDb.update(
        { username: decoded.username },  
        { $set: { username: userModify } },  
        {},
        (err, numReplaced) => {
          if (err) {
            return res.status(500)}
          if (numReplaced === 0) {
            return res.status(400);
          }

          const authtoken = jwt.sign({ username: userModify, email: user.email }, secret, { expiresIn: '7d' });

          res.status(200).json({ message: 'Success', auth: authtoken });
        }
      );
    } catch (error) {
      console.error('Unexpected error:', error);
      res.status(500).json({ message: 'An unknown error occurred.' });
    }
  });
});


app.listen(port, () => {
  console.log('Listening on port localhost:' + port);
});
