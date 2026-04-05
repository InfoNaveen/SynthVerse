const fs = require('fs');

function replaceInFile(filePath, replacements) {
    if (!fs.existsSync(filePath)) return;
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    
    for (const [search, replace] of replacements) {
        if (typeof search === 'string') {
            content = content.replaceAll(search, replace);
        } else {
            content = content.replace(search, replace);
        }
    }
    
    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Modified:', filePath);
    }
}

// 1. layout.tsx
replaceInFile('frontend/app/layout.tsx', [
    ['title: "ECLIPSIS — Metaverse Dark Period Forensics"', 'title: "ECLIPSIS — Metaverse Dark Period Forensics"'], 
    ['"When the metaverse goes dark, nothing goes unrecorded. Decentralized forensics and accountability layer for metaverse digital twins."', '"When the metaverse goes dark, nothing goes unrecorded. ECLIPSIS is the decentralized dark-period forensics and accountability layer for metaverse digital twins."'],
    ['AntiGravity — Metaverse Forensics', 'ECLIPSIS — Metaverse Dark Period Forensics']
]);

// 2. page.tsx
replaceInFile('frontend/app/page.tsx', [
    ['The metaverse went dark.', 'When the metaverse goes dark,'],
    ['We made sure nothing went unaccounted for.', 'nothing goes unrecorded.'],
    ['data-text="ANTI"', 'data-text="ECLIPSIS"'],
    ['>\\n              ANTI\\n            <', '>\\n              ECLIPSIS\\n            <'],
    ['>ANTI<', '>ECLIPSIS<'],
    ['data-text="GRAVITY"', 'data-text="// DARK PERIOD FORENSICS"'],
    ['>\\n              GRAVITY\\n            <', '>\\n              // DARK PERIOD FORENSICS\\n            <'],
    ['>GRAVITY<', '>// DARK PERIOD FORENSICS<'],
    ['AntiGravity', 'ECLIPSIS'] // there might be other invisible mentions, but I should just replace text carefully.
]);

// 3. Navbar.tsx
replaceInFile('frontend/components/Navbar.tsx', [
    ['AntiGravity', 'ECLIPSIS'],
    ['// META FORENSICS', '// DARK PERIOD FORENSICS']
]);

// 4. Providers.tsx
replaceInFile('frontend/components/Providers.tsx', [
    ["appName: 'AntiGravity — Metaverse Forensics'", "appName: 'ECLIPSIS — Metaverse Forensics'"]
]);

// 5. wagmi.ts
replaceInFile('frontend/lib/wagmi.ts', [
    ["appName: 'AntiGravity — Metaverse Forensics'", "appName: 'ECLIPSIS — Metaverse Dark Period Forensics'"]
]);

// 6. frontend package.json
replaceInFile('frontend/package.json', [
    ['"description": "ECLIPSIS Frontend', '"description": "ECLIPSIS Frontend — Decentralized metaverse dark period forensics'],
    ['"description": "ECLIPSIS Frontend', '"description": "ECLIPSIS Frontend — Decentralized metaverse dark period forensics"']
]);

// 7. frontend README.md - FULL RENAME
replaceInFile('frontend/README.md', [
    [/AntiGravity/g, 'ECLIPSIS'],
    [/antigravity/g, 'eclipsis'],
    [/Antigravity/g, 'Eclipsis']
]);

// 8. backend package.json
replaceInFile('backend/package.json', [
    ['"description": "ECLIPSIS Backend', '"description": "ECLIPSIS Backend — Real-time forensics engine']
]);

// 9. backend server.js
replaceInFile('backend/server.js', [
    ["console.log('ECLIPSIS Backend starting...')", "console.log('ECLIPSIS Backend starting...')"],
    ["console.log('AntiGravity server running", "console.log('ECLIPSIS server running"]
]);

// 10. backend README.md
replaceInFile('backend/README.md', [
    [/AntiGravity/g, 'ECLIPSIS'],
    [/antigravity/g, 'eclipsis'],
    [/Antigravity/g, 'Eclipsis']
]);

// 11. contracts package.json
replaceInFile('contracts/package.json', [
    ['"description": "AntiGravity Smart Contracts', '"description": "ECLIPSIS Smart Contracts — Polygon Amoy']
]);

// 12. contracts README.md
replaceInFile('contracts/README.md', [
    [/AntiGravity/g, 'ECLIPSIS'],
    [/antigravity/g, 'eclipsis'],
    [/Antigravity/g, 'Eclipsis']
]);

// 13. contracts/contracts/AntiGravityAnchor.sol
replaceInFile('contracts/contracts/AntiGravityAnchor.sol', [
    ['@title AntiGravityAnchor', '@title ECLIPSIS Anchor Contract'],
    ['@author AntiGravity Team', '@author ECLIPSIS Team'],
    ['@notice AntiGravity', '@notice ECLIPSIS']
]);

// 14. contracts/contracts/AntiGravityToken.sol
replaceInFile('contracts/contracts/AntiGravityToken.sol', [
    ['@title AntiGravityToken (AGVT)', '@title ECLIPSIS Token (AGVT)'],
    ['ERC20("AntiGravity Token", "AGVT")', 'ERC20("ECLIPSIS Token", "AGVT")']
]);

// 15. contracts/contracts/AntiGravityForensics.sol
replaceInFile('contracts/contracts/AntiGravityForensics.sol', [
    ['@title AntiGravityForensics', '@title ECLIPSIS Forensics Contract']
]);

// 16. scripts/deploy.js
replaceInFile('scripts/deploy.js', [
    ['Deploying AntiGravity contracts...', 'Deploying ECLIPSIS contracts...'],
    ['AntiGravityToken deployed to:', 'ECLIPSIS Token (AGVT) deployed to:'],
    ['AntiGravityAnchor deployed to:', 'ECLIPSIS Anchor deployed to:'],
    ['AntiGravityForensics deployed to:', 'ECLIPSIS Forensics deployed to:']
]);

// 17. deployed-addresses.json
replaceInFile('deployed-addresses.json', [
    ['{', '{\n  "projectName": "ECLIPSIS",']
]);

// 18. AttackSimulator.tsx
replaceInFile('frontend/components/AttackSimulator.tsx', [
    [/AntiGravity/g, 'ECLIPSIS'],
    [/antigravity/g, 'eclipsis']
]);

// 19. ForensicsPanel.tsx
replaceInFile('frontend/components/ForensicsPanel.tsx', [
    [/AntiGravity/g, 'ECLIPSIS']
]);

// 20. TwinPanel.tsx
replaceInFile('frontend/components/TwinPanel.tsx', [
    ['◈ AntiGravity // LIVE DIGITAL TWIN', '◈ ECLIPSIS // LIVE DIGITAL TWIN']
]);

// 21. AgentPanel.tsx
replaceInFile('frontend/components/AgentPanel.tsx', [
    ['AntiGravity AGENT PROFILE', 'ECLIPSIS AGENT PROFILE'],
    ['AntiGravity Security Operations Center', 'ECLIPSIS Security Operations Center']
]);

// 22. ThreatPanel.tsx
replaceInFile('frontend/components/ThreatPanel.tsx', [
    ['◈ AntiGravity // THREAT INTELLIGENCE', '◈ ECLIPSIS // THREAT INTELLIGENCE']
]);

// 23. General terms in components, hooks, services, APIs, Postman if any.
const termsToReplace = [
    [/ECLIPSIS Backend/g, "ECLIPSIS Backend"],
    [/ECLIPSIS Frontend/g, "ECLIPSIS Frontend"],
    [/ECLIPSIS SOC/g, "ECLIPSIS SOC"],
    [/ECLIPSIS Agent/g, "ECLIPSIS Agent"],
    [/ECLIPSIS Protocol/g, "ECLIPSIS Protocol"],
    [/Built by ECLIPSIS/g, "Built by ECLIPSIS"],
    [/ECLIPSIS Metaverse Forensics/g, "ECLIPSIS Metaverse Forensics"]
];

const fsWalk = require('fs').readdirSync;
const path = require('path');
function walk(dir) {
    if (!fs.existsSync(dir)) return;
    const list = fsWalk(dir);
    for (const file of list) {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            if (!['node_modules', '.git', 'artifacts', 'cache', '.next'].includes(file)) {
                walk(filePath);
            }
        } else if (['.tsx', '.ts', '.js', '.json', '.md', '.sol'].includes(path.extname(file))) {
            let content = fs.readFileSync(filePath, 'utf8');
            let original = content;
            for (const [s, r] of termsToReplace) {
                content = content.replace(s, r);
            }
            if (content !== original) {
                fs.writeFileSync(filePath, content, 'utf8');
                console.log('Modified general terms in:', filePath);
            }
        }
    }
}
walk('./');
