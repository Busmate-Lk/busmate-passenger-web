/* generated using openapi-typescript-codegen -- do not edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Pageablenull } from './Pageablenull';
import type { ScheduleResponse } from './ScheduleResponse';
import type { Sortnull } from './Sortnull';
export type PageScheduleResponse = {
    totalElements?: number;
    totalPages?: number;
    size?: number;
    content?: Array<ScheduleResponse>;
    number?: number;
    sort?: Sortnull;
    numberOfElements?: number;
    pageable?: Pageablenull;
    first?: boolean;
    last?: boolean;
    empty?: boolean;
};

