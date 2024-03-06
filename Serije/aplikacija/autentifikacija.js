const mail = require("./moduli/mail.js");
const kodovi = require("./moduli/kodovi.js");
const portRest = 12000;
class Autentifikacija {
	async dodajKorisnika(korisnik) {
		let tijelo = {
			ime: korisnik.ime,
			prezime: korisnik.prezime,
			lozinka: kodovi.kreirajSHA256(korisnik.lozinka, "moja sol"),
			email: korisnik.email,
			korime: korisnik.korime,
			spol: korisnik.spol,
			datum_rodenja: korisnik.datum_rodenja,
			telefon: korisnik.telefon,
		};

		let aktivacijskiKod = kodovi.dajNasumceBroj(10000, 99999);
		tijelo["aktivacijskiKod"] = aktivacijskiKod;

		let zaglavlje = new Headers();
		zaglavlje.set("Content-Type", "application/json");

		let parametri = {
			method: "POST",
			body: JSON.stringify(tijelo),
			headers: zaglavlje,
		};
		let odgovor = await fetch(
			"http://localhost:" + portRest + "/baza/korisnici",
			parametri
		);

		if (odgovor.status == 200) {
			console.log("Korisnik ubačen na servisu");
			let mailPoruka =
				"aktivacijski kod:" +
				aktivacijskiKod +
				" http://localhost:12000/aktivacijaRacuna?korime=" +
				korisnik.korime +
				"&kod=" +
				aktivacijskiKod;
			mailPoruka;
			let poruka = await mail.posaljiMail(
				"rwa@foi.hr",
				korisnik.email,
				"Aktivacijski kod",
				mailPoruka
			);
			return true;
		} else {
			console.log(odgovor.status);
			console.log(await odgovor.text());
			return false;
		}
	}

	async aktivirajKorisnickiRacun(korime, kod) {
		let zaglavlje = new Headers();
		zaglavlje.set("Content-Type", "application/json");
		let parametri = {
			method: "PUT",
			body: JSON.stringify({ aktivacijskiKod: kod }),
			headers: zaglavlje,
		};
		return await fetch(
			"http://localhost:" + portRest + "/baza/korisnici/" + korime + "/aktivacija", parametri
		);
	}

	async prijaviKorisnika(zahtjev, korime, lozinka) {
		console.log("Prijava: " + korime + " " + lozinka);
		lozinka = kodovi.kreirajSHA256(lozinka, "moja sol");
		let tijelo = {
			lozinka: lozinka,
		};
		let zaglavlje = new Headers();
		zaglavlje.set("Content-Type", "application/json");

		let parametri = {
			method: "POST",
			body: JSON.stringify(tijelo),
			headers: zaglavlje,
		};
		let odgovor = await fetch(
			"http://localhost:" + portRest + "/baza/korisnici/" + korime + "/prijava",
			parametri
		);

		if (odgovor.status == 200) {
			zahtjev.session.korisnik = {
				korime: korime,
			};
			return await odgovor.text();
		} else {
			return false;
		}
	}
}

module.exports = Autentifikacija;
