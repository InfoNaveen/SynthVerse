const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-toolbox/network-helpers");

describe("AntiGravity", function () {
  // ═══════════════════════════════════════════════════════
  //  Shared Fixture
  // ═══════════════════════════════════════════════════════
  async function deployFullSuiteFixture() {
    const [owner, agent1, agent2, agent3, unauthorized] = await ethers.getSigners();

    // Deploy Token
    const TokenFactory = await ethers.getContractFactory("AntiGravityToken");
    const token = await TokenFactory.deploy();
    await token.waitForDeployment();

    // Deploy Anchor
    const AnchorFactory = await ethers.getContractFactory("AntiGravityAnchor");
    const anchor = await AnchorFactory.deploy(await token.getAddress());
    await anchor.waitForDeployment();

    // Deploy Forensics
    const ForensicsFactory = await ethers.getContractFactory("AntiGravityForensics");
    const forensics = await ForensicsFactory.deploy(await anchor.getAddress());
    await forensics.waitForDeployment();

    // Set minter
    await token.setMinter(await anchor.getAddress());

    // Authorize agent1
    await anchor.setAgentAuthorization(agent1.address, true);

    return { token, anchor, forensics, owner, agent1, agent2, agent3, unauthorized };
  }

  // Sample data helpers
  const sampleRoot = ethers.keccak256(ethers.toUtf8Bytes("digital-twin-state-v1"));
  const sampleRoot2 = ethers.keccak256(ethers.toUtf8Bytes("digital-twin-state-v2"));
  const sampleCID = "QmYwAPJzv5CZsnAzt8auVXLm5VNZeMZF49q9p4g6NQxD3g";
  const sampleCID2 = "QmT5NvUtoM5n7fDGCNqGcjPJGU6yK8k6V1UvbJ7KZd7Fgz";
  const sampleReportCID = "QmReportXyz123abc456def789ghi012jkl345mno678pqr";
  const sampleEvidenceCID = "QmEvidenceAbc123def456ghi789jkl012mno345pqr678st";

  // ═══════════════════════════════════════════════════════
  //  AntiGravityToken Tests
  // ═══════════════════════════════════════════════════════
  describe("AntiGravityToken", function () {
    describe("Deployment", function () {
      it("should have correct name and symbol", async function () {
        const { token } = await loadFixture(deployFullSuiteFixture);
        expect(await token.name()).to.equal("AntiGravity Token");
        expect(await token.symbol()).to.equal("AGVT");
      });

      it("should have zero initial supply", async function () {
        const { token } = await loadFixture(deployFullSuiteFixture);
        expect(await token.totalSupply()).to.equal(0n);
      });

      it("should set deployerAddress as owner", async function () {
        const { token, owner } = await loadFixture(deployFullSuiteFixture);
        expect(await token.owner()).to.equal(owner.address);
      });
    });

    describe("Minter Management", function () {
      it("should allow owner to set minter", async function () {
        const { token, anchor } = await loadFixture(deployFullSuiteFixture);
        expect(await token.minter()).to.equal(await anchor.getAddress());
      });

      it("should emit MinterUpdated event", async function () {
        const { owner } = await ethers.getSigners();
        const TokenFactory = await ethers.getContractFactory("AntiGravityToken");
        const freshToken = await TokenFactory.deploy();
        await freshToken.waitForDeployment();

        const newMinter = "0x0000000000000000000000000000000000000001";
        await expect(freshToken.setMinter(newMinter))
          .to.emit(freshToken, "MinterUpdated")
          .withArgs(ethers.ZeroAddress, newMinter);
      });

      it("should revert when non-owner sets minter", async function () {
        const { token, agent1 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          token.connect(agent1).setMinter(agent1.address)
        ).to.be.revertedWithCustomError(token, "OwnableUnauthorizedAccount");
      });

      it("should revert when setting minter to zero address", async function () {
        const { token } = await loadFixture(deployFullSuiteFixture);
        await expect(
          token.setMinter(ethers.ZeroAddress)
        ).to.be.revertedWithCustomError(token, "MinterCannotBeZeroAddress");
      });
    });

    describe("Minting", function () {
      it("should revert when non-minter tries to mint", async function () {
        const { token, agent1 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          token.connect(agent1).mint(agent1.address, ethers.parseEther("100"))
        ).to.be.revertedWithCustomError(token, "OnlyMinterCanMint");
      });
    });

    describe("Agent Ranks", function () {
      it("should return GHOST for new agents", async function () {
        const { token, agent1 } = await loadFixture(deployFullSuiteFixture);
        expect(await token.getAgentRank(agent1.address)).to.equal("GHOST");
      });

      it("should return PHANTOM for agents with 1000+ AGVT", async function () {
        const { token, anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        // Submit 10 roots to earn 1000 AGVT
        for (let i = 0; i < 10; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`state-${i}`));
          await anchor.connect(agent1).submitMerkleRoot(root, `CID-${i}`, Date.now());
        }

        expect(await token.getAgentRank(agent1.address)).to.equal("PHANTOM");
      });

      it("should return WRAITH for agents with 5000+ AGVT", async function () {
        const { token, anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        // Submit 50 roots to earn 5000 AGVT
        for (let i = 0; i < 50; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`state-${i}`));
          await anchor.connect(agent1).submitMerkleRoot(root, `CID-${i}`, Date.now());
        }

        expect(await token.getAgentRank(agent1.address)).to.equal("WRAITH");
      });

      it("should return SPECTER for agents with 20000+ AGVT", async function () {
        const { token, anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        // Submit 200 roots to earn 20000 AGVT
        for (let i = 0; i < 200; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`state-${i}`));
          await anchor.connect(agent1).submitMerkleRoot(root, `CID-${i}`, Date.now());
        }

        expect(await token.getAgentRank(agent1.address)).to.equal("SPECTER");
      });
    });

    describe("Leaderboard", function () {
      it("should return empty leaderboard with no agents", async function () {
        const { token } = await loadFixture(deployFullSuiteFixture);
        const [topAgents, balances] = await token.getLeaderboard();
        expect(topAgents.length).to.equal(0);
        expect(balances.length).to.equal(0);
      });

      it("should return agents sorted by balance", async function () {
        const { token, anchor, agent1, agent2 } = await loadFixture(deployFullSuiteFixture);

        // Agent1 submits 3 roots = 300 AGVT
        for (let i = 0; i < 3; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`a1-${i}`));
          await anchor.connect(agent1).submitMerkleRoot(root, `CID-a1-${i}`, Date.now());
        }

        // Agent2 submits 5 roots = 500 AGVT
        for (let i = 0; i < 5; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`a2-${i}`));
          await anchor.connect(agent2).submitMerkleRoot(root, `CID-a2-${i}`, Date.now());
        }

        const [topAgents, balances] = await token.getLeaderboard();
        expect(topAgents.length).to.equal(2);
        expect(topAgents[0]).to.equal(agent2.address);
        expect(topAgents[1]).to.equal(agent1.address);
        expect(balances[0]).to.be.gt(balances[1]);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  AntiGravityAnchor Tests
  // ═══════════════════════════════════════════════════════
  describe("AntiGravityAnchor", function () {
    describe("Deployment", function () {
      it("should set the token address correctly", async function () {
        const { anchor, token } = await loadFixture(deployFullSuiteFixture);
        expect(await anchor.agvtToken()).to.equal(await token.getAddress());
      });

      it("should set deployer as owner", async function () {
        const { anchor, owner } = await loadFixture(deployFullSuiteFixture);
        expect(await anchor.owner()).to.equal(owner.address);
      });

      it("should have correct reward constants", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        expect(await anchor.ANCHOR_REWARD()).to.equal(ethers.parseEther("100"));
        expect(await anchor.TAMPER_REWARD()).to.equal(ethers.parseEther("1000"));
      });
    });

    describe("Agent Authorization", function () {
      it("should authorize agents correctly", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        expect(await anchor.authorizedAgents(agent1.address)).to.be.true;
      });

      it("should emit AgentAuthorizationUpdated event", async function () {
        const { anchor, agent2 } = await loadFixture(deployFullSuiteFixture);
        await expect(anchor.setAgentAuthorization(agent2.address, true))
          .to.emit(anchor, "AgentAuthorizationUpdated")
          .withArgs(agent2.address, true);
      });

      it("should revert when non-owner authorizes agents", async function () {
        const { anchor, agent1, agent2 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(agent1).setAgentAuthorization(agent2.address, true)
        ).to.be.revertedWithCustomError(anchor, "OwnableUnauthorizedAccount");
      });
    });

    describe("submitMerkleRoot", function () {
      it("should store the Merkle root correctly", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        const timestamp = Date.now();

        await anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, timestamp);

        const history = await anchor.getMerkleHistory(1);
        expect(history.length).to.equal(1);
        expect(history[0].root).to.equal(sampleRoot);
        expect(history[0].ipfsCID).to.equal(sampleCID);
        expect(history[0].submitter).to.equal(agent1.address);
      });

      it("should emit RootAnchored event", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        const timestamp = Date.now();

        await expect(anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, timestamp))
          .to.emit(anchor, "RootAnchored")
          .withArgs(sampleRoot, sampleCID, timestamp, agent1.address, 0);
      });

      it("should reward 100 AGVT to the submitter", async function () {
        const { anchor, token, agent1 } = await loadFixture(deployFullSuiteFixture);
        const timestamp = Date.now();

        await anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, timestamp);

        expect(await token.balanceOf(agent1.address)).to.equal(ethers.parseEther("100"));
      });

      it("should update agent stats", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        await anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, Date.now());
        await anchor.connect(agent1).submitMerkleRoot(sampleRoot2, sampleCID2, Date.now());

        const [totalAnchors, totalRewards] = await anchor.getAgentStats(agent1.address);
        expect(totalAnchors).to.equal(2n);
        expect(totalRewards).to.equal(ethers.parseEther("200"));
      });

      it("should revert with empty IPFS CID", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(agent1).submitMerkleRoot(sampleRoot, "", Date.now())
        ).to.be.revertedWithCustomError(anchor, "EmptyIPFSCID");
      });

      it("should allow anyone to submit (no access control)", async function () {
        const { anchor, unauthorized } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(unauthorized).submitMerkleRoot(sampleRoot, sampleCID, Date.now())
        ).to.not.be.reverted;
      });
    });

    describe("Dark Period Lifecycle", function () {
      it("should declare a dark period by owner", async function () {
        const { anchor, owner } = await loadFixture(deployFullSuiteFixture);

        await expect(anchor.declareDarkPeriod())
          .to.emit(anchor, "DarkPeriodStarted");

        expect(await anchor.getDarkPeriodCount()).to.equal(1n);
      });

      it("should declare a dark period by authorized agent", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        await expect(anchor.connect(agent1).declareDarkPeriod())
          .to.emit(anchor, "DarkPeriodStarted");
      });

      it("should revert when unauthorized user declares dark period", async function () {
        const { anchor, unauthorized } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(unauthorized).declareDarkPeriod()
        ).to.be.revertedWithCustomError(anchor, "NotAuthorized");
      });

      it("should revert on double declaration", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        await anchor.declareDarkPeriod();

        await expect(anchor.declareDarkPeriod())
          .to.be.revertedWithCustomError(anchor, "DarkPeriodAlreadyActive");
      });

      it("should end dark period and store report CID", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        await anchor.declareDarkPeriod();

        await expect(anchor.endDarkPeriod(sampleReportCID))
          .to.emit(anchor, "DarkPeriodEnded");

        const period = await anchor.darkPeriods(0);
        expect(period.active).to.be.false;
        expect(period.forensicReportCID).to.equal(sampleReportCID);
      });

      it("should revert ending dark period when none active", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.endDarkPeriod(sampleReportCID)
        ).to.be.revertedWithCustomError(anchor, "NoDarkPeriodActive");
      });

      it("should revert ending dark period with empty CID", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        await anchor.declareDarkPeriod();
        await expect(
          anchor.endDarkPeriod("")
        ).to.be.revertedWithCustomError(anchor, "EmptyIPFSCID");
      });

      it("should allow starting a new dark period after ending one", async function () {
        const { anchor } = await loadFixture(deployFullSuiteFixture);
        await anchor.declareDarkPeriod();
        await anchor.endDarkPeriod(sampleReportCID);

        await expect(anchor.declareDarkPeriod())
          .to.emit(anchor, "DarkPeriodStarted");

        expect(await anchor.getDarkPeriodCount()).to.equal(2n);
      });
    });

    describe("submitTamperEvidence", function () {
      it("should store tamper evidence correctly", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        await expect(
          anchor.connect(agent1).submitTamperEvidence(sampleRoot, sampleRoot2, sampleEvidenceCID)
        ).to.emit(anchor, "TamperDetected")
          .withArgs(sampleRoot, sampleRoot2, sampleEvidenceCID, agent1.address, 0);
      });

      it("should reward 1000 AGVT to the submitter", async function () {
        const { anchor, token, agent2 } = await loadFixture(deployFullSuiteFixture);

        await anchor.connect(agent2).submitTamperEvidence(sampleRoot, sampleRoot2, sampleEvidenceCID);

        expect(await token.balanceOf(agent2.address)).to.equal(ethers.parseEther("1000"));
      });

      it("should revert when pre and post roots are the same", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(agent1).submitTamperEvidence(sampleRoot, sampleRoot, sampleEvidenceCID)
        ).to.be.revertedWithCustomError(anchor, "RootsMustDiffer");
      });

      it("should revert with empty evidence CID", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);
        await expect(
          anchor.connect(agent1).submitTamperEvidence(sampleRoot, sampleRoot2, "")
        ).to.be.revertedWithCustomError(anchor, "EmptyIPFSCID");
      });
    });

    describe("View Functions", function () {
      it("getMerkleHistory should return last N entries", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        for (let i = 0; i < 5; i++) {
          const root = ethers.keccak256(ethers.toUtf8Bytes(`state-${i}`));
          await anchor.connect(agent1).submitMerkleRoot(root, `CID-${i}`, Date.now() + i);
        }

        const history = await anchor.getMerkleHistory(3);
        expect(history.length).to.equal(3);
      });

      it("getMerkleHistory should return all if count exceeds total", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        await anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, Date.now());

        const history = await anchor.getMerkleHistory(100);
        expect(history.length).to.equal(1);
      });

      it("getAgentStats should return zeroes for new agent", async function () {
        const { anchor, unauthorized } = await loadFixture(deployFullSuiteFixture);
        const [totalAnchors, totalRewards] = await anchor.getAgentStats(unauthorized.address);
        expect(totalAnchors).to.equal(0n);
        expect(totalRewards).to.equal(0n);
      });

      it("getMerkleCount should track total anchors", async function () {
        const { anchor, agent1 } = await loadFixture(deployFullSuiteFixture);

        expect(await anchor.getMerkleCount()).to.equal(0n);

        await anchor.connect(agent1).submitMerkleRoot(sampleRoot, sampleCID, Date.now());
        expect(await anchor.getMerkleCount()).to.equal(1n);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  AntiGravityForensics Tests
  // ═══════════════════════════════════════════════════════
  describe("AntiGravityForensics", function () {
    describe("Deployment", function () {
      it("should set anchor contract address correctly", async function () {
        const { forensics, anchor } = await loadFixture(deployFullSuiteFixture);
        expect(await forensics.anchorContract()).to.equal(await anchor.getAddress());
      });

      it("should have zero initial reports", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);
        expect(await forensics.getTotalReports()).to.equal(0n);
        expect(await forensics.getTamperCount()).to.equal(0n);
      });
    });

    describe("recordForensicReport", function () {
      it("should store a forensic report by owner", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);

        await expect(
          forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, true, 95)
        ).to.emit(forensics, "ForensicReportFiled")
          .withArgs(0, sampleReportCID, sampleRoot, sampleRoot2, true, 95, (await ethers.getSigners())[0].address);
      });

      it("should increment tamperCount when tamper detected", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);

        await forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, true, 85);
        expect(await forensics.getTamperCount()).to.equal(1n);

        await forensics.recordForensicReport(1, sampleReportCID, sampleRoot, sampleRoot2, true, 90);
        expect(await forensics.getTamperCount()).to.equal(2n);
      });

      it("should NOT increment tamperCount when no tamper", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);

        await forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, false, 10);
        expect(await forensics.getTamperCount()).to.equal(0n);
      });

      it("should revert for unauthorized callers", async function () {
        const { forensics, unauthorized } = await loadFixture(deployFullSuiteFixture);
        await expect(
          forensics.connect(unauthorized).recordForensicReport(
            0, sampleReportCID, sampleRoot, sampleRoot2, true, 95
          )
        ).to.be.revertedWithCustomError(forensics, "NotAuthorized");
      });

      it("should revert on duplicate report for same dark period", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);

        await forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, true, 95);

        await expect(
          forensics.recordForensicReport(0, sampleCID2, sampleRoot, sampleRoot2, false, 50)
        ).to.be.revertedWithCustomError(forensics, "ReportAlreadyExists");
      });

      it("should revert with empty report CID", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);
        await expect(
          forensics.recordForensicReport(0, "", sampleRoot, sampleRoot2, true, 95)
        ).to.be.revertedWithCustomError(forensics, "EmptyReportCID");
      });

      it("should revert when confidence score exceeds 100", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);
        await expect(
          forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, true, 101)
        ).to.be.revertedWithCustomError(forensics, "InvalidConfidenceScore");
      });
    });

    describe("getReport", function () {
      it("should return stored report correctly", async function () {
        const { forensics, owner } = await loadFixture(deployFullSuiteFixture);

        await forensics.recordForensicReport(42, sampleReportCID, sampleRoot, sampleRoot2, true, 88);

        const report = await forensics.getReport(42);
        expect(report.darkPeriodId).to.equal(42n);
        expect(report.geminiReportCID).to.equal(sampleReportCID);
        expect(report.preRoot).to.equal(sampleRoot);
        expect(report.postRoot).to.equal(sampleRoot2);
        expect(report.tamperDetected).to.be.true;
        expect(report.confidenceScore).to.equal(88n);
        expect(report.filedBy).to.equal(owner.address);
        expect(report.exists).to.be.true;
      });

      it("should revert for non-existent report", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);
        await expect(
          forensics.getReport(999)
        ).to.be.revertedWithCustomError(forensics, "ReportNotFound");
      });
    });

    describe("getReportedPeriods", function () {
      it("should return all reported dark period IDs", async function () {
        const { forensics } = await loadFixture(deployFullSuiteFixture);

        await forensics.recordForensicReport(0, sampleReportCID, sampleRoot, sampleRoot2, true, 95);
        await forensics.recordForensicReport(3, sampleCID, sampleRoot, sampleRoot2, false, 20);

        const periods = await forensics.getReportedPeriods();
        expect(periods.length).to.equal(2);
        expect(periods[0]).to.equal(0n);
        expect(periods[1]).to.equal(3n);
      });
    });
  });

  // ═══════════════════════════════════════════════════════
  //  Integration Tests
  // ═══════════════════════════════════════════════════════
  describe("Integration: Full Attack Lifecycle", function () {
    it("should handle a complete attack scenario end-to-end", async function () {
      const { anchor, token, forensics, owner, agent1, agent2 } = await loadFixture(deployFullSuiteFixture);

      // Phase 1: Normal operations — agents submit Merkle roots
      for (let i = 0; i < 3; i++) {
        const root = ethers.keccak256(ethers.toUtf8Bytes(`normal-state-${i}`));
        await anchor.connect(agent1).submitMerkleRoot(root, `QmNormal${i}`, Date.now() + i);
      }

      // Agent1 should have 300 AGVT, rank = GHOST
      expect(await token.balanceOf(agent1.address)).to.equal(ethers.parseEther("300"));
      expect(await token.getAgentRank(agent1.address)).to.equal("GHOST");

      // Phase 2: Attack detected — declare dark period
      await anchor.connect(agent1).declareDarkPeriod();
      expect(await anchor.getDarkPeriodCount()).to.equal(1n);

      // Phase 3: Agent2 submits tamper evidence during attack
      const preRoot = ethers.keccak256(ethers.toUtf8Bytes("pre-attack"));
      const postRoot = ethers.keccak256(ethers.toUtf8Bytes("post-attack"));
      await anchor.connect(agent2).submitTamperEvidence(preRoot, postRoot, "QmEvidence123");

      // Agent2 should have 1000 AGVT, rank = PHANTOM
      expect(await token.balanceOf(agent2.address)).to.equal(ethers.parseEther("1000"));
      expect(await token.getAgentRank(agent2.address)).to.equal("PHANTOM");

      // Phase 4: Attack resolved — end dark period
      await anchor.endDarkPeriod("QmForensicReport123");

      // Phase 5: File forensic report
      await forensics.recordForensicReport(0, "QmGeminiForensicReport", preRoot, postRoot, true, 97);

      const report = await forensics.getReport(0);
      expect(report.tamperDetected).to.be.true;
      expect(report.confidenceScore).to.equal(97n);
      expect(await forensics.getTamperCount()).to.equal(1n);

      // Verify leaderboard
      const [topAgents, balances] = await token.getLeaderboard();
      expect(topAgents[0]).to.equal(agent2.address); // 1000 AGVT
      expect(topAgents[1]).to.equal(agent1.address);  // 300 AGVT
    });
  });
});
