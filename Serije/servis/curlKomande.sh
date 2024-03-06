port=12000
server="spider.foi.hr"
echo "GET /baza/korisnici/"
curl -X GET http://localhost:12000/baza/korisnici
echo ""
echo "POST /baza/korisnici/"
curl -X POST -H "Content-Type: application/json" -d '{"ime":"Matija","prezime":"Ceran","korime":"mceran","email":"mcerang@foi.hr","lozinka":"rwa","slika":null, "spol":"Žensko", "datum_rodenja":null, "telefon":"098676542", "opis":null,"br_favorita":null,"uloga_id":3}' http://localhost:12000/baza/korisnici
echo ""
echo "PUT /baza/korisnici/"
curl -X PUT http://localhost:12000/baza/korisnici
echo ""
echo "DELETE /baza/korisnici/"
curl -X DELETE http://localhost:12000/baza/korisnici
echo ""

echo "GET /baza/korisnici/:korime"
curl http://localhost:12000/baza/korisnici/mceran
echo ""
echo "POST /baza/korisnici/:korime"
curl -X POST -H "Content-Type: application/json" http://localhost:12000/baza/korisnici/mceran
echo ""
echo "PUT /baza/korisnici/:korime"
curl -X PUT -H "Content-Type: application/json" -d '{"ime":"Sasa","prezime":"Ceran","korime":"sceran","email":"mcerand@foi.hr","lozinka":"rwa","slika":null,"spol":"Žensko", "datum_rodenja":null, "telefon":"098676542", "opis":null,"br_favorita":null,"uloga_id":3}' http://localhost:12000/baza/korisnici/mceran
echo ""
echo "DELETE /baza/korisnici/:korime"
curl -X DELETE http://localhost:12000/baza/korisnici/mceran
echo ""
