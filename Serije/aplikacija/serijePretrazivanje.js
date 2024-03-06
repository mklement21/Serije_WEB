const portRest = 12000;
const url = "http://localhost:" + portRest + "/api";
const kodovi = require("./moduli/kodovi.js");
class SerijeZanroviPretrazivanje {
	async dohvatiSerije(stranica, kljucnaRijec = "") {
		let putanja =
			url + "/tmdb/serije?stranica=" + stranica + "&trazi=" + kljucnaRijec;
		console.log(putanja);
		let odgovor = await fetch(putanja);
		let podaci = await odgovor.text();
		let serije = JSON.parse(podaci);
		console.log(serije);
		return serije;
	}
}

module.exports = SerijeZanroviPretrazivanje;
