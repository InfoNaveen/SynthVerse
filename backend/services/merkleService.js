const { MerkleTree } = require('merkletreejs');
const crypto = require('crypto');

// Use SHA-256 as the hashing function (keccak256-compatible leaf generation)
function sha256(data) {
  return crypto.createHash('sha256').update(data).digest();
}

/**
 * Flatten a nested twinState object into an array of "key:value" strings.
 * e.g. { weather: { temp: 30 } } → ["weather.temp:30"]
 */
function flattenState(obj, prefix = '') {
  const leaves = [];
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      leaves.push(...flattenState(val, path));
    } else {
      leaves.push(`${path}:${String(val)}`);
    }
  }
  return leaves;
}

/**
 * Build a Merkle root from a twinState object.
 * @param {Object} twinState
 * @returns {{ root: string, leaves: string[], tree: MerkleTree }}
 */
function buildMerkleRoot(twinState) {
  const leafStrings = flattenState(twinState);
  const leafHashes = leafStrings.map((l) => sha256(l));

  const tree = new MerkleTree(leafHashes, sha256, { sortPairs: true });
  const root = tree.getHexRoot();

  return {
    root,
    leaves: leafStrings,
    tree,
  };
}

/**
 * Compare two Merkle roots.
 * @param {string} root1
 * @param {string} root2
 * @returns {{ identical: boolean, divergenceDetected: boolean }}
 */
function compareMerkleRoots(root1, root2) {
  const identical = root1 === root2;
  return {
    identical,
    divergenceDetected: !identical,
  };
}

/**
 * Generate a Merkle proof for a specific field inside a twinState.
 * @param {Object} twinState
 * @param {string} field — dot-notation path, e.g. "weather.temp"
 * @returns {{ proof: string[], leaf: string, valid: boolean }}
 */
function generateProof(twinState, field) {
  const { leaves, tree } = buildMerkleRoot(twinState);

  // Find the leaf that starts with the requested field
  const targetLeaf = leaves.find((l) => l.startsWith(`${field}:`));
  if (!targetLeaf) {
    return { proof: [], leaf: null, valid: false };
  }

  const leafHash = sha256(targetLeaf);
  const proof = tree.getProof(leafHash).map((p) => p.data.toString('hex'));
  const valid = tree.verify(
    tree.getProof(leafHash),
    leafHash,
    tree.getRoot()
  );

  return { proof, leaf: targetLeaf, valid };
}

module.exports = {
  buildMerkleRoot,
  compareMerkleRoots,
  generateProof,
  flattenState,
};
