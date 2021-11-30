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
    console.log(req.query);
    //db.all('SELECT * from Consumption WHERE year = ? ORDER BY state_abbreviation', [req.params.selected_year], (err, row) => {
    
    let database_promise = new Promise((resolve, reject)=> {

        let query_string = '';
        let and_boolean = false;

        if(req.query.start_date){
            query_string += "date_time >="
        }






        if(req.query.start_date){
            db.all('SELECT * from Incidents WHERE date_time >= \'' + req.query.start_date + '\' ORDER BY date_time LIMIT 1000', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else if(req.query.end_date){
            db.all('SELECT * from Incidents WHERE date_time >= \'' + req.query.end_date + '\' ORDER BY date_time LIMIT 1000', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else if(req.query.code){
            db.all('SELECT * from Incidents WHERE code IN (' + req.query.code + ')', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else if(req.query.grid){
            db.all('SELECT * from Incidents WHERE police_grid IN (' + req.query.grid + ')', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else if(req.query.neighborhood){
            db.all('SELECT * from Incidents WHERE neighborhood_number IN (' + req.query.neighborhood + ')', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else if(req.query.limit){
            db.all('SELECT * from Incidents WHERE police_grid IN (' + req.query.grid + ')', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
        else{
            db.all('SELECT * from Incidents', (err, row) => {
                if(err){console.log(err)}
                resolve(row);
            })
        }
    });
    database_promise.then( (data) => {
        data.forEach(element => {
            let date_time_string = '';
            date_time_string = element.date_time;
            delete element['date_time'];
            const array = date_time_string.split('T');
            element['date'] = array[0];
            element['time'] = array[1];
        });
        
        res.send(data);
    })
    
});


app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
