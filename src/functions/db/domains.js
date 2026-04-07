import { sql, desc, asc } from 'drizzle-orm';
import { BaseRepository } from './base-repository';
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { drizzle } from 'drizzle-orm/d1';

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
export class Domains extends BaseRepository {

    /**
     * @param {DrizzleInstance}
     */
    db;
    constructor(db) {
        const drizzleWrapper = drizzle(db);
        super(drizzleWrapper);
        this.db = drizzleWrapper;
    }

    getList({ orders = { hit_count: 'desc' }, limit = 10 } = {}) {
        // 🚀 1. 객체를 Drizzle 정렬 함수로 변환하는 로직
        const orderFields = Object.entries(orders).map(([column, direction]) => {
            const targetColumn = tb_chktime_domain[column]; // 스키마에서 컬럼 찾기
            return direction.toLowerCase() === 'desc'
                ? desc(targetColumn)
                : asc(targetColumn);
        });

        // 🚀 2. 변환된 배열을 orderBy에 흩뿌리기(...연산자)
        return this.db.select()
            .from(tb_chktime_domain)
            .orderBy(...orderFields) // 여러 개 정렬도 가능해짐!
            .limit(limit)
            .all();
    }

    upsertHitCount(domain) {
        return this.db.insert(tb_chktime_domain)
            .values({
                domain: domain,
                hit_count: 1
            })
            .onConflictDoUpdate({
                target: tb_chktime_domain.domain,
                set: {
                    hit_count: sql`${tb_chktime_domain.hit_count} + 1`
                }
            }).run();
    }
}

export default Domains;