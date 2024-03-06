import express from "express";
import kolacici from "cookie-parser";
import sesija from "express-session";
import Konfiguracija from "./konfiguracija.js";
import restKorisnik from "./servis/restKorisnik.js";
import RestTMDB from "./servis/restTMDB.js";
import HtmlUpravitelj from "./aplikacija/htmlUpravitelj.js";
import FetchUpravitelj from "./aplikacija/fetchUpravitelj.js";

const port = 12000;
const server = express();

let konf = new Konfiguracija();
konf
	.ucitajKonfiguraciju()
	.then(pokreniServer)
	.catch((greska) => {
		console.log(greska);
		if (process.argv.length == 2) {
			console.error("Molim unesite naziv datoteke!");
		} else {
			console.error("Naziv datoteke nije dobar: " + greska.path);
		}
	});

function pokreniServer() {
	server.use(express.urlencoded({ extended: true }));
	server.use(express.json());

	server.use(kolacici());
	server.use(
		sesija({
			secret: konf.dajKonf().tajniKljucSesija,
			saveUninitialized: true,
			cookie: { maxAge: 1000 * 60 * 60 * 3 },
			resave: false,
		})
	);

	server.use("/js", express.static("./aplikacija/js"));
	server.use("/css", express.static("./aplikacija/css"));

	pripremiPutanjeKorisnik();
	pripremiPutanjeTMDB();
	pripremiPutanjePocetna();
	pripremiPutanjePretrazivanjeSerija();
	pripremiPutanjeAutentifikacija();
	pripremiPutanjeProfil();

	server.use((zahtjev, odgovor) => {
		odgovor.status(404);
		odgovor.json({ opis: "nema resursa" });
	});
	server.listen(port, () => {
		console.log(`Server pokrenut na portu: ${port}`);
	});

	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);

	server.use((zahtjev, odgovor, next) => {
    fetchUpravitelj.provjeriAutorizaciju(zahtjev, odgovor, next);
});

function pripremiPutanjeKorisnik() {
	server.get("/baza/korisnici", restKorisnik.getKorisnici);
	server.post("/baza/korisnici", restKorisnik.postKorisnici);
	server.put("/baza/korisnici", restKorisnik.putKorisnici);
	server.delete("/baza/korisnici", restKorisnik.deleteKorisnici);

	server.get("/baza/korisnici/:korime", restKorisnik.getKorisnik);
	server.post("/baza/korisnici/:korime", restKorisnik.postKorisnik);
	server.put("/baza/korisnici/:korime", restKorisnik.putKorisnik);
	server.delete("/baza/korisnici/:korime", restKorisnik.deleteKorisnik);

	server.get("/baza/korisnici/:korime/prijava", restKorisnik.getKorisnikPrijava);
	server.post("/baza/korisnici/:korime/prijava", restKorisnik.postKorisnikPrijava);
	server.put("/baza/korisnici/:korime/prijava", restKorisnik.putKorisnikPrijava);
	server.delete("/baza/korisnici/:korime/prijava", restKorisnik.deleteKorisnikPrijava);
}

function pripremiPutanjeTMDB() {
	let restTMDB = new RestTMDB(konf.dajKonf()["tmdb.apikey.v3"]);
	server.get("/api/tmdb/serije", restTMDB.getSerije.bind(restTMDB));
}

function pripremiPutanjePocetna() {
    let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
    server.get("/", htmlUpravitelj.pocetna.bind(htmlUpravitelj));
}

function pripremiPutanjePretrazivanjeSerija() {
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	server.get(
		"/serijePretrazivanje",
		htmlUpravitelj.serijePretrazivanje.bind(htmlUpravitelj)
	);
	server.post(
		"/serijePretrazivanje",
		fetchUpravitelj.serijePretrazivanje.bind(fetchUpravitelj)
	);
	server.get("/detaljiSerije", htmlUpravitelj.detaljiSerije.bind(htmlUpravitelj));
	server.post("/dodajSeriju", fetchUpravitelj.dodajSeriju.bind(fetchUpravitelj));
}

function pripremiPutanjeAutentifikacija() {
	let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
	let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, fetchUpravitelj);
	server.get("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
    server.post("/registracija", htmlUpravitelj.registracija.bind(htmlUpravitelj));
    server.get("/odjava", htmlUpravitelj.odjava.bind(htmlUpravitelj));
    server.get("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
    server.post("/prijava", htmlUpravitelj.prijava.bind(htmlUpravitelj));
    server.get("/getJWT", fetchUpravitelj.getJWT.bind(fetchUpravitelj));
    server.get("/aktivacijaRacuna",fetchUpravitelj.aktivacijaRacuna.bind(fetchUpravitelj));
	server.get("/korisnici", htmlUpravitelj.korisnici.bind(htmlUpravitelj));
}

function pripremiPutanjeProfil() {
    let fetchUpravitelj = new FetchUpravitelj(konf.dajKonf().jwtTajniKljuc);
    let htmlUpravitelj = new HtmlUpravitelj(konf.dajKonf().jwtTajniKljuc, fetchUpravitelj);
    server.get("/profil", htmlUpravitelj.profil.bind(htmlUpravitelj));
	server.post("/profil", htmlUpravitelj.profil.bind(htmlUpravitelj));
	}
}
