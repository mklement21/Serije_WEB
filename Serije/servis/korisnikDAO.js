const Baza = require("./baza.js");
const path = require("path");

class KorisnikDAO {
	constructor() {
		this.baza = new Baza("./dokumentacija/SerijeSQL.sqlite");
	}

	dajSve = async function () {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik";
		var podaci = await this.baza.izvrsiUpit(sql, []);
		this.baza.zatvoriVezu();
		return podaci;
	};

	daj = async function (korime) {
		this.baza.spojiSeNaBazu();
		let sql = "SELECT * FROM korisnik WHERE korime=?;";
		var podaci = await this.baza.izvrsiUpit(sql, [korime]);
		this.baza.zatvoriVezu();
		return podaci.length === 1 ? podaci[0] : null;
	};

	dodaj = async function (korisnik) {
		console.log(korisnik);
		let sql = `
			INSERT INTO korisnik (ime, prezime, korime, email, lozinka, slika, spol, datum_rodenja, telefon, opis, br_favorita, uloga_id)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
		`;
		let podaci = [
			korisnik.ime,
			korisnik.prezime,
			korisnik.korime,
			korisnik.email,
			korisnik.lozinka,
			korisnik.slika || null,
			korisnik.spol || null,
			korisnik.datum_rodenja || null,
			korisnik.telefon || null,
			korisnik.opis || null,
			korisnik.br_favorita || null,
			3,
		];

		try {
			await this.baza.izvrsiUpit(sql, podaci);
			return { opis: "Uspješno dodan korisnik." };
		} catch (error) {
			console.error(error);
			throw { opis: "Greška prilikom dodavanja korisnika." };
		}
	};

	obrisi = async function (korime) {
		try {
			this.baza.spojiSeNaBazu();

			let sql = `DELETE FROM korisnik WHERE korime=?`;
			let podaci = [korime];

			let result = await this.baza.izvrsiUpit(sql, podaci);

			if (result && result.changes > 0) {
				return true;
			} else {
				return false;
			}
		} catch (error) {
			console.error(error);
			return false;
		} finally {
			this.baza.zatvoriVezu();
		}
	};

	azuriraj = async function (korime, korisnik) {
		let sql = `UPDATE korisnik SET ime=?, prezime=?, lozinka=?, slika=?, opis=?, email=?, uloga_id=? WHERE korime=?`;
		let podaci = [
			korisnik.ime,
			korisnik.prezime,
			korisnik.lozinka,
			korisnik.slika,
			korisnik.opis,
			korisnik.email,
			korisnik.uloga_id,
			korime,
		];

		try {
			await this.baza.izvrsiUpit(sql, podaci);
			return true;
		} catch (error) {
			console.error(error);
			return false;
		}
	};
}

module.exports = KorisnikDAO;
