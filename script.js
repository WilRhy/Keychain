import { encryptVault, decryptVault } from "./vault.js";
import { saveVault, loadVault } from "./storage.js";

let vaultData = [];
let masterPassword = "";

// UI elements
const setup = document.getElementById("setup");
const login = document.getElementById("login");
const vault = document.getElementById("vault");
const entries = document.getElementById("entries");

window.onload = async () => {
  const existing = await loadVault();
  if (existing) {
    // Vault exists → show login screen
    setup.hidden = true;
    login.hidden = false;
  } else {
    // First time → show setup screen
    setup.hidden = false;
    login.hidden = true;
  }
};

// Create new vault
document.getElementById("create").onclick = async () => {
  const pass1 = document.getElementById("new-master").value.trim();
  const pass2 = document.getElementById("confirm-master").value.trim();

  if (!pass1 || pass1.length < 8) {
    alert("Master password must be at least 8 characters.");
    return;
  }
  if (pass1 !== pass2) {
    alert("Passwords do not match.");
    return;
  }

  masterPassword = pass1;
  vaultData = [];
  const encrypted = await encryptVault(vaultData, masterPassword);
  await saveVault(encrypted);

  alert("Vault created! Use your master password to unlock next time.");

  setup.hidden = true;
  login.hidden = false;
};

// Unlock existing vault
document.getElementById("unlock").onclick = async () => {
  masterPassword = document.getElementById("master").value.trim();
  const saved = await loadVault();

  if (!saved) {
    alert("No vault found. Please create one first.");
    return;
  }

  try {
    vaultData = await decryptVault(saved, masterPassword);
  } catch {
    alert("Incorrect master password.");
    return;
  }

  login.hidden = true;
  vault.hidden = false;
  render();
};

// Add new password entry
document.getElementById("add").onclick = async () => {
  const site = prompt("Website:");
  const user = prompt("Username:");
  const pass = prompt("Password:");
  if (!site || !user || !pass) return;

  vaultData.push({ site, user, pass });
  const encrypted = await encryptVault(vaultData, masterPassword);
  await saveVault(encrypted);
  render();
};

function render() {
  entries.innerHTML = "";
  vaultData.forEach(({ site, user, pass }) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${site}</strong><span>${user}</span>`;
    div.title = `Password: ${pass}`;
    entries.appendChild(div);
  });
}
