/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { OperatorResponse } from './OperatorResponse';
import type { Pageablenull } from './Pageablenull';
import type { Sortnull } from './Sortnull';
export type PageOperatorResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<OperatorResponse>;
    number?: number;
    sort?: Sortnull;
    numberOfElements?: number;
    pageable?: Pageablenull;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

