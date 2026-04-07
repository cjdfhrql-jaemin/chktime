
import { BaseRepository } from './base-repository';
import { mysqlTable, text, int } from "drizzle-orm/mysql-core";
import { eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/mysql2';

const tables = {
    g5_write_development: mysqlTable("g5_write_development", {
        id: int("wr_id").primaryKey().autoincrement(),
        title: text("wr_subject").notNull(),
        content: text("wr_content"),
        pubDate: text("wr_datetime").notNull(),
        hit_count: int("wr_hit").default(0)
    }),
    g5_write_dev_manual: mysqlTable("g5_write_dev_manual", {
        id: int("wr_id").primaryKey().autoincrement(),
        title: text("wr_subject").notNull(),
        content: text("wr_content"),
        pubDate: text("wr_datetime").notNull(),
        hit_count: int("wr_hit").default(0)
    }),
    g5_board_file: mysqlTable("g5_board_file", {
        bo_table: text("bo_table").notNull(),
        wr_id: int("wr_id").notNull(),
        source: text("bf_source").notNull(),
        file: text("bf_file")
    })
}

/**
 * @typedef {import('drizzle-orm/mysql2').MySqlDatabase<any, any>} DrizzleInstance
 */
export class Feeds extends BaseRepository {

    /**
     * @param {DrizzleInstance}
     */
    db;
    constructor(db) {
        const drizzleWrapper = drizzle(db);
        super(drizzleWrapper);
        this.db = drizzleWrapper;
    }

    async getFeeds({ table = 'g5_write_development', limit = 10, id = null }) {

        // join 테이블들의 정보를 합쳐서 가져오기
        let query = this.db.select().from(tables[table]).leftJoin(tables.g5_board_file, eq(tables[table].id, tables.g5_board_file.wr_id)).limit(limit);

        if (id) {
            query = query.where(eq(tables[table].id, id));
        }

        const rows = await query.execute();
        return this.merge_table(rows);
    }
}

export default Feeds;