// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title IAntiGravityToken
 * @notice Interface for the AntiGravityToken contract used by the Anchor.
 */
interface IAntiGravityToken {
    function mint(address to, uint256 amount) external;
}

/**
 * @title AntiGravityAnchor
 * @author AntiGravity Team
 * @notice Core contract for anchoring digital twin Merkle roots on-chain,
 *         managing dark periods during infrastructure attacks, and recording
 *         tamper evidence. Rewards agents with AGVT tokens for contributions.
 * @dev Agents submit Merkle roots every ~60 seconds to create an immutable
 *      audit trail. During dark periods (infrastructure attacks), agents can
 *      submit tamper evidence comparing pre-attack and post-attack states.
 */
contract AntiGravityAnchor is Ownable, ReentrancyGuard {
    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    /// @notice Represents a single Merkle root anchor submission
    struct MerkleAnchor {
        bytes32 root;
        string ipfsCID;
        uint256 timestamp;
        address submitter;
        uint256 blockNumber;
    }

    /// @notice Represents a dark period (infrastructure attack window)
    struct DarkPeriod {
        uint256 startTime;
        uint256 endTime;
        string forensicReportCID;
        bool active;
        address declaredBy;
    }

    /// @notice Represents on-chain tamper evidence
    struct TamperEvidence {
        bytes32 preAttackRoot;
        bytes32 postAttackRoot;
        string evidenceCID;
        address submitter;
        uint256 timestamp;
    }

    /// @notice Tracks cumulative statistics for each agent
    struct AgentStats {
        uint256 totalAnchors;
        uint256 totalRewards;
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────

    /// @notice Reference to the AGVT token contract
    IAntiGravityToken public immutable agvtToken;

    /// @notice Reward for submitting a Merkle root anchor (100 AGVT)
    uint256 public constant ANCHOR_REWARD = 100 * 1e18;

    /// @notice Reward for submitting tamper evidence (1000 AGVT)
    uint256 public constant TAMPER_REWARD = 1000 * 1e18;

    /// @notice Ordered list of all Merkle root submissions
    MerkleAnchor[] public merkleHistory;

    /// @notice Ordered list of all dark periods
    DarkPeriod[] public darkPeriods;

    /// @notice Ordered list of all tamper evidence submissions
    TamperEvidence[] public tamperEvidences;

    /// @notice Per-agent cumulative stats
    mapping(address => AgentStats) public agentStats;

    /// @notice Addresses authorized to declare dark periods (in addition to owner)
    mapping(address => bool) public authorizedAgents;

    /// @notice Tracks total tamper evidence submissions
    uint256 public tamperCount;

    /// @notice Tracks if a dark period is currently active
    bool public darkPeriodActive;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    /// @dev Emitted when a new Merkle root is anchored
    event RootAnchored(
        bytes32 indexed root,
        string ipfsCID,
        uint256 timestamp,
        address indexed submitter,
        uint256 indexed anchorIndex
    );

    /// @dev Emitted when a dark period is declared
    event DarkPeriodStarted(uint256 indexed darkPeriodId, uint256 startTime, address indexed declaredBy);

    /// @dev Emitted when a dark period ends
    event DarkPeriodEnded(uint256 indexed darkPeriodId, uint256 endTime, string reportCID);

    /// @dev Emitted when tamper evidence is submitted
    event TamperDetected(
        bytes32 indexed preAttackRoot,
        bytes32 indexed postAttackRoot,
        string evidenceCID,
        address indexed submitter,
        uint256 evidenceIndex
    );

    /// @dev Emitted when an agent is authorized or deauthorized
    event AgentAuthorizationUpdated(address indexed agent, bool authorized);

    // ──────────────────────────────────────────────
    //  Errors
    // ──────────────────────────────────────────────

    /// @dev Thrown when a non-authorized caller tries to declare a dark period
    error NotAuthorized();

    /// @dev Thrown when trying to declare a dark period while one is already active
    error DarkPeriodAlreadyActive();

    /// @dev Thrown when trying to end a dark period when none is active
    error NoDarkPeriodActive();

    /// @dev Thrown when the requested count exceeds available history
    error InsufficientHistory();

    /// @dev Thrown when an empty IPFS CID is provided
    error EmptyIPFSCID();

    /// @dev Thrown when pre and post attack roots are identical
    error RootsMustDiffer();

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @notice Deploys the AntiGravityAnchor contract.
     * @param _tokenAddress The address of the deployed AntiGravityToken contract
     */
    constructor(address _tokenAddress) Ownable(msg.sender) {
        agvtToken = IAntiGravityToken(_tokenAddress);
    }

    // ──────────────────────────────────────────────
    //  Agent Authorization
    // ──────────────────────────────────────────────

    /**
     * @notice Authorizes or deauthorizes an agent to declare dark periods.
     * @dev Only callable by the contract owner.
     * @param agent The address to authorize or deauthorize
     * @param authorized Whether the agent should be authorized
     */
    function setAgentAuthorization(address agent, bool authorized) external onlyOwner {
        authorizedAgents[agent] = authorized;
        emit AgentAuthorizationUpdated(agent, authorized);
    }

    // ──────────────────────────────────────────────
    //  Core Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Submits a Merkle root anchoring the current state of a digital twin.
     * @dev Anyone can submit. The submitter is rewarded with 100 AGVT tokens.
     *      This creates an immutable on-chain record that can be used to detect
     *      tampering during dark periods.
     * @param root The Merkle root hash of the digital twin state
     * @param ipfsCID The IPFS content identifier pointing to the full state data
     * @param timestamp The off-chain timestamp when the state snapshot was taken
     */
    function submitMerkleRoot(
        bytes32 root,
        string calldata ipfsCID,
        uint256 timestamp
    ) external nonReentrant {
        if (bytes(ipfsCID).length == 0) revert EmptyIPFSCID();

        uint256 anchorIndex = merkleHistory.length;

        merkleHistory.push(
            MerkleAnchor({
                root: root,
                ipfsCID: ipfsCID,
                timestamp: timestamp,
                submitter: msg.sender,
                blockNumber: block.number
            })
        );

        agentStats[msg.sender].totalAnchors += 1;
        agentStats[msg.sender].totalRewards += ANCHOR_REWARD;

        agvtToken.mint(msg.sender, ANCHOR_REWARD);

        emit RootAnchored(root, ipfsCID, timestamp, msg.sender, anchorIndex);
    }

    /**
     * @notice Declares the start of a dark period (infrastructure attack detected).
     * @dev Only callable by the contract owner or an authorized agent.
     *      Only one dark period can be active at a time.
     */
    function declareDarkPeriod() external nonReentrant {
        if (msg.sender != owner() && !authorizedAgents[msg.sender]) revert NotAuthorized();

        // Check no active dark period
        uint256 periodCount = darkPeriods.length;
        if (periodCount > 0 && darkPeriods[periodCount - 1].active) {
            revert DarkPeriodAlreadyActive();
        }

        uint256 darkPeriodId = periodCount;

        darkPeriods.push(
            DarkPeriod({
                startTime: block.timestamp,
                endTime: 0,
                forensicReportCID: "",
                active: true,
                declaredBy: msg.sender
            })
        );

        darkPeriodActive = true;

        emit DarkPeriodStarted(darkPeriodId, block.timestamp, msg.sender);
    }

    /**
     * @notice Ends the currently active dark period and stores the forensic report.
     * @dev Only callable by the contract owner or an authorized agent.
     *      Requires an active dark period to exist.
     * @param forensicReportCID The IPFS CID of the AI-generated forensic report
     */
    function endDarkPeriod(string calldata forensicReportCID) external nonReentrant {
        if (msg.sender != owner() && !authorizedAgents[msg.sender]) revert NotAuthorized();
        if (bytes(forensicReportCID).length == 0) revert EmptyIPFSCID();

        uint256 periodCount = darkPeriods.length;
        if (periodCount == 0 || !darkPeriods[periodCount - 1].active) {
            revert NoDarkPeriodActive();
        }

        uint256 darkPeriodId = periodCount - 1;
        DarkPeriod storage period = darkPeriods[darkPeriodId];
        period.endTime = block.timestamp;
        period.forensicReportCID = forensicReportCID;
        period.active = false;

        darkPeriodActive = false;

        emit DarkPeriodEnded(darkPeriodId, block.timestamp, forensicReportCID);
    }

    /**
     * @notice Submits tamper evidence comparing pre-attack and post-attack states.
     * @dev Anyone can submit evidence. The submitter is rewarded with 1000 AGVT tokens.
     *      Pre and post-attack roots must be different to constitute evidence of tampering.
     * @param preAttackRoot The Merkle root of the digital twin state before the attack
     * @param postAttackRoot The Merkle root of the digital twin state after the attack
     * @param evidenceCID The IPFS CID pointing to the detailed tamper evidence data
     */
    function submitTamperEvidence(
        bytes32 preAttackRoot,
        bytes32 postAttackRoot,
        string calldata evidenceCID
    ) external nonReentrant {
        if (preAttackRoot == postAttackRoot) revert RootsMustDiffer();
        if (bytes(evidenceCID).length == 0) revert EmptyIPFSCID();

        uint256 evidenceIndex = tamperEvidences.length;

        tamperEvidences.push(
            TamperEvidence({
                preAttackRoot: preAttackRoot,
                postAttackRoot: postAttackRoot,
                evidenceCID: evidenceCID,
                submitter: msg.sender,
                timestamp: block.timestamp
            })
        );

        agentStats[msg.sender].totalRewards += TAMPER_REWARD;
        tamperCount += 1;

        agvtToken.mint(msg.sender, TAMPER_REWARD);

        emit TamperDetected(preAttackRoot, postAttackRoot, evidenceCID, msg.sender, evidenceIndex);
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Returns the last N Merkle root anchors from the history.
     * @dev If count exceeds the total history length, all records are returned.
     * @param count The number of recent anchors to retrieve
     * @return anchors Array of MerkleAnchor structs
     */
    function getMerkleHistory(uint256 count) external view returns (MerkleAnchor[] memory anchors) {
        uint256 total = merkleHistory.length;
        uint256 returnCount = count > total ? total : count;

        anchors = new MerkleAnchor[](returnCount);
        uint256 startIndex = total - returnCount;

        for (uint256 i = 0; i < returnCount; i++) {
            anchors[i] = merkleHistory[startIndex + i];
        }
    }

    /**
     * @notice Returns cumulative statistics for a given agent.
     * @param agent The address of the agent to query
     * @return totalAnchors The total number of Merkle roots submitted by the agent
     * @return totalRewards The total AGVT tokens earned by the agent
     */
    function getAgentStats(address agent)
        external
        view
        returns (uint256 totalAnchors, uint256 totalRewards)
    {
        AgentStats storage stats = agentStats[agent];
        return (stats.totalAnchors, stats.totalRewards);
    }

    /**
     * @notice Returns the total number of anchored Merkle roots.
     * @return count The length of the merkleHistory array
     */
    function getMerkleCount() external view returns (uint256 count) {
        return merkleHistory.length;
    }

    /**
     * @notice Returns the total number of dark periods (active and ended).
     * @return count The length of the darkPeriods array
     */
    function getDarkPeriodCount() external view returns (uint256 count) {
        return darkPeriods.length;
    }

    /**
     * @notice Returns the total number of tamper evidence submissions.
     * @return count The length of the tamperEvidences array
     */
    function getTamperEvidenceCount() external view returns (uint256 count) {
        return tamperEvidences.length;
    }

    /**
     * @notice Returns the total number of tamper evidence submissions.
     * @return count The total tamper count
     */
    function getTamperCount() external view returns (uint256 count) {
        return tamperCount;
    }
}
