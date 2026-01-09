import { describe, it, expect, beforeEach } from "vitest";
import { BaseAuction, BidResult } from "./BaseAuction.js";
import { AuctionBasicResource } from "./AuctionBasicResource.js";
import { AuctionBuyRice } from "./AuctionBuyRice.js";
import { AuctionSellRice } from "./AuctionSellRice.js";
import { AuctionUniqueItem } from "./AuctionUniqueItem.js";
import { AuctionFactory } from "./AuctionFactory.js";
import { AuctionInfo, AuctionBid } from "./types.js";
import { General } from "../entities.js";

// Mock General for testing
function createMockGeneral(overrides: Partial<General> = {}): General {
  return {
    id: 1,
    name: "유비",
    nationId: 1,
    cityId: 1,
    gold: 10000,
    rice: 10000,
    leadership: 7,
    strength: 7,
    intel: 7,
    politics: 7,
    charm: 8,
    crew: 1000,
    crewType: 0,
    train: 80,
    atmos: 80,
    injury: 0,
    experience: 1000,
    dedication: 1000,
    weapon: "None",
    book: "None",
    horse: "None",
    item: "None",
    special: "None",
    specAge: 20,
    special2: "None",
    specAge2: 0,
    turnTime: new Date(),
    killTurn: 10,
    ...overrides,
  } as General;
}

function createMockAuctionInfo(overrides: Partial<AuctionInfo> = {}): AuctionInfo {
  const now = new Date();
  const closeDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now

  return {
    id: 1,
    type: "BuyRice",
    finished: false,
    target: null,
    hostGeneralId: 2,
    reqResource: "gold",
    openDate: now,
    closeDate,
    detail: {
      title: "Test Auction",
      hostName: "조조",
      remainCloseDateExtensionCnt: 3,
      isReverse: false,
      startBidAmount: 100,
      finishBidAmount: 500,
      amount: 1000,
      availableLatestBidCloseDate: new Date(closeDate.getTime() + 24 * 60 * 60 * 1000),
    },
    ...overrides,
  };
}

describe("Auction System", () => {
  describe("BaseAuction", () => {
    describe("genObfuscatedName", () => {
      it("should generate consistent obfuscated names for same id and seed", () => {
        const namePool = {
          first: ["김", "이", "박"] as const,
          middle: ["영", "민", "준"] as const,
          last: ["호", "석", "우"] as const,
        };

        const name1 = BaseAuction.genObfuscatedName(0, "test-seed", namePool);
        const name2 = BaseAuction.genObfuscatedName(0, "test-seed", namePool);

        expect(name1).toBe(name2);
      });

      it("should generate different names for different ids", () => {
        const namePool = {
          first: ["김", "이", "박"] as const,
          middle: ["영", "민", "준"] as const,
          last: ["호", "석", "우"] as const,
        };

        const name1 = BaseAuction.genObfuscatedName(0, "test-seed", namePool);
        const name2 = BaseAuction.genObfuscatedName(1, "test-seed", namePool);

        expect(name1).not.toBe(name2);
      });

      it("should append index when exceeding pool size", () => {
        const namePool = {
          first: ["김"] as const,
          middle: ["영"] as const,
          last: ["호"] as const,
        };

        // Pool size = 1, so id=1 should get suffix
        const name0 = BaseAuction.genObfuscatedName(0, "test-seed", namePool);
        const name1 = BaseAuction.genObfuscatedName(1, "test-seed", namePool);

        expect(name0).toBe("김영호");
        expect(name1).toBe("김영호1");
      });
    });
  });

  describe("AuctionBasicResource", () => {
    describe("validateOpenAuctionParams", () => {
      it("should reject invalid close turn count", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(500, 0, 250, 550);
        expect(error).toContain("종료기한");
      });

      it("should reject amount below minimum", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(50, 10, 25, 55);
        expect(error).toContain("거래량");
      });

      it("should reject amount above maximum", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(20000, 10, 10000, 22000);
        expect(error).toContain("거래량");
      });

      it("should reject start bid outside 50%-200% range", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(1000, 10, 200, 1100);
        expect(error).toContain("시작거래가");
      });

      it("should reject finish bid below 110%", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(1000, 10, 500, 1000);
        expect(error).toContain("즉시거래가");
      });

      it("should accept valid parameters", () => {
        const error = AuctionBasicResource.validateOpenAuctionParams(1000, 10, 500, 1100);
        expect(error).toBeNull();
      });
    });
  });

  describe("AuctionBuyRice", () => {
    let auction: AuctionBuyRice;
    let general: General;

    beforeEach(() => {
      general = createMockGeneral();
      const info = createMockAuctionInfo({ type: "BuyRice" });
      auction = new AuctionBuyRice(info, general);
    });

    it("should have correct resource types", () => {
      expect(auction.getHostRes()).toBe("rice");
      expect(auction.getBidderRes()).toBe("gold");
    });

    it("should return auction info", () => {
      const info = auction.getInfo();
      expect(info.type).toBe("BuyRice");
      expect(info.finished).toBe(false);
    });

    it("should accept valid bid", () => {
      auction.setHighestBid(null);
      const error = auction.bid(200, false);
      expect(error).toBeNull();
    });

    it("should reject bid on finished auction", () => {
      const info = createMockAuctionInfo({ type: "BuyRice", finished: true });
      const finishedAuction = new AuctionBuyRice(info, general);
      const error = finishedAuction.bid(200, false);
      expect(error).not.toBeNull();
    });
  });

  describe("AuctionSellRice", () => {
    it("should have correct resource types (reverse of BuyRice)", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "SellRice",
        detail: {
          title: "Test Sell Rice",
          hostName: "조조",
          remainCloseDateExtensionCnt: 3,
          isReverse: true, // Reverse auction
          startBidAmount: 1000, // Start high
          finishBidAmount: 100, // Go low
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionSellRice(info, general);

      expect(auction.getHostRes()).toBe("gold");
      expect(auction.getBidderRes()).toBe("rice");
    });
  });

  describe("AuctionUniqueItem", () => {
    let auction: AuctionUniqueItem;
    let general: General;

    beforeEach(() => {
      general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "UniqueItem",
        target: "che_sword_cheongjungsword", // A unique sword
        reqResource: "inheritancePoint",
      });
      auction = new AuctionUniqueItem(info, general);
    });

    it("should reject bid if item does not exist in registry", () => {
      // che_sword_cheongjungsword is not in the item registry
      const info = createMockAuctionInfo({
        type: "UniqueItem",
        target: "nonexistent_item",
        reqResource: "inheritancePoint",
      });
      const auctionWithBadItem = new AuctionUniqueItem(info, general);

      const error = auctionWithBadItem.bid(1000, false);
      expect(error).toContain("존재하지 않는 아이템");
    });

    it("should reject bid if general already owns the same item", () => {
      // Use a known item from the registry
      const generalWithItem = createMockGeneral({ weapon: "che_weapon_sword" });
      const info = createMockAuctionInfo({
        type: "UniqueItem",
        target: "che_weapon_sword",
        reqResource: "inheritancePoint",
      });
      const auctionWithOwner = new AuctionUniqueItem(info, generalWithItem);

      const error = auctionWithOwner.bid(1000, false);
      // Either "이미 가진 아이템" or "존재하지 않는 아이템" depending on registry
      expect(error).not.toBeNull();
    });
  });

  describe("AuctionFactory", () => {
    it("should create AuctionBuyRice for BuyRice type", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({ type: "BuyRice" });
      const auction = AuctionFactory.create(info, general);

      expect(auction).toBeInstanceOf(AuctionBuyRice);
    });

    it("should create AuctionSellRice for SellRice type", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({ type: "SellRice" });
      const auction = AuctionFactory.create(info, general);

      expect(auction).toBeInstanceOf(AuctionSellRice);
    });

    it("should create AuctionUniqueItem for UniqueItem type", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({ type: "UniqueItem", target: "some_item" });
      const auction = AuctionFactory.create(info, general);

      expect(auction).toBeInstanceOf(AuctionUniqueItem);
    });

    it("should throw for unsupported type", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({ type: "BasicResource" as any }); // BasicResource not in factory

      expect(() => AuctionFactory.create(info, general)).toThrow("지원하지 않는 경매 타입");
    });
  });

  describe("Bid validation", () => {
    it("should reject bid below start amount", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "BuyRice",
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 3,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);
      auction.setHighestBid(null);

      // bid() calls _bid() internally which validates the amount
      const error = auction.bid(50, false); // Below start
      expect(error).toContain("시작가"); // Should reject below start amount
    });

    it("should reject bid above finish amount in normal auction", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "BuyRice",
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 3,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);

      // Set a highest bid first
      auction.setHighestBid({
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 3,
        amount: 200,
        bidDate: new Date(),
        aux: {
          userName: "test",
          obfuscatedName: "익명",
          tryExtendCloseDate: false,
        },
      });

      const error = auction.bid(600, false); // Above finish
      expect(error).toContain("즉시 낙찰가"); // Should reject above finish amount
    });

    it("should accept valid bid within range", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "BuyRice",
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 3,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);
      auction.setHighestBid(null);

      const error = auction.bid(200, false); // Within valid range
      expect(error).toBeNull();
    });
  });

  describe("Close date extension", () => {
    it("should allow extending close date when extension count > 0", () => {
      const general = createMockGeneral();
      const now = new Date();
      const closeDate = new Date(now.getTime() + 60 * 60 * 1000);
      const info = createMockAuctionInfo({
        type: "BuyRice",
        closeDate,
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 3,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);

      const newCloseDate = new Date(closeDate.getTime() + 30 * 60 * 1000);
      const error = auction.extendCloseDate(newCloseDate);

      expect(error).toBeNull();
      expect(auction.getInfo().closeDate.getTime()).toBe(newCloseDate.getTime());
      expect(auction.getInfo().detail.remainCloseDateExtensionCnt).toBe(2);
    });

    it("should reject extension when count is 0", () => {
      const general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "BuyRice",
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 0,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);

      const newCloseDate = new Date(info.closeDate.getTime() + 30 * 60 * 1000);
      const error = auction.extendCloseDate(newCloseDate);

      expect(error).toContain("더 이상 연장할 수 없습니다");
    });

    it("should allow forced extension regardless of count", () => {
      const general = createMockGeneral();
      const now = new Date();
      const closeDate = new Date(now.getTime() + 60 * 60 * 1000);
      const info = createMockAuctionInfo({
        type: "BuyRice",
        closeDate,
        detail: {
          title: "Test",
          hostName: "조조",
          remainCloseDateExtensionCnt: 0,
          isReverse: false,
          startBidAmount: 100,
          finishBidAmount: 500,
          amount: 1000,
          availableLatestBidCloseDate: null,
        },
      });
      const auction = new AuctionBuyRice(info, general);

      const newCloseDate = new Date(closeDate.getTime() + 30 * 60 * 1000);
      const error = auction.extendCloseDate(newCloseDate, true); // force=true

      expect(error).toBeNull();
    });
  });

  describe("tryFinish", () => {
    it("should return null if auction not yet closed", () => {
      const general = createMockGeneral();
      const now = new Date();
      const closeDate = new Date(now.getTime() + 60 * 60 * 1000); // 1 hour from now
      const info = createMockAuctionInfo({ closeDate });
      const auction = new AuctionBuyRice(info, general);

      const result = auction.tryFinish(now);
      expect(result).toBeNull();
    });

    it("should rollback if no highest bid when auction closes", () => {
      const general = createMockGeneral();
      const now = new Date();
      const closeDate = new Date(now.getTime() - 1000); // Already closed
      const info = createMockAuctionInfo({ closeDate });
      const auction = new AuctionBuyRice(info, general);
      auction.setHighestBid(null);

      const result = auction.tryFinish(now);
      expect(result).toBe(true);
      expect(auction.getInfo().finished).toBe(true);
    });
  });

  describe("Inheritance Point Bid Validation (Legacy Parity)", () => {
    // Test class to expose protected validateInheritancePointBid method
    class TestableAuction extends AuctionBuyRice {
      public testValidateInheritancePointBid(
        amount: number,
        highestBid: AuctionBid | null
      ): string | null {
        return this.validateInheritancePointBid(amount, highestBid);
      }
    }

    let auction: TestableAuction;
    let general: General;

    beforeEach(() => {
      general = createMockGeneral();
      const info = createMockAuctionInfo({
        type: "BuyRice",
        reqResource: "inheritancePoint",
      });
      auction = new TestableAuction(info, general);
    });

    it("should allow any bid amount when there is no highest bid", () => {
      const error = auction.testValidateInheritancePointBid(100, null);
      expect(error).toBeNull();
    });

    it("should require 1% higher bid than current highest (legacy line 286)", () => {
      const highestBid: AuctionBid = {
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 2,
        amount: 1000,
        bidDate: new Date(),
        aux: { userName: "test", obfuscatedName: "익명", tryExtendCloseDate: false },
      };

      // 1000 * 1.01 = 1010, so 1009 should fail
      const error = auction.testValidateInheritancePointBid(1009, highestBid);
      expect(error).toContain("1%");
    });

    it("should require at least 10 points higher bid (legacy line 289)", () => {
      const highestBid: AuctionBid = {
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 2,
        amount: 100, // 1% of 100 = 1, so 10 point rule takes precedence
        bidDate: new Date(),
        aux: { userName: "test", obfuscatedName: "익명", tryExtendCloseDate: false },
      };

      // 100 + 10 = 110, so 109 should fail
      const error = auction.testValidateInheritancePointBid(109, highestBid);
      expect(error).toContain("10 포인트");
    });

    it("should accept bid that satisfies both 1% AND 10 point rules", () => {
      const highestBid: AuctionBid = {
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 2,
        amount: 1000,
        bidDate: new Date(),
        aux: { userName: "test", obfuscatedName: "익명", tryExtendCloseDate: false },
      };

      // 1000 * 1.01 = 1010, and 1000 + 10 = 1010, so 1010 should pass
      const error = auction.testValidateInheritancePointBid(1010, highestBid);
      expect(error).toBeNull();
    });

    it("should fail if only 1% rule passes but not 10 point rule", () => {
      const highestBid: AuctionBid = {
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 2,
        amount: 500, // 1% = 5 points, need 10 points
        bidDate: new Date(),
        aux: { userName: "test", obfuscatedName: "익명", tryExtendCloseDate: false },
      };

      // 500 * 1.01 = 505 (passes 1%), but 500 + 10 = 510 (fails 10 point rule)
      const error = auction.testValidateInheritancePointBid(506, highestBid);
      expect(error).toContain("10 포인트");
    });

    it("should fail if only 10 point rule passes but not 1% rule", () => {
      const highestBid: AuctionBid = {
        id: 1,
        auctionId: 1,
        userId: "user1",
        generalId: 2,
        amount: 2000, // 1% = 20 points, so 10 points is not enough
        bidDate: new Date(),
        aux: { userName: "test", obfuscatedName: "익명", tryExtendCloseDate: false },
      };

      // 2000 + 10 = 2010 (passes 10 point), but 2000 * 1.01 = 2020 (fails 1%)
      const error = auction.testValidateInheritancePointBid(2015, highestBid);
      expect(error).toContain("1%");
    });
  });

  describe("BaseAuction Constants (Legacy Parity)", () => {
    it("should have correct auction close minutes coefficient", () => {
      expect(BaseAuction.COEFF_AUCTION_CLOSE_MINUTES).toBe(24);
    });

    it("should have correct extension minutes per bid coefficient", () => {
      expect(BaseAuction.COEFF_EXTENSION_MINUTES_PER_BID).toBeCloseTo(1 / 6);
    });

    it("should have correct minimum extension minutes", () => {
      expect(BaseAuction.MIN_AUCTION_CLOSE_MINUTES).toBe(30);
      expect(BaseAuction.MIN_EXTENSION_MINUTES_PER_BID).toBe(1);
      expect(BaseAuction.MIN_EXTENSION_MINUTES_LIMIT_BY_BID).toBe(5);
      expect(BaseAuction.MIN_EXTENSION_MINUTES_BY_EXTENSION_QUERY).toBe(5);
    });
  });
});
