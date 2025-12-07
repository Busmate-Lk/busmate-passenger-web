/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageablenull } from './Pageablenull';
import type { Sortnull } from './Sortnull';
import type { TripResponse } from './TripResponse';
export type PageTripResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<TripResponse>;
    number?: number;
    sort?: Sortnull;
    numberOfElements?: number;
    pageable?: Pageablenull;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

