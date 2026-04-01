import { eq, sql } from 'drizzle-orm';
import { domains as t } from './schema';
import { CommonDao } from './common-dao';

export class Domains extends CommonDao {
    constructor(db) {
        super(db, t);
    }

    async updateHitCount(domain) {
        return await this.db.update(t).set({ hit_count: sql`${t.hit_count} + 1` }).where(eq(t.domain, domain)).run();
    }
}

export default Domains;