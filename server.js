let fs = require('fs');
let path = require('path')

//node modules
let sqlite3 = require('sqlite3');
let express = require('express') //npm install express

//user curl to test i believe

let port = 8000
let public_dir = path.join(__dirname, 'public')
let app = express()

let db_filename = path.join(__dirname, 'stpaul_crime.sqlite3')

//load in db
let db = new sqlite3.Database(db_filename, sqlite3.OPEN_READONLY, (err) => {
    if (err) {console.log('Error opening ' + db_filename); }
    else {console.log('Now connected to ' + db_filename);}
});

app.use(express.static(public_dir))

app.get('/', (req, res) => {
    res.send('Hello world!');
})

app.get('/codes', (req, res) => {
    console.log(req.query);
    //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
    db.all('SELECT * from Codes ORDER BY code', (err, row) => {
        res.send(row);
    })
    
});

app.get('/neighborhoods', (req, res) => {
    console.log(req.query);
    //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
    db.all('SELECT * from Neighborhoods ORDER BY neighborhood_number', (err, row) => {
        res.send(row);
    })
    
});

app.get('/incidents', (req, res) => {
    console.log(req.query);
    //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
    db.all('SELECT * from Incidents WHERE case_number = 21116050', (err, row) => {
        res.send(row);
    })
    
});


app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
