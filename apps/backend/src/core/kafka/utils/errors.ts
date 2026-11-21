import type { FailureMetadata } from '../../../../../../shared/types.js';

export function buildFailureMetadata(err: unknown, topic: string): FailureMetadata {
    return {
        error: err instanceof Error ? err.message : String(err),
        stack: err instanceof Error ? err.stack : undefined,
        originalTopic: topic,
        failedAt: new Date().toISOString(),
    };
}
