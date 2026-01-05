'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api, {
    type General,
    type City,
    type Nation,
    type Command,
    type GameConst,
    type Message,
} from '@/lib/api';

/** 장수 관련 훅 */
export function useGeneralDetail(id: number) {
    return useQuery({
        queryKey: ['general', id],
        queryFn: () => api.general.getDetail(id),
        enabled: !!id,
    });
}

export function useGeneralList() {
    return useQuery({
        queryKey: ['generals'],
        queryFn: () => api.general.getList(),
    });
}

export function useMyGeneral() {
    return useQuery({
        queryKey: ['general', 'me'],
        queryFn: () => api.general.getMe(),
    });
}

export function useExecuteCommand() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            commandId,
            params,
        }: {
            commandId: string;
            params?: Record<string, unknown>;
        }) => api.general.executeCommand(commandId, params),
        onSuccess: () => {
            // 명령 실행 후 관련 데이터 새로고침
            queryClient.invalidateQueries({ queryKey: ['general', 'me'] });
            queryClient.invalidateQueries({ queryKey: ['messages'] });
        },
    });
}

/** 도시 관련 훅 */
export function useCityDetail(id: number) {
    return useQuery({
        queryKey: ['city', id],
        queryFn: () => api.city.getDetail(id),
        enabled: !!id,
    });
}

export function useCityList() {
    return useQuery({
        queryKey: ['cities'],
        queryFn: () => api.city.getList(),
    });
}

/** 국가 관련 훅 */
export function useNationDetail(id: number) {
    return useQuery({
        queryKey: ['nation', id],
        queryFn: () => api.nation.getDetail(id),
        enabled: !!id,
    });
}

export function useNationList() {
    return useQuery({
        queryKey: ['nations'],
        queryFn: () => api.nation.getList(),
    });
}

export function useNationGenerals(nationId: number) {
    return useQuery({
        queryKey: ['nation', nationId, 'generals'],
        queryFn: () => api.nation.getGenerals(nationId),
        enabled: !!nationId,
    });
}

/** 명령 관련 훅 */
export function useAvailableCommands() {
    return useQuery({
        queryKey: ['commands'],
        queryFn: () => api.command.getAvailable(),
    });
}

/** 게임 글로벌 훅 */
export function useGameConst() {
    return useQuery({
        queryKey: ['game', 'const'],
        queryFn: () => api.game.getConst(),
        staleTime: 60000, // 1분간 캐시
    });
}

export function useMessages(type?: string) {
    return useQuery({
        queryKey: ['messages', type],
        queryFn: () => api.game.getMessages(type),
        refetchInterval: 10000, // 10초마다 새로고침
    });
}

export function useMap() {
    return useQuery({
        queryKey: ['game', 'map'],
        queryFn: () => api.game.getMap(),
        staleTime: 30000, // 30초간 캐시
    });
}

/** 가입 관련 훅 */
export function useJoinableNations() {
    return useQuery({
        queryKey: ['join', 'nations'],
        queryFn: () => api.join.getNations(),
    });
}

export function useCreateGeneral() {
    return useMutation({
        mutationFn: (data: {
            name: string;
            leadership: number;
            strength: number;
            intel: number;
            nationId: number;
            specialWar?: string;
            specialDomestic?: string;
        }) => api.join.createGeneral(data),
    });
}

/** 경매 관련 훅 */
export function useAuctionList() {
    return useQuery({
        queryKey: ['auction'],
        queryFn: () => api.auction.getList(),
    });
}

export function useBid() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ auctionId, amount }: { auctionId: number; amount: number }) =>
            api.auction.bid(auctionId, amount),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['auction'] });
            queryClient.invalidateQueries({ queryKey: ['general', 'me'] });
        },
    });
}

/** 게시판 관련 훅 */
export function useBoardList(type: string, page?: number) {
    return useQuery({
        queryKey: ['board', type, page],
        queryFn: () => api.board.getList(type, page),
    });
}

export function useBoardDetail(type: string, id: number) {
    return useQuery({
        queryKey: ['board', type, id],
        queryFn: () => api.board.getDetail(type, id),
        enabled: !!id,
    });
}

export function useCreatePost() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            type,
            data,
        }: {
            type: string;
            data: { title: string; content: string };
        }) => api.board.create(type, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['board', variables.type] });
        },
    });
}
