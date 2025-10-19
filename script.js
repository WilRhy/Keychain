import { encryptData, decryptData } from "./crypto.js";

const setup = document.getElementById("setup");
const login = document.getElementById("login");
const vault = document.getElementById("vault");
const entries = document.getElementById("entries");

let masterPassword = "";
let vaultData = [];

// Show/hide password
document.getElementById("toggle-master").onclick = () => {
  const input = document.getElementById("new-master");
  input.type = input.type==="password"?"text":"password";
};
document.getElementById("toggle-confirm").onclick = () => {
  const input = document.getElementById("confirm-master");
  input.type = input.type==="password"?"text":"password";
};

// Load vault
window.onload = async () => {
  const stored = localStorage.getItem("vault");
  const bioStored = localStorage.getItem("webauthn");
  if (stored) login.hidden = false;
  else setup.hidden = false;
  if (bioStored) document.getElementById("bio-unlock").hidden = false;
};

// Create Vault
document.getElementById("create").onclick = async () => {
  const p1 = document.getElementById("new-master").value;
  const p2 = document.getElementById("confirm-master").value;
  if (p1.length<8){alert("Master password at least 8 chars");return;}
  if (p1!==p2){alert("Passwords do not match");return;}
  masterPassword = p1; vaultData = [];
  const encrypted = await encryptData(vaultData, masterPassword);
  localStorage.setItem("vault", JSON.stringify(encrypted));
  alert("Vault created!");
  setup.hidden=true; login.hidden=false;
  document.getElementById("register-bio").hidden=false;
};

// Add Entry
document.getElementById("add").onclick = async () => {
  const site = prompt("Website:");
  const user = prompt("Username:");
  const pass = prompt("Password:");
  if(!site||!user||!pass) return;
  vaultData.push({site,user,pass});
  await saveVault();
  render();
};

// Unlock Vault
document.getElementById("unlock").onclick = async () => {
  const stored = JSON.parse(localStorage.getItem("vault"));
  const password = document.getElementById("master").value;
  try{
    vaultData = await decryptData(stored,password);
    masterPassword=password;
    login.hidden=true; vault.hidden=false; render();
  }catch{alert("Incorrect password");}
};

// Lock Vault
document.getElementById("lock").onclick = () => {
  vault.hidden=true; login.hidden=false; entries.innerHTML="";
};

// Render Vault
function render(){
  entries.innerHTML="";
  vaultData.forEach((item,index)=>{
    const div = document.createElement("div");
    div.className="vault-entry";
    div.dataset.index=index;
    div.innerHTML=`
      <span>${item.site} — ${item.user}</span>
      <span class="entry-buttons">
        <button class="show-pass">Show</button>
        <button class="edit-pass">Edit</button>
        <button class="delete-pass">Delete</button>
      </span>`;
    entries.appendChild(div);
  });
}

// Entry Buttons
entries.addEventListener("click", async (e)=>{
  const idx = e.target.closest(".vault-entry")?.dataset.index;
  if(idx===undefined) return;
  if(e.target.classList.contains("show-pass")) alert(`Password: ${vaultData[idx].pass}`);
  else if(e.target.classList.contains("edit-pass")){
    const newPass=prompt("New password:",vaultData[idx].pass);
    if(newPass) vaultData[idx].pass=newPass;
  }else if(e.target.classList.contains("delete-pass")){
    if(confirm("Delete this entry?")) vaultData.splice(idx,1);
  }
  await saveVault();
  render();
});

// Save Vault Helper
async function saveVault(){
  const encrypted = await encryptData(vaultData,masterPassword);
  localStorage.setItem("vault",JSON.stringify(encrypted));
}

// --- WebAuthn Biometric Unlock ---
document.getElementById("register-bio").onclick = async () => {
  if(!window.PublicKeyCredential){alert("WebAuthn not supported"); return;}
  const cred = await navigator.credentials.create({
    publicKey:{
      challenge: new Uint8Array(32),
      rp:{name:"Keychain"},
      user:{id: new Uint8Array(16), name:"user", displayName:"User"},
      pubKeyCredParams:[{type:"public-key",alg:-7}]
    }
  });
  localStorage.setItem("webauthn","true");
  alert("Biometric unlock enabled!");
  document.getElementById("register-bio").hidden=true;
  document.getElementById("bio-unlock").hidden=false;
};

document.getElementById("bio-unlock").onclick = async () => {
  if(!window.PublicKeyCredential){alert("WebAuthn not supported"); return;}
  try{
    await navigator.credentials.get({
      publicKey:{challenge:new Uint8Array(32)}
    });
    // Unlock vault with stored master password
    const stored = JSON.parse(localStorage.getItem("vault"));
    vaultData = await decryptData(stored, masterPassword);
    login.hidden=true; vault.hidden=false; render();
  }catch{alert("Biometric authentication failed");}
};
