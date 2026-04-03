import { eq, desc, asc, and } from 'drizzle-orm';

/**
 * @typedef {import('drizzle-orm/d1').DrizzleD1Database | import('drizzle-orm/mysql2').MySqlDatabase<any, any>} DrizzleInstance
 */
export class CommonDao {
    // ⚠️ 서버리스 환경 원칙 1: 싱글톤(Map)은 쓰지 않는다! (삭제 완료)
    
    /** @type {DrizzleInstance} */
    db;
    table;

    constructor(drizzleWrapper, table) {
        this.db = drizzleWrapper;
        this.table = table;
    }

    // 🚀 [핵심 1] 모든 DB 엔진을 포용하는 범용 실행기
    async #execute(query, type = 'fetch') {
        try {
            if (type === 'fetch') {
                // D1(SQLite) 최적화 경로
                if (typeof query.all === 'function') {
                    return await query.all();
                }
                // Hyperdrive(MySQL) 최적화 경로: 메타데이터 버리고 순수 rows만 추출
                const res = await query.execute();
                return Array.isArray(res) && Array.isArray(res[0]) ? res[0] : res;
            } else {
                // CUD (Create, Update, Delete) 경로
                if (typeof query.run === 'function') {
                    return await query.run(); // D1
                }
                const res = await query.execute(); // MySQL
                return Array.isArray(res) ? res[0] : res;
            }
        } catch (e) {
            console.error(`❌ [CommonDao] DB Execution Error:`, e.message);
            throw e; // 호출부(Route)로 에러를 던져서 500 응답을 할 수 있게 함
        }
    }

    // 🚀 [핵심 2] 외부에서 커넥션을 수동으로 안전하게 닫을 수 있는 생명줄
    async destroy() {
        try {
            const client = this.db?.session?.client;
            if (client && typeof client.end === 'function') {
                await client.end();
            }
        } catch (e) {
            console.error(`⚠️ [CommonDao] Failed to close pool:`, e.message);
        }
    }

    // ==========================================
    // 🛠️ CRUD 메서드 (수정할 필요 없이 완벽함)
    // ==========================================

    async select({ columns = {}, wheres = {}, orders = {}, groups = [], limit = 10 }) {
        let query = Object.keys(columns).length > 0
            ? this.db.select(columns).from(this.table)
            : this.db.select().from(this.table);

        const whereConditions = Object.entries(wheres).map(([k, v]) => eq(this.table[k], v));
        if (whereConditions.length > 0) query = query.where(and(...whereConditions));

        if (groups.length > 0) query = query.groupBy(...groups.map(col => this.table[col]));

        const orderByFields = Object.entries(orders).map(([k, d]) =>
            d.toLowerCase() === 'desc' ? desc(this.table[k]) : asc(this.table[k])
        );
        if (orderByFields.length > 0) query = query.orderBy(...orderByFields);

        return await this.#execute(query.limit(limit));
    }

    async getDataById(id, idKey = 'id') {
        const query = this.db.select().from(this.table).where(eq(this.table[idKey], id)).limit(1);
        const results = await this.#execute(query);
        return results && results.length > 0 ? results[0] : null;
    }

    async insert(data) {
        return await this.#execute(this.db.insert(this.table).values(data), 'run');
    }

    async update(data, idKey = 'id') {
        const query = this.db.update(this.table).set(data).where(eq(this.table[idKey], data[idKey]));
        return await this.#execute(query, 'run');
    }

    async delete(wheres = {}) {
        if (Object.keys(wheres).length === 0) throw new Error("⚠️ 전체 삭제(Delete All) 방지 트리거 작동!");
        const conditions = Object.entries(wheres).map(([k, v]) => eq(this.table[k], v));
        return await this.#execute(this.db.delete(this.table).where(and(...conditions)), 'run');
    }
}