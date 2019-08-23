const request = require('request');
const express = require('express');
var to_json = require('xmljson').to_json;

let app = express();

let sms_username = process.env.SMSUSER;
let sms_password = process.env.SMSPASS;
let mobilenumber = "353872252312";
let message = "Hello this is testing Sendmode gateway";
let senderid = "TEST";

let url = "https://api.sendmode.com/httppost.aspx?Type=sendparam&username="+encodeURIComponent(sms_username)+"&password="+encodeURIComponent(sms_password)+"&numto="+encodeURIComponent(mobilenumber)+"&data1="+encodeURIComponent(message)+"&senderid="+encodeURIComponent(senderid);

app.get('/sendMail', (req, res) => {
	request(url, (err, res, body) => {
		if(body) {
			to_json(''+body, (err, data) => {
				if(err) {
					console.log('Data Error');
					console.log(err);
				}
				if(data) {	
					console.log('**Start Body**');
					console.log(data);
					console.log('**End Body**');
				}
			})
		}
	})
});

app.listen('5000', () => {
	console.log('server is ready on port 5000');
})