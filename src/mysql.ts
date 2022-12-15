import mariadb from 'mariadb';
import { readFileSync } from 'fs';

import YAML from 'yaml';
const { mysql } = YAML.parse(readFileSync('./config.yml', 'utf8'));

export default async () => {
	// Create a connection to the database
	const con = await mariadb.createConnection(mysql);

	// createData function
	const createData = async (table: string, body: any) => {
		const bodykeys = Object.keys(body);
		const bodyvalues = Object.values(body);
		const VALUES = bodyvalues.map(v => { return v === null ? 'NULL' : `'${v}'`; }).join(', ');
		try {
			await db.con.query(`INSERT INTO ${table} (${bodykeys.join(', ')}) VALUES (${VALUES})`);
			console.log(`Created ${table}: ${JSON.stringify(body)}`);
		}
		catch (err) {
			console.error(`Error creating ${table}: ${err}`);
		}
	};

	// delData function
	const delData = async (table: string, where: any) => {
		const wherekeys = Object.keys(where);
		const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
		try {
			await db.con.query(`DELETE FROM ${table} WHERE ${WHERE}`);
			console.log(`${table} deleted where ${JSON.stringify(where)}!`);
		}
		catch (err) {
			console.error(`Error deleting ${table} where ${JSON.stringify(where)}: ${err}`);
		}
	};

	// getData function
	const getData = async (table: string, where: any, options: any = {}) => {
		const wherekeys = where ? Object.keys(where) : null;
		const WHERE = wherekeys ? wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ') : null;
		let data = await db.con.query(`SELECT * FROM ${table}${WHERE ? ` WHERE ${WHERE}` : ''}`);
		if (where && !options.nocreate && !data[0]) {
			await db.createData(table, where);
			data = await db.getData(table, where, { nocreate: true, all: true });
		}
		return options.all ? data : data[0];
	};

	// setData function
	const setData = async (table: string, where: any, body: any) => {
		const wherekeys = Object.keys(where);
		const WHERE = wherekeys.map(k => { return `${k} = ${where[k] === null ? 'NULL' : `'${where[k]}'`}`; }).join(' AND ');
		const bodykeys = Object.keys(body);
		const SET = bodykeys.map(k => { return `${k} = ${body[k] === null ? 'NULL' : `'${body[k]}'`}`; }).join(', ');
		const data = await db.con.query(`SELECT * FROM ${table} WHERE ${WHERE}`);
		console.log(`Set ${table} where ${JSON.stringify(where)} to ${JSON.stringify(body)}`);
		if (!data[0]) await db.createData(table, where);
		db.con.query(`UPDATE ${table} SET ${SET} WHERE ${WHERE}`);
	};

    global.db = { con, createData, delData, getData, setData };

	// Log
	console.log('MySQL database loaded');
};
