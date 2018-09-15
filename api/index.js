const express = require('express');
const helmet = require('helmet');
const fs = require('fs');
const app = express();
var cors = require('cors')
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(cors())
var mysql = require('mysql');
let DBCONFIG = JSON.parse(fs.readFileSync("db.creds"));
DBCONFIG.connectionLimit = 10;
var mysqlPool  = mysql.createPool(DBCONFIG);
app.use(helmet());

app.get('/', (req, res) => {
  res.end('Hello from the backend');
});

app.get('/grants/', (req, res) => {
  console.log('/example',req.params)
  mysqlPool.query('SELECT * FROM EthGrants', function (error, results, fields) {
    if (error) throw error;
    res.end(JSON.stringify(results));
  });
});

app.listen(8000, () => console.log('listing on 8000'));
