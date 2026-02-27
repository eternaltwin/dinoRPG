import { trace, SpanStatusCode } from '@opentelemetry/api';

const tracer = trace.getTracer('mon-service');

export async function withSpan<T>(name: string, fn: () => Promise<T>): Promise<T> {
	return tracer.startActiveSpan(name, async span => {
		try {
			const result = await fn();
			return result;
		} catch (error) {
			span.setStatus({ code: SpanStatusCode.ERROR, message: (error as Error).message });
			span.recordException(error as Error);
			throw error;
		} finally {
			span.end();
		}
	});
}
