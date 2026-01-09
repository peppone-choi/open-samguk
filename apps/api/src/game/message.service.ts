import { Injectable } from "@nestjs/common";
import { createPrismaClient } from "@sammo/infra";

@Injectable()
export class MessageService {
  private readonly prisma = createPrismaClient();

  // 상수 정의 (레거시 PHP 참고)
  public static readonly MAILBOX_PUBLIC = 0;
  public static readonly MAILBOX_NATIONAL = 1000;

  /**
   * 최근 메시지 조회
   */
  async getRecentMessages(generalId: number, nationId: number, sequence: number = -1) {
    const sequenceClause = sequence >= 0 ? { id: { gt: sequence } } : {};

    // 1. 개인 메시지 (사서함 = generalId)
    const privateMsgs = await this.prisma.message.findMany({
      where: {
        mailbox: generalId,
        type: "private",
        ...sequenceClause,
      },
      take: 15,
      orderBy: { id: "desc" },
      include: { src: { select: { no: true, name: true, picture: true, imgSvr: true } } },
    });

    // 2. 전체 메시지 (사서함 = 0)
    const publicMsgs = await this.prisma.message.findMany({
      where: {
        mailbox: MessageService.MAILBOX_PUBLIC,
        type: "public",
        ...sequenceClause,
      },
      take: 15,
      orderBy: { id: "desc" },
      include: { src: { select: { no: true, name: true, picture: true, imgSvr: true } } },
    });

    // 3. 국가 메시지 (사서함 = 1000 + nationId)
    const nationalMailbox = MessageService.MAILBOX_NATIONAL + nationId;
    const nationalMsgs = await this.prisma.message.findMany({
      where: {
        mailbox: nationalMailbox,
        type: "national",
        ...sequenceClause,
      },
      take: 15,
      orderBy: { id: "desc" },
      include: { src: { select: { no: true, name: true, picture: true, imgSvr: true } } },
    });

    // 4. 외교 메시지
    const diplomacyMsgs = await this.prisma.message.findMany({
      where: {
        mailbox: nationalMailbox,
        type: "diplomacy",
        ...sequenceClause,
      },
      take: 15,
      orderBy: { id: "desc" },
      include: { src: { select: { no: true, name: true, picture: true, imgSvr: true } } },
    });

    // 결과 정렬 및 시퀀스 결정
    const allFetched = [...privateMsgs, ...publicMsgs, ...nationalMsgs, ...diplomacyMsgs];
    const nextSequence =
      allFetched.length > 0 ? Math.max(...allFetched.map((m) => m.id)) : sequence;

    return {
      private: privateMsgs,
      public: publicMsgs,
      national: nationalMsgs,
      diplomacy: diplomacyMsgs,
      sequence: nextSequence,
      nationId,
    };
  }

  /**
   * 메시지 전송
   */
  async sendMessage(
    srcGeneralId: number,
    mailbox: number,
    text: string,
    type: "public" | "national" | "private" | "diplomacy"
  ) {
    const me = await this.prisma.general.findUnique({
      where: { no: srcGeneralId },
      include: { nation: true },
    });

    if (!me) throw new Error("장수 정보가 없습니다.");

    let targetMailbox = mailbox;
    let messageType = type;

    // 사서함 결정 로직
    if (type === "public") {
      targetMailbox = MessageService.MAILBOX_PUBLIC;
    } else if (type === "national") {
      targetMailbox = MessageService.MAILBOX_NATIONAL + (me.nationId || 0);
    } else if (type === "diplomacy") {
      // mailbox 파라미터가 대상 국가 ID라고 가정할 때
      targetMailbox = MessageService.MAILBOX_NATIONAL + mailbox;
    } else {
      // private: mailbox가 대상 장수 ID
      targetMailbox = mailbox;
    }

    const newMessage = await this.prisma.message.create({
      data: {
        mailbox: targetMailbox,
        type: messageType,
        srcId: srcGeneralId,
        destId: type === "private" ? mailbox : 0, // private이면 destId 채움
        message: { text }, // JSON 필드에 저장
      },
    });

    return newMessage;
  }

  /**
   * 최신 메시지 읽음 처리
   */
  async readLatestMessage(generalId: number, messageIds: number[]) {
    let updatedCount = 0;

    // 개별 메시지 읽음 처리 (JSON 필드 업데이트)
    for (const msgId of messageIds) {
      const msg = await this.prisma.message.findFirst({
        where: {
          id: msgId,
          OR: [{ mailbox: generalId }, { destId: generalId }],
        },
      });
      if (msg) {
        const messageData = (msg.message as any) || {};
        messageData.read = true;
        messageData.readAt = new Date().toISOString();
        await this.prisma.message.update({
          where: { id: msgId },
          data: { message: messageData },
        });
        updatedCount++;
      }
    }

    return { success: true, count: updatedCount };
  }

  /**
   * 메시지 삭제
   */
  async deleteMessage(generalId: number, messageId: number) {
    // 해당 장수가 접근 가능한 메시지인지 확인
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        OR: [
          { mailbox: generalId }, // 개인 사서함
          { destId: generalId }, // 수신자
          { srcId: generalId }, // 발신자 (자신이 보낸 메시지)
        ],
      },
    });

    if (!message) {
      throw new Error("메시지를 찾을 수 없거나 삭제 권한이 없습니다.");
    }

    // 실제 삭제가 아닌 soft delete (aux에 deleted 마킹)
    const messageData = (message.message as any) || {};
    messageData.deletedBy = messageData.deletedBy || [];
    if (!messageData.deletedBy.includes(generalId)) {
      messageData.deletedBy.push(generalId);
    }

    await this.prisma.message.update({
      where: { id: messageId },
      data: { message: messageData },
    });

    return { success: true, messageId };
  }

  /**
   * 과거 메시지 조회 (페이징)
   */
  async getOldMessages(
    generalId: number,
    nationId: number,
    params: {
      type?: "private" | "public" | "national" | "diplomacy";
      limit?: number;
      offset?: number;
      beforeId?: number;
    }
  ) {
    const { type, limit = 30, offset = 0, beforeId } = params;

    const mailboxes = [
      generalId, // 개인
      MessageService.MAILBOX_PUBLIC, // 전체
      MessageService.MAILBOX_NATIONAL + nationId, // 국가
    ];

    const where: any = {
      mailbox: { in: mailboxes },
      ...(type ? { type } : {}),
      ...(beforeId ? { id: { lt: beforeId } } : {}),
    };

    const messages = await this.prisma.message.findMany({
      where,
      orderBy: { id: "desc" },
      take: limit,
      skip: offset,
      include: {
        src: {
          select: {
            no: true,
            name: true,
            picture: true,
            imgSvr: true,
            nationId: true,
          },
        },
      },
    });

    // soft delete된 메시지 필터링
    const filteredMessages = messages.filter((msg) => {
      const messageData = (msg.message as any) || {};
      const deletedBy = messageData.deletedBy || [];
      return !deletedBy.includes(generalId);
    });

    return {
      messages: filteredMessages,
      hasMore: messages.length === limit,
    };
  }

  /**
   * 연락처 목록 조회 (메시지 보낼 수 있는 대상)
   */
  async getContactList(generalId: number) {
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true },
    });

    if (!general) throw new Error("장수 정보가 없습니다.");

    // 모든 국가 목록 (외교 메시지용)
    const nations = await this.prisma.nation.findMany({
      where: { nation: { gt: 0 } },
      select: {
        nation: true,
        name: true,
        color: true,
        level: true,
      },
      orderBy: { name: "asc" },
    });

    // 같은 국가 장수들 (국가 메시지용, NPC 제외)
    let sameNationGenerals: any[] = [];
    if (general.nationId > 0) {
      sameNationGenerals = await this.prisma.general.findMany({
        where: {
          nationId: general.nationId,
          npc: 0,
          no: { not: generalId },
        },
        select: {
          no: true,
          name: true,
          picture: true,
          imgSvr: true,
          officerLevel: true,
        },
        orderBy: { officerLevel: "desc" },
      });
    }

    // 최근 대화 상대 (개인 메시지)
    const recentContacts = await this.prisma.message.findMany({
      where: {
        type: "private",
        OR: [{ srcId: generalId }, { destId: generalId }],
      },
      select: {
        srcId: true,
        destId: true,
        src: {
          select: { no: true, name: true, picture: true, imgSvr: true },
        },
      },
      orderBy: { id: "desc" },
      take: 20,
    });

    // 중복 제거한 최근 연락처
    const contactMap = new Map();
    for (const msg of recentContacts) {
      const contactId = msg.srcId === generalId ? msg.destId : msg.srcId;
      if (contactId && contactId !== generalId && !contactMap.has(contactId)) {
        const contactGeneral = await this.prisma.general.findUnique({
          where: { no: contactId },
          select: { no: true, name: true, picture: true, imgSvr: true, nationId: true },
        });
        if (contactGeneral) {
          contactMap.set(contactId, contactGeneral);
        }
      }
    }

    return {
      nations,
      sameNationGenerals,
      recentContacts: Array.from(contactMap.values()),
    };
  }

  /**
   * 메시지 응답 결정 (외교 메시지에 대한 수락/거절)
   */
  async decideMessageResponse(generalId: number, messageId: number, decision: "accept" | "reject") {
    const message = await this.prisma.message.findFirst({
      where: {
        id: messageId,
        type: "diplomacy",
      },
    });

    if (!message) {
      throw new Error("외교 메시지를 찾을 수 없습니다.");
    }

    // 응답 권한 확인 (수뇌부만 가능)
    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { nationId: true, officerLevel: true },
    });

    if (!general || general.officerLevel < 5) {
      throw new Error("외교 메시지 응답 권한이 없습니다.");
    }

    // 메시지에 응답 기록
    const messageData = (message.message as any) || {};
    messageData.response = {
      decision,
      respondedBy: generalId,
      respondedAt: new Date().toISOString(),
    };

    await this.prisma.message.update({
      where: { id: messageId },
      data: { message: messageData },
    });

    return { success: true, decision };
  }
}
