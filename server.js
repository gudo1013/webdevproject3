let express = require('express') //npm install express
let path = require('path')
let fs = require('fs')

//user curl to test i believe

let port = 8000
let public_dir = path.join(__dirname, 'public')
let app = express()


app.get('/', (req, res) => {
    res.send('Hello world!');
})

app.get('/codes', (req, res) => {
    console.log(req.query);
    res.send('Hello world!' + req.query.hello);
});
app.use(express.static(public_dir))

app.listen(port, () => {
    console.log('Now listening on port ' + port);
});
