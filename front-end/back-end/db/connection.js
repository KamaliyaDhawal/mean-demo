const mysql = require('mysql');

/*var con = mysql.createConnection({
	host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: 'interview_system'
});

con.connect(
	(error, sucess) => {
		if(error) {
			console.log('Database Connection Error: ', error.sqlMessage);
			return;
		}
		console.log('Database Connected Succesfully');
	}
);


*/
var db_config = {
  host: process.env.HOST,
	user: process.env.USER,
	password: process.env.PASSWORD,
	database: 'interview_system'
};

var con;

function handleDisconnect() {
  con = mysql.createConnection(db_config); // Recreate the connection, since
                                           // the old one cannot be reused.
  con.connect(function(err) {              // The server is either down
    if(err) {                                     // or restarting (takes a while sometimes).
      console.log('Error when connecting to db:', err);
      setTimeout(handleDisconnect, 2000); // We introduce a delay before attempting to reconnect,
    } else {    
    	console.log('Database connection successfull'); // to avoid a hot loop, and to allow our node script to
    }                                    
  });                                     // process asynchronous requests in the meantime.
                                          // If you're also serving http, display a 503 error.
  con.on('error', function(err) {
    console.log('db error', err);
    if(err.code === 'PROTOCOL_CONNECTION_LOST') { // Connection to the MySQL server is usually
      handleDisconnect();                         // lost due to either server restart, or a
    } else {                                      // connnection idle timeout (the wait_timeout
      throw err;                                  // server variable configures this)
    }
  });
}

handleDisconnect();
module.exports = con;