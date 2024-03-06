let url = "http://localhost:12000/baza";
let poruka = document.getElementById("poruka");

window.addEventListener("load", async () => {
    poruka = document.getElementById("poruka");
    dajSerije(1);
    document.getElementById("filter").addEventListener("keyup", (event) => {
        const filterValue = dajFilter();
        if (filterValue.length >= 3) {
            dajSerije(1);
        }
    });
});

async function dajSerije(str) {
    let parametri = { method: "POST" };
    parametri = await dodajToken(parametri);

    let odgovor = await fetch(
        "/serijePretrazivanje?str=" + str + "&filter=" + dajFilter(),
        parametri
    );
    if (odgovor.status == 200) {
        let podaci = await odgovor.text();
        podaci = JSON.parse(podaci);
        prikaziSerije(podaci.results);
        prikaziStranicenje(podaci.page, podaci.total_pages, "dajSerije");
    } else if (odgovor.status == 401) {
        document.getElementById("sadrzaj").innerHTML = "";
        poruka.innerHTML = "Neautorizirani pristup! Prijavite se!";
    } else {
        poruka.innerHTML = "Greška u dohvatu serija!";
    }
}

function prikaziSerije(serije) {
    let glavna = document.getElementById("sadrzaj");
    let tablica = "<table border=1>";
    tablica +=
        "<tr><th>Naslov</th><th>Opis</th><th>Detalji</th></tr>";
    for (let f of serije) {
        tablica += "<tr>";
        tablica += "<td>" + f.original_name + "</td>";
        tablica += "<td>" + f.overview + "</td>";
        tablica +=
		"<td><button>Detalji</button></td>";
        tablica += "</tr>";
    }
    tablica += "</table>";

    sessionStorage.dohvaceneSerije = JSON.stringify(serije);
    glavna.innerHTML = tablica;
}

async function prikaziDetalje(idSerije) {
    window.location.href = `/serija_detalji.html?id=${idSerije}`;
    document.getElementById('naslov').innerText = detalji.original_name;
}

function prikaziDetaljeNaStranici(detalji) {
    document.getElementById('naslov').innerText = detalji.original_name;
    document.getElementById('opis').innerText = detalji.overview;
    document.getElementById('broj-sezona').innerText = detalji.number_of_seasons;
    document.getElementById('broj-epizoda').innerText = detalji.number_of_episodes;
    document.getElementById('popularnost').innerText = detalji.popularity;
    document.getElementById('slika').src = detalji.poster_path;
    document.getElementById('poveznica').href = detalji.homepage;
    window.location.href = `/serija_detalji.html?id=${idSerije}`;
}

async function dodajUbazu(idSerija) {
    let serije = JSON.parse(sessionStorage.dohvaceneSerije);
    for (let serija of serije) {
        if (idSerija == serija.id) {
            let parametri = { method: "POST", body: JSON.stringify(serija) };
            parametri = await dodajToken(parametri);
            let odgovor = await fetch("/dodajSerija", parametri);
            if (odgovor.status == 200) {
                let podaci = await odgovor.text();
                console.log(podaci);
                poruka.innerHTML = "Serija dodana u bazu!";
            } else if (odgovor.status == 401) {
                poruka.innerHTML = "Neautorizirani pristup! Prijavite se!";
            } else {
                poruka.innerHTML = "Greška u dodavanju serija!";
            }
            break;
        }
    }
}

function dajFilter() {
    return document.getElementById("filter").value;
}
