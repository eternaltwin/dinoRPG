import { ExpectedError } from '@drpg/core/utils/ExpectedError';

export type QuantityLine = { itemId: number; quantity: number };

/**
 * Validates the `{ itemId, quantity }` lines a player sends (donations, sales) and merges the lines of a same
 * id. Every id and quantity must be an integer, every quantity positive: a string quantity used to fail one
 * write while the others went through, and a repeated line was checked against the same stock several times.
 * @param errorMessage message of the error thrown on an invalid input
 */
export function parseQuantityLines(raw: unknown, errorMessage = 'wrongQuantity'): QuantityLine[] {
	if (!Array.isArray(raw) || raw.length === 0) {
		throw new ExpectedError(errorMessage);
	}
	const merged = new Map<number, number>();
	for (const line of raw) {
		const itemId = (line as Partial<QuantityLine> | null)?.itemId;
		const quantity = (line as Partial<QuantityLine> | null)?.quantity;
		if (!Number.isInteger(itemId) || !Number.isInteger(quantity) || (quantity as number) <= 0) {
			throw new ExpectedError(errorMessage);
		}
		merged.set(itemId as number, (merged.get(itemId as number) ?? 0) + (quantity as number));
	}
	return [...merged].map(([itemId, quantity]) => ({ itemId, quantity }));
}
