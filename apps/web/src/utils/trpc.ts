import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@sammo-ts/api';

export const trpc = createTRPCReact<AppRouter>();
