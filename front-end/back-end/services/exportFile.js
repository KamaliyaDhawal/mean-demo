const express = require('express');
const mysql = require('mysql');
const path = require('path');

const excel = require('node-excel-export');
require('dotenv').config();
const app = express();

var con = mysql.createConnection({
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
		//console.log('Database Connected Succesfully');
	}
);

module.exports = {
	exportFile: function(res, data) {
		debugger;
		data = JSON.parse(data);
		setData((specification, dataset) => {

			const report = excel.buildExport(
			  [
			    {
			      name: 'Report',
			      specification: specification,
			      data: dataset
			    }
			  ]
			);

			res.attachment('report.xlsx');
			return res.download(res.attachment('report.xlsx'));

		});
	}
}

const styles = {
  headerDark: {
    fill: {
      fgColor: {
        rgb: 'FF000000'
      }
    },
    font: {
      color: {
        rgb: 'FFFFFFFF'
      },
      sz: 14,
      bold: true,
      underline: true
    }
  },
  cellPink: {
    fill: {
      fgColor: {
        rgb: 'FFFFCCFF'
      }
    }
  },
  cellGreen: {
    fill: {
      fgColor: {
        rgb: 'FF00FF00'
      }
    }
  }
};

function setData(createFile) {
	debugger;
	let query = "select students.fullname as fullname, students.email as email, students.mobile as mobile, interview_info.slot_id as slot, interview_info.decision as decision, interview_info.reference as reference from students join interview_info on interview_info.student_id = students.id";

	con.query(query, (err, info) => {
		if(info) {
			const dataset = info;
			var heading = "";
			var specification = {};

			let keys = Object.keys(dataset[0]);
			
			keys.forEach((key) => {
				heading += "{ value:'"+key+"', style: styles.headerDark},"; 
				specification[key] = { displayName: key.replace(/\b\w/g, l => l.toUpperCase()), headerStyle: styles.headerDark,width: 220}
			});

			heading = heading.replace(/,\s*$/, "");
			heading = "["+heading+"]";

			createFile(specification, dataset);
		}
	})	
}
