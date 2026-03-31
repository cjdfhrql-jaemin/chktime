-- auto formatted
PRAGMA defer_foreign_keys=TRUE;
DROP TABLE IF EXISTS tb_chktime_domain;
CREATE TABLE tb_chktime_domain (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    domain TEXT UNIQUE NOT NULL,
    hit INTEGER DEFAULT 0,
    reg_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
DELETE FROM sqlite_sequence;
