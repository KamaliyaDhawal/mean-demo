const Cryptr = require('cryptr');
const cryptr = new Cryptr('dkjgffh8@#$v$@%^');
const path = require('path');

RandExp = require('randexp');
require('dotenv').config();

const sendInfoService = require(path.join(process.cwd(), 'services', 'sendInfo'));
const verificationService = require(path.join(process.cwd(), 'services', 'verification'));
const exportFile = require(path.join(process.cwd(), 'services', 'exportFile'));
const sendStudentData = require(path.join(process.cwd(), 'services', 'sendStudentData'));

module.exports = function (app, con, jwt) {

	////////////////////////////////////////////
	//////////// Common Routes ////////////////
	//////////////////////////////////////////

	app.get('/checkLogin', function (req, res) {
		const bearerHeader = req.headers['authorization'];
		if (bearerHeader) {
			var bearer = bearerHeader.split(" ");
			token = bearer[1];
			if (!token) {
				return res.send({ status: false, data: 'unauthenticate' });
			}
			jwt.verify(token, 'dkjgffh8@#$v$@%^', function (err, decoded) {
				if (err) {
					req.authenticated = false;
					req.decoded = null;
					res.send({ status: false, data: err });
				} else if (decoded) {
					req.decoded = decoded;
					req.authenticated = true;

					res.send({ status: true, data: JSON.stringify(decoded) });
				}
			});
		}
	});

	app.post('/login', function (req, res) {
		let email = req.body.email;
		let password = req.body.password;

		con.query("SELECT * FROM user WHERE email='" + email + "' AND status=1 AND is_deleted=0", function (err, user) {
			if (err) return { status: 0, errMsg: 'Error While Login' };

			if (!user[0]) {
				return res.send({ status: 0, errMsg: 'User Not Found' });
			}

			if (cryptr.decrypt(user[0].password) != password) {
				return res.send({ status: 0, errMsg: 'Invalid Password' });
			}
			//req.user = user[0];
			if (!user[0].mobile || user[0].mobile == '' || user[0].mobile == null) {
				return res.send({ status: 0, errMsg: 'Mobile Number Not Found' });
			}

			let mobile = cryptr.encrypt(user[0].mobile);
			let replaceString = '';
			for (let i = 0; i < user[0].mobile.toString().length - 2; i++) {
				replaceString += '*';
			}
			let showMobile = user[0].mobile.toString().replace(user[0].mobile.toString().substring(0, user[0].mobile.toString().length - 2), replaceString);
			const JWTtoken = jwt.sign({ email: user[0].email, mobile: user[0].mobile, id: user[0].id, role: user[0].role }, 'dkjgffh8@#$v$@%^', { expiresIn: '8h' });
			return res.send({ status: 1, JWTtoken, mobile, showMobile, role: user[0].role });
		})
	});

	app.post('/sendVerifyCode', (req, res) => {
		verificationService.sendVerifyCode(res, req.body.data);
	});

	app.post('/verifyCode', (req, res) => {
		verificationService.verifyCode(res, req.body.data);
	});

	////////////////////////////////////////////
	//////////// Course Routes ////////////////
	//////////////////////////////////////////

	app.post('/addCourse', function (req, res) {
		let name = req.body.name;
		let userId = req.body.userId;
		if (req.body.id) {
			let dateTime = getDate('full');
			con.query('UPDATE courses SET name="' + name + '", updated_dt="' + dateTime + '", updated_by=' + userId + ' WHERE id=' + req.body.id + '',
				function (err, data) {
					if (err) {
						res.send(false);
					}
					if (data) {
						res.send(true);
					}
				})
		} else {
			con.query('INSERT INTO courses (name, created_by, updated_by) VALUES("' + name + '", "' + userId + '", "' + userId + '")',
				function (err, data) {
					if (err) {
						res.send(false);
					}
					if (data) {
						res.send(true);
					}
				}
			)
		}
	});

	app.get('/getCourses/:from', function (req, res) {
		let query;
		if (req.params.from === 'course') {
			query = 'SELECT * FROM courses WHERE is_deleted = 0 ORDER BY updated_dt DESC';
		} else {
			query = 'SELECT * FROM courses WHERE is_deleted = 0 ORDER BY id';
		}
		con.query(query, function (err, data) {
			if (err) {
				res.send(false)
			}
			if (data) {
				res.send(data);
			}
		});
	});



	app.get('/getRegisterCourse', (req, res) => {
		let date = getDate('date');
		let coursesArray = [];
		let query = "select course_id from rounds where schedule_dt >'" + date + "'";
		con.query(query, (err, info) => {
			if (info) {
				info.forEach((courses) => {
					coursesTemp = courses.course_id.split(",");
					coursesTemp.forEach((course) => {
						if (coursesArray.indexOf(course) == -1) {
							coursesArray.push(course);
						}
					});
				});
			}
			if (coursesArray.length == 0) return res.send(false);
			let query = "select * from courses where id in (" + coursesArray.join() + ")"
			con.query(query, (err, info) => {
				if (err) {
					res.send(false)
				}
				if (info) {
					res.send(info);
				}
			});
		});
	});

	app.get('/getCoursesForSlots/:courses', function (req, res) {
		con.query('SELECT * FROM courses WHERE id IN (' + req.params.courses + ') AND is_deleted = 0 ORDER BY id', function (err, data) {
			if (err) {
				res.send(false)
			}
			if (data) {
				res.send(data);
			}
		});
	});

	app.patch('/changeCourseStatus', function (req, res) {
		courseId = req.body.id;
		status = req.body.status;
		let userId = req.body.userId;
		if (status == 1) {
			newStatus = 0;
		} else {
			newStatus = 1;
		}

		con.query("UPDATE courses SET status=" + newStatus + ", updated_by=" + userId + " WHERE id=" + courseId + "", function (err, data) {
			if (data) {
				return true;
			} else {
				return false;
			}
		});
	});

	app.patch('/deleteCourse', function (req, res) {
		let userId = req.body.userId;
		con.query("UPDATE courses SET is_deleted = 1, updated_by=" + userId + " WHERE id = " + req.body.id + "",
			function (err, data) {
				if (err) return res.send(err);
				con.query("SELECT id FROM rounds WHERE course_id = " + req.body.id + "",
					function (err, roundData) {
						if (err) return res.send(err);
						let roundIds = [];
						roundIds = roundData.map(a => a.id);
						con.query("UPDATE rounds SET is_deleted=1, updated_by=" + userId + " WHERE id IN (" + roundIds + ")",
							//SELECT * FROM galleries WHERE id IN ('$ids')
							function (err, data) {
								if (err) return res.send(err);

								if (data) {
									con.query("UPDATE slots SET is_deleted=1, updated_by=" + userId + " WHERE round_id IN (" + roundIds + ")",
										function (err, data) {
											if (err) {
												res.send(false);
											} else {
												res.send(true);
											}
										}
									)
								}
							}
						)
					}
				)
			}
		);
	});

	app.get('/getCourseStatus', (req, res) => {
		let query = "select course_status.assign_per as assign, rounds.name as round, courses.name as course from course_status join rounds join courses where course_status.assign_per>=90 and course_status.is_deleted=0 and course_status.status=1 and courses.id = course_status.course_id and rounds.id = course_status.round_id order by course_status.updated_dt";

		con.query(query, (err, info) => {
			if (err) {

			}
			if (info) {
				res.send(info);
			}
		})

	})


	app.get('/getCourseById/:round', (req, res) => {

		let query = "select * from courses where id in " + req.params.round + " and is_deleted=0 and status=1 order by id";

		con.query(query, (err, info) => {
			if (err) {
				res.send({ status: 0, msg: 'Error While Fetching Data' });
			}
			if (info) {
				res.send({ status: 1, msg: info });
			}
		})

	})

	app.get('/getCourseForReports/:round', (req, res) => {
		let round = req.params.round;
		let query = "";

		if (round == "*") {
			query = "select DISTINCT courses.name as name, courses.id as id from courses JOIN rounds on FIND_IN_SET(courses.id, rounds.course_id) where courses.status=1 and courses.is_deleted=0";
		} else {
			query = "select DISTINCT courses.name as name, courses.id as id from courses JOIN rounds on FIND_IN_SET(courses.id, rounds.course_id) where courses.status=1 and courses.is_deleted=0 and rounds.id=" + round + "";
		}

		con.query(query, (err, info) => {
			if (err) {
				res.send({ status: 0, msg: 'Database Error While Fetching Course Data' });
			}
			if (info) {
				res.send({ status: 1, msg: info });
			}
		});
	});

	////////////////////////////////////////////
	//////////// Round Routes ////////////////
	//////////////////////////////////////////

	app.post('/saveRound', function (req, res) {
		let name = req.body.name;
		let courseId = JSON.parse("[" + req.body.course + "]").sort().join();
		let userId = req.body.userId;
		let scheduleDate = req.body.date;

		if (req.body.id) {
			let dateTime = getDate('full');
			con.query('select * from rounds where schedule_dt="' + scheduleDate + '" and id!=' + req.body.id + ' and is_deleted=0 and status=1', (err, info) => {
				if (info.length > 0) {
					return res.send({ status: 'error', msg: 'Round Is Alredy Schedule For This Date' });
				} else {
					con.query('UPDATE rounds SET name="' + name + '", schedule_dt="' + scheduleDate + '", course_id="' + courseId + '", updated_dt="' + dateTime + '", updated_by=' + userId + ' WHERE id =' + req.body.id + '', function (err, data) {
						if (err) res.send({ status: 'error', msg: 'Database Error While Insert Round' });
						if (courseId != "") {
							if (data) {
								// Course Array
								courseId = courseId.split(",");
								// Create Default Slot For Round //
								courseId.forEach((course) => {
									course = parseInt(course);
									con.query("SELECT COUNT(id) as count FROM slots WHERE course_id=" + course + " AND round_id=" + req.body.id + " AND is_deleted=0 AND status=1", function (err, info) {
										if (info[0].count === 0) {
											addSlots(con, req.body.id, course, userId, res);
										}
									});
								});
								return res.send({ status: 'success', msg: 'Round Saved' });
							}
						} else {
							return res.send({ status: 'success', msg: 'Round Saved' });
						}
					})
				}
			})
		} else {
			con.query("SELECT * FROM rounds WHERE schedule_dt='" + scheduleDate + "' AND is_deleted=0 AND status=1", (err, info) => {
				if (err) {
					return res.send({ status: 'error', msg: 'Database Error While Insert Round' });
				}
				if (info.length > 0) {
					return res.send({ status: 'error', msg: 'Round Is Alredy Schedule For This Date' });
				} else {
					con.query('INSERT INTO rounds (name, course_id, schedule_dt ,created_by, updated_by) VALUES("' + name + '", "' + courseId + '", "' + scheduleDate + '", ' + userId + ', ' + userId + ')',
						function (err, data) {
							if (err) return res.send({ status: 'error', msg: 'Database Error While Insert Round' });
							if (courseId != "") {
								if (data) {
									// Course Array
									courseId = courseId.split(",");
									// Create Default Slot For Round //
									courseId.forEach((course) => {
										course = parseInt(course);
										addSlots(con, data.insertId, course, userId, res);
									});
									return res.send({ status: 'success', msg: 'Round Saved' });
								}
							} else {
								return res.send({ status: 'success', msg: 'Round Saved' });
							}
						}
					);
				}
			})
		}

	});

	app.get('/allRound', function (req, res) {
		con.query("SELECT * FROM rounds WHERE is_deleted=0 AND status=1", function (err, rounds) {
			if (err) return res.send(err);

			if (rounds) {
				res.send(rounds);
			}
		})
	});

	app.get('/getRound/:id', function (req, res) {
		let round = req.params.id;
		con.query('SELECT * FROM rounds WHERE id=' + round + ' AND is_deleted=0 AND status=1 ORDER BY updated_dt DESC',
			function (err, data) {
				if (err) {
					res.send(err);
				} else if (data) {
					res.send(data);
				}
			}
		)
	});

	app.patch('/deleteRound', function (req, res) {
		let userId = req.body.name;
		con.query("UPDATE rounds SET is_deleted=1, updated_by=" + userId + " WHERE id =" + req.body.id + "", function (err, data) {
			if (err) return err;

			con.query("UPDATE slots SET is_deleted=1, updated_by=" + userId + " WHERE round_id=" + req.body.id + "",
				function (err, data) {
					if (err) {
						res.send(err);
					} else if (data) {
						res.send(data);
					}
				})
		})
	})

	////////////////////////////////////////////
	//////////// Slots Routes ////////////////
	//////////////////////////////////////////

	app.get('/getSlot/:round/:course', function (req, res) {
		con.query("SELECT * FROM slots WHERE round_id=" + req.params.round + " AND course_id=" + req.params.course + " AND is_deleted=0 ORDER BY id",
			function (err, data) {
				if (err) {
					return res.send(err);
				} else if (data) {
					return res.send(data);
				}
			}
		)
	})

	app.patch('/saveSlot', function (req, res) {
		let slot = req.body.id;
		let count = req.body.count;
		let forAll = req.body.applyForAll;
		let round = req.body.round;
		let course = req.body.course;
		let userId = req.body.userId;
		let dateTime = getDate('full');
		if (forAll === true || forAll === 1) {
			con.query("UPDATE slots SET count=" + count + ", updated_by=" + userId + ", updated_dt='" + dateTime + "' WHERE round_id=" + round + " AND course_id =" + course + " ",
				function (err, data) {
					if (err) {
						return res.send(err);
					} else if (data) {
						return res.send(data);
					}
				});
		} else {
			con.query("UPDATE slots SET count=" + count + ", updated_by=" + userId + ", updated_dt='" + dateTime + "' WHERE round_id=" + round + " AND course_id=" + course + " AND id=" + slot + "",
				function (err, data) {
					if (err) {
						return res.send(err);
					} else if (data) {
						return res.send(data);
					}
				});
		}
	})

	app.get('/countData/:round/:course', (req, res) => {
		con.query("SELECT SUM(count) as count, SUM(assigned) as assigned from slots where round_id=" + req.params.round + " and course_id=" + req.params.course + "", (err, info) => {
			if (info) {
				let countData = {};
				countData.assignSlotPer = parseInt((parseInt(info[0].assigned) * 100) / parseInt(info[0].count));
				countData.totalCount = parseInt(info[0].count);
				countData.assignedCount = parseInt(info[0].assigned);
				res.send(countData);
			} else if (err) {

			}
		});
	})


	////////////////////////////////////////////
	//////////// Registration Routes //////////
	//////////////////////////////////////////

	app.post('/saveStudent', function (req, res) {
		let student = req.body.student;
		let results = req.body.results;
		saveStudent(con, res, student, (status, studentData) => {
			if (status) {
				/*Insert Data in Result Table*/
				insertResult(con, res, results, studentData.student_id, (status, resultData) => {
					if (status) {
						/*Assign Slots*/
						assignSlot(con, res, studentData.course_id, studentData.student_id, true, (status, slotData) => {
							if (status) {
								sendInfoService.sendInfo(con, studentData.student_id, (status, mailData) => {
									res.send({ status: true, data: mailData });
								});
							} else {
								con.query("DELETE students, result FROM students INNER JOIN result ON students.id = result.student_id WHERE students.id=" + studentData.student_id + "", (err, info) => {
									console.log(err);
									res.send({ status: false, data: slotData });
								});
							}
						});
					} else {
						con.query("DELETE students, result FROM students INNER JOIN result ON students.id = result.student_id WHERE students.id=" + studentData.student_id + "", (err, info) => {
							console.log(err);
							res.send({ status: false, data: resultData });
						});
					}
				});
			} else {
				console.log(studentData);
				res.send({ status: false, data: studentData.sqlMessage });
			}
		});
	});


	///////////////////////////////////////////
	////////////// Students Routes ////////////
	///////////////////////////////////////////

	app.get('/getStudent/:data', (req, res) => {
		data = JSON.parse(req.params.data);
		let queryData = {
			round_id: data.round,
			course_id: data.course,
			decision: data.decision,
			reference: data.reference,
			is_deleted: 0
		}
		let queryCond = '';
		for (var key in queryData) {
			if(queryData.hasOwnProperty(key) && queryData[key] != '*' && key == 'course_id') {
				queryCond += key + ' in (' + queryData[key] + ') AND ';
			} else  if (queryData.hasOwnProperty(key) && queryData[key] != '*') {
				queryCond += key + ' = ' + queryData[key] + ' AND ';
			}
		}

		var lastIndex = queryCond.lastIndexOf(' AND ');

		queryCond = queryCond.substring(0, lastIndex);

		if (queryCond.length > 0) {
			queryCond = "where " + queryCond;
		}

		let query = "select students.*, interview_info.student_id as student_id, interview_info.course_id as course_id, interview_info.old_course as old_course, interview_info.decision as decision, interview_info.mail_sent as mail_sent, interview_info.mail_sent_fail as mail_sent_fail, interview_info.reference as reference, interview_info.sms_sent as sms_sent, rounds.id as round, rounds.name as roundName, rounds.schedule_dt as roundDate, courses.id as course, courses.name as courseName, slots.start_time as time from students JOIN interview_info join rounds join courses join slots join (SELECT id, round_id, student_id, slot_id, course_id from interview_info " + queryCond + ") temp ON (students.id = temp.student_id and interview_info.id = temp.id and rounds.id=temp.round_id and courses.id = temp.course_id and slots.id = temp.slot_id)";
		con.query(query, (err, info) => {
			if (info) {
				res.send({ status: 1, msg: info });
			}
			if (err) {
				res.send({ status: 0, msg: 'Error While Fetching Student Data' });
			}
		});
	});

	app.post('/updateStudent', (req, res) => {
		let field = req.body.type;
		let course = req.body.course;
		let round = req.body.round;
		let studentId = req.body.studentId;
		let value = req.body.value;
		let admin = req.body.admin;
		let date = getDate('full');

		let query = "update interview_info set " + field + "=" + value + ", updated_by=" + admin + ", updated_dt='" + date + "' where student_id=" + studentId + " and round_id=" + round + " and course_id=" + course + "";

		con.query(query, (err, info) => {
			if (info) {
				res.send({ status: 1, msg: "Data for " + field + " update" });
			} else {
				res.send({ status: 0, msg: "Error While Updating" });
			}
		})
	});

	app.get('/exportFile/:data', (req, res) => {
		let data = req.params.data;
		exportFile.exportFile(res, data);
	});

	app.post('/sendMail', (req, res) => {
		let students = req.body.students;
		//students = students.filter(data => data.mail_sent == 0);
		students = students.filter(data => data.Email != "");
		students = students.filter(data => data.Email != null);

		if (students.length == 0) {
			res.send({ status: 0, msg: 'Mails are already sent to or no email address are available' });
		} else {
			sendStudentData.sendMail(con, res, students);
		}
	})

	app.post('/sendSMS', (req, res) => {
		let students = req.body.students;
		students = students.filter(student => student.sms_sent == 0);
		students = students.filter(data => data.Mobile != "");
		students = students.filter(data => data.Mobile != null);

		if (students.length == 0) {
			res.send({ status: 0, msg: 'SMS are already sent to all students or mobile number is not available' });
		} else {
			sendStudentData.sendSMS(con, res, students);
		}
	});

	app.get('/getStudentById/:id', (req, res) => {
		let studentId = req.params.id;
		let query = "select * from students where id=" + studentId;
		con.query(query, (err, info) => {
			if (err) {
				res.send({ status: 0, info: err })
			}
			if (info) {
				res.send({ status: 1, info: info })
			}
		});
	});

	app.post('/editStudent', (req, res) => {
		let student = req.body.student;
		let oldStudent = req.body.oldStudent;
		let slots = JSON.parse(oldStudent.slots_id);
		let oldFirstChoice = oldStudent.firstchoice;
		let oldSecondChoice = oldStudent.secondchoice;
		let newFirstChoice = student.firstchoice;
		let newSecondChoice = student.secondchoice;
		let oldSlots = JSON.parse(oldStudent.slots_id);
		let firstTempSlot;
		if (student.firstchoice != oldStudent.firstchoice && student.secondchoice != oldStudent.secondchoice) {
			this.oldFirstChoice = oldStudent.firstchoice;
			this.oldSecondChoice = oldStudent.secondchoice;
			this.newFirstChoice = student.firstchoice;
			this.newSecondChoice = student.secondchoice;
			setSlot(con, res, student.firstchoice, oldStudent.firstchoice, slots, student.id, (err, firstSlots) => {
				let tempSlot = JSON.parse(oldStudent.slots_id);
				delete tempSlot[oldFirstChoice];
				tempSlot[newFirstChoice] = firstSlots[newFirstChoice];
				if (newSecondChoice) {
					setSlot(con, res, student.secondchoice, oldStudent.secondchoice, JSON.parse(oldStudent.slots_id), student.id, (err, secondSlots) => {
						if (oldSecondChoice != newFirstChoice) {
							delete tempSlot[oldSecondChoice];
						}
						tempSlot[newSecondChoice] = secondSlots[newSecondChoice];
						student.slots_id = JSON.stringify(tempSlot);
						editStudent(con, res, student, (err, data) => {
							if (err == 0) {
								updateInfo(con, res, oldSlots, tempSlot, student.id, (err, updatedData) => {
									if (updatedData) {
										let slotsId = '';
										if (oldSlots[oldSecondChoice]) {
											slotsId = '(' + oldSlots[oldFirstChoice] + ', ' + oldSlots[oldSecondChoice] + ')';
										} else {
											slotsId = '(' + oldSlots[oldFirstChoice] + ')';
										}
										let assignQuery = "update slots set assigned=assigned-1 WHERE id in " + slotsId;
										con.query(assignQuery, (err, assignQueryData) => {
											if (assignQueryData) {
												res.send({ status: 1, msg: 'User Update Successfully' });
											} else {
												res.send({ status: 0, msg: 'Error Chang Slot' });
											}
										});
									} else if (err) {
										res.send({ status: 0, msg: 'Error While Update Information' });
									}
								});
							} else {
								res.send({ status: 0, msg: 'Error While Update Student Data' });
							}
						});
					});
				} else {
					if (oldSecondChoice != newFirstChoice) {
						delete tempSlot[oldSecondChoice];
					}
					student.slots_id = JSON.stringify(tempSlot);
					student.course_id = newFirstChoice;
					editStudent(con, res, student, (err, data) => {
						if (err == 0) {
							updateInfo(con, res, oldSlots, tempSlot, student.id, (err, updatedData) => {
								if (updatedData) {
									let slotsId = '';
									if (oldSlots[oldSecondChoice]) {
										slotsId = '(' + oldSlots[oldFirstChoice] + ', ' + oldSlots[oldSecondChoice] + ')';
									} else {
										slotsId = '(' + oldSlots[oldFirstChoice] + ')';
									}
									let assignQuery = "update slots set assigned=assigned-1 WHERE id in " + slotsId;
									con.query(assignQuery, (err, assignQueryData) => {
										if (assignQueryData) {
											res.send({ status: 1, msg: 'User Update Successfully' });
										} else {
											res.send({ status: 0, msg: 'Error Chang Slot' });
										}
									});
								} else if (err) {
									res.send({ status: 0, msg: 'Error While Update Information' });
								}
							});
						} else {
							res.send({ status: 0, msg: 'Error While Update Student Data' });
						}
					});
				}

			});
		} else if (student.firstchoice != oldStudent.firstchoice && student.secondchoice == oldStudent.secondchoice) {
			setSlot(con, res, student.firstchoice, oldStudent.firstchoice, slots, student.id, (err, slots) => {
				student.slots_id = JSON.stringify(slots);
				editStudent(con, res, student, (err, data) => {
					if (err == 0) {
						let tempUpdateOldSlots = {}
						tempUpdateOldSlots[oldFirstChoice] = oldSlots[oldFirstChoice];
						let tempUpdateNewSlot = {}
						tempUpdateNewSlot[newFirstChoice] = slots[newFirstChoice];
						updateInfo(con, res, tempUpdateOldSlots, tempUpdateNewSlot, student.id, (err, updatedData) => {
							if (updatedData) {
								slotsId = '(' + oldSlots[oldFirstChoice] + ')';
								let assignQuery = "update slots set assigned=assigned-1 WHERE id in " + slotsId;
								con.query(assignQuery, (err, assignQueryData) => {
									if (assignQueryData) {
										res.send({ status: 1, msg: 'User Update Successfully' });
									} else {
										res.send({ status: 0, msg: 'Error Chang Slot' });
									}
								});
							} else if (err) {
								res.send({ status: 0, msg: 'Error While Update Information' });
							}
						});
					} else {
						res.send({ status: 0, msg: 'Error While Update Student Data' });
					}
				});
			});
		} else if (student.firstchoice == oldStudent.firstchoice && student.secondchoice != oldStudent.secondchoice) {
			if (newSecondChoice) {
				setSlot(con, res, student.secondchoice, oldStudent.secondchoice, slots, student.id, (err, slots) => {
					student.slots_id = JSON.stringify(slots);
					editStudent(con, res, student, (err, data) => {
						if (err == 0) {
							let tempUpdateOldSlots = {}
							if (oldSlots[oldSecondChoice]) {
								tempUpdateOldSlots[oldSecondChoice] = oldSlots[oldSecondChoice];
							} else {
								tempUpdateOldSlots = null;
							}
							let tempUpdateNewSlot = {}
							tempUpdateNewSlot[newSecondChoice] = slots[newSecondChoice];
							updateInfo(con, res, tempUpdateOldSlots, tempUpdateNewSlot, student.id, (err, updatedData) => {
								if (updatedData) {
									if (oldSlots[oldSecondChoice]) {
										slotsId = '(' + oldSlots[oldSecondChoice] + ')';
										let assignQuery = "update slots set assigned=assigned-1 WHERE id in " + slotsId;
										con.query(assignQuery, (err, assignQueryData) => {
											if (assignQueryData) {
												res.send({ status: 1, msg: 'User Update Successfully' });
											} else {
												res.send({ status: 0, msg: 'Error Chang Slot' });
											}
										});
									} else {
										res.send({ status: 1, msg: 'User Update Successfully' });
									}
								} else if (err) {
									res.send({ status: 0, msg: 'Error While Update Information' });
								}
							});
						} else {
							res.send({ status: 0, msg: 'Error While Update Student Data' });
						}
					});
				});
			} else {
				delete slots[oldSecondChoice];
				student.slots_id = JSON.stringify(slots);
				student.course_id = newFirstChoice;
				editStudent(con, res, student, (err, data) => {
					if (err == 0) {
						let tempUpdateOldSlots = {}
						if (oldSlots[oldSecondChoice]) {
							tempUpdateOldSlots[oldSecondChoice] = oldSlots[oldSecondChoice];
						} else {
							tempUpdateOldSlots = null;
						}
						let tempUpdateNewSlot = null;
						updateInfo(con, res, tempUpdateOldSlots, tempUpdateNewSlot, student.id, (err, updatedData) => {
							if (updatedData) {
								if (oldSlots[oldSecondChoice]) {
									slotsId = '(' + oldSlots[oldSecondChoice] + ')';
									let assignQuery = "update slots set assigned=assigned-1 WHERE id in " + slotsId;
									con.query(assignQuery, (err, assignQueryData) => {
										if (assignQueryData) {
											res.send({ status: 1, msg: 'User Update Successfully' });
										} else {
											res.send({ status: 0, msg: 'Error Chang Slot' });
										}
									});
								} else {
									res.send({ status: 1, msg: 'User Update Successfully' });
								}
							} else if (err) {
								res.send({ status: 0, msg: 'Error While Update Information' });
							}
						});
					} else {
						res.send({ status: 0, msg: 'Error While Update Student Data' });
					}
				});
			}
		} else {
			editStudent(con, res, student, (err, data) => {
				if (err == 0) {
					res.send({ status: 1, msg: 'Student Data Updated Succesfully' });
				} else {
					res.send({ status: 0, msg: 'Error While Update Student Data' });
				}
			});
		}
	});

	app.post('/reAssignSlot', (req, res) => {
		let student = req.body;
		reAssignSlots(con, res, student.course, student.student_id, (err, length, data) => {
			if (length > 0) {
				let date = getDate('full');
				let query = "UPDATE interview_info set is_deleted = 1, updated_by = " + student.update_by + ", updated_dt = '" + date + "' WHERE student_id=" + student.student_id + " AND course_id=" + student.course + " AND round_id=" + student.round + "";
				con.query(query, (err, info) => {
					if (info) {
						let query = "INSERT INTO interview_info (student_id, round_id, course_id, slot_id, created_by, updated_by) SELECT " + student.student_id + ", round_id, " + student.course + ", " + data + ", " + student.update_by + ", " + student.update_by + " FROM slots WHERE id = " + data + "";
						con.query(query, (err, info) => {
							let oldSlots = JSON.parse(student.slots_id);
							for (let key in oldSlots) {
								if (key = student.course) {
									oldSlots[key] = data;
								}
							}
							let newSlots = JSON.stringify(oldSlots);
							let query = "UPDATE students set slots_id = '" + newSlots + "', sms_sent=0, update_dt='" + date + "', update_by=" + student.update_by + " where id = " + student.student_id + "";
							con.query(query, (err, info) => {
								if (info) {
									sendInfoService.sendInfo(con, student.student_id, (status, mailData) => {

										let query = "select sum(count) as count, sum(assigned) as assigned, rounds.id as round_id, rounds.name as round, rounds.schedule_dt as date, courses.id as course_id, courses.name as course from slots JOIN (SELECT round_id, course_id FROM slots WHERE id=" + data + ") temp JOIN rounds on rounds.id=temp.round_id JOIN courses on courses.id=temp.course_id WHERE slots.round_id = temp.round_id AND slots.course_id = temp.course_id";

										con.query(query, (err, info) => {
											if (info) {
												let per = parseInt((parseInt(info[0].assigned) * 100) / parseInt(info[0].count));
												info[0].admin = process.env.ADMINEMAIL;
												info[0].per = per;
												info[0].avalible = parseInt(info[0].count) - parseInt(info[0].assigned);

												if (per >= 90) {
													sendInfoService.sendCourseAlert(con, info[0], (status, err) => { })
												} else {
													let query = "UPDATE `course_status` join (SELECT * FROM `course_status` WHERE `round_id`=" + info[0].round_id + " AND `course_id`=" + info[0].course_id + ") temp SET course_status.assign_per=" + info[0].per + "  WHERE course_status.id=temp.id";
													con.query(query);
												}
											} else {
												res.send({ status: 0, msg: 'Error While re-assign slot' });
											}
										});

										res.send({ status: 1, msg: 'Slots Re-assign For ' + student.courseName });
									});
								} else {
									res.send({ status: 0, msg: 'Error While re-assign slot' });
								}
							})
						})
					} else {
						res.send({ status: 0, msg: 'Error While re-assign slot' });
					}
				});
			} else {
				res.send({ status: 0, msg: 'No Future slot is available for this course' });
			}

		});
	});

	app.post('/sendCustomData', (req, res) => {
		req.setTimeout(600000000);
		let type = req.body.type;
		let studentsData = req.body.studentsData;
		let data = req.body.content;
		let index = 0;
		let students = [];
		sendCustomDataFn(con, res, index, students, type, studentsData, data);
		//let query = "select students.*, interview_info.student_id as student_id, interview_info.modified_course as modified_course_id, interview_info.decision as decision, interview_info.mail_sent as mail_sent, interview_info.mail_sent_fail as mail_sent_fail, interview_info.reference as reference, interview_info.sms_sent as sms_sent, rounds.id as round, rounds.name as roundName, rounds.schedule_dt as roundDate, courses.id as course, courses.name as courseName, slots.start_time as time from students JOIN interview_info join rounds join courses join slots join (SELECT id, round_id, student_id, slot_id, course_id from interview_info where interview_info.student_id in("+studentsId+")) temp ON (students.id = temp.student_id and interview_info.id = temp.id and rounds.id=temp.round_id and courses.id = temp.course_id and slots.id = temp.slot_id)";

		// con.query(query, (err, students) => {
		// 	if(students) {
		// 		let field = "";
		// 		if (type == 'email' ) {	
		// 			students = students.filter(data => data.email != null);
		// 			students = students.filter(data => data.email != "");
		// 			field = "Email Id ";
		// 		} else if (type == 'sms' ) {	
		// 			students = students.filter(data => data.mobile != null);
		// 			students = students.filter(data => data.mobile != "");
		// 			field = "Mobile Number ";
		// 		}

		// 		if (students.length > 0) {
		// 			sendStudentData.sendCustomData(res, type, students, data, con);
		// 		} else {
		// 			res.send({status:0, msg: field+'Is Not Available For Sending Data' });
		// 		}
		// 	} else if(err) {
		// 		res.send({status:0, msg: 'Error While Getting Student Details' });
		// 	}
		// })


	});

	app.patch('/modifiedCourse', (req, res) => {
		let data = req.body;
		let query = "update interview_info";
		let condition = " where ";
		let field = " set ";
		for (let k in data) {
			if (k == 'updated_by' || k == 'course_id' || k == 'old_course') {
				field += k + "=" + data[k] + ", ";
			} else {
				condition += k + "=" + data[k] + " and ";
			}
		}

		field = field.substring(0, field.length - 2);
		condition += 'course_id = ' + data['old_course'];
		query += field + condition;

		con.query(query, (err, modifiedData) => {
			if (err) {
				res.send({ status: false, msg: 'Database Error While Modified Interview Course', data: err })
			} else {
				query = "select * from students where id=" + data['student_id'];
				con.query(query, (err, student) => {
					student = student[0];
					//var updatedField;
					var updatedField = (student.firstchoice == data['old_course']) ? 'firstchoice' : ((student.secondchoice == data['old_course']) ? 'secondchoice' : null);
					// if(student.firstchoice == data['old_course']){
					// 	updatedField = 'firstchoice';
					// } else if(student.secondchoice == data['old_course']) {
					// 	updatedField = 'secondchoice';
					// }else {
					// 	updatedField = null;
					// }
					//let updatedField = (student.firstchoice == data['old_course'])? 'firstchoice':'secondchoice';
					if (updatedField == null) {
						return res.send({ status: false, msg: 'Old Course Not Found For Student ', data: err });
					}

					query = "update students set " + updatedField + "=" + data['course_id'] + " where id=" + data['student_id'];

					con.query(query, (err, studentModified) => {
						if (err) {
							res.send({ status: false, msg: 'Database Error While Modified Student Course', data: err });
						}
						if (studentModified) {
							res.send({ status: true, msg: 'Course Modified Successfully', data: data });
						}
					})
				})
			}
		})
	})


	app.patch('/deleteStudent', (req, res) => {
		let student_id = req.body.student_id;
		let round_id = req.body.round_id;
		let course_id = req.body.course_id;
		let secondchoice = req.body.secondchoice;
		let admin = req.body.admin;

		let query = "UPDATE students as s, interview_info as i set i.is_deleted=1, s.update_by=" + admin + ", i.updated_by=" + admin + ", s.update_dt='" + getDate('full') + "', i.updated_dt='" + getDate('full') + "', s.secondchoice=null where s.id=" + student_id + " and i.student_id=" + student_id + " and i.round_id=" + round_id + " and i.course_id=" + course_id;
		if (secondchoice && secondchoice != null && secondchoice != '') {
			console.log('Inside second set');
			if (secondchoice == 'remove_firstchoice') {
				query = "UPDATE students as s, interview_info as i set i.is_deleted=1, s.update_by=" + admin + ", s.update_dt='" + getDate('full') + "', i.updated_dt='" + getDate('full') + "', i.updated_by=" + admin + ", s.firstchoice=null where s.id=" + student_id + " and i.student_id=" + student_id + " and i.round_id=" + round_id + " and i.course_id=" + course_id;
			} else {
				query = "UPDATE students as s, interview_info as i set i.is_deleted=1, s.update_by=" + admin + ", s.update_dt='" + getDate('full') + "', i.updated_dt='" + getDate('full') + "', i.updated_by=" + admin + ", s.firstchoice=" + secondchoice + ", s.secondchoice=null where s.id=" + student_id + " and i.student_id=" + student_id + " and i.round_id=" + round_id + " and i.course_id=" + course_id;
			}
		}

		con.query(query, (err, data) => {
			if (err) {
				res.send({ status: false, msg: 'Erro While Deletting Student(s)', err });
			} else {
				res.send({ status: true, msg: 'Student(s) Deleted Successfully', data });
			}
		})
	})

	///////////////////////////////////////////
	///////////// Templates Routes ////////////
	///////////////////////////////////////////

	app.post('/saveTemplate', (req, res) => {
		let fields = req.body;
		if (fields.id) {
			let query = "update templates set ";
			let fieldQuery = '';
			for (let key of Object.keys(fields)) {
				if (key != 'id') {
					fieldQuery += "`" + key + "`='" + fields[key] + "', ";
				}
			}
			fieldQuery = fieldQuery.substring(0, fieldQuery.length - 2);
			query += fieldQuery + " where id=" + fields['id'];
			con.query(query, (err, info) => {
				if (err) {
					res.send({ status: false, msg: err });
				} else {
					res.send({ status: true, msg: 'Template Updated Succesfully' });
				}
			});
		} else {
			let query = "insert into templates (";
			let fieldQuery = "";
			let valueQuery = "";
			for (let key in fields) {
				fieldQuery += "`" + key + "`, ";
				valueQuery += "'" + fields[key] + "', ";
			}
			fieldQuery = fieldQuery.substring(0, fieldQuery.length - 2);
			valueQuery = valueQuery.substring(0, valueQuery.length - 2);
			query += fieldQuery + ') values ' + '(' + valueQuery + ')';

			con.query(query, (err, info) => {
				if (err) {
					res.send({ status: false, msg: err });
				} else {
					res.send({ status: true, msg: 'Template Save Succesfully' });
				}
			});
		}
	});

	app.get('/getTemplate', (req, res) => {
		let query = "select * from templates where is_deleted=0";
		con.query(query, (err, info) => {
			if (err) {
				res.send({ status: false, msg: 'Database Error While Getting Data', data: err });
			} else {
				res.send({ status: true, msg: 'Template Fetch Successfully', data: info });
			}
		})
	});

	app.patch('/deleteTemplate', (req, res) => {
		let id = req.body.id;
		let admin = req.body.admin;
		let query = "update templates set is_deleted=1, updated_by=" + admin + " where id=" + id;
		con.query(query, (err, info) => {
			if (info) {
				res.send({ status: true, msg: 'Template Deleted Successfully', data: info });
			} else {
				res.send({ status: false, msg: 'Error While Delete Template', data: err });
			}
		});
	})
	///////////////////////////////////////////
	///////////////// PHASE 9 /////////////////
	///////////////////////////////////////////

	app.post('/changePassword', (req, res) => {

		let password = req.body.oldPassword;
		let newPassword = req.body.newPassword;
		let email = req.body.email;
		let id = req.body.id;

		let query = "SELECT id,password FROM user WHERE email='" + email + "' AND status=1 AND is_deleted=0";
		con.query(query, (err, user) => {
			if (err) return { status: 0, errMsg: 'Error While Login' };
			if (user) {


				if (!user[0]) {
					return res.send({ status: 0, errMsg: 'User Not Found' });
				}
				if (cryptr.decrypt(user[0].password) != password) {
					return res.send({ status: 0, errMsg: 'Invalid Password' });
				} else {

					let newEncPassword = cryptr.encrypt(newPassword);
					query = "UPDATE user set password='" + newEncPassword + "', updated_by='" + id + "'where id=" + user[0].id;
					con.query(query, (err, info) => {
						if (err) {

							return { status: 0, errMsg: 'Error While Change Password' };
						}
						else {

							return res.send({ status: 1, msg: 'Password changed' });
						}
					})
				}
				// res.send({status: true, msg:'Template Deleted Successfully', data:user});
			}
		});
	});

	app.post('/createUser', (req, res) => {
		let guidanceUserObj = req.body.guidanceUserSubForm;

		let query;

		query = "SELECT email FROM user WHERE email='" + req.body.email + "' AND status=1 AND is_deleted=0"
		con.query(query,
			(err, user) => {
				if (err) {
					return res.send({ status: 0, errMsg: 'Error While Create User' });
				}
				if (user[0]) {
					return res.send({ status: 1, msg: 'User is already created' });
				} else {
					if (guidanceUserObj) {

						query = "INSERT INTO `guidance_user` (`firstName`, `lastName`, `schoolName`, `schoolPhoneNo`, `schoolAddress`,`is_deleted`,`created_by`, `updated_by`) VALUES ('" + guidanceUserObj.firstName + "', '" + guidanceUserObj.lastName + "', '" + guidanceUserObj.schoolName + "', '" + guidanceUserObj.schoolPhoneNo + "', '" + guidanceUserObj.schoolAddress + "', 0, '" + req.body.id + "','" + req.body.id + "')"

						con.query(query,
							(err, info) => {
								if (err) {
									return res.send({ status: 0, errMsg: 'Error While Create User' });
								}
								if (info) {
									addUser(con, res, req.body, info.insertId);
								}
							}
						);
					} else {
						addUser(con, res, req.body, 0);

					}
				}
			}
		);
	});

	app.post('/getGuidanceUserDetails', (req, res) => {
		let data = req.body;
		query = "SELECT schoolName FROM user join guidance_user on guidance_user.id = user.guidance_user_id  WHERE user.email='" + data.email + "' AND user.status=1 AND user.is_deleted=0";
		con.query(query, (err, user) => {
			if (err) {
				return res.send({ status: false, errMsg: 'Database Error ' });

			}
			if (user[0]) {

				return res.send({ status: true, msg: 'School Name ', data: user[0].schoolName });

			}
			return res.send({ status: true, msg: 'School Name ', data: 'school name' });

		})
	});
	app.get('/getStudentList/:schoolName', (req, res) => {
		let schoolName = req.params.schoolName;
		// let query = "SELECT students.fullname, students.email ,interview_info.arrivalTime as time, courses.name FROM `students` join courses join interview_info on (students.id = interview_info.student_id and courses.id = interview_info.course_id) where interview_info.is_deleted = 0 and students.school_name = '" + schoolName + "'"
		let query = "SELECT students.fullname, students.email , courses.name, slots.start_time as time FROM `students` join courses join interview_info join slots on (students.id = interview_info.student_id and courses.id = interview_info.course_id and interview_info.slot_id = slots.id) where interview_info.is_deleted = 0 and students.school_name = '" + schoolName + "'"


		con.query(query, (err, info) => {


			if (err) {
				return res.send({ status: false, errMsg: 'Database Error ' });

			}
			if (info) {

				return res.send({ status: true, msg: 'students ', data: info });

			}
			return res.send({ status: true, msg: 'School Name ', data: [] });

		})
	})
	app.post('/saveStudentByGuidanceUser', (req, res) => {
		let student = req.body.student;
		let email = req.body.email;
		// console.log("email ", email);

		saveStudent(con, res, student, (status, studentData) => {
			if (status) {

				/*Assign Slot to student*/
				assignSlot(con, res, studentData.course_id, studentData.student_id, true, (status, slotData) => {
					if (status) {
						// console.log(studentData);

						sendInfoService.sendInfoToGuidanceUser(con, studentData.student_id, email, (status, mailData) => {

							if (status) {

								con.query("UPDATE students set mail_sent=1 where id=" + studentData.student_id + "", (err, result) => {
								
								})

							}
						});
						res.send({ status: true, data: studentData });

					} else {
						con.query("DELETE students, result FROM students INNER JOIN result ON students.id = result.student_id WHERE students.id=" + studentData.student_id + "", (err, info) => {
							console.log(err);
							res.send({ status: false, data: slotData });
						});
					}
				});
			} else {

				res.send({ status: false, data: studentData.sqlMessage });
			}
		});
	});
	app.get('/getUserList', (req, res) => {
		let query = "SELECT email, mobile ,role FROM `user`"
		con.query(query, (err, info) => {


			if (err) {
				return res.send({ status: false, errMsg: 'Database Error ' });

			}
			if (info) {

				return res.send({ status: true, msg: 'users ', data: info });

			}
			return res.send({ status: true, msg: 'no user found ', data: [] });

		})

	})
	app.post('/getSchoolInfo',(req,res)=>{
		let searchTearm = req.body.searchTearm;
		let query = "select id,Off_Name as name from school_info where Off_Name like '"+searchTearm+"%' limit 5";
		con.query(query,(err,info)=>{
			if(err){
				// console.log(err);
				
				return res.send({ status: false, errMsg: 'Database Error ' });
			}else{
				return res.send({ status: true, msg: 'schools ', data: info });

			}
		})
	})
}

function addUser(con, res, data, gid) {
	let randexp = new RandExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[@$!%*?&])[A-Za-z0-9@$!%*?&]{8,10}$');
	let pwd = randexp.gen();
	let password = cryptr.encrypt(pwd);
	query = "INSERT INTO `user` (`email`, `password`, `mobile`, `role`, `guidance_user_id`,`status`,`is_deleted`,`created_by`, `updated_by`) VALUES ('" + data.email + "', '" + password + "', '" + data.mobile + "', '" + data.role + "', '" + gid + "', 1, 0,'" + data.id + "','" + data.id + "')"


	con.query(query,
		(err, info) => {
			if (err) {
				return res.send({ status: 0, errMsg: 'Error While Create User' });
			}
			if (info) {
				sendInfoService.sendUserInfo({ email: data.email, password: pwd }, (mailResponse) => {

					query = "UPDATE user set mail_sent=" + mailResponse + " where email='" + data.email + "'";
					con.query(query, (err, info) => {
						// console.log("err ", query);

					})
				});
				return res.send({ status: 1, msg: 'User Created' });
			}
		}
	);
}

let warningCount;
let assignedCount;

function updateInfo(con, res, oldSlots, slots, studentId, cb) {
	let oldCount = 0;
	let newCount = 0;

	if (oldSlots != null) {
		for (let course in oldSlots) {
			let slot = oldSlots[course];
			let query = "update interview_info set is_deleted=1 where course_id=" + course + " and slot_id=" + slot + " and student_id=" + studentId;
			con.query(query, (err, response) => {
				if (err) {
					cb(true, 'Error While Delete Old Information');
				} else {
					if (slots) {
						oldCount++;
						if (oldCount == Object.keys(oldSlots).length) {
							for (let course in slots) {
								let slot = slots[course];
								let roundQuery = "select round_id from slots where id=" + slot;
								con.query(roundQuery, (err, round) => {
									round = round[0].round_id
									let insertQuery = "INSERT INTO `interview_info`(`student_id`, `round_id`, `course_id`, `slot_id`) values(" + studentId + ", " + round + ", " + course + ", " + slot + ")";
									con.query(insertQuery, (err, response) => {
										newCount++;
										if (err) {
											cb(true, 'Error While Enter Old Information');
										} else {
											if (newCount == Object.keys(slots).length) {
												sendInfoService.sendInfo(con, studentId, (status, mailData) => {
													cb(false, mailData);
												});
											}
										}
									})
								});
							}
						}
					} else {
						sendInfoService.sendInfo(con, studentId, (status, mailData) => {
							cb(false, mailData);
						});
					}
				}
			})
		}
	} else {
		for (let course in slots) {
			let slot = slots[course];
			let roundQuery = "select round_id from slots where id=" + slot;
			con.query(roundQuery, (err, round) => {
				round = round[0].round_id
				let insertQuery = "INSERT INTO `interview_info`(`student_id`, `round_id`, `course_id`, `slot_id`) values(" + studentId + ", " + round + ", " + course + ", " + slot + ")";
				con.query(insertQuery, (err, response) => {
					newCount++;
					if (err) {
						cb(true, 'Error While Enter Old Information');
					} else {
						if (newCount == Object.keys(slots).length) {
							sendInfoService.sendInfo(con, studentId, (status, mailData) => {
								cb(false, mailData);
							});
						}
					}
				})
			});
		}
	}
}

function setSlot(con, res, newCourse, oldCourse, slots, studentId, cb) {
	let date = getDate('full');
	let round;
	let query = 'SELECT id FROM `rounds` WHERE schedule_dt > "' + date + '" AND is_deleted=0 ORDER by schedule_dt LIMIT 1';
	con.query(query, (err, info) => {
		if (info.length > 0) {
			round = info[0].id;
			let subQuery = 'SELECT id FROM slots WHERE slots.course_id =' + newCourse + ' AND slots.round_id=' + info[0].id + ' AND slots.count>0 AND slots.assigned < slots.count AND slots.is_deleted=0 ORDER BY slots.id LIMIT 1';
			con.query(subQuery, (err, data) => {
				if (data.length > 0) {
					if (slots[oldCourse]) {
						delete slots[oldCourse];
						slots[newCourse] = data[0].id;
						//slots = JSON.parse(JSON.stringify(slots).replace(oldCourse, newCourse));
					} else {
						slots[newCourse] = data[0].id;
					}
					assignSlot(con, res, newCourse, studentId, false, (err, data) => {
						if (err) {
							res.send({ status: 0, msg: 'Error While Assign Slots' });
						} else {
							cb(0, slots);
						}
					});
				} else {
					res.send({ status: 0, msg: 'No Future slot is available for selected course' });
				}
			})
		} else {
			res.send({ status: 0, msg: 'No Future slot is available for selected course' });
		}
	});
}

function reAssignSlots(con, res, course, studentId, cb) {
	let date = getDate('date');
	let query = "select slots.id from `slots` JOIN rounds on slots.round_id = rounds.id where slots.course_id = " + course + " and (count - assigned) > 0 and rounds.schedule_dt > '" + date + "' ORDER BY rounds.schedule_dt, slots.id LIMIT 1";
	con.query(query, (err, info) => {
		if (info) {
			if (info.length > 0) {
				let subQuery = "update slots join (select slots.id from `slots` JOIN rounds on slots.round_id = rounds.id where slots.course_id = " + course + " and (count - assigned) > 0 and rounds.schedule_dt > '" + date + "' ORDER BY rounds.schedule_dt, slots.id LIMIT 1) temp on slots.id = temp.id set slots.assigned = slots.assigned + 1, slots.id = LAST_INSERT_ID(slots.id)";
				con.query(subQuery, (err, subInfo) => {
					let slotId = subInfo.insertId;
					cb(false, info.length, slotId);
				})
			} else {
				cb(false, info.length, 'Slot Not Available');
			}
		}
	});


}

function editStudent(con, res, student, cb) {
	let query = "UPDATE students SET ";
	let updateQuery = "";
	let condition = "WHERE id=" + student.id;
	student.update_dt = getDate('full');
	for (let key in student) {

		if (student.hasOwnProperty(key)) {
			if (key != 'id' && student[key] != null) {
				updateQuery += key + '="' + student[key] + '", ';
			}
			if (key == 'secondchoice' && student[key] == null) {
				updateQuery += key + '=' + student[key] + ', ';
			}
		}
	}
	updateQuery = updateQuery.replace(/,\s*$/, "");
	query += updateQuery + condition;
	query = query.replace('slots_id="{', 'slots_id=\'{');
	query = query.replace('}", update_dt', '}\', update_dt');
	con.query(query, (err, data) => {
		if (err) {
			cb(1, err);
		} else {
			cb(0, data);
		}
	});
}




function saveStudent(con, res, student, cb) {
	
	let query = 'INSERT INTO students (';
	let fields = '';
	let values = '';

	for (var key in student) {
		if (student.hasOwnProperty(key) && student[key] != null) {
			fields += '`' + key + '`, ';
			values += '"' + student[key] + '", ';
		}
	}

	fields = fields.replace(/,\s*$/, '');
	values = values.replace(/,\s*$/, '');
	query += fields + ') values(' + values + ')';

	con.query(query, (err, info) => {
		if (err) {
			cb(false, err);
		}
		student_id = info.insertId;
		let courses = student.course_id.split(',');
		let rounds = [];
		let slots = [];
		getRounds(con, res, info.insertId, courses, 0, rounds, slots, (rounds, slots) => {
			let roundLength = rounds.length;

			for (let index = 0; roundLength > index; index++) {
				let query = "insert into `interview_info` (student_id, round_id, course_id, slot_id) values(" + student_id + ", " + rounds[index] + ", " + courses[index] + ", " + slots[index] + ")";

				con.query(query, (err, info) => {
					if (info) {
						if (index + 1 != roundLength) {
							index++;
						} else {
							cb(true, {
								student_id,
								course_id: courses
							});
						}
					}
				})
			}
		});
	});
}

function getRounds(con, res, student_id, course, index, rounds, slots, cb) {

	let date = getDate('date');

	let query = "select rounds.id as round, slots.id as slot from `rounds` JOIN slots on slots.round_id = rounds.id where slots.course_id = " + course[index] + " and (count - assigned) > 0 and rounds.schedule_dt > '" + date + "' ORDER BY rounds.schedule_dt, slots.id LIMIT 1";

	con.query(query, (err, info) => {
		if (info) {
			if (info.length == 0) {
				return res.send({ status: 0, data: 'No Round Are Available' });
			}
			rounds[index] = info[0].round;
			slots[index] = info[0].slot;

			if (course.length > index + 1) {
				index = parseInt(index) + 1;
				getRounds(con, res, student_id, course, index, rounds, slots, cb);
			} else {
				cb(rounds, slots);
			}
		}
	});

}

function assignSlot(con, res, selectedCourses, studentId, updateSlots, cb) {
	let courses = JSON.parse("[" + selectedCourses + "]");
	let slots = {};
	let counter = 0;

	courses.forEach((course) => {
		let date = getDate('date');
		con.query("update slots join (select slots.id from `slots` JOIN rounds on slots.round_id = rounds.id where slots.course_id = " + course + " and (count - assigned) > 0 and rounds.schedule_dt > '" + date + "' ORDER BY rounds.schedule_dt, slots.id LIMIT 1) temp on slots.id = temp.id set slots.assigned = slots.assigned + 1, slots.id = LAST_INSERT_ID(slots.id)", (err, info) => {
			if (info) {
				if (info.affectedRows === 1) {
					slots[course] = info.insertId;
					let query = "select sum(count) as count, sum(assigned) as assigned, rounds.id as round_id, rounds.name as round, rounds.schedule_dt as date, courses.id as course_id, courses.name as course from slots JOIN (SELECT round_id, course_id FROM slots WHERE id=" + info.insertId + ") temp JOIN rounds on rounds.id=temp.round_id JOIN courses on courses.id=temp.course_id WHERE slots.round_id = temp.round_id AND slots.course_id = temp.course_id";
					con.query(query, (err, info) => {
						if (info) {
							let per = parseInt((parseInt(info[0].assigned) * 100) / parseInt(info[0].count));
							info[0].admin = process.env.ADMINEMAIL;
							info[0].per = per;
							info[0].avalible = parseInt(info[0].count) - parseInt(info[0].assigned);

							if (per >= 90) {
								sendInfoService.sendCourseAlert(con, info[0], (status, err) => { })
							} else {
								let query = "UPDATE `course_status` join (SELECT * FROM `course_status` WHERE `round_id`=" + info[0].round_id + " AND `course_id`=" + info[0].course_id + ") temp SET course_status.assign_per=" + info[0].per + "  WHERE course_status.id=temp.id";
								con.query(query);
							}
						}
					});
				} else {
					slots[course] = null;
				}
			}
			if (err) {
				cb(false, err);
			}
			counter++;
			if (updateSlots && counter === courses.length) {
				con.query("update students set slots_id='" + JSON.stringify(slots) + "' where id =" + studentId + " and is_deleted=0 and status=1", (err, info) => {
					if (info) {
						cb(true, info);
					}
					if (err) {
						cb(false, err);
					}
				});
			} else if (!updateSlots && counter === courses.length) {
				cb(0, 'success');
			}
		});
	});
}

function insertResult(con, res, results, studentId, cb) {
	let query = "";
	if (results.length == 1) {
		results.forEach((result) => {
			if (result['name'] != null) {
				query = 'INSERT INTO result (`student_id`, `subject`, `level`, `grade`, `year`, `created_by`, `updated_by`) VALUES(' + studentId + ', "' + result['name'] + '", "' + result['level'] + '", "' + result['grade'] + '", "' + result['year'] + '",1,1)';
			}
		});
	} else if (results.length > 1) {
		query = 'INSERT INTO result (`student_id`, `subject`, `level`, `grade`, `year`, `created_by`, `updated_by`) VALUES';
		let values = '';
		results.forEach((result) => {
			values += '(' + studentId + ', "' + result['name'] + '", "' + result['level'] + '", "' + result['grade'] + '", "' + result['year'] + '", ' + 1 + ', ' + 1 + '),';
		});
		values = values.replace(/,\s*$/, '');
		query = query + values;
	}

	if (query.length > 0) {
		con.query(query, (err, info) => {
			if (err) {
				return cb(false, err);
			}
			if (info) {
				return cb(true, info);
			}
		});
	} else {
		return cb(true, null);
	}
}

/* Date Function Start*/
function getDate(type) {
	var date = new Date();

	var y = date.getFullYear();

	var m = date.getMonth() + 1;
	if (m.length < 2) m = '0' + m;

	var d = date.getDate();
	if (d.length < 2) d = '0' + d;

	var h = date.getHours();
	if (h.length < 2) h = '0' + h;

	var mn = date.getMinutes();
	if (mn.length < 2) mn = '0' + mn;

	var s = date.getSeconds();
	if (s.length < 2) s = '0' + s;

	let dFull = y + '-' + m + '-' + d + ' ' + h + ':' + mn + ':' + s;

	let dDate = y + '-' + m + '-' + d;

	if (type === 'full') {
		return dFull;
	} else if (type === 'date') {
		return dDate;
	}
}
/* Date Function End*/

function addSlots(con, round, course, userId, res) {
	con.query("INSERT INTO slots (round_id, course_id, start_time, end_time, created_by, updated_by) VALUES (" + round + ", " + course + ", '09:00', '09:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '09:15', '09:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '09:30', '09:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '09:45', '10:00', " + userId + ", " + userId + "),(" + round + ", " + course + ", '10:00', '10:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '10:15', '10:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '10:30', '10:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '10:45', '11:00', " + userId + ", " + userId + "),(" + round + ", " + course + ", '11:00', '11:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '11:15', '11:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '11:30', '11:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '11:45', '12:00', " + userId + ", " + userId + "),(" + round + ", " + course + ", '12:00', '12:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '12:15', '12:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '12:30', '12:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '12:45', '13:00', " + userId + ", " + userId + "),(" + round + ", " + course + ", '13:00', '13:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '13:15', '13:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '13:30', '13:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '13:45', '14:00', " + userId + ", " + userId + "),(" + round + ", " + course + ", '14:00', '14:15', " + userId + ", " + userId + "),(" + round + ", " + course + ", '14:15', '14:30', " + userId + ", " + userId + "),(" + round + ", " + course + ", '14:30', '14:45', " + userId + ", " + userId + "),(" + round + ", " + course + ", '14:45', '15:00', " + userId + ", " + userId + ")",
		function (err, info) {
			if (err) {
				return res.send({ status: 'error', msg: 'Database Error While Create Slots' });
			}
			if (info) {
				return;
			}
		}
	);
}

function sendCustomDataFn(con, res, index, students, type, studentsData, data) {
	if (studentsData.length == index) {
		let field = "";
		if (type == 'email') {
			students = students.filter(data => data.email != null);
			students = students.filter(data => data.email != "");
			field = "Email Id ";
		} else if (type == 'sms') {
			students = students.filter(data => data.mobile != null);
			students = students.filter(data => data.mobile != "");
			field = "Mobile Number ";
		}

		if (students.length > 0) {
			sendStudentData.sendCustomData(res, type, students, data, con);
		} else {
			res.send({ status: 0, msg: field + 'Is Not Available For Sending Data' });
		}
	} else {
		let student = studentsData[index];
		let query = "select students.*, interview_info.student_id as student_id, interview_info.course_id as course_id, interview_info.old_course as old_course, interview_info.decision as decision, interview_info.mail_sent as mail_sent, interview_info.mail_sent_fail as mail_sent_fail, interview_info.reference as reference, interview_info.sms_sent as sms_sent, rounds.id as round, rounds.name as roundName, rounds.schedule_dt as roundDate, courses.id as course, courses.name as courseName, slots.start_time as time from students JOIN interview_info join rounds join courses join slots join (SELECT id, round_id, student_id, slot_id, old_course, course_id from interview_info where interview_info.student_id=" + student.id + " and interview_info.course_id=" + student.course + " and interview_info.round_id=" + student.round + ") temp ON (students.id = temp.student_id and interview_info.id = temp.id and rounds.id=temp.round_id and courses.id = temp.course_id and slots.id = temp.slot_id)";
		con.query(query, (err, info) => {
			if (info) {
				index++;
				students.push(info[0]);
				sendCustomDataFn(con, res, index, students, type, studentsData, data);
			} else {
				res.send({ status: 0, msg: 'Error While Fetch Student(s) Details' });
			}
		})
	}

}


