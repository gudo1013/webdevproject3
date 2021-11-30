let fs = require('fs');
let path = require('path')

//node modules
let sqlite3 = require('sqlite3');
let express = require('express') //npm install express
let cors = require('cors')


//user curl to test i believe

let port = 8000
let public_dir = path.join(__dirname, 'public')
let app = express()
app.use(cors())

let db_filename = path.join(__dirname, 'db', 'stpaul_crime.sqlite3')

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
    console.log(req.query.code);
    if(req.query.code){
        db.all('SELECT * from Codes WHERE code IN (' + req.query.code + ') ORDER BY code', (err, row) => {
            res.send(row);
        })
    }
    else{
    //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
        db.all('SELECT * from Codes ORDER BY code', (err, row) => {
            res.send(row);
        })
    }
    
});

app.get('/neighborhoods', (req, res) => {
    console.log(req.query);

    if(req.query.id){
        db.all('SELECT * FROM Neighborhoods WHERE neighborhood_number IN (' + req.query.id + ') ORDER BY neighborhood_number', (err, row) => {
            console.log('here');
            res.send(row);
        });
    }
    else{
        //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
        db.all('SELECT * from Neighborhoods ORDER BY neighborhood_number', (err, row) => {
            res.send(row);
        })
    }
    
});

app.get('/incidents', (req, res) => {

    //For these, have to modify the date_time into different fields
    let database_promise = new Promise((resolve, reject) => {
        let queryString = 'SELECT * FROM Incidents {{{WHERE CLAUSE}}} ORDER BY date_time DESC LIMIT {{{LIMIT AMOUNT}}}';
        let whereClause = 'WHERE ';
        let hasPrevClause = false;
        //Start Date
        if(req.query.start_date){
            whereClause += 'date_time >= \'' + req.query.start_date + 'T00:00:00\'';
            hasPrevClause = true;
        }
        //End Date
        if(req.query.end_date){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'date_time <= \'' + req.query.end_date + 'T11:59:59\'';
            hasPrevClause = true;
        }
        //Code
        if(req.query.code){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'code IN (' + req.query.code + ')';
            hasPrevClause = true;
        }
        //Grid
        if(req.query.grid){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'police_grid IN (' + req.query.grid + ')';
            hasPrevClause = true;
        }
        //Neighborhood
        if(req.query.neighborhood){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'neighborhood_number IN (' + req.query.neighborhoood + ')';
            hasPrevClause = true;
        }
        //Input the where clause if there is one
        if(whereClause != 'WHERE '){
            queryString = queryString.replace('{{{WHERE CLAUSE}}}', whereClause);
        }
        else{
            queryString = queryString.replace('{{{WHERE CLAUSE}}}', "");
        }
        //Input the limit amount if there was one
        if(req.query.limit){
            queryString = queryString.replace('{{{LIMIT AMOUNT}}}', req.query.limit);
        }
        else{
            queryString = queryString.replace('{{{LIMIT AMOUNT}}}', 1000);

        }
        db.all(queryString, (err, rows) => {
            resolve(rows);
        })
    });
    database_promise.then((data) => {
        let newRows = [];
        data.forEach(row => {
            let datetime = row['date_time'].split("T");
            delete row.date_time;
            row.date = datetime[0];
            row.time = datetime[1].split('.')[0];
            newRows.push(row);
        });
        res.send(newRows);
    });
});

app.post('/new-incident', (req, res) => {
    /*console.log(req.query.case_number);
    console.log(req.query.date);
    console.log(req.query.time);
    console.log(req.query.code);
    console.log(req.query.incident);
    console.log(req.query.police_grid);
    console.log(req.query.neighborhood_number);
    console.log(req.query.block);
    console.log(req.body);*/
    db.get("SELECT * FROM Incidents WHERE case_number = ?", [req.query.case_number], (err, row) =>{
        //check if code exists
        if(err)
        {
            res.status(404).send("Error 404: error with database");
        }
        else if(row != null)
        {
            res.status(500).type('txt').send("Error 500: case number " + req.query.case_number + " already exists");
        }
        else
        {
            console.log("case not found");
            db.run("INSERT INTO Incidents (case_number, date, time, code, incident, police_grid, neighborhood_number, block) VALUES (?,?,?,?,?,?,?,?)", 
            [req.query.case_number, req.query.date, req.query.time, req.query.code, req.query.incident, req.query.police_grid, req.query.neighborhood_number, req.query.block], (err, row)=>
            {
                res.status(200).type('txt').send("SUCCESS");
            });
        }
    });
    res.status(200);
});

app.delete('/remove-incident', (req, res) => {
    console.log(req.query.case_number);
    db.get("SELECT * FROM Incidents WHERE case_number = ?", [req.query.case_number], (err, row) =>{
        //check if code exists
        if(err)
        {
            res.status(404).send("Error 404: error with database");
        }
        else if(row == null)
        {
            res.status(500).type('txt').send("Error 500: case number " + req.query.case_number + " does not exists");
        }
        else
        {
            console.log("case found");
            db.run("DELETE FROM Incidents WHERE ?", [req.query.case_number],  (err, row)=>
            {
                res.status(200).type('txt').send("SUCCESS");
            });
        }
    });
    res.status(200);
});



app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
