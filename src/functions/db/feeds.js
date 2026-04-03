import { CommonDao } from './common-dao';
import { feeds as t } from './schema';

/**
 * @typedef {import('drizzle-orm/mysql2').MySqlDatabase<any, any>} DrizzleInstance
 */
export class Feeds extends CommonDao {

    constructor(drizzleWrapper) {
        super(drizzleWrapper, t);
    }
}

export default Feeds;