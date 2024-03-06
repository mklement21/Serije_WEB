const ds = require("fs/promises");

class Konfiguracija {
    constructor() {
        this.konf = {};
    }

    dajKonf() {
        return this.konf;
    }

	dajBrojStranicaPoStranici() {
        return parseInt(this.konf.appStranicenje) || 5;
    }

    async ucitajKonfiguraciju() {
        try {
            let podaci = await ds.readFile(process.argv[2], "UTF-8");
            if (!podaci) {
                console.log("Navedena datoteka je prazna");
                process.exit(1);
            }
            this.konf = pretvoriJSONkonfig(podaci);
            this.provjeriIspravnostKonfiguracije(this.konf);
            console.log(this.konf);

            global.appStranicenje = this.dajBrojStranicaPoStranici();
        } catch (greska) {
            console.error("Greška prilikom učitavanja");
            throw greska;
        }
    }

    provjeriIspravnostKonfiguracije(konfiguracija) {
        const regexPodaci = {
            jwtValjanost: /^(1[5-9]|[2-9]\d|[1-9]\d{2}|[12]\d{3}|3[0-5]\d{2}|3600)$/,
            jwtTajniKljuc: /^[a-zA-Z0-9]{50,100}$/,
            tajniKljucSesija: /^[a-zA-Z0-9]{50,100}$/,
            appStranicenje: /^(?:[5-9]|[1-9][0-9]|100)$/,
            'tmdb.apikey.v3': /^.*$/,
            'tmdb.apikey.v4': /^.*$/,
        };

        const csvPodaci = [
            { kljuc: "jwtValjanost", opis: "Broj od 15 do 3600" },
            { kljuc: "jwtTajniKljuc", opis: "Veličina: 50 - 100 znakova, Dozvoljava: velika i mala slova te brojke" },
            { kljuc: "tajniKljucSesija", opis: "Tajni ključ za sesiju" },
            { kljuc: "appStranicenje", opis: "Broj od 5 do 100" },
            { kljuc: "tmdb.apikey.v3", opis: "Nema restrikcija" },
            { kljuc: "tmdb.apikey.v4", opis: "Nema restrikcija" },
        ];

        const greske = [];
        for (const { kljuc, opis } of csvPodaci) {
            const regex = regexPodaci[kljuc];
            const vrijednost = konfiguracija[kljuc];

            if (!konfiguracija.hasOwnProperty(kljuc)) {
                greske.push(`Nedostaje podatak u konfiguracijskoj datoteci: ${kljuc}`);
            } else if (!vrijednost) {
                greske.push(`Prazna vrijednost za ${kljuc}. Očekivani format: ${opis}`);
            } else if (kljuc !== "tmdb.apikey.v4" && !vrijednost.match(regex)) {
                greske.push(`Pogrešna vrijednost za ${kljuc} u konfiguracijskoj datoteci. Očekivani format: ${opis}`);
            }
        }

        if (greske.length > 0) {
            greske.forEach((greska) => {
                console.log(greska);
            }); process.exit(1);
        }
    }
}

function pretvoriJSONkonfig(podaci) {
    let konf = {};
    var nizPodataka = podaci.split("\n");
    for (let podatak of nizPodataka) {
        var podatakNiz = podatak.split("=");
        var naziv = podatakNiz[0].trim();
        var vrijednost = podatakNiz[1].trim();
        konf[naziv] = vrijednost;
    }
    return konf;
}

module.exports = Konfiguracija;
