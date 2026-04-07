export class BaseRepository {
    db;

    constructor(drizzleWrapper) {
		if (!drizzleWrapper) {
			throw new Error("Drizzle wrapper is required");
		}
		
        this.db = drizzleWrapper;
    }

    merge_table(rows) {
        if (!Array.isArray(rows)) return rows;

        return rows.map(row => {
            const merged = {};
            
            Object.values(row).forEach(val => {
                if (val && typeof val === 'object') {
                    Object.assign(merged, val);
                }
            });

            return merged;
        });
    }
}

export default BaseRepository;