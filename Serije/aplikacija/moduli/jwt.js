const jwt = require("jsonwebtoken");

function kreirajToken(korisnik, tajniKljucJWT, trajanje = "1d", algoritam = "HS256") {
    const ulogaMap = {
        1: 'Admin',
        2: 'Moderator',
        3: 'Student',
    };

    const token = jwt.sign(
        {
            korime: korisnik.korime,
            uloga: korisnik.uloga_id,
        },
        tajniKljucJWT,
        {
            expiresIn: trajanje,
            algorithm: algoritam,
        }
    );

    console.log("Token kreiran:", token);
    return token;
}

function provjeriToken(zahtjev, tajniKljucJWT) {
    const sessionToken = zahtjev.session.jwtToken;

    if (zahtjev.headers.authorization != null) {
        console.log("zahtjev headers autoriz", zahtjev.headers.authorization);
        const headerToken = zahtjev.headers.authorization;
        try {
            let podaci = jwt.verify(headerToken, tajniKljucJWT);
            console.log("Decoded Token Data:", podaci);
            zahtjev.session.uloga = podaci.uloga;

            const tijelo = dajTijelo(headerToken);
            const dijelovi = ispisiDijelove(headerToken);
            console.log("Uloga korisnika:", tijelo.uloga);
            console.log("Uloga korisnika dijelovi:", dijelovi);

            ispisiDijelove(headerToken);
            return true;
        } catch (e) {
            if (e instanceof jwt.TokenExpiredError) {
                console.log("Token has expired.");
                return { status: 401, poruka: "Token has expired." };
            }
            console.log(e);
            return false;
        }
    } else {
        console.log("Authorization header not provided");
        return { status: 401, poruka: "Authorization header not provided" };
    }
}

function ispisiDijelove(token) {
    const dijelovi = token.split(".");
    const zaglavlje = dekodirajBase64(dijelovi[0]);
    console.log("Zaglavlje:", zaglavlje);
    const tijelo = dekodirajBase64(dijelovi[1]);
    console.log("Tijelo:", tijelo);
    const potpis = dekodirajBase64(dijelovi[2]);
    console.log("Potpis:", potpis);
}

function dajTijelo(token) {
    const dijelovi = token.split(".");
    return JSON.parse(dekodirajBase64(dijelovi[1]));
}

function dekodirajBase64(data) {
    const buff = Buffer.from(data, 'base64');
    return buff.toString('ascii');
}

module.exports = {
    kreirajToken,
    provjeriToken,
    ispisiDijelove,
    dajTijelo
};
