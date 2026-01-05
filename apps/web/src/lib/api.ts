/**
 * API 클라이언트 및 타입 정의
 * Legacy SammoAPI 구조를 기반으로 함
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

/** API 응답 공통 타입 */
export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}

/** 장수 기본 정보 */
export interface General {
    id: number;
    name: string;
    nation: number;
    nationName?: string;
    city: number;
    cityName?: string;
    leadership: number;     // 통솔
    strength: number;       // 무력
    intel: number;          // 지력
    level: number;
    exp: number;
    gold: number;
    rice: number;
    troops: number;
    maxTroops: number;
    train: number;          // 훈련도
    atmos: number;          // 사기
    hp: number;
    maxHp: number;
    officerLevel: number;   // 관직
    dedication: number;     // 헌신
    specialWar?: string;    // 전투특기
    specialDomestic?: string; // 내정특기
    imgPath?: string;
}

/** 도시 정보 */
export interface City {
    id: number;
    name: string;
    nation: number;
    nationName?: string;
    population: number;
    trust: number;          // 민심
    agri: number;           // 농업
    comm: number;           // 상업
    secu: number;           // 치안
    wall: number;           // 성벽
    def: number;            // 수비
}

/** 국가 정보 */
export interface Nation {
    id: number;
    name: string;
    color: string;
    capital: number;
    capitalName?: string;
    gold: number;
    rice: number;
    kingId?: number;
    kingName?: string;
    generalCount: number;
    cityCount: number;
    type: 'wei' | 'shu' | 'wu' | 'jin' | 'neutral';
}

/** 자원 정보 */
export interface Resources {
    gold: number;
    rice: number;
    troops: number;
    train: number;
    atmos: number;
}

/** 명령 정보 */
export interface Command {
    id: string;
    name: string;
    description: string;
    category: 'domestic' | 'military' | 'diplomacy' | 'personal';
    cost?: {
        gold?: number;
        rice?: number;
        turn?: number;
    };
    available: boolean;
    reason?: string;
}

/** 게임 상수 */
export interface GameConst {
    year: number;
    month: number;
    startYear: number;
    turnTerm: number;
    serverName: string;
}

/** 메시지 */
export interface Message {
    id: number;
    type: 'system' | 'nation' | 'personal' | 'battle' | 'global';
    content: string;
    date: string;
    sender?: string;
}

/** API 클라이언트 */
class ApiClient {
    private baseUrl: string;

    constructor(baseUrl: string) {
        this.baseUrl = baseUrl;
    }

    private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options?.headers,
            },
            credentials: 'include',
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        return response.json();
    }

    /** 장수 API */
    general = {
        /** 장수 목록 조회 */
        getList: () => this.fetch<General[]>('/api/generals'),

        /** 장수 상세 조회 */
        getDetail: (id: number) => this.fetch<General>(`/api/generals/${id}`),

        /** 내 장수 정보 조회 */
        getMe: () => this.fetch<General>('/api/generals/me'),

        /** 명령 실행 */
        executeCommand: (commandId: string, params?: Record<string, unknown>) =>
            this.fetch<ApiResponse<unknown>>('/api/generals/command', {
                method: 'POST',
                body: JSON.stringify({ commandId, params }),
            }),
    };

    /** 도시 API */
    city = {
        /** 도시 목록 조회 */
        getList: () => this.fetch<City[]>('/api/cities'),

        /** 도시 상세 조회 */
        getDetail: (id: number) => this.fetch<City>(`/api/cities/${id}`),
    };

    /** 국가 API */
    nation = {
        /** 국가 목록 조회 */
        getList: () => this.fetch<Nation[]>('/api/nations'),

        /** 국가 상세 조회 */
        getDetail: (id: number) => this.fetch<Nation>(`/api/nations/${id}`),

        /** 국가 장수 목록 */
        getGenerals: (nationId: number) =>
            this.fetch<General[]>(`/api/nations/${nationId}/generals`),
    };

    /** 명령 API */
    command = {
        /** 사용 가능한 명령 목록 */
        getAvailable: () => this.fetch<Command[]>('/api/commands'),
    };

    /** 게임 글로벌 API */
    game = {
        /** 게임 상수 조회 */
        getConst: () => this.fetch<GameConst>('/api/game/const'),

        /** 메시지 목록 조회 */
        getMessages: (type?: string) =>
            this.fetch<Message[]>(`/api/game/messages${type ? `?type=${type}` : ''}`),

        /** 지도 데이터 조회 */
        getMap: () => this.fetch<{ cities: City[]; nations: Nation[] }>('/api/game/map'),
    };

    /** 가입 API */
    join = {
        /** 가입 가능 국가 조회 */
        getNations: () => this.fetch<Nation[]>('/api/join/nations'),

        /** 장수 생성 */
        createGeneral: (data: {
            name: string;
            leadership: number;
            strength: number;
            intel: number;
            nationId: number;
            specialWar?: string;
            specialDomestic?: string;
        }) =>
            this.fetch<ApiResponse<General>>('/api/join', {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    };

    /** 경매 API */
    auction = {
        /** 경매 목록 조회 */
        getList: () => this.fetch<unknown[]>('/api/auction'),

        /** 입찰 */
        bid: (auctionId: number, amount: number) =>
            this.fetch<ApiResponse<unknown>>('/api/auction/bid', {
                method: 'POST',
                body: JSON.stringify({ auctionId, amount }),
            }),
    };

    /** 게시판 API */
    board = {
        /** 게시글 목록 */
        getList: (type: string, page?: number) =>
            this.fetch<unknown[]>(`/api/board/${type}?page=${page || 1}`),

        /** 게시글 상세 */
        getDetail: (type: string, id: number) => this.fetch<unknown>(`/api/board/${type}/${id}`),

        /** 게시글 작성 */
        create: (type: string, data: { title: string; content: string }) =>
            this.fetch<ApiResponse<unknown>>(`/api/board/${type}`, {
                method: 'POST',
                body: JSON.stringify(data),
            }),
    };
}

export const api = new ApiClient(API_BASE_URL);

export default api;
