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
}
