// storage.js

export function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("KeychainDB", 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore("vault");
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = (e) => reject(e);
  });
}

export async function saveVault(data) {
  const db = await openDB();
  const tx = db.transaction("vault", "readwrite");
  tx.objectStore("vault").put(data, "data");
  await tx.done;
}

export async function loadVault() {
  const db = await openDB();
  const tx = db.transaction("vault", "readonly");
  return tx.objectStore("vault").get("data");
}
