import { sql } from 'drizzle-orm';
import { domains as t } from './schema';
import { CommonDao } from './common-dao';


/**
 * @typedef {import('drizzle-orm/d1').DrizzleD1Database} DrizzleInstance
 */
export class Domains extends CommonDao {

    constructor(drizzleWrapper) {
        super(drizzleWrapper, t);
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