export class StudentData {
	constructor(
		private course_id: string,
		private firstchoice: number,
		private secondchoice: string,
		private fullname: string,
		private birthdate: string,
		private school_name: string,
		private created_by: number = 1,
		private update_by: number = 1,
		private status: number = 1,
		private is_deleted: number = 0,
	){}
}