import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const domains = sqliteTable("tb_chktime_domain", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    domain: text("domain").notNull(),
	hit_count: integer("hit_count").default(0),
	search_date: text("search_date").$defaultFn(() => new Date().toISOString())
})