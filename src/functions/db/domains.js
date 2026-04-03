import { sql } from 'drizzle-orm';
import { CommonDao } from './common-dao';

import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

// 1. D1(SQLite) 전용 테이블
const tb_chktime_domain = sqliteTable("tb_chktime_domain", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    domain: text("domain").notNull().unique(),
    hit_count: integer("hit_count").default(0),
    search_date: text("search_date").$defaultFn(() => new Date().toISOString())
});

/**
 * @typedef {import('drizzle-orm/d1').DrizzleD1Database} DrizzleInstance
 */
export class Domains extends CommonDao {

    constructor(drizzleWrapper) {
        super(drizzleWrapper, tb_chktime_domain);
    }
    
    upsertHitCount(domain) {
        return this.db.insert(this.table)
            .values({
                domain: domain,
                hit_count: 1
            })
            .onConflictDoUpdate({
                target: this.table.domain,
                set: {
                    hit_count: sql`${this.table.hit_count} + 1`
                }
            }).run();
    }
}

export default Domains;