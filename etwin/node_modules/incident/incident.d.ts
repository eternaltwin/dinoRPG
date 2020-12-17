import { Incident as Interface, StaticIncident as StaticInterface } from "./types";
/**
 * Default message formatter.
 *
 * This uses `object-inspect` to print the `data` object.
 *
 * @param data Data object associated with the error.
 * @return String representation of the data object.
 */
export declare function format(data: any): string;
export declare const Incident: StaticInterface;
export interface Incident<D extends object, N extends string = string, C extends (Error | undefined) = (Error | undefined)> extends Interface<D, N, C> {
}
