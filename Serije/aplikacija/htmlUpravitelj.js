const ds = require("fs/promises");
const jwt = require("./moduli/jwt.js");
const Autentifikacija = require("./autentifikacija.js");
const path = require('path');

class HtmlUpravitelj {
    constructor(tajniKljucJWT, fetchUpravitelj) {
        this.tajniKljucJWT = tajniKljucJWT;
        this.fetchUpravitelj = fetchUpravitelj;
        this.auth = new Autentifikacija();
    }

    async pocetna(zahtjev, odgovor) {
        try {
            let korisnik = zahtjev.session.korisnik;
            let stranica = await this.ucitajStranicu(zahtjev, "pocetna", "");
            if (zahtjev.session.korisnik){
                stranica = stranica.replace("#dobrodosli#", `Dobrodošli, ${korisnik}`);
                odgovor.send(stranica);
            }else{
                stranica = stranica.replace("#dobrodosli#", "");;
                odgovor.send(stranica);
            }

        } catch (error) {
            console.error("Error while checking token:", error);
            odgovor.status(500).send("Internal Server Error");
        }
    }

    async registracija(zahtjev, odgovor) {
        console.log(zahtjev.body);
        let greska = "";

        if (zahtjev.method == "POST") {
            var jwtToken = jwt.provjeriToken(zahtjev);
            if (zahtjev.session.uloga != 1) {
                greska = "Samo administratori mogu dodati nove korisnike!";
                let stranica = await this.ucitajStranicu(zahtjev, "registracija", greska);
                return odgovor.send(stranica);
            } else {
                let uspjeh = await this.auth.dodajKorisnika(zahtjev.body);
                if (uspjeh) {
                    var korisnik = await this.auth.prijaviKorisnika(zahtjev, zahtjev.body.korime, zahtjev.body.lozinka);
                    if (korisnik) {
                        korisnik = JSON.parse(korisnik);
                        zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
                        zahtjev.session.korime = korisnik.korime;

                        let decodedToken = jwt.verifyToken(zahtjev.session.jwtToken, this.tajniKljucJWT);
                        zahtjev.session.uloga = decodedToken.uloga;

                        console.log(korisnik);
                        console.log(zahtjev.session);

                        let stranica = await this.ucitajStranicu(zahtjev, "registracija", greska);
                        odgovor.send(stranica);
                    } else {
                        greska = "Netočna lozinka ili korisnik nije pronađen!";
                    }

                } else {
                    greska = "Dodavanje nije uspjelo, provjerite podatke!";
                }
            }
        }

        let stranica = await this.ucitajStranicu(zahtjev, "registracija", greska);
        odgovor.send(stranica);
    }

    async odjava(zahtjev, odgovor) {
        if (zahtjev.session.korisnik) {
            zahtjev.session.jwt = null;
            zahtjev.session.jwtToken = null;
            zahtjev.session.korisnik = null;
            zahtjev.session.korime = null;
            zahtjev.session.uloga = null;
            odgovor.redirect("/");
        }
    }

    async prijava(zahtjev, odgovor) {
        let greska = "";

        if (zahtjev.method == "POST") {
            var korime = zahtjev.body.korime;
            var lozinka = zahtjev.body.lozinka;
            var korisnik = await this.auth.prijaviKorisnika(zahtjev, korime, lozinka);

            if (korisnik) {
                korisnik = JSON.parse(korisnik);
                zahtjev.session.korisnik = korisnik.ime + " " + korisnik.prezime;
                zahtjev.session.korime = korisnik.korime;

                let token = jwt.kreirajToken(korisnik, this.tajniKljucJWT);
                jwt.provjeriToken(zahtjev, this.tajniKljucJWT);

                zahtjev.session.jwtToken = token;
                zahtjev.session.uloga = korisnik.uloga_id;

                odgovor.redirect("/");
                return;
            } else {
                greska = "Netočna lozinka ili korisnik nije pronađen!";
            }
        } else {
            greska = "Podatci za prijavu : student student, admin rwa, obican rwa, moderator rwa!";
        }

        if (!zahtjev.session.korisnik){
            let stranica = await this.ucitajStranicu(zahtjev, "prijava", greska);
            odgovor.send(stranica);
        }else{
            odgovor.redirect("/");
        }
    }

    async serijePretrazivanje(zahtjev, odgovor) {
        let stranica;
        stranica = await this.ucitajStranicu(zahtjev, "serije_pretrazivanje", "");
        odgovor.send(stranica);
    }

    async detaljiSerije(zahtjev, odgovor) {
        console.log("Sesija detalji:", zahtjev.session);
        let stranica = await this.ucitajStranicu(zahtjev, "serija_detalji", "");
        if (zahtjev.session.korisnik){
            odgovor.send(stranica);
        }else{
            odgovor.redirect("/");
        }
    }

    async profil(zahtjev, odgovor) {
        console.log("Sesija profil:", zahtjev.session);
        let stranica = await this.ucitajStranicu(zahtjev, "profil", "");

        if (zahtjev.session.korisnik){
            odgovor.send(stranica);
        }else{
            odgovor.redirect("/");
        }
    }

    async korisnici(zahtjev, odgovor) {
        let stranica = await this.ucitajStranicu(zahtjev, "korisnici", "");

        if (zahtjev.session.korisnik){
            odgovor.send(stranica);
        }else{
            odgovor.redirect("/");
        }
    }

    async ucitajStranicu(zahtjev, nazivStranice, poruka = "") {
        try {
            if (!nazivStranice || typeof nazivStranice !== "string") {
                throw new Error("Naziv stranice nije ispravno postavljen.");
            }
            console.log("Naziv stranice:", nazivStranice);

            let stranice = [this.ucitajHTML(nazivStranice), this.ucitajHTML("navigacija")];
            let [stranica, nav] = await Promise.all(stranice);

            stranica = stranica.replace("#navigacija#", nav);

            stranica = this.prilagodiNavigaciju(zahtjev, stranica);
            stranica = stranica.replace("#poruka#", poruka);
            return stranica;
        } catch (error) {
            console.error("Greška pri učitavanju stranice:", error.message);
            return "Greška pri učitavanju stranice.";
        }
    }

    async ucitajHTML(htmlStranica) {
        return ds.readFile(__dirname + "/html/" + htmlStranica + ".html", "UTF-8");
    }

    prilagodiNavigaciju(zahtjev, stranica) {
        if (!zahtjev.session.korisnik) {
            stranica = stranica.replace('id="odjava"', 'id="odjava" style="display:none"');
            stranica = stranica.replace('id="prijava"', 'id="prijava"');
            stranica = stranica.replace('id="registracija"', 'id="registracija"');
            stranica = stranica.replace('id="profil"', 'id="profil" style="display:none"');
            stranica = stranica.replace('id="serijePretrazivanje"', 'id="serijePretrazivanje"');
            stranica = stranica.replace('id="korisnici"', 'id="korisnici" style="display:none"');
        } else {
            stranica = stranica.replace('id="odjava" style="display:none"', 'id="odjava"');
            stranica = stranica.replace('id="prijava"', 'id="prijava" style="display:none"');
            stranica = stranica.replace('id="serijePretrazivanje" style="display:none"', 'id="serijePretrazivanje"');
            stranica = stranica.replace('id="profil" style="display:none"', 'id="profil"');

            if (zahtjev.session.uloga == 1 || zahtjev.session.uloga == 2) {
                stranica = stranica.replace('id="registracija"', 'id="registracija"');
                stranica = stranica.replace('id="korisnici"', 'id="korisnici"');
            } else {
                stranica = stranica.replace('id="registracija"', 'id="registracija"');
                stranica = stranica.replace('id="korisnici"', 'id="korisnici" style="display:none"');
            }
        }
        return stranica;
    }
}

module.exports = HtmlUpravitelj;
