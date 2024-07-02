// webserver
const express = require('express');
const path = require('path');
const fs = require('fs');

// verify
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

// upload
const multer  = require('multer');
const { get } = require('http');
const { exit } = require('process');
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/media')
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname)
  }
})
const upload = multer({ storage })


const upload2 = multer({ dest: 'public/media' })


// express
const app = express();
const port = 3000;

// users
const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync('password', 10), // Password should be hashed
    group: 'admin',
  },
  {
    id: 2,
    username: 'nick',
    passwordHash: bcrypt.hashSync('123456', 10),
    group: 'admin'
  }
];

// Passport configuration
passport.use(new LocalStrategy((username, password, done) => {
  const user = users.find(u => u.username === username);
  if (!user) {
    return done(null, false, { message: 'Incorrect username.' });
  }
  if (!bcrypt.compareSync(password, user.passwordHash)) {
    return done(null, false, { message: 'Incorrect password.' });
  }
  return done(null, user);
}));

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  const user = users.find(u => u.id === id);
  done(null, user);
});

// functions

function renameFile(name){
  fs.readdir('/public/media', (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    // Filter out the files
    let fileCount = 0;
    files.forEach(file => {
        const filePath = path.join(directoryPath, file);
        if (fs.statSync(filePath).isFile()) {
            fileCount++;
        }
    });
    fileCount++;

    return fileCount;
});
}

function renameFile2(){
  fs.readdir(__dirname + '/public/media', (err, files) => {
    if (err) {
        return console.error('Unable to scan directory: ' + err);
    }

    // Filter out the files
    let fileCount = 0;
    files.forEach(file => {
        const filePath = path.join(__dirname + '/public/media', file);
        if (fs.statSync(filePath).isFile()) {
            fileCount++;
        }
    });
    fileCount++;


    var string = '' + fileCount + '.json'

    return string;
})}

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'public/media')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const mediaFolder = path.join(__dirname, 'public/media');
const infoFolder = path.join(__dirname, 'infos');


// api
app.post('/api/upload', upload2.single('file'), (req, res) => {

  var lol = req.file.filename

  fs.rename('public/media/' + lol, 'public/media/' + renameFile2((err)=>console.log(err)), (err)=> console.log(err))
  console.log()
  res.redirect('/admin')
})

app.get('/api/infos', (req, res) => {
  fs.readdir(infoFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory: ' + err})
    }
    res.json ({files});
  })
})

app.get('/api/infos/:id', (req, res) => {
  const options = {
    root: path.join(__dirname, 'infos')
  };
  const fileName = req.params.id + '.json';
    res.sendFile(fileName, options, function (err) {
        if (err) {
            console.error('Error sending file:', err);
        } else {
            console.log('Sent:', fileName);
        }
    });
})

// Routes
app.get('/read-media', (req, res) => {
  fs.readdir(mediaFolder, (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Unable to scan directory: ' + err });
    }
    res.json({ files });
  });
});

app.get('/admin', (req, res) => {
  if (req.isAuthenticated()) {
    console.log('admin page got entered')
    console.log(req.user.group)
    res.sendFile(path.join(__dirname, 'public', 'admin.html'));
  } else {
    res.redirect('/login');
  }
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});


app.post('/login',
  passport.authenticate('local', {
    successRedirect: '/admin',
    failureRedirect: '/login',
  })
);

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});