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
        let queryString = 'SELECT * FROM Incidents INNER JOIN Neighborhoods ON Incidents.neighborhood_number = Neighborhoods.neighborhood_number JOIN Codes ON Incidents.code = Codes.code {{{WHERE CLAUSE}}} ORDER BY date_time DESC LIMIT {{{LIMIT AMOUNT}}}';
        let whereClause = 'WHERE ';
        let hasPrevClause = false;
        //Start Date
        if(req.query.start_date){
            whereClause += 'date(Incidents.date_time) >= \'' + req.query.start_date + '\'';
            hasPrevClause = true;
        }
        //End Date
        if(req.query.end_date){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'date(Incidents.date_time) <= \'' + req.query.end_date + '\'';
            hasPrevClause = true;
        }
        //Start Time
        if(req.query.start_time){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'time(Incidents.date_time) >= \'' + req.query.start_time + '\'';
            hasPrevClause = true;
        }
        if(req.query.end_time){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'time(Incidents.date_time) <= \'' + req.query.end_time + '\'';
            hasPrevClause = true;
        }
        //Code
        if(req.query.code){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'Incidents.code IN (' + req.query.code + ')';
            hasPrevClause = true;
        }
        //Grid
        if(req.query.grid){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'Incidents.police_grid IN (' + req.query.grid + ')';
            hasPrevClause = true;
        }
        //Neighborhood
        if(req.query.neighborhood){
            if(hasPrevClause){
                whereClause += ' AND ';
            }
            whereClause += 'Incidents.neighborhood_number IN (' + req.query.neighborhood + ')';
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

            // //Get rid of X's within the number in the address if there are any
            // let addr = row['block'];
            // delete row.block;
            // let arr = addr.split(' ');
            // let first = arr[0];
            // if((first.charAt(0) >= '0' && first.charAt(0) <= '9') || first.charAt(0) == 'X'){
            //     first = first.replace(/X/g, '0');
            //     let newAddr = first + ' ';
            //     for(let i = 1; i < arr.length; i++){
            //         newAddr += arr[i];
            //         if(i != arr.length - 1){
            //             newAddr += ' ';
            //         }
            //     }
            //     row.block = newAddr;
            // }
            // else{
            //     row.block = addr;
            // }
            newRows.push(row);
        });
        res.send(newRows);
    });
});

app.post('/new-incident', (req, res) => {
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
            db.run("INSERT INTO Incidents (case_number, date_time, code, incident, police_grid, neighborhood_number, block) VALUES (?,?,?,?,?,?,?)", 
            [req.query.case_number, req.query.date_time, req.query.code, req.query.incident, req.query.police_grid, req.query.neighborhood_number, req.query.block], (err, row)=>
            {
                if(err)
                { 
                    console.log(err);
                }
                else
                {
                    res.status(200).type('txt').send("SUCCESS");
                }
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
            console.log("case found" + req.query.case_number);
            db.run("DELETE FROM Incidents WHERE case_number = ?", [req.query.case_number],  (err, rows)=>
            {
                if(err)
                {
                    console.log(err)
                }
                else
                {
                    res.status(200).type('txt').send("SUCCESS");
                }
            });
        }
    });
    res.status(200);
});

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
