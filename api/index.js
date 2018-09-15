const express = require('express')
const helmet = require('helmet')
const fs = require('fs')
const app = express()
var cors = require('cors')
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}))
app.use(cors())
app.use(express.json())
var mysql = require('mysql')
let DBCONFIG = JSON.parse(fs.readFileSync("db.creds"))
DBCONFIG.connectionLimit = 10
var mysqlPool  = mysql.createPool(DBCONFIG)
app.use(helmet())

app.get('/', (req, res) => {
  res.end('Hello from the backend')
})

/**
 * Get all Grants
 */
app.get('/grants', (req, res) => {
  console.log('/grants',req.params)
  // @TODO need to implement pagination
  mysqlPool.query('SELECT * FROM EthGrants', function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Find a grant by ID
 */
app.get('/grants/:id', (req, res) => {
  console.log('/grands/:id',req.params.id)
  mysqlPool.query('SELECT * FROM EthGrants WHERE id = ?', req.params.id, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Create a new Grant
 */
app.post('/grants/create', (req, res) => {
  console.log('/grants/create', req.body)
  mysqlPool.query('INSERT INTO EthGrants SET ?', req.body, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
})

/**
 * Update a Grant
 */
app.put('/grants/update/:id', (req, res) => {
  console.log('/grants/create', req.body)
  // @TODO need to figure out what fields are updateable
  /*
  mysqlPool.query('UPDATE EthGrants SET ', req.body, function (error, results, fields) {
    if (error) throw error
    res.setHeader('Content-Type', 'application/json')
    res.end(JSON.stringify(results))
  })
  */
  res.end(JSON.stringify('endpoint not implemented'))
})

app.listen(8000, () => console.log('listing on 8000'));
