# PAJEapp-V1: Alfred Delivery & Synchronization Guide

This document defines the protocols for the **Alfred** Persona to modify the `PAJEapp-V1` Native React (Expo) codebase and deliver updates directly to the `Paje-Systems-LLC` centralized GitHub repository.

## The Walled Garden Architecture

The `PAJEapp-V1` repository is an extracted, 100% Native version of `appPAJEclub`. It communicates strictly via REST API tokens with the Locaweb Walled Garden on `https://api.pajesystems.com`.
The codebase resides at `C:\aaa_appPAJEclub`.

## Alfred's Mission

Whenever Boaz Jr (Project Owner) requests a design update or structural change to the mobile interfaces, the Alfred agent must:
1. Traverse to the `/src/` components.
2. Edit the `.js` files using best practices for Expo.
3. Validate the `npm run lint` configuration automatically.
4. Execute the automatic Git Push synchronization sequence securely over SSH.

## Delivery Command Execution

To minimize manual prompt engineering and ensure the code instantly hits the **Einstein Auto-Correction Loop**, an automated script was generated. 

**Whenever Alfred finalizes a feature block or modification on PAJEapp-V1, he MUST run the following command:**
```powershell
cd C:\aaa_appPAJEclub ; .\alfred_sync_github.bat "Your Commit Message Here"
```

### What does `alfred_sync_github.bat` do?
1. It runs the ESLint sequence enforcing Nano Banana styling rules.
2. It stages all changes made by Alfred.
3. It bundles the commit message provided globally.
4. It connects to GitHub securely using the pre-mapped SSH key `~/.ssh/VPS-LaMPS`.
5. It triggers the Webhook to the local port `3050` (Einstein), registering the changes into Obsidian Vault automatically.

*Stay Compliant. Maintain the Walled Garden.*
