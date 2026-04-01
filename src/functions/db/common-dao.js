import { eq,desc,asc,and } from 'drizzle-orm';

export class CommonDao {
    static instances = new Map();

    static getInstance() {
        throw new Error("getInstance()는 자식 클래스에서 구현");
    }
    
    constructor(drizzleWrapper, table) {
        this.db = drizzleWrapper; 
        this.table = table;
    }
    
    async getList({ columns = {}, wheres = {}, orders = {}, groups = [], limit = 10 }) {

        let query = Object.keys(columns).length > 0
            ? this.db.select(columns).from(this.table)
            : this.db.select().from(this.table);

        // WHERE 절
        const whereConditions = Object.entries(wheres).map(([key, value]) => {
            return eq(this.table[key], value);
        });
        
        if (whereConditions.length > 0) {
            query = query.where(and(...whereConditions));
        }

        // GROUP BY 절 (groups가 배열이어야 함)
        if (groups.length > 0) {
            const groupByFields = groups.map(key => this.table[key]);
            query = query.groupBy(...groupByFields);
        }

        // ORDER BY 절
        const orderByFields = Object.entries(orders).map(([key, direction]) => {
            const column = this.table[key];
            return direction.toLowerCase() === 'desc' ? desc(column) : asc(column);
        });
        
        if (orderByFields.length > 0) {
            query = query.orderBy(...orderByFields);
        }

        return await query.limit(limit).all();
    }

    // 공통: 단일 조회 (id 기준)
    async getDataById(id) {
        return await this.db.select().from(this.table).where(eq(this.table.id, id)).get();
    }

    // 3. 삽입
    async insert(data) {
        return await this.db.insert(this.table).values(data).run();
    }

    // 4. 수정
    async update(data, idKey = 'id') {
        return await this.db.update(this.table)
            .set(data)
            .where(eq(this.table[idKey], data[idKey]))
            .run();
    }
}