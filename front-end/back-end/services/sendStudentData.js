const nodemailer = require('nodemailer');
const handlebars = require('handlebars');
const path = require('path');
const fs = require('fs');
const request = require('request');
const to_json = require('xmljson').to_json;

require('dotenv').config();

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


module.exports = {
	sendMail: function(con, res, datas) {
		let index = 1;
		datas.forEach((data) => {
			sendMail(con, data, () => {
				if(index == datas.length) {
					res.send({status:1, msg:'Emails Send Successfully'});
				} else {
					index++;
				}
			});
		})
	},
	sendSMS: function(con, res, datas) {
		let index = 1;
		datas.forEach((student) => {
			sendSMS(con, student, (status, err) => {
				if(index == datas.length) {
					res.send({status:1, msg:'SMS Send Successfully'});
				} else {
					index++;
				}
			})
		})
	},

	sendCustomData: function(res, type, students, data, con) {
		let index = 1;
		if(type == 'email') {
			sendCustomEmailFn(type, students, index, data, con, res);
		} else if(type == 'sms') {
			sendCustomSMSFn(type, students, index, data, con, res);
		}
	}
}

function readHTMLFile(path, callback) {
    fs.readFile(path, {encoding: 'utf-8'}, function (err, html) {
        if (err) {
          throw err;
          callback(err);
        }
        else {
          callback(null, html);
        }
    });
};

function sendMail(con, data, cb) {
	readHTMLFile(path.join(process.cwd(), 'templates', 'studentStatus.html'), function(err, html) {
    let template = handlebars.compile(html);
    let htmlToSend = template(data);
    let mailOption = {
        from: 'noreplay@cnc.com',
        to : data.Email,
        subject : 'Interview Status',
        html : htmlToSend,
        attachments: [{
			    filename: 'logo.png',
			    path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
			    cid: 'library@logo'
				}]
    };
		transport.sendMail(mailOption, function(err, info) {
			if(err) {
				console.log("Error While Sending Mail");
			}
			if(info) {
				let query = "update interview_info set mail_sent=mail_sent+1 where Student_Id="+data.Student_Id+" and round_id="+data.Round+" and course_id="+data.Course+"";
				con.query(query, (err, info) => {
					if(info) {
						console.log("Succesfull Mail Send");
						cb();
					} else {
						console.log("Mail Not Send");
						cb();
					}
				});
			}
		});
	});
}

function sendSMS(con, student, cb) {
	let sms_username = process.env.SMSUSER;
	let sms_password = process.env.SMSPASS;
	let mobilenumber = student.Mobile;
	let message = "Hello "+student.Student_Name+", Hope You Are Doing Good, ";
	let senderid = "Liberties College";
	let messageTmp = "";

	messageTmp += "Your Status Of Interview Is:'"+student.Decision+"' For Course Name: "+student.Course_Name+", Date: "+student.Round_Date+", Time: "+student.Slot_Time+", ";
	message += messageTmp;
	
	let url = "https://api.sendmode.com/httppost.aspx?Type=sendparam&username="+encodeURIComponent(sms_username)+"&password="+encodeURIComponent(sms_password)+"&numto="+encodeURIComponent(mobilenumber)+"&data1="+encodeURIComponent(message)+"&senderid="+encodeURIComponent(senderid);
	
	request(url, (err, res, body) => {
		if(body) {
			to_json(''+body, (err, data) => {
				if(err) {
					cb(true, err);
				}
				if(data) {
					let query = "update interview_info set sms_sent=1 where student_id="+student.Student_Id+" and round_id="+student.Round+" and course_id="+student.Course+"";
					con.query(query, (err, data) => {
						cb(true, data);
					})
				}
			})
		}
	});
}

function sendCustomEmailFn(type, students, index, data, con, res) {
	sendCustomEmail(type, students, index, data, con, (status, msg) => {
		console.log(index)
		if(index == students.length) {
			res.send({status:1, msg:type+' Send Successfully'});
		} else {
			index++;
			sendCustomEmailFn(type, students, index, data, con, res);
		}
	});
}


function sendCustomEmail(type, students, index, data, con, cb) {
	var student = students[index-1];
	replaceVariable(type, student, data, async (info) => {
		let signature = "<p>Yours sincerely,<br><br>Admissions Office <br>Gemma Woods <br>Liberties College <br></p><img src='cid:library@logo' height='50px'>";
	    let htmlData = info.body+signature;
	    let mailOption = {
	      	from: 'noreplay@cnc.com',
	      	to : student.email,
	      	subject : info.subject,
	      	html: htmlData,
	      	attachments: [{
			    filename: 'logo.png',
			    path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
			    cid: 'library@logo'
			}]
    	};
    	try {
			var info = await transport.sendMail(mailOption);
			let query = "update interview_info join (select mail_sent from interview_info where Student_Id="+student.student_id+" and round_id="+student.round+" and course_id="+student.course+")"+" temp set interview_info.mail_sent=temp.mail_sent+1 where Student_Id="+student.student_id+" and round_id="+student.round+" and course_id="+student.course;
			con.query(query, (err, info) => {
				if(info) {
					console.log("Succesfull Mail Send");
					cb(false, info);
				} else {
					console.log("Mail Not Send");
					cb();
				}
			});
		} catch (err){
			if(err) {
				let query = "update interview_info join (select mail_sent_fail from interview_info where Student_Id="+student.student_id+" and round_id="+student.round+" and course_id="+student.course+")"+" temp set interview_info.mail_sent_fail=temp.mail_sent_fail+1 where Student_Id="+student.student_id+" and round_id="+student.round+" and course_id="+student.course;
				con.query(query, (err, info) => {
					if(info) {
						console.log("Error While Mail Sending");
						cb(true, err);
					} else {
						console.log("Mail Not Send");
						cb();
					}
				});
			}
		}
	});
}

function sendCustomSMSFn(type, students, index, data, con, res) {
	sendCustomSMS(type, students, index, data, con, res, () => {
		console.log(index);
		if(index == students.length) {
			res.send({status:1, msg:'SMS Sent Succesfully'});
		} else {
			index++;
			sendCustomSMSFn(type, students, index, data, con, res);
		}
	})
}

function sendCustomSMS(type, students, index, data, con, res, cb) {
	debugger;
	let student = students[index-1];
	replaceVariable(type, student, data, (info) => {
		let sms_username = process.env.SMSUSER;
		let sms_password = process.env.SMSPASS;
		let mobilenumber = student.mobile;
		let message = info;
		let senderid = "Liberties College";
		let messageTmp = "";
		let url = "https://api.sendmode.com/httppost.aspx?Type=sendparam&username="+encodeURIComponent(sms_username)+"&password="+encodeURIComponent(sms_password)+"&numto="+encodeURIComponent(mobilenumber)+"&data1="+encodeURIComponent(message)+"&senderid="+encodeURIComponent(senderid);
		request(url, (err, info, body) => {
			if(body) {
				to_json(''+body, (err, data) => {
					if(err) {
						console.log('Error While Sending SMS')
						cb();
					} else {
						console.log('SMS Send Successfully')
						cb();
					}
				})
			}
		});

	});
}

function replaceVariable(type, student, data, cb) {
	if (type == 'email') {
		let subject = data.emailSubject.replace(new RegExp('{{StudentName}}', 'g'), student.fullname);
		subject = subject.replace(new RegExp('{{CourseName}}', 'g'), student.courseName);

		let body =  data.emailBody.replace(new RegExp('{{StudentName}}', 'g'), student.fullname);
		body = body.replace(new RegExp('{{CourseName}}', 'g'), student.courseName);
		body = body.replace(new RegExp('{{InterviewTime}}', 'g'), student.time);

		cb({subject, body});
	} else if(type="sms") {
		let message =  data.replace(new RegExp('{{StudentName}}', 'g'), student.fullname);
		message = message.replace(new RegExp('{{CourseName}}', 'g'), student.courseName);
		message = message.replace(new RegExp('{{InterviewTime}}', 'g'), student.time);
		cb(message);
	}
}