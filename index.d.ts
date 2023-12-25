import { createPaginator, paginate, pagination } from "./src";

declare module "prisma-extension-pagination" {
    export type paginate = typeof paginate;
    export type createPaginator = typeof createPaginator;
    export type pagination = typeof pagination;
}
