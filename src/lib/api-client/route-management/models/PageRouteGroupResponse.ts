/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageablenull } from './Pageablenull';
import type { RouteGroupResponse } from './RouteGroupResponse';
import type { Sortnull } from './Sortnull';
export type PageRouteGroupResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<RouteGroupResponse>;
    number?: number;
    sort?: Sortnull;
    numberOfElements?: number;
    pageable?: Pageablenull;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

