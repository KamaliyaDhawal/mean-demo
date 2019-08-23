const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const https = require('https'); 

require('dotenv').config();

var port = parseInt(process.env.PORT || 3000);
var app = express();
const con = require(path.join(__dirname, 'db','connection'));

require(path.join(__dirname, 'services','cronService'));
require(path.join(__dirname, 'services','pm2-guard'));

app.use(bodyParser.json());
app.use(cors());

app.use((req, res, next) => {
    if(req.url == '/getRegisterCourse' || req.url == '/checkLogin' || req.url == '/login' || req.url == '/sendVerifyCode' || req.url == '/verifyCode' || req.url == '/saveStudent' || req.url == '/getSchoolInfo') {
      return next();
    }
    const bearerHeader = req.headers['authorization'];
    if (bearerHeader){
    var bearer = bearerHeader.split(" ");
    token = bearer[1];
    jwt.verify(token, 'dkjgffh8@#$v$@%^', function (err, decoded){
      if (err){
          console.log('inside middleware error');
          req.authenticated = false;
          req.decoded = null;
          res.status(403).send('Unauthorize');
      } else if (decoded){
          req.decoded = decoded;
          req.authenticated = true;
          next();
      }
    });
  }
})


require(path.join(__dirname, 'routes', 'routes'))(app, con, jwt);

//listning server
if( process.env.SERVER == 'localhost' ) {
        app.listen(port, function() {
                console.log('Server is ready on port ', port);
        }).on('error', function(e) {
                console.log('Server is not ready', e);
        });
} else {
        let privateKey  = fs.readFileSync('../../etc/letsencrypt/live/apply.libertiescollege.ie/privkey.pem', 'utf8');
        ///let certificate = fs.readFileSync('../../etc/letsencrypt/live/alpha.libertiescollege.ie/cert.pem', 'utf8');
        let certificate = fs.readFileSync('../../etc/letsencrypt/live/apply.libertiescollege.ie/fullchain.pem', 'utf8');
        let credentials = {key: privateKey, cert: certificate};
        let httpsServer = https.createServer(credentials, app);
        httpsServer.listen(port);
}

