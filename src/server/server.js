const express = require('express');
const mysql = require('mysql');
const bodyParser = require('body-parser');

const app = express();
const port = 8080;
const table ='images';

const pool = mysql.createPool({
  host: 'leaflet-database.caccpytxj8mx.us-west-2.rds.amazonaws.com',
  user: 'leafletadmin',
  password: 'leafletadmin',
  database: 'leaflet'
});

app.listen(port, () => {
  console.log(`App server now listening to port ${port}`);
});

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.get('/api/images', (req, res) => {
  pool.query(`select * from ${table}`, (err, rows) => {
    if (err) {
      res.send(err);
    } else {
      res.send(rows);
    }
  });
});

app.post('/api/post', (req, res) => {
    console.log(req.body);
    pool.query(`INSERT INTO ${table} (image_title, image_author) VALUES ('${req.body.title}', 'admin')`, (err, rows) => {
      if (err) {
        res.send(err);
      } else {
        res.send(`I received your POST request. This is what you sent me: ${req.body.post}`);
      }
    });
  });