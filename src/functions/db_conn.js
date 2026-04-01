import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";

let db = null;

export const getConnection = async (env) => {
    // 1. 인스턴스 재사용 (싱글톤)
    if (db) {
        return db;
    }
    
    // 2. Hyperdrive 연결 문자열 (로컬/서버 공통)
    const connectionString = env.HH_DB.connectionString;

    // 3. Pool 생성 (여기가 핵심 포인트!!!)
    const pool = mysql.createPool({
        uri: connectionString,
        disableEval: true, // 🔥 Cloudflare 공식 해결책: Worker 환경에서 eval() 에러를 막는 유일한 키
        waitForConnections: true,
        connectionLimit: 5,
        maxIdle: 2
    });

    // 4. Drizzle 인스턴스 생성
    db = drizzle(pool);

    return db;
};