const cron = require('node-cron');
const mysqldump = require('mysqldump');
const nodemailer = require('nodemailer');
const path = require('path');

require('dotenv').config();
console.log('cron service added');

const transport = nodemailer.createTransport({
	service: 'gmail',
	auth: {
		user: process.env.EMAILUSER,
		pass: process.env.EMAILPASSWORD
	},
	tls: {
		rejectUnauthorized: false
	}
});

let date = new Date();
let filename = date.getDate() + '-' + parseInt(date.getMonth() + 1) + '-' + date.getFullYear()+'.sql';
console.log(path.join(process.cwd(), 'db', 'backup', filename));

cron.schedule('0 0 2 * * *', ()=>{
	setTimeout(() => {
		console.log('cron run at ', new Date());
		mysqldump({
		    connection: {
		       	host: process.env.HOST,
				user: process.env.USER,
		        password: process.env.PASSWORD,
		        database: 'interview_system',
		    },
		    dumpToFile: path.join(process.cwd(), 'db', 'backup', filename),
		});
		let attachments = [{ filename: filename, path: path.join(process.cwd(), 'db', 'backup', filename)}];

		let mailOption = {
		    from: 'noreplay@cnc.com',
		    to : 'dhaval_creativeencode@outlook.com, '+process.env.ADMINEMAIL,
		    subject : 'Database-backup',
		    text : 'Please Find attach file('+filename+') for latest database backup',
		    attachments
		};

		transport.sendMail(mailOption, function(err, info) {
			if(err) {
				console.log('Error While Sending Database Backup Mail: ', err);
			}
			if(info) {
				console.log('Database mail send successfully at ', new Date());
			}
		});
	}, 40000);
})