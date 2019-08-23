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
	sendInfo: function (con, studentId, cb) {
		getStudentData(con, studentId, (err, studentData) => {
			if (studentData.email != null) {
				sendMail(con, studentData, (status, mailData) => {
					if (studentData.mobile != null) {
						sendSMS(con, studentData, (status, smsData) => {
							cb(true, studentData);
						})
					} else {
						cb(true, studentData);
					}
				})
			} else {
				if (studentData.mobile != null) {
					sendSMS(con, studentData, (status, smsData) => {
						cb(true, studentData);
					})
				} else {
					cb(true, studentData);
				}
			}
		})
	},
	sendInfoToGuidanceUser: function (con, studentId, email, cb) {
		// console.log("test");
		getStudentData(con, studentId, (err, studentData) => {
			if (email != null) {
				sendMailToGuidanceUser(studentData,email,(status,mailData)=>{
					
					cb(status,studentData);
				})
			}
		})
	},

	sendCourseAlert: function (con, alertData, cb) {
		let query = "INSERT INTO `course_status` (`round_id`, `course_id`, `assign_per`, `mail_sent`, `mail_to`) VALUES (" + alertData.round_id + ", " + alertData.course_id + ", " + alertData.per + ", 1, '" + alertData.admin + "') ON DUPLICATE KEY UPDATE assign_per=" + alertData.per + "";
		con.query(query, (err, info) => {
			if (info.affectedRows != 2) {
				sendAlert(con, alertData);
			}
		})
	},
	sendUserInfo: function (userData,cb) {
		userData.date = new Date();
		sendPassword(userData,(res)=>{

			cb(res);
		});
	}
}

function readHTMLFile(path, callback) {
	fs.readFile(path, { encoding: 'utf-8' }, function (err, html) {
		if (err) {
			throw err;
			callback(err);
		}
		else {
			callback(null, html);
		}
	});
};

function getStudentData(con, studentId, callback) {
	let studentData = {}
	con.query("SELECT * FROM students WHERE id=" + studentId + " AND is_deleted=0 AND status=1", (err, info) => {
		studentData.id = info[0].id;
		studentData.email = info[0].email;
		studentData.mobile = info[0].mobile;
		studentData.courses = "";

		if (info[0].fullname != null) {
			studentData.username = info[0].fullname;
			studentData.mobileUser = info[0].fullname;
		} else if (info[0].firstname != null) {
			studentData.username = info[0].firstname;
			studentData.mobileUser = info[0].firstname;
		} else if (info[0].email != null) {
			studentData.username = info[0].email;
			studentData.mobileUser = 'Applicant';
		} else {
			studentData.username = 'Applicant';
			studentData.mobileUser = 'Applicant';
		}

		let currentSlots = JSON.parse(info[0].slots_id);
		let courses = "";
		let slots = "";

		for (let k in currentSlots) {
			courses += k + ", ";
			if (currentSlots.hasOwnProperty(k)) {
				if (currentSlots[k] != null) {
					slots += currentSlots[k] + ", ";
				}
			}
		}

		courses = courses.replace(/,\s*$/, "");
		courses = "(" + courses + ")";
		slots = slots.replace(/,\s*$/, "");
		slots = "(" + slots + ")";

		studentData.coursesData = [];
		con.query("SELECT id, name FROM courses WHERE id IN " + courses + " AND is_deleted=0 AND status=1 ORDER BY id", (err, courseData) => {
			studentData.courses = courseData[0].name;
			if (courseData.length > 1) {
				studentData.courses += ", " + courseData[1].name;
			}

			courseData.forEach((course) => {
				studentData.coursesData.push({
					course_id: course.id,
					name: course.name
				});
			});

			con.query("select slots.course_id, rounds.schedule_dt, slots.start_time from rounds join slots on rounds.id = slots.round_id WHERE slots.id in " + slots + " ORDER BY slots.course_id", (err, slotData) => {
				if (slotData) {
					slotData.forEach((slot) => {
						let index = studentData.coursesData.findIndex((data) => data.course_id == slot.course_id);
						if (index > -1) {
							if (slot.schedule_dt != null) {
								studentData.coursesData[index].date = convertDate(slot.schedule_dt);
							}
							if (slot.start_time != null) {
								studentData.coursesData[index].time = slot.start_time;
							}
						} else {
							studentData.coursesData[index].date = 'N/A';
							studentData.coursesData[index].time = 'N/A';
						}
					});
				}
				callback(null, studentData);
			});
		});

	})
}

function convertDate(date) {
	var d = new Date(date),
		month = '' + (d.getMonth() + 1),
		day = '' + d.getDate(),
		year = d.getFullYear();

	if (month.length < 2) month = '0' + month;
	if (day.length < 2) day = '0' + day;

	return [day, month, year].join('/');
}

function sendSMS(con, studentData, cb) {
	let sms_username = process.env.SMSUSER;
	let sms_password = process.env.SMSPASS;
	let mobilenumber = studentData.mobile;
	let message = "Hi " + studentData.mobileUser + ", thank you for applying. Your interview";
	let senderid = "Liberties College";
	let messageTmp = "";
	studentData.coursesData.forEach((courseData) => {
		messageTmp += ' for course "' + courseData.name + '" is on ' + courseData.date + ' at ' + courseData.time + ' and';
	});

	let lastIndex = messageTmp.lastIndexOf(" ");
	messageTmp = messageTmp.substring(0, lastIndex);
	message += messageTmp + '.';

	let url = "https://api.sendmode.com/httppost.aspx?Type=sendparam&username=" + encodeURIComponent(sms_username) + "&password=" + encodeURIComponent(sms_password) + "&numto=" + encodeURIComponent(mobilenumber) + "&data1=" + encodeURIComponent(message) + "&senderid=" + encodeURIComponent(senderid);

	request(url, (err, res, body) => {
		if (body) {
			to_json('' + body, (err, data) => {
				if (err) {
					cb(true, err);
				}
				if (data) {
					con.query("update students set sms_sent=1 where id=" + studentData.id + " and is_deleted=0 and status=1", (err, data) => {
						cb(true, data);
					})
				}
			})
		}
	});
}

function sendMail(con, studentData, cb) {
	readHTMLFile(path.join(process.cwd(), 'templates', 'studentEmail.html'), function (err, html) {

		let template = handlebars.compile(html);
		let htmlToSend = template(studentData);
		let mailOption = {
			from: 'noreplay@cnc.com',
			to: studentData.email,
			subject: 'Registration',
			html: htmlToSend,
			attachments: [{
				filename: 'logo.png',
				path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
				cid: 'library@logo'
			}]
		};
		transport.sendMail(mailOption, function (err, info) {
			if (err) {
				cb(true, err);
			}
			if (info) {
				con.query("update students set mail_sent=1 where id=" + studentData.id + "", (err, info) => {
					cb(true, studentData);
				})
			}
		});
	});
}

function sendAlert(con, alertData, cb) {
	readHTMLFile(path.join(process.cwd(), 'templates', 'adminEmail.html'), function (err, html) {
		alertData.date = convertDate(alertData.date);
		let template = handlebars.compile(html);
		let htmlToSend = template(alertData);
		let mailOption = {
			from: 'noreplay@cnc.com',
			to: alertData.admin,
			subject: 'Slot Alert',
			html: htmlToSend,
			attachments: [{
				filename: 'logo.png',
				path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
				cid: 'library@logo'
			}]
		};
		transport.sendMail(mailOption, function (err, info) {
			if (err) {
				//cb(true, err);
			}
			if (info) {

				console.log("success");
			}
		});
	});
}

function sendPassword(userData,cb) {
	readHTMLFile(path.join(process.cwd(), 'templates', 'userEmail.html'), function (err, html) {
		userData.date = convertDate(userData.date);
		let template = handlebars.compile(html);
		let htmlToSend = template(userData);
		let mailOption = {
			from: 'noreplay@cnc.com',
			to: userData.email,
			subject: 'User Password',
			html: htmlToSend,
			attachments: [{
				filename: 'logo.png',
				path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
				cid: 'library@logo'
			}]
		};
		transport.sendMail(mailOption, function (err, info) {
			if (err) {
				cb(0);
				
			}
			if (info) {
				console.log("success");
				cb(1);
			}
		});
	});

}
function sendMailToGuidanceUser(studentData,email,cb) {
	readHTMLFile(path.join(process.cwd(), 'templates', 'studentEmail.html'), function (err, html) {

		let template = handlebars.compile(html);
		let htmlToSend = template(studentData);
		let mailOption = {
			from: 'noreplay@cnc.com',
			to: email,
			subject: 'Registration',
			html: htmlToSend,
			attachments: [{
				filename: 'logo.png',
				path: path.join(process.cwd(), 'templates', 'images', 'logo.png'),
				cid: 'library@logo'
			}]
		};
		transport.sendMail(mailOption, function (err, info) {
			if (err) {
				cb(false, err);
			}
			if (info) {
				cb(true, studentData);
			}
		});
	});
}
