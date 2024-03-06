let poruka;
let korisnici;

window.addEventListener("load", async () => {
    poruka = document.getElementById("poruka");
    await dajKorisnike();
});

async function dajKorisnike() {
    let parametri = { method: "GET" };
    parametri = await dodajToken(parametri);

    try {
        let odgovor = await fetch("/baza/korisnici", parametri);
        console.log("Odgovor"+ odgovor);

        if (odgovor.status === 200) {
            let podaci = await odgovor.json();
            prikaziKorisnike(podaci);
        } else if (odgovor.status === 401) {
            document.getElementById("sadrzaj").innerHTML = "";
            poruka.innerHTML = "Potrebna prijava";
        } else {
            poruka.innerHTML = "Greška u dohvatu korisnika!";
        }
    } catch (error) {
        console.error("Greška u dohvatu podataka:", error);
    }
}

function prikaziKorisnike(korisnici) {
    let glavna = document.getElementById("sadrzaj");

    let tablica = "<table class=korisnici-table border=1>";
    tablica += "<tr><th>ID</th><th>Ime</th><th>Prezime</th><th>Korisnicko ime</th><th>Lozinka</th><th>Emial</th><th>Spol</th><th>Datum rođenja</th><th>Broj mobitela</th><th>Tip korisnika</th><th>DELETE</th></tr>";

    for (let k of korisnici) {
        tablica += "<tr>";
        tablica += "<td>" + k.id_korisnika + "</td>";
        tablica += "<td>" + k.ime + "</td>";
        tablica += "<td>" + k.prezime + "</td>";
        tablica += "<td>" + k.korime + "</td>";
        tablica += "<td>" + k.lozinka + "</td>";
        tablica += "<td>" + k.email + "</td>";
        tablica += "<td>" + k.spol + "</td>";
        tablica += "<td>" + k.datum_rodenja + "</td>";
        tablica += "<td>" + k.telefon + "</td>";
        tablica += "<td>" + k.uloga_id + "</td>"
        tablica += "</tr>";
    }

    tablica += "</table>";

    sessionStorage.korisnici = JSON.stringify(korisnici);

    glavna.innerHTML = tablica;
}

