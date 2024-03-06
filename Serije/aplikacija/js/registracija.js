let url = "http://localhost:12000/baza";

window.addEventListener("load", async () => {});

function provjeriRegistraciju() {
    var ime = document.getElementById("ime").value;
    var prezime = document.getElementById("prezime").value;
    var lozinka = document.getElementById("lozinka").value;
    var email = document.getElementById("email").value;
    var korime = document.getElementById("korime").value;
    var spol = document.getElementById("spol").value;
    var datumRodjenja = document.getElementById("datum_rodenja").value;
    var telefon = document.getElementById("telefon").value;

    if (!ime || !prezime || !lozinka || !email || !korime || !spol || !datumRodjenja || !telefon) {
        alert("Sva obavezna polja moraju biti popunjena!");
        return false;
    }

    if (!ispravanEmail(email)) {
        alert("Unesite ispravnu email adresu!");
        return false;
    }

    return true;
}

function ispravanEmail(email) {
    return email.includes("@");
}
