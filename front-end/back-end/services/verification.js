const request = require('request');
const Cryptr = require('cryptr');
const cryptr = new Cryptr('dkjgffh8@#$v$@%^');
const to_json = require('xmljson').to_json;
require('dotenv').config();



module.exports = { 
	sendVerifyCode: function (res, mobile){
		mobile = parseInt(cryptr.decrypt(mobile));	
		let message = {
				//"timeout":4,
				"tokenLength":6,
				"messagetext":"Your Liberties Admission Login Code is: ",
				"recipient":mobile
			}
		let url = 'https://rest.sendmode.com/v2/verify?access_key='+process.env.SMSACCESSKEY+'&message='+JSON.stringify(message);

		request(url, (err, response, body) => {
			if(body) {
				body = JSON.parse(body);
				if(body.status == 'OK') {
					res.send({"status": true});
				} else {
					res.send({"status": false});
				}
			}
		});
	},
	verifyCode: function (res, data){
		let code = data.code;
		let mobile = parseInt(cryptr.decrypt(data.mobile));
		let url = 'https://rest.sendmode.com/v2/verify?access_key='+process.env.SMSACCESSKEY+'&code='+code+'&recipient='+mobile;
		
		request(url, (err, response, body) => {
			if(body) {
				body = JSON.parse(body);
				if(body.status == 'OK') {
					res.send({"status": true});
				} else {
					res.send({"status": false});
				}
			}
		})
	}
}
