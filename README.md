# Menoseuranta

Selainohjelmoinnin harjoitustyö, joka soveltaa puhelinluettelon React + Vite -rakennetta omaan aiheeseen. Sovelluksella kirjataan menoja ja tarkastellaan kulutusta HTML-taulukossa.

## Käynnistys

Tarvitset Node.js:n version 22.12 tai uudemman sekä npm:n.

```sh
npm install
npm run dev
```

Avaa Viten tulostama osoite (oletuksena http://localhost:5173). Sama komento käynnistää React-käyttöliittymän sekä backendin osoitteeseen http://127.0.0.1:3001. Lopeta Ctrl+C:llä. Vaihtoehtoisesti käynnistä `npm run dev:server` ja `npm run dev:client` erillisissä terminaaleissa.

Jos tämän Windows-koneen `npm` antaa virheen puuttuvasta `npm-cli.js`-tiedostosta, voit käyttää toimivaa asennusta suoraan PowerShellissä:

```powershell
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' install
node 'C:/Program Files/nodejs/node_modules/npm/bin/npm-cli.js' run dev
```

```sh
npm run lint
npm test
npm run build
npm start
```

Käännöksen jälkeen `npm start` palvelee sekä käyttöliittymää että rajapintaa osoitteessa http://127.0.0.1:3001. `npm run preview` esikatselee vain frontendin käännöstä, joten koko sovelluksen kokeilemiseen käytä `npm start`.

## Toiminnot

- Menon lisääminen: kuvaus, summa euroina, päivämäärä ja kategoria.
- Kuvaushaku sekä kategorian ja kuukauden suodatus. Tyhjä kuukausi näyttää kaikki kuukaudet.
- Taulukko, jossa uusimmat menot näkyvät ensin. Taulukossa on otsikot ja yhteissumman sisältävä `tfoot`.
- Suodatettujen menojen yhteissumma, lukumäärä ja euromäärältään suurin kategoria.
- Menon poisto vahvistuksella.
- Syötteiden tarkistus frontendissä ja backendissä, latausilmaisin sekä virheilmoitukset.
- Mobiilinäkymä, jossa taulukkoa voi vierittää sivusuunnassa.

## Arkkitehtuuri

```text
React-käyttöliittymä → fetch-palvelukerros → Express-rajapinta → JSON-tiedosto
```

```text
src/
  App.jsx                     tila, lataus, suodatus, lisääminen ja poistaminen
  components/
    ExpenseForm.jsx           lisäyslomake ja kenttien tila
    ExpenseFilters.jsx        haku, kategoria ja kuukausi
    ExpenseSummary.jsx        suodatettujen menojen yhteenveto
    ExpenseTable.jsx          semanttinen HTML-taulukko
    Notification.jsx          palaute käyttäjälle
  services/expenses.js        HTTP-pyynnöt
  utils.js                    päivämäärien ja eurojen esitysmuoto
  styles.css                  ulkoasu ja responsiivisuus
shared/expenses.js            kategoriat, summan muunnos ja validointi
server/
  index.js                    palvelimen käynnistys
  app.js                      reitit ja virheenkäsittely
  store.js                    JSON-tallennus
  data/expenses.json          syntyy ensimmäisestä tallennuksesta
scripts/dev.js                frontendin ja backendin yhteiskäynnistys
tests/expenses.test.js         rahasummien, päivämäärien ja rajapinnan testit
```

`useState` säilyttää käyttöliittymän tilan. `useEffect` hakee menot palvelimelta. Tiedot kulkevat komponenteille propseina ja muutokset takaisin tapahtumankäsittelijöillä. Palvelukerros käyttää `fetch`-kutsuja ja Promisejen `.then`/`.catch`-käsittelyä. Sen vastauksen lukemisessa sekä backendin tiedosto-operaatioissa käytetään myös `async`/`await`-rakennetta: `await` odottaa Promisen valmistumista asynkronisen funktion sisällä.

Jinjaa ei tarvita, sillä React muodostaa käyttöliittymän JSX:stä. Express palauttaa JSON-dataa. Kehityksessä Viten proxy välittää `/api`-pyynnöt backendille, jolloin frontend voi käyttää suhteellisia osoitteita.

### Tietomalli

```json
{
  "id": "palvelimen-luoma-uuid",
  "description": "Ruokaostokset",
  "date": "2026-10-19",
  "category": "Ruoka",
  "amountCents": 3490
}
```

Rahasummat tallennetaan kokonaisina sentteinä: `3490` tarkoittaa 34,90 euroa. Syötteessä hyväksytään pilkku tai piste ja enintään kaksi desimaalia. Summa on 0,01–9 999 999,99 euroa. Kuvaus on 1–100 merkkiä. Päivämäärän tulee olla olemassa oleva kalenteripäivä.

### Rajapinta

| Metodi | Osoite | Toiminto |
| --- | --- | --- |
| GET | `/api/expenses` | Kaikki menot |
| POST | `/api/expenses` | Lisää meno, palauttaa 201 ja tallennetun menon |
| DELETE | `/api/expenses/:id` | Poista meno, palauttaa 204 |

Virheellinen syöte palauttaa 400, puuttuva meno 404 ja tallennusvirhe 500. Virhevastauksen muoto on `{ "error": "selitys" }`.

Backend jonottaa muutokset ja kirjoittaa ensin väliaikaistiedoston, jonka se nimeää tallennustiedostoksi. Tämä estää saman prosessin samanaikaisia pyyntöjä hukkaamasta toistensa tietoja. Virheellistä tallennustiedostoa ei korvata tyhjällä listalla.

## Rajaukset ja GitHub

Sovellus on yhdelle käyttäjälle paikalliseen käyttöön. Siinä ei ole kirjautumista, budjetteja eikä menojen muokkausta. Älä julkaise tätä versiota internetiin henkilökohtaisilla tiedoilla: kaikki saman palvelimen käyttäjät näkevät saman menolistan. Käynnistä vain yksi backend-prosessi tallennustiedostoa kohden.

Omat menot, `node_modules`, `dist` ja ympäristömuuttujat on rajattu pois Gitistä. Tallennuspaikan voi vaihtaa `DATA_FILE`-ympäristömuuttujalla ja backendin portin `PORT`-muuttujalla. Kehityksen proxy olettaa portin 3001, joten porttia vaihtaessa muuta myös `vite.config.js`.

Ulkoasu käyttää Arial-kirjasinta eikä lataa ulkoisia fontteja.

## Raportin valmistelu

Lisää palautusraporttiin kuvakaappaukset valmiista käyttöliittymästä, lisätystä menosta ja suodatetusta taulukosta. Kuvaa arkkitehtuuri, toiminnot sekä omin sanoin, mitä opit toteutuksesta. Tämä README toimii teknisen kuvauksen pohjana. GitHub-julkaisu ja palautusraportti tehdään erikseen projektin tarkastelun jälkeen.
