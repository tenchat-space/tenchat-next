
const fs = require('fs');
const path = require('path');

const contractsDir = '.ignore/contracts/artifacts/contracts';
const outDir = 'lib/config/abis';

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

const contracts = [
  'TenchatToken',
  'TenchatIdentity',
  'TenchatSignaling',
  'TenchatMiniAppRegistry',
  'TenchatPrediction',
  'TenchatSubscription'
];

contracts.forEach(contract => {
  const artifactPath = path.join(contractsDir, `${contract}.sol`, `${contract}.json`);
  if (fs.existsSync(artifactPath)) {
    const artifact = JSON.parse(fs.readFileSync(artifactPath, 'utf8'));
    fs.writeFileSync(
      path.join(outDir, `${contract}.json`),
      JSON.stringify(artifact.abi, null, 2)
    );
    console.log(`Extracted ABI for ${contract}`);
  } else {
    console.error(`Artifact not found for ${contract} at ${artifactPath}`);
  }
});

