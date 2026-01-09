import { Injectable } from "@nestjs/common";
import { createPrismaClient, type PrismaClientType } from "@sammo/infra";

/** 게시판 유형 */
export type BoardType = "public" | "nation" | "secret";

@Injectable()
export class BoardService {
  private readonly prisma: PrismaClientType = createPrismaClient();

  /**
   * 게시글 목록 조회
   */
  async getBoardList(params: {
    nationId: number;
    type: BoardType;
    limit?: number;
    offset?: number;
  }) {
    const { nationId, type, limit = 20, offset = 0 } = params;
    const isSecret = type === "secret";

    // public인 경우 nationId = 0
    const whereNationId = type === "public" ? 0 : nationId;

    const [boards, total] = await Promise.all([
      this.prisma.board.findMany({
        where: {
          nationId: whereNationId,
          isSecret,
        },
        orderBy: { date: "desc" },
        take: limit,
        skip: offset,
        select: {
          no: true,
          date: true,
          author: true,
          authorIcon: true,
          title: true,
          generalId: true,
          _count: {
            select: { comments: true },
          },
        },
      }),
      this.prisma.board.count({
        where: {
          nationId: whereNationId,
          isSecret,
        },
      }),
    ]);

    return {
      result: true,
      boards: boards.map((b) => ({
        no: b.no,
        date: b.date,
        author: b.author,
        authorIcon: b.authorIcon,
        title: b.title,
        generalId: b.generalId,
        commentCount: b._count.comments,
      })),
      total,
      limit,
      offset,
    };
  }

  /**
   * 게시글 상세 조회
   */
  async getBoardDetail(boardNo: number) {
    const board = await this.prisma.board.findUnique({
      where: { no: boardNo },
      include: {
        comments: {
          orderBy: { date: "asc" },
          select: {
            no: true,
            date: true,
            author: true,
            text: true,
            generalId: true,
          },
        },
      },
    });

    if (!board) {
      throw new Error("게시글이 존재하지 않습니다.");
    }

    return {
      result: true,
      board: {
        no: board.no,
        nationId: board.nationId,
        isSecret: board.isSecret,
        date: board.date,
        author: board.author,
        authorIcon: board.authorIcon,
        title: board.title,
        text: board.text,
        generalId: board.generalId,
        comments: board.comments,
      },
    };
  }

  /**
   * 게시글 작성
   */
  async createBoard(params: {
    generalId: number;
    nationId: number;
    type: BoardType;
    title: string;
    text: string;
  }) {
    const { generalId, nationId, type, title, text } = params;

    const general = await this.prisma.general.findUnique({
      where: { no: generalId },
      select: { name: true, picture: true },
    });

    if (!general) {
      throw new Error("장수 정보가 없습니다.");
    }

    const isSecret = type === "secret";
    const boardNationId = type === "public" ? 0 : nationId;

    const board = await this.prisma.board.create({
      data: {
        nationId: boardNationId,
        isSecret,
        date: new Date(),
        generalId,
        author: general.name,
        authorIcon: general.picture,
        title,
        text,
      },
    });

    return { result: true, boardNo: board.no };
  }

  /**
   * 게시글 수정
   */
  async updateBoard(params: { boardNo: number; generalId: number; title?: string; text?: string }) {
    const { boardNo, generalId, title, text } = params;

    const board = await this.prisma.board.findUnique({
      where: { no: boardNo },
    });

    if (!board) {
      throw new Error("게시글이 존재하지 않습니다.");
    }

    if (board.generalId !== generalId) {
      throw new Error("수정 권한이 없습니다.");
    }

    await this.prisma.board.update({
      where: { no: boardNo },
      data: {
        ...(title !== undefined ? { title } : {}),
        ...(text !== undefined ? { text } : {}),
      },
    });

    return { result: true };
  }

  /**
   * 게시글 삭제
   */
  async deleteBoard(boardNo: number, generalId: number, isAdmin: boolean = false) {
    const board = await this.prisma.board.findUnique({
      where: { no: boardNo },
    });

    if (!board) {
      throw new Error("게시글이 존재하지 않습니다.");
    }

    if (!isAdmin && board.generalId !== generalId) {
      throw new Error("삭제 권한이 없습니다.");
    }

    await this.prisma.board.delete({
      where: { no: boardNo },
    });

    return { result: true };
  }

  /**
   * 댓글 작성
   */
  async addComment(params: { boardNo: number; generalId: number; nationId: number; text: string }) {
    const { boardNo, generalId, nationId, text } = params;

    const [board, general] = await Promise.all([
      this.prisma.board.findUnique({ where: { no: boardNo } }),
      this.prisma.general.findUnique({
        where: { no: generalId },
        select: { name: true },
      }),
    ]);

    if (!board) {
      throw new Error("게시글이 존재하지 않습니다.");
    }

    if (!general) {
      throw new Error("장수 정보가 없습니다.");
    }

    const comment = await this.prisma.comment.create({
      data: {
        nationId,
        isSecret: board.isSecret,
        date: new Date(),
        documentNo: boardNo,
        generalId,
        author: general.name,
        text,
      },
    });

    return { result: true, commentNo: comment.no };
  }

  /**
   * 댓글 삭제
   */
  async deleteComment(commentNo: number, generalId: number, isAdmin: boolean = false) {
    const comment = await this.prisma.comment.findUnique({
      where: { no: commentNo },
    });

    if (!comment) {
      throw new Error("댓글이 존재하지 않습니다.");
    }

    if (!isAdmin && comment.generalId !== generalId) {
      throw new Error("삭제 권한이 없습니다.");
    }

    await this.prisma.comment.delete({
      where: { no: commentNo },
    });

    return { result: true };
  }

  /**
   * 최근 게시글 목록 (전체 게시판)
   */
  async getRecentBoards(limit: number = 10) {
    const boards = await this.prisma.board.findMany({
      where: { isSecret: false },
      orderBy: { date: "desc" },
      take: limit,
      select: {
        no: true,
        nationId: true,
        date: true,
        author: true,
        title: true,
        _count: { select: { comments: true } },
      },
    });

    return {
      result: true,
      boards: boards.map((b) => ({
        no: b.no,
        nationId: b.nationId,
        date: b.date,
        author: b.author,
        title: b.title,
        commentCount: b._count.comments,
      })),
    };
  }
}
