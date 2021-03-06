const express = require('express');
const fs = require('fs');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());

if (process.env.NODE_ENV === 'production') {
  imgLocation = 'client/build'; // global variable
  // Serve any static files
  app.use(express.static(path.join(__dirname, imgLocation)));
  // Handle React routing, return all requests to React app
  app.get('/', function(req, res) {
    res.sendFile(path.join(__dirname, imgLocation, 'index.html'));
  });
  // set up for upload
  var storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, imgLocation + '/images')
    },
    filename: (req, file, cb) => {
        cb(null, String(Date.now()).substring(0, 10) + '-' + file.originalname)
    }
  });
} else { // development version
  imgLocation = 'client/public';
  app.use(express.static(imgLocation));
  var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, imgLocation + '/images')
  },
  filename: (req, file, cb) => {
      cb(null, String(Date.now()).substring(0, 10) + '-' + file.originalname)
  }
});
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App server now listening to port ${port}`);
});

// AWS RDS MySQL database info
const table ='images';
const pool = mysql.createPool({
  connectionLimit: 100,
  host: 'leaflet-database.caccpytxj8mx.us-west-2.rds.amazonaws.com',
  user: 'leafletadmin',
  password: 'leafletadmin',
  database: 'leaflet'
});

// GET route to load images
app.get('/api/images', (req, res) => {
  pool.query(`select * from ${table}`, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

// POST route to store image file (FormData)
const upload = multer({storage});
app.post('/api/post', upload.single('image'), (req, res) => {
  if (req.file) {
    console.log(req.file.filename);
    console.log("DEBUG: /api/post SUCCESS");
  } else {
    res.status("409").json("No Files to Upload.");
  }
});

// POST route to store image details in SQL database
app.post('/api/postdetails', (req, res) => {
  var sql = `INSERT INTO ${table} (image_title, image_author, src, name, tags) VALUES (?, ?, ?, ?, ?)`;
  let filename = String(Date.now()).substring(0, 10) + '-' + req.body.filename;
  if (req.body.url) { // upload from URL
    pool.query(sql, [filename, 'admin', req.body.url, req.body.name, JSON.stringify(req.body.tags)], (err, rows) => {
      if (err) {
        console.log("DEBUG: /api/postdetails ERROR MESSAGE: ");
        console.log(err);
      } else {
        console.log("DEBUG: /api/postdetails SUCCESS");
      }
    });
  } else { // upload from device
    pool.query(sql, [filename, 'admin', '/images/'+ filename, req.body.name, JSON.stringify(req.body.tags)], (err, rows) => {
      if (err) {
        console.log("DEBUG: /api/postdetails ERROR MESSAGE: ");
        console.log(err);
      } else {
        console.log("DEBUG: /api/postdetails SUCCESS");
      }
    });
  }
});

// POST route to delete image details (and file, if it exists)
app.post('/api/delete', (req, res) => {
  // delete image details from SQL database
  var sql = `delete from ${table} where image_id = ?`;
  console.log(req.body.id);
  console.log(req.body.path);
  pool.query(sql, [req.body.id], (err, rows) => {
    if (err) {
      console.log("DEBUG: SQL delete entry error message");
      console.log(err);
    }
  });
  // remove file
  if (fs.existsSync(imgLocation + '/images/' + req.body.path)) {
    fs.unlink(imgLocation + '/images/' + req.body.path, (err) => {
      if (err) {
        console.log("DEBUG: Unlink file error message");
        console.error(err);
        return;
      } else {
        console.log("DEBUG: Removed file");
      }
    })
  }
});
