// Tabella che contiene i dati dei fiumi
let myTable;

// Gruppi di fiumi divisi per continente
let gruppi = {};

// Posizioni dei glifi
let posizioni = [];

// Valori minimi e massimi
let minLength = Infinity;
let maxLength = -Infinity;
let minTemp = Infinity;
let maxTemp = -Infinity;
let maxTributaries = 0;

// Ordine dei continenti
let continenti = [
  "Africa",
  "Asia",
  "Europe",
  "North America",
  "South America",
  "Australia",
  "Oceania"
];

function preload() {
  // Carico il dataset CSV
  myTable = loadTable("assets/rivers.csv", "csv", "header");
}

function setup() {

  // Inizializzo i gruppi
  for (let continente of continenti) {
    gruppi[continente] = [];
  }

  // Leggo tutti i fiumi del dataset
  for (let i = 0; i < myTable.getRowCount(); i++) {

    let lunghezza = myTable.getNum(i, "length");
    let temperatura = myTable.getNum(i, "avg_temp");
    let affluenti = myTable.getNum(i, "tributaries");
    let continente = myTable.getString(i, "continent").trim();

    // Calcolo i valori minimi e massimi
    minLength = min(minLength, lunghezza);
    maxLength = max(maxLength, lunghezza);
    minTemp = min(minTemp, temperatura);
    maxTemp = max(maxTemp, temperatura);
    maxTributaries = max(maxTributaries, affluenti);

    // Inserisco il fiume nel gruppo geografico
    if (gruppi[continente]) {
      gruppi[continente].push(i);
    }
  }

  // Calcolo le posizioni dei glifi
  let colonne = 6;
  let larghezzaCella = 160;
  let altezzaCella = 115;
  let y = 175;

  for (let continente of continenti) {

    // Salto i continenti senza fiumi
    if (gruppi[continente].length === 0) {
      continue;
    }

    // Salvo la posizione del titolo del continente
    gruppi[continente].titoloY = y;
    y += 35;

    // Dispongo i fiumi in una griglia
    for (let j = 0; j < gruppi[continente].length; j++) {

      let colonna = j % colonne;
      let riga = floor(j / colonne);

      let x = 70 + colonna * larghezzaCella;
      let posizioneY = y + riga * altezzaCella;

      let indice = gruppi[continente][j];

      // Associo una posizione al singolo fiume
      posizioni[indice] = {
        x: x,
        y: posizioneY
      };
    }

    // Calcolo lo spazio necessario per il gruppo
    let numeroRighe = ceil(gruppi[continente].length / colonne);
    y += numeroRighe * altezzaCella + 35;
  }

  // Creo il canvas con l'altezza necessaria
  createCanvas(windowWidth, y);
}

function draw() {

  // Sfondo scuro
  background(25);

  // Titolo del progetto
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(26);
  text("RIVERS OF THE WORLD", width / 2, 40);

  // Legenda
  textSize(13);
  fill(220);
  text("Come leggere i glifi", width / 2, 80);

  // Spiegazione della dimensione
  text("Dimensione = lunghezza del fiume", width / 2, 103);

  // Spiegazione del colore
  text("Colore = temperatura media (blu = fredda, rosso = calda)", width / 2, 123);

  

  // Disegno i gruppi geografici
  for (let continente of continenti) {

    if (gruppi[continente].length === 0) {
      continue;
    }

    // Titolo del continente
    fill(255);
    textAlign(LEFT);
    textSize(18);
    text(continente, 35, gruppi[continente].titoloY);

    // Disegno i glifi del continente
    for (let indice of gruppi[continente]) {
      disegnaGlifo(indice);
    }
  }

  // Controllo se il cursore si trova sopra un glifo
  mostraTooltip();
}

function disegnaGlifo(indice) {

  // Leggo i dati del fiume
  let lunghezza = myTable.getNum(indice, "length");
  let temperatura = myTable.getNum(indice, "avg_temp");
  let affluenti = myTable.getNum(indice, "tributaries");

  let x = posizioni[indice].x;
  let y = posizioni[indice].y;

  // La lunghezza determina la dimensione del glifo
  let dimensione = map(lunghezza, minLength, maxLength, 12, 32);

  // La temperatura determina il colore del glifo
  let valoreColore = map(temperatura, minTemp, maxTemp, 0, 1);
  let colore = lerpColor(
    color(60, 140, 255),
    color(255, 90, 70),
    valoreColore
  );

  // Disegno il cerchio centrale
  noStroke();
  fill(colore);
  circle(x, y, dimensione * 2);

  // Scrivo il nome del fiume sotto il glifo
  fill(230);
  textAlign(CENTER);
  textSize(10);
  text(myTable.getString(indice, "name"), x, y + 55);
}

function mostraTooltip() {

  // Controllo tutti i fiumi
  for (let i = 0; i < myTable.getRowCount(); i++) {

    let x = posizioni[i].x;
    let y = posizioni[i].y;

    // Verifico se il cursore è vicino al glifo
    if (dist(mouseX, mouseY, x, y) < 35) {

      // Leggo le informazioni del fiume
      let nome = myTable.getString(i, "name");
      let paesi = myTable.getString(i, "countries");
      let lunghezza = myTable.getNum(i, "length");
      let temperatura = myTable.getNum(i, "avg_temp");
      let affluenti = myTable.getNum(i, "tributaries");

      // Dimensioni del riquadro
      let boxWidth = 250;
      let boxHeight = 145;

      // Posiziono il riquadro vicino al cursore
      let boxX = mouseX + 15;
      let boxY = mouseY + 15;

      // Evito che il riquadro esca dal canvas
      if (boxX + boxWidth > width) {
        boxX = mouseX - boxWidth - 15;
      }

      if (boxY + boxHeight > height) {
        boxY = mouseY - boxHeight - 15;
      }

      // Disegno il riquadro
      fill(15);
      stroke(150);
      strokeWeight(1);
      rect(boxX, boxY, boxWidth, boxHeight, 6);

      // Titolo: nome del fiume
      noStroke();
      fill(255);
      textAlign(LEFT);
      textSize(13);
      textStyle(BOLD);
      text(nome, boxX + 12, boxY + 22);

      // Informazioni del fiume
      textStyle(NORMAL);
      textSize(11);

      // I paesi possono occupare più righe
      text("Paesi: " + paesi, boxX + 12, boxY + 43, boxWidth - 24, 38);

      // Valori numerici
      text("Lunghezza: " + lunghezza + " km",
           boxX + 12, boxY + 91);

      text("Temperatura media: " + temperatura + " °C",
           boxX + 12, boxY + 108);

      text("Affluenti: " + affluenti,
           boxX + 12, boxY + 125);

      // Interrompo il controllo dopo aver trovato il glifo
      break;
    }
  }
}
  
