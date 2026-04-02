import { eq, sql } from 'drizzle-orm';
import { domains as t } from './schema';
import { CommonDao } from './common-dao';

export class Domains extends CommonDao {
    static getInstance(drizzleWrapper) {
        const key = `Domains_${drizzleWrapper.constructor.name}`;

        if (!CommonDao.instances.has(key)) {
            // ⭐️ 부모(CommonDao)가 아니라 나(Domains)를 직접 생성!
            // 이렇게 해야 updateHitCount 메서드가 포함된 객체가 Map에 저장돼.
            CommonDao.instances.set(key, new Domains(drizzleWrapper, t));
        }

        return CommonDao.instances.get(key);
    }

    updateHitCount(domain) {
        return this.db.update(t).set({ hit_count: sql`${t.hit_count} + 1` }).where(eq(t.domain, domain)).run();
    }

    upsertHitCount(domain) {
        return this.db.insert(this.table)
            .values({
                domain: domain,
                hit_count: 1
            })
            .onConflictDoUpdate({
                target: this.table.domain, // 충돌 지점 (UNIQUE 인덱스)
                set: {
                    hit_count: sql`${this.table.hit_count} + 1`
                }
            }).run();
    }
}

export default Domains;