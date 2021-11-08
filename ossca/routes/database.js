const mysql = require("mysql2/promise");
//import mysql from "mysql2/promise";
const config = require("./config");

const pool = mysql.createPool(config.db_info);
const DB = async (type, sql, params) => {
  try {
    let result = {}; // state는 쿼리문 실행 성공시 true, 실패시 false
    const connection = await pool.getConnection(async (conn) => conn);
    // 함수에 async 선언해 비동기로 동작되도록
    try {
      const [rows] = await connection.query(sql, params);
      if (type == "GET") result["row"] = rows;
      result["state"] = true;
      connection.release(); // 사용된 풀 반환
      return result;
    } catch (err) {
      console.log("Query Error");
      result["state"] = false;
      result["error"] = err;
      connection.release();
      return result;
    }
  } catch (err) {
    console.log("DB Error");
    result["state"] = false;
    result["error"] = err;
    return result;
  }
};
module.exports = DB;
