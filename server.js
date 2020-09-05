const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies
app.use(cors());
app.use(express.static('client/public'));

if (process.env.NODE_ENV === 'production') {
  // Serve any static files
  app.use(express.static(path.join(__dirname, 'client/build')));
  // Handle React routing, return all requests to React app
  app.get('*', function(req, res) {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`App server now listening to port ${port}`);
});

// AWS RDS MySQL database info
const table ='images';
const pool = mysql.createPool({
  host: 'leaflet-database.caccpytxj8mx.us-west-2.rds.amazonaws.com',
  user: 'leafletadmin',
  password: 'leafletadmin',
  database: 'leaflet'
});

// GET route
app.get('/api/images', (req, res) => {
  pool.query(`select * from ${table}`, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

var storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, 'client/public/images')
  },
  filename: (req, file, cb) => {
      cb(null, Date.now() + '-' + file.originalname)
  }
});

// POST route
const upload = multer({storage});
app.post('/api/post', upload.single('image'), (req, res) => {
  if (req.file) {
    // upload file data into MySQL database
    var sql = `INSERT INTO ${table} (image_title, image_author, src) VALUES (?, ?, ?)`;
    pool.query(sql, [req.file.filename, 'admin', '/images/'+ req.file.filename], (err, rows) => {
      if (err) {
        console.log("ERROR MESSAGE: ");
        console.log(err);
      } else {
        console.log("SUCCESS RESPONSE: ");
        console.log(res);
      }
    });
  } else {
    res.status("409").json("No Files to Upload.");
  }
});