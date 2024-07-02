const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

// verify
const session = require('express-session');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcrypt');

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


const app = express();
const uploadFolder1 = './infos'; // Erster Zielordner
const uploadFolder2 = './public/media'; // Zweiter Zielordner

// Sicherstellen, dass die Upload-Ordner existieren
if (!fs.existsSync(uploadFolder1)) {
  fs.mkdirSync(uploadFolder1);
}
if (!fs.existsSync(uploadFolder2)) {
  fs.mkdirSync(uploadFolder2);
}

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/media', express.static(path.join(__dirname, 'public/media')));
app.use(session({ secret: 'secret', resave: false, saveUninitialized: false }));
app.use(passport.initialize());
app.use(passport.session());

const mediaFolder = path.join(__dirname, 'public/media');
const infoFolder = path.join(__dirname, 'infos');

// Funktion zur Erstellung einer Multer-Konfiguration
const createStorage = (folder) => {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, folder);
    },
    filename: (req, file, cb) => {
      // Dateiname wird zunächst temporär gesetzt
      cb(null, file.originalname);
    }
  });
};

// Multer Konfigurationen für beide Upload-Funktionen
const upload1 = multer({ storage: createStorage(uploadFolder1) });
const upload2 = multer({ storage: createStorage(uploadFolder2) });

// Funktion zum Hochladen und Umbenennen der Datei
const handleUpload = (req, res, folderPath) => {
  const tempPath = req.file.path;

  // Anzahl der Dateien im Ordner zählen
  fs.readdir(folderPath, (err, files) => {
    if (err) {
      return res.status(500).json({ message: 'Fehler beim Lesen des Ordners' });
    }

    // Neuer Dateiname basierend auf der Anzahl der Dateien im Ordner
    var newFileName;
    if (path.extname(req.file.originalname) == '.json'){
      newFileName = '' + files.length + path.extname(req.file.originalname);
    } else {
      newFileName = '' + files.length + ".png";
    }

    const newPath = path.join(folderPath, newFileName);

    // Datei umbenennen
    fs.rename(tempPath, newPath, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Fehler beim Umbenennen der Datei' });
      }

      res.status(200).json({ message: 'Datei erfolgreich hochgeladen', filename: newFileName });
    });
  });
};

// api


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


  

// Route zum Hochladen der Datei in den ersten Ordner
app.post('/api/upload/info', upload1.single('file'), (req, res) => {
  handleUpload(req, res, uploadFolder1);
});

// Route zum Hochladen der Datei in den zweiten Ordner
app.post('/api/upload/pictures', upload2.single('file'), (req, res) => {
  handleUpload(req, res, uploadFolder2);
});

// Routes
app.get('/read-media', (req, res) => {
    fs.readdir(mediaFolder, (err, files) => {
      if (err) {
        return res.status(500).json({ error: 'Unable to scan directory: ' + err });
      }
      res.json({ files });
    });
  });

  app.get('/info', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'info.html'))
  })
  
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

// Server starten
const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server läuft auf http://localhost:${PORT}`);
});
