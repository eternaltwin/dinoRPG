/**
 * Construct a type with the properties of `T`, except that the fields from `K` are non-nullable.
 */
export type Ensure<T, K extends keyof T> = Omit<T, K> & {
	[P in K]-?: NonNullable<T[P]>;
} extends infer Parent
	? { [P in keyof Parent]: Parent[P] }
	: never;
