#!/usr/bin/env node
/**
 * Demo data is stored in the browser (localStorage), not on the server.
 * This script only prints how to reset the static demo.
 */
console.log("EscrowET demo persistence is browser localStorage.");
console.log("Keys: escrow-mvp-state-v1 , escrow-mvp-role-v1");
console.log("Reset: Operator dashboard → Reset demo data");
console.log("   or: clear those keys in DevTools → Application → Local Storage");
