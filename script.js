import { encryptVault, decryptVault } from "./vault.js";
import { saveVault, loadVault } from "./storage.js";

let vaultData = [];
let masterPassword = "";

const login = document.getElementById("login");
const vault = document.getElementById("vault");
const entries = document.getElementById("entries");

document.getElementById("unlock").onclick = async () => {
  masterPassword = document.getElementById("master").value.trim();
  const saved = await loadVault();

  if (saved) {
    try {
      vaultData = await decryptVault(saved, masterPassword);
    } catch {
      alert("Incorrect password or corrupted vault.");
      return;
    }
  } else vaultData = [];

  login.hidden = true;
  vault.hidden = false;
  render();
};

document.getElementById("add").onclick = async () => {
  const site = prompt("Website:");
  const user = prompt("Username:");
  const pass = prompt("Password:");
  if (!site || !user || !pass) return;

  vaultData.push({ site, user, pass });
  const enc = await encryptVault(vaultData, masterPassword);
  await saveVault(enc);
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
