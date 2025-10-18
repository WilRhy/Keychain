import { encryptData, decryptData } from "./crypto.js";

const setup = document.getElementById("setup");
const login = document.getElementById("login");
const vault = document.getElementById("vault");
const entries = document.getElementById("entries");

let masterPassword = "";
let vaultData = [];

window.onload = async () => {
  const stored = localStorage.getItem("vault");
  if (stored) {
    login.hidden = false;
  } else {
    setup.hidden = false;
  }
};

// Create new vault
document.getElementById("create").onclick = async () => {
  const pass1 = document.getElementById("new-master").value;
  const pass2 = document.getElementById("confirm-master").value;

  if (pass1.length < 8) {
    alert("Password must be at least 8 characters.");
    return;
  }
  if (pass1 !== pass2) {
    alert("Passwords do not match.");
    return;
  }

  masterPassword = pass1;
  vaultData = [];
  const encrypted = await encryptData(vaultData, masterPassword);
  localStorage.setItem("vault", JSON.stringify(encrypted));

  alert("Vault created!");
  setup.hidden = true;
  login.hidden = false;
};

// Unlock existing vault
document.getElementById("unlock").onclick = async () => {
  const stored = JSON.parse(localStorage.getItem("vault"));
  const password = document.getElementById("master").value;

  try {
    vaultData = await decryptData(stored, password);
    masterPassword = password;
    login.hidden = true;
    vault.hidden = false;
    render();
  } catch {
    alert("Incorrect master password.");
  }
};

// Add new entry
document.getElementById("add").onclick = async () => {
  const site = prompt("Website:");
  const user = prompt("Username:");
  const pass = prompt("Password:");
  if (!site || !user || !pass) return;

  vaultData.push({ site, user, pass });
  const encrypted = await encryptData(vaultData, masterPassword);
  localStorage.setItem("vault", JSON.stringify(encrypted));
  render();
};

// Render vault entries
function render() {
  entries.innerHTML = "";
  vaultData.forEach(({ site, user, pass }) => {
    const div = document.createElement("div");
    div.innerHTML = `<strong>${site}</strong><br>${user} — <em>${pass}</em>`;
    entries.appendChild(div);
  });
}
