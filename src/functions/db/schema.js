// 🚀 D1용(SQLite)과 MySQL용 임포트를 각각 가져와!
import { sqliteTable, text as sqliteText, integer } from "drizzle-orm/sqlite-core";
import { mysqlTable, text as mysqlText, int } from "drizzle-orm/mysql-core";

// 1. D1(SQLite) 전용 테이블
export const domains = sqliteTable("tb_chktime_domain", {
    id: integer("id").primaryKey({ autoIncrement: true }),
    domain: sqliteText("domain").notNull(),
    hit_count: integer("hit_count").default(0),
    search_date: sqliteText("search_date").$defaultFn(() => new Date().toISOString())
});

// 2. MySQL(Hyperdrive) 전용 테이블
export const feeds = mysqlTable("g5_write_development", {
    // MySQL은 .autoincrement() 문법
    id: int("wr_id").primaryKey().autoincrement(), 
    title: mysqlText("wr_subject").notNull(),
    content: mysqlText("wr_content"),
    pubDate: mysqlText("wr_datetime").notNull(),
    hit_count: int("wr_hit").default(0)
});