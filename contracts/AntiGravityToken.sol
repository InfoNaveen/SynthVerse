// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AntiGravityToken (AGVT)
 * @author AntiGravity Team
 * @notice ERC-20 reward token for the AntiGravity dark-period forensics platform.
 * @dev Minting is restricted to the designated AntiGravityAnchor contract.
 *      Agents earn AGVT by anchoring Merkle roots and submitting tamper evidence.
 *      Agents are ranked by cumulative token earnings into four tiers:
 *      GHOST → PHANTOM → WRAITH → SPECTER.
 */
contract AntiGravityToken is ERC20, Ownable, ReentrancyGuard {
    /// @notice Address of the AntiGravityAnchor contract authorized to mint tokens
    address public minter;

    /// @notice Tracks cumulative AGVT earned (minted) per agent for rank calculation
    mapping(address => uint256) public agentEarnings;

    /// @notice Array of all agents who have ever earned tokens (for leaderboard)
    address[] private _agents;

    /// @notice Tracks whether an address has been added to the _agents array
    mapping(address => bool) private _isRegisteredAgent;

    /// @dev Emitted when the minter address is updated
    event MinterUpdated(address indexed previousMinter, address indexed newMinter);

    /// @dev Emitted when tokens are minted to an agent
    event TokensMinted(address indexed agent, uint256 amount);

    /// @dev Thrown when a non-minter address attempts to mint
    error OnlyMinterCanMint();

    /// @dev Thrown when the minter address is set to the zero address
    error MinterCannotBeZeroAddress();

    /**
     * @notice Deploys the AntiGravityToken contract.
     * @dev Sets the token name to "AntiGravity Token" and symbol to "AGVT".
     *      The deployer becomes the initial owner via Ownable.
     */
    constructor() ERC20("AntiGravity Token", "AGVT") Ownable(msg.sender) {}

    /**
     * @notice Sets the authorized minter address (AntiGravityAnchor contract).
     * @dev Only callable by the contract owner. This should be called once after
     *      deploying the AntiGravityAnchor contract.
     * @param _minter The address of the AntiGravityAnchor contract
     */
    function setMinter(address _minter) external onlyOwner {
        if (_minter == address(0)) revert MinterCannotBeZeroAddress();
        address previousMinter = minter;
        minter = _minter;
        emit MinterUpdated(previousMinter, _minter);
    }

    /**
     * @notice Mints AGVT tokens to a specified agent as a reward.
     * @dev Only callable by the authorized minter (AntiGravityAnchor contract).
     *      Updates cumulative earnings for rank tracking and registers new agents.
     * @param to The address of the agent receiving the reward
     * @param amount The number of tokens to mint (in wei, 18 decimals)
     */
    function mint(address to, uint256 amount) external nonReentrant {
        if (msg.sender != minter) revert OnlyMinterCanMint();

        if (!_isRegisteredAgent[to]) {
            _agents.push(to);
            _isRegisteredAgent[to] = true;
        }

        agentEarnings[to] += amount;
        _mint(to, amount);

        emit TokensMinted(to, amount);
    }

    /**
     * @notice Returns the rank title for a given agent based on their cumulative earnings.
     * @dev Rank tiers (in whole tokens, not wei):
     *      - 0–999 AGVT      → "GHOST"
     *      - 1,000–4,999 AGVT → "PHANTOM"
     *      - 5,000–19,999 AGVT → "WRAITH"
     *      - 20,000+ AGVT     → "SPECTER"
     * @param agent The address of the agent to query
     * @return rank The string rank title of the agent
     */
    function getAgentRank(address agent) external view returns (string memory rank) {
        uint256 tokens = agentEarnings[agent] / 1e18;

        if (tokens >= 20000) {
            return "SPECTER";
        } else if (tokens >= 5000) {
            return "WRAITH";
        } else if (tokens >= 1000) {
            return "PHANTOM";
        } else {
            return "GHOST";
        }
    }

    /**
     * @notice Returns the top 10 agents ranked by current token balance.
     * @dev Iterates all registered agents and maintains a sorted top-10 list.
     *      If fewer than 10 agents exist, returns all of them.
     *      Gas cost scales linearly with total agent count — intended for off-chain reads.
     * @return topAgents Array of addresses (up to 10) sorted by descending balance
     * @return balances Corresponding balances for each agent in topAgents
     */
    function getLeaderboard()
        external
        view
        returns (address[] memory topAgents, uint256[] memory balances)
    {
        uint256 agentCount = _agents.length;
        uint256 leaderboardSize = agentCount < 10 ? agentCount : 10;

        topAgents = new address[](leaderboardSize);
        balances = new uint256[](leaderboardSize);

        // Temporary arrays for sorting
        address[] memory tempAddresses = new address[](leaderboardSize);
        uint256[] memory tempBalances = new uint256[](leaderboardSize);

        for (uint256 i = 0; i < agentCount; i++) {
            address agent = _agents[i];
            uint256 bal = balanceOf(agent);

            // Find position in the sorted top-N list
            uint256 insertPos = leaderboardSize;
            for (uint256 j = 0; j < leaderboardSize; j++) {
                if (bal > tempBalances[j]) {
                    insertPos = j;
                    break;
                }
            }

            // If the agent qualifies for the leaderboard, insert and shift
            if (insertPos < leaderboardSize) {
                for (uint256 k = leaderboardSize - 1; k > insertPos; k--) {
                    tempAddresses[k] = tempAddresses[k - 1];
                    tempBalances[k] = tempBalances[k - 1];
                }
                tempAddresses[insertPos] = agent;
                tempBalances[insertPos] = bal;
            }
        }

        topAgents = tempAddresses;
        balances = tempBalances;
    }

    /**
     * @notice Returns the total number of registered agents.
     * @return count The number of unique addresses that have earned AGVT
     */
    function getAgentCount() external view returns (uint256 count) {
        return _agents.length;
    }
}
