/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { BusResponse } from './BusResponse';
import type { Pageablenull } from './Pageablenull';
import type { Sortnull } from './Sortnull';
export type PageBusResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<BusResponse>;
    number?: number;
    sort?: Sortnull;
    numberOfElements?: number;
    pageable?: Pageablenull;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

