const CONFIG = {
  apiUrl: "https://script.google.com/macros/s/AKfycbw6vROf0b18UcvyWxp1ENtlpYMuq5hJaBb_s-C1vqRafTaNWt9y_owYJQ9Je2UyFo8oUA/exec",
  refreshIntervalMs: 30000
};

const CHARACTERS = [
  { id: "guerriero", name: "Guerriero", image: "guerriero.png" },
  { id: "paladino", name: "Paladino", image: "paladino.png" },
  { id: "ladro", name: "Ladro", image: "ladro.png" },
  { id: "mago", name: "Mago", image: "mago.png" },
  { id: "chierico", name: "Chierico", image: "chierico.png" }
];

const characterContainer = document.querySelector("#characters");
const statusMessage = document.querySelector("#statusMessage");
const dialog = document.querySelector("#reservationDialog");
const form = document.querySelector("#reservationForm");
const playerNameInput = document.querySelector("#playerName");
const dialogCharacterName = document.querySelector("#dialogCharacterName");
const dialogError = document.querySelector("#dialogError");

let state = [];
let selectedCharacter = null;

function setStatus(message) {
  statusMessage.textContent = message;
}

function normalizeState(apiData) {
  const reservations = new Map(
    Array.isArray(apiData)
      ? apiData.map(item => [String(item.personaggio || "").toLowerCase(), item.giocatore || ""])
      : []
  );

  return CHARACTERS.map(character => ({
    ...character,
    player: reservations.get(character.name.toLowerCase()) || ""
  }));
}

function render() {
  characterContainer.innerHTML = "";

  state.forEach(character => {
    const reserved = Boolean(character.player);
    const card = document.createElement("article");
    card.className = "character-card";

    const imageWrap = document.createElement("div");
    imageWrap.className = "character-image-wrap";

    const img = document.createElement("img");
    img.className = "character-image";
    img.src = character.image;
    img.alt = `Locandina del ${character.name}`;
    img.addEventListener("error", () => {
      imageWrap.innerHTML = `<div class="image-placeholder">Aggiungi qui la locandina del ${character.name}</div>`;
    });
    imageWrap.appendChild(img);

    const body = document.createElement("div");
    body.className = "character-body";
    body.innerHTML = `
      <h2 class="character-name">${character.name}</h2>
      <span class="character-status ${reserved ? "reserved" : "available"}">
        ${reserved ? "Prenotato" : "Disponibile"}
      </span>
      <p class="character-player">${reserved ? `Prenotato da <strong>${escapeHtml(character.player)}</strong>` : "Questo personaggio è ancora libero."}</p>
    `;

    const button = document.createElement("button");
    button.className = "reserve-button";
    button.type = "button";
    button.textContent = reserved ? "Non disponibile" : "Scegli questo personaggio";
    button.disabled = reserved;
    button.addEventListener("click", () => openReservation(character));
    body.appendChild(button);

    card.append(imageWrap, body);
    characterContainer.appendChild(card);
  });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function openReservation(character) {
  selectedCharacter = character;
  dialogCharacterName.textContent = character.name;
  playerNameInput.value = "";
  dialogError.textContent = "";
  dialog.showModal();
  playerNameInput.focus();
}

function closeReservation() {
  selectedCharacter = null;
  dialog.close();
}

async function loadState({ quiet = false } = {}) {
  if (!CONFIG.apiUrl) {
    state = normalizeState([]);
    render();
    setStatus("Pagina pronta. Manca solo il collegamento al Google Sheet.");
    return;
  }

  if (!quiet) setStatus("Aggiornamento disponibilità…");

  try {
    const response = await fetch(CONFIG.apiUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Risposta non valida dal servizio");
    const data = await response.json();
    state = normalizeState(data);
    render();
    if (!quiet) setStatus("Disponibilità aggiornata.");
  } catch (error) {
    console.error(error);
    setStatus("Non riesco a leggere le prenotazioni. Riprova tra poco.");
  }
}

async function reserveCharacter(character, playerName) {
  const body = new URLSearchParams({
    personaggio: character.name,
    giocatore: playerName
  });

  const response = await fetch(CONFIG.apiUrl, {
    method: "POST",
    body
  });

  if (!response.ok) throw new Error("Errore durante la prenotazione");
  return response.json();
}

form.addEventListener("submit", async event => {
  event.preventDefault();

  const playerName = playerNameInput.value.trim();
  if (!playerName) {
    dialogError.textContent = "Inserisci il tuo nome.";
    return;
  }

  if (!CONFIG.apiUrl) {
    dialogError.textContent = "Il sistema di prenotazione non è ancora collegato al Google Sheet.";
    return;
  }

  const submitButton = form.querySelector('[type="submit"]');
  submitButton.disabled = true;
  dialogError.textContent = "";

  try {
    const result = await reserveCharacter(selectedCharacter, playerName);

    if (!result.success) {
      dialogError.textContent = result.message || "Il personaggio non è più disponibile.";
      await loadState({ quiet: true });
      return;
    }

    closeReservation();
    await loadState();
    setStatus(`${selectedCharacter?.name || "Personaggio"} prenotato con successo.`);
  } catch (error) {
    console.error(error);
    dialogError.textContent = "Prenotazione non riuscita. Riprova.";
  } finally {
    submitButton.disabled = false;
  }
});

document.querySelector("#closeDialog").addEventListener("click", closeReservation);
document.querySelector("#cancelReservation").addEventListener("click", closeReservation);

loadState();
setInterval(() => loadState({ quiet: true }), CONFIG.refreshIntervalMs);
