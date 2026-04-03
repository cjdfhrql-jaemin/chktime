import { CommonDao } from './common-dao';
import { mysqlTable, text as mysqlText, int } from "drizzle-orm/mysql-core";


// 2. MySQL(Hyperdrive) 전용 테이블
const g5_write_development = mysqlTable("g5_write_development", {
    // MySQL은 .autoincrement() 문법
    id: int("wr_id").primaryKey().autoincrement(), 
    title: mysqlText("wr_subject").notNull(),
    content: mysqlText("wr_content"),
    pubDate: mysqlText("wr_datetime").notNull(),
    hit_count: int("wr_hit").default(0)
});

/**
 * @typedef {import('drizzle-orm/mysql2').MySqlDatabase<any, any>} DrizzleInstance
 */
export class Feeds extends CommonDao {

    constructor(drizzleWrapper) {
        super(drizzleWrapper, g5_write_development);
    }
}

export default Feeds;