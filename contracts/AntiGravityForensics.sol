// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title AntiGravityForensics
 * @author AntiGravity Team
 * @notice Stores AI-generated forensic reports for dark period events in the
 *         AntiGravity ecosystem. Provides an immutable on-chain record of
 *         every forensic analysis performed by the Gemini AI forensics engine.
 * @dev Each forensic report is linked to a dark period ID from the
 *      AntiGravityAnchor contract and stores pre/post attack Merkle roots,
 *      tamper detection results, confidence scores, and IPFS report CIDs.
 */
contract AntiGravityForensics is Ownable, ReentrancyGuard {
    // ──────────────────────────────────────────────
    //  Types
    // ──────────────────────────────────────────────

    /// @notice Represents a complete AI forensic report for a dark period
    struct ForensicReport {
        uint256 darkPeriodId;
        string geminiReportCID;
        bytes32 preRoot;
        bytes32 postRoot;
        bool tamperDetected;
        uint256 confidenceScore;
        address filedBy;
        uint256 timestamp;
        bool exists;
    }

    // ──────────────────────────────────────────────
    //  State Variables
    // ──────────────────────────────────────────────

    /// @notice Address of the AntiGravityAnchor contract
    address public immutable anchorContract;

    /// @notice Maps dark period IDs to their forensic reports
    mapping(uint256 => ForensicReport) public forensicReports;

    /// @notice Total number of forensic reports filed
    uint256 public totalReports;

    /// @notice Total number of tampering events detected across all reports
    uint256 public tamperCount;

    /// @notice Array of all dark period IDs that have reports (for enumeration)
    uint256[] private _reportedPeriods;

    // ──────────────────────────────────────────────
    //  Events
    // ──────────────────────────────────────────────

    /// @dev Emitted when a new forensic report is filed
    event ForensicReportFiled(
        uint256 indexed darkPeriodId,
        string geminiReportCID,
        bytes32 indexed preRoot,
        bytes32 indexed postRoot,
        bool tamperDetected,
        uint256 confidenceScore,
        address filedBy
    );

    // ──────────────────────────────────────────────
    //  Errors
    // ──────────────────────────────────────────────

    /// @dev Thrown when a non-authorized caller tries to file a report
    error NotAuthorized();

    /// @dev Thrown when a report already exists for a given dark period
    error ReportAlreadyExists();

    /// @dev Thrown when no report exists for a queried dark period
    error ReportNotFound();

    /// @dev Thrown when an empty report CID is provided
    error EmptyReportCID();

    /// @dev Thrown when the confidence score exceeds 100
    error InvalidConfidenceScore();

    // ──────────────────────────────────────────────
    //  Constructor
    // ──────────────────────────────────────────────

    /**
     * @notice Deploys the AntiGravityForensics contract.
     * @param _anchorContract The address of the deployed AntiGravityAnchor contract
     */
    constructor(address _anchorContract) Ownable(msg.sender) {
        anchorContract = _anchorContract;
    }

    // ──────────────────────────────────────────────
    //  Core Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Records a new AI forensic report for a specific dark period.
     * @dev Only callable by the contract owner or the AntiGravityAnchor contract.
     *      Each dark period can only have one forensic report.
     *      Confidence score must be between 0 and 100 (inclusive).
     * @param darkPeriodId The ID of the dark period this report covers
     * @param geminiReportCID The IPFS CID of the full Gemini AI forensic report
     * @param preRoot The Merkle root of the digital twin state before the attack
     * @param postRoot The Merkle root of the digital twin state after the attack
     * @param tamperDetected Whether the AI detected tampering during analysis
     * @param confidenceScore The AI's confidence in its analysis (0-100)
     */
    function recordForensicReport(
        uint256 darkPeriodId,
        string calldata geminiReportCID,
        bytes32 preRoot,
        bytes32 postRoot,
        bool tamperDetected,
        uint256 confidenceScore
    ) external nonReentrant {
        if (msg.sender != owner() && msg.sender != anchorContract) revert NotAuthorized();
        if (forensicReports[darkPeriodId].exists) revert ReportAlreadyExists();
        if (bytes(geminiReportCID).length == 0) revert EmptyReportCID();
        if (confidenceScore > 100) revert InvalidConfidenceScore();

        forensicReports[darkPeriodId] = ForensicReport({
            darkPeriodId: darkPeriodId,
            geminiReportCID: geminiReportCID,
            preRoot: preRoot,
            postRoot: postRoot,
            tamperDetected: tamperDetected,
            confidenceScore: confidenceScore,
            filedBy: msg.sender,
            timestamp: block.timestamp,
            exists: true
        });

        totalReports += 1;
        _reportedPeriods.push(darkPeriodId);

        if (tamperDetected) {
            tamperCount += 1;
        }

        emit ForensicReportFiled(
            darkPeriodId,
            geminiReportCID,
            preRoot,
            postRoot,
            tamperDetected,
            confidenceScore,
            msg.sender
        );
    }

    // ──────────────────────────────────────────────
    //  View Functions
    // ──────────────────────────────────────────────

    /**
     * @notice Retrieves the full forensic report for a given dark period.
     * @param darkPeriodId The ID of the dark period to query
     * @return report The complete ForensicReport struct
     */
    function getReport(uint256 darkPeriodId) external view returns (ForensicReport memory report) {
        if (!forensicReports[darkPeriodId].exists) revert ReportNotFound();
        return forensicReports[darkPeriodId];
    }

    /**
     * @notice Returns the total number of tampering events detected across all reports.
     * @return count The cumulative tamper count
     */
    function getTamperCount() external view returns (uint256 count) {
        return tamperCount;
    }

    /**
     * @notice Returns all dark period IDs that have forensic reports filed.
     * @return periodIds Array of dark period IDs with reports
     */
    function getReportedPeriods() external view returns (uint256[] memory periodIds) {
        return _reportedPeriods;
    }

    /**
     * @notice Returns the total number of forensic reports filed.
     * @return count The total report count
     */
    function getTotalReports() external view returns (uint256 count) {
        return totalReports;
    }
}
