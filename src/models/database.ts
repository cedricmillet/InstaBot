
import { config } from '../config/config';
const mysql = require('mysql');


export async function getDbConnection() : Promise<any> {
    const dbcon = await mysql.createConnection({
        host: this.config.mysql.db_hostname,
        port: this.config.mysql.db_port,
        user: this.config.mysql.db_username,
        password: this.config.mysql.db_password,
        database: this.config.mysql.db_name
    });
    return new Promise((res)=> { res(dbcon); });
}


export function getAll() {

}

/*
export function getAllFaq() : Promise<Faq[]> {
	return new Promise((resolve, reject): void => { 
		dbcon.query('SELECT * FROM faq', (err : any, rows : any) => {
		  if(err) {
			console.log(err);
			resolve([]);
		  }
		  if(rows.length>0) 
			  resolve(<Faq[]>rows);
		  resolve([]);
		});
    });
}
*/