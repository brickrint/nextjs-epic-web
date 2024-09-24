-- CreateTable
CREATE TABLE "Permission" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "access" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO Permission VALUES('cm1glsufl0000p66t7ox5jq5s','create','user','own','',1727192469009,1727192469009);
INSERT INTO Permission VALUES('cm1glsufo0001p66t1mws89a1','create','user','any','',1727192469013,1727192469013);
INSERT INTO Permission VALUES('cm1glsufp0002p66t6yqf6ijh','read','user','own','',1727192469014,1727192469014);
INSERT INTO Permission VALUES('cm1glsufq0003p66tuj4w8dkz','read','user','any','',1727192469015,1727192469015);
INSERT INTO Permission VALUES('cm1glsufr0004p66t74inj0bh','update','user','own','',1727192469016,1727192469016);
INSERT INTO Permission VALUES('cm1glsufs0005p66thtpkpw3z','update','user','any','',1727192469016,1727192469016);
INSERT INTO Permission VALUES('cm1glsufs0006p66tkkf5npw0','delete','user','own','',1727192469017,1727192469017);
INSERT INTO Permission VALUES('cm1glsuft0007p66tw2tec55m','delete','user','any','',1727192469018,1727192469018);
INSERT INTO Permission VALUES('cm1glsufu0008p66twp4iiknu','create','note','own','',1727192469019,1727192469019);
INSERT INTO Permission VALUES('cm1glsufv0009p66tara268ir','create','note','any','',1727192469020,1727192469020);
INSERT INTO Permission VALUES('cm1glsufw000ap66t80anwk1u','read','note','own','',1727192469020,1727192469020);
INSERT INTO Permission VALUES('cm1glsufx000bp66tbj3si3nr','read','note','any','',1727192469021,1727192469021);
INSERT INTO Permission VALUES('cm1glsufy000cp66ts9q5iyh6','update','note','own','',1727192469022,1727192469022);
INSERT INTO Permission VALUES('cm1glsufz000dp66t6b0vzgfh','update','note','any','',1727192469023,1727192469023);
INSERT INTO Permission VALUES('cm1glsufz000ep66t2esu5csc','delete','note','own','',1727192469024,1727192469024);
INSERT INTO Permission VALUES('cm1glsug0000fp66tpgomvksf','delete','note','any','',1727192469025,1727192469025);

-- CreateTable
CREATE TABLE "Role" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

INSERT INTO Role VALUES('cm1glsug3000gp66tlifx1bt7','admin','',1727192469028,1727192469028);
INSERT INTO Role VALUES('cm1glsug5000hp66ts7f1y2kb','user','',1727192469029,1727192469029);

-- CreateTable
CREATE TABLE "_PermissionToRole" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_PermissionToRole_A_fkey" FOREIGN KEY ("A") REFERENCES "Permission" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_PermissionToRole_B_fkey" FOREIGN KEY ("B") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO _PermissionToRole VALUES('cm1glsufo0001p66t1mws89a1','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufq0003p66tuj4w8dkz','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufs0005p66thtpkpw3z','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsuft0007p66tw2tec55m','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufv0009p66tara268ir','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufx000bp66tbj3si3nr','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufz000dp66t6b0vzgfh','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsug0000fp66tpgomvksf','cm1glsug3000gp66tlifx1bt7');
INSERT INTO _PermissionToRole VALUES('cm1glsufl0000p66t7ox5jq5s','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufp0002p66t6yqf6ijh','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufr0004p66t74inj0bh','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufs0006p66tkkf5npw0','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufu0008p66twp4iiknu','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufw000ap66t80anwk1u','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufy000cp66ts9q5iyh6','cm1glsug5000hp66ts7f1y2kb');
INSERT INTO _PermissionToRole VALUES('cm1glsufz000ep66t2esu5csc','cm1glsug5000hp66ts7f1y2kb');

-- CreateTable
CREATE TABLE "_RoleToUser" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,
    CONSTRAINT "_RoleToUser_A_fkey" FOREIGN KEY ("A") REFERENCES "Role" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoleToUser_B_fkey" FOREIGN KEY ("B") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_action_entity_access_key" ON "Permission"("action", "entity", "access");

-- CreateIndex
CREATE UNIQUE INDEX "_PermissionToRole_AB_unique" ON "_PermissionToRole"("A", "B");

-- CreateIndex
CREATE INDEX "_PermissionToRole_B_index" ON "_PermissionToRole"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_RoleToUser_AB_unique" ON "_RoleToUser"("A", "B");

-- CreateIndex
CREATE INDEX "_RoleToUser_B_index" ON "_RoleToUser"("B");
