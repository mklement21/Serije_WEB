let url = "http://localhost:12000";
var atributiMap;
var podaciKorisnika;
var korime;

window.addEventListener("load", async () => {
    await prijavljeniKorisnik();
});

async function prijavljeniKorisnik() {
    let token = await dajToken();
    korime = dekodirajBase64(token);
    console.log('JWT Token:', token);
    console.log('JWT Token korime:', korime);
    await prikaziPodatke(korime);
}

function dekodirajBase64(token) {
    try {
        const payloadBase64 = token.split('.')[1];
        const decodedPayload = atob(payloadBase64);
        const payload = JSON.parse(decodedPayload);
        return payload.korime;
    } catch (error) {
        console.error('Error extracting korime from token:', error);
        return null;
    }
}

async function prikaziPodatke(korime) {
    let profil = document.getElementById("korisnikPodaci");
    let prikaz = "<ul>";

    if (korime == null) {
        profil.innerHTML = "";
        poruka.innerHTML = "Neautorizirani pristup! Prijavite se!";
    } else {
        try {
            let response = await fetch(`http://localhost:12000/baza/korisnici/${korime}`);
            podaciKorisnika = await response.json();
            if (response.ok) {
                atributiMap = {
                    "ime": "Ime",
                    "prezime": "Prezime",
                    "korime": "Korisničko ime",
                    "email": "Email",
                    "slika": "Slika",
                    "spol": "Spol",
                    "datum_rodenja": "Datum rođenja",
                    "telefon": "Broj telefona",
                    "opis": "Opis",
                    "br_favorita": "Broj favorita"
                };

                const skriveniAtributi = ["prezime"];

                for (let podatak in podaciKorisnika) {
                    if (!atributiMap[podatak] || skriveniAtributi.includes(atributiMap[podatak])) {
                        continue;
                    }

                    prikaz += `<label>${atributiMap[podatak]}:</label> <span>${podaciKorisnika[podatak]}</span>`;

                    prikaz += "<br>";
                }
                prikaz += "<br><button onClick='azurirajProfil()'>Ažuriraj</button>";
                profil.innerHTML = prikaz + "</ul>";
            } else {
                profil.innerHTML = "Pogreška u dohvaćanju podataka.";
            }
        } catch (error) {
            console.error("Error:", error);
            profil.innerHTML = "Pogreška u dohvaćanju podataka.";
        }
    }
}

function azurirajProfil() {
    let formaPodaci = document.getElementById("forma");
    let formaHTML = `<form id="forma">`;

    for (let podatak in atributiMap) {
        formaHTML += `
            <label for="${podatak}">${atributiMap[podatak]}:</label>
            <input type="text" id="${podatak}" name="${podatak}" value="${podaciKorisnika[podatak]}">
            <br>
        `;
    }

    formaHTML += `<br><button type="button" onclick="spremiPromjene()">Spremi promjene</button></form>`;
    formaPodaci.innerHTML = formaHTML;
}

function spremiPromjene() {
    let newData = {};

    for (let podatak in atributiMap) {
        newData[podatak] = document.getElementById(podatak).value;
    }

    newData['id_korisnika'] = podaciKorisnika['id_korisnika'];
    newData['lozinka'] = podaciKorisnika['lozinka'];
    newData['uloga_id'] = podaciKorisnika['uloga_id'];

    console.log("New data:", newData);

    fetch(`http://localhost:12000/baza/korisnici/${korime}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newData),
    })
    .then(response => response.json())
    .then(data => {
        if (data) {
            zatvoriFormu();

            prikaziPodatke(korime);
        } else {
            console.error('Greška prilikom ažuriranja profila');
        }
    })
    .catch((error) => {
        console.error('Error:', error);
    });
}

function zatvoriFormu() {
    let formElement = document.getElementById("forma");

    if (formElement) {
        formElement.innerHTML = '';
    }
}