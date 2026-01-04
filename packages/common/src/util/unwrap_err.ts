import type { Nullable } from "./Nullable";

type ErrType<T> = { new (msg?: string): T };

// Nullable 결과를 안전하게 언랩하고, 실패 시 명확한 에러를 던진다.
export function unwrap_err<T, ErrT extends Error>(
    result: Nullable<T>,
    errType: ErrType<ErrT>,
    errMsg?: string
): T {
    if (result === null || result === undefined) {
        throw new errType(errMsg);
    }
    return result;
}
