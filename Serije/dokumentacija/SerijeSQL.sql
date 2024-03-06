
BEGIN TRANSACTION;
CREATE TABLE IF NOT EXISTS "uloga"(
  "id" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "naziv" VARCHAR(45) NOT NULL,
  "opis" TEXT,
  CONSTRAINT "opis_UNIQUE"
    UNIQUE("opis")
);
INSERT INTO uloga VALUES(1,'admin','administrator');
INSERT INTO uloga VALUES(2,'moderator','moderator');
INSERT INTO uloga VALUES(3,'korisnik','registrirani korisnik');
CREATE TABLE IF NOT EXISTS "serija"(
  "id_serija" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "tmdb_id_ser" INTEGER NOT NULL,
  "naziv" VARCHAR(100) NOT NULL,
  "opis" TEXT,
  "popularnost" REAL, 
  "poveznica" VARCHAR(100),
  "slika" TEXT,
  "br_epizoda_serija" INTEGER,
  "br_sezona" INTEGER
);
INSERT INTO serija VALUES(1,1234,'Serija 1','Opis serije 1',80.500000000000000001,'poveznica1','slika1.jpg',10,2);
INSERT INTO serija VALUES(2,5678,'Serija 2','Opis serije 2',95.299999999999997161,'poveznica2','slika2.jpg',12,3);
INSERT INTO serija VALUES(3,9876,'Serija 3','Opis serije 3',70.20000000000000284,'poveznica3','slika3.jpg',8,2);
CREATE TABLE IF NOT EXISTS "sezona"(
  "id_sezona" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL, 
  "naziv" VARCHAR(100) NOT NULL,
  "tmdb_id_sez" INTEGER NOT NULL,
  "opis" TEXT,
  "slika" TEXT,
  "br_sezone" INTEGER,
  "br_epizoda_sezona" INTEGER,
  "serija_id_serija" INTEGER NOT NULL,
  CONSTRAINT "fk_sezona_serije1"
    FOREIGN KEY("serija_id_serija")
    REFERENCES "serija"("id_serija")
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);
INSERT INTO sezona VALUES(1,'Sezona 1',101,'Opis sezone 1','slika_sezona1.jpg',2,5,1);
INSERT INTO sezona VALUES(2,'Sezona 2',202,'Opis sezone 2','slika_sezona2.jpg',3,7,1);
INSERT INTO sezona VALUES(3,'Sezona 1',303,'Opis sezone 1','slika_sezona3.jpg',2,6,2);
INSERT INTO sezona VALUES(4,'Sezona 3',404,'Opis sezone 3','slika_sezona4.jpg',3,8,2);
CREATE TABLE IF NOT EXISTS "korisnik"(
  "id_korisnik" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "ime" VARCHAR(50),
  "prezime" VARCHAR(100),
  "korime" VARCHAR(50) NOT NULL,
  "email" VARCHAR(100) NOT NULL,
  "lozinka" VARCHAR(50) NOT NULL,
  "slika" TEXT,
  "spol" VARCHAR(10), 
  "datum_rodenja" DATE,
  "telefon" VARCHAR(20),  
  "opis" TEXT,
  "br_favorita" INTEGER,
  "uloga_id" INTEGER NOT NULL DEFAULT 3,
  CONSTRAINT "korime_UNIQUE"
    UNIQUE("korime"),
  CONSTRAINT "email_UNIQUE"
    UNIQUE("email"),
  CONSTRAINT "fk_korisnici_uloga"
    FOREIGN KEY("uloga_id")
    REFERENCES "uloga"("id")
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);
INSERT INTO korisnik VALUES(1,'Maja','Kos','obican','mkos@foi.hr','2317c5cc4e67b0cb5f55b26fdcf5fe0a24012503ae99d22b26f3c866d281be2b', 'Ženski', '3.3.2023', '0956543456', NULL, NULL,NULL,3);
INSERT INTO korisnik VALUES(2,'Sara','Majer','moderator','smajer@foi.hr','2317c5cc4e67b0cb5f55b26fdcf5fe0a24012503ae99d22b26f3c866d281be2b', 'Ženski', '3.3.2023', '0956543456', NULL,NULL,NULL,2);
INSERT INTO korisnik VALUES(3,'Matea','Klement','admin','mklemenet21@foi.hr','2317c5cc4e67b0cb5f55b26fdcf5fe0a24012503ae99d22b26f3c866d281be2b', 'Ženski', '3.3.2023', '0956543456', NULL,NULL,NULL,1);
CREATE TABLE IF NOT EXISTS "dnevnik"(
  "id_dnevnik" INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
  "datum_vrijeme" DATETIME,
  "metode" VARCHAR(45),
  "korisnik_id_korisnik" INTEGER NOT NULL,
  CONSTRAINT "fk_dnevnik_korisnik1"
    FOREIGN KEY("korisnik_id_korisnik")
    REFERENCES "korisnik"("id_korisnik")
    ON DELETE RESTRICT
    ON UPDATE RESTRICT
);
INSERT INTO dnevnik VALUES(1,'2023-10-27 15:30:00','GET /baza/v1/sadrzaj',2);
INSERT INTO dnevnik VALUES(2,'2023-10-27 16:45:00','POST /baza/v1/komentari',1);
CREATE TABLE IF NOT EXISTS "favoriti"(
  "korisnik_id_korisnik" INTEGER NOT NULL,
  "serija_id_serija" INTEGER NOT NULL,
  CONSTRAINT "fk_korisnik_has_serija_korisnik1"
    FOREIGN KEY("korisnik_id_korisnik")
    REFERENCES "korisnik"("id_korisnik")
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT "fk_korisnik_has_serija_serija1"
    FOREIGN KEY("serija_id_serija")
    REFERENCES "serija"("id_serija")
);
INSERT INTO favoriti VALUES(2,1);
INSERT INTO favoriti VALUES(2,2);
INSERT INTO favoriti VALUES(3,1);
DELETE FROM sqlite_sequence;
INSERT INTO sqlite_sequence VALUES('korisnik',3);
INSERT INTO sqlite_sequence VALUES('dnevnik',2);
INSERT INTO sqlite_sequence VALUES('serija',3);
INSERT INTO sqlite_sequence VALUES('sezona',4);
INSERT INTO sqlite_sequence VALUES('uloga',3);
CREATE INDEX "sezona.fk_sezona_serije1_idx" ON "sezona" ("serija_id_serija");
CREATE INDEX "korisnik.fk_korisnici_uloga_idx" ON "korisnik" ("uloga_id");
CREATE INDEX "dnevnik.fk_dnevnik_korisnik1_idx" ON "dnevnik" ("korisnik_id_korisnik");
CREATE INDEX "favoriti.fk_korisnik_has_serija_serija1_idx" ON "favoriti" ("serija_id_serija");
CREATE INDEX "favoriti.fk_korisnik_has_serija_korisnik1_idx" ON "favoriti" ("korisnik_id_korisnik");
COMMIT;
