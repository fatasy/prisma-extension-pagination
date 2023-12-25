import { resetOrdering, resetSelection } from "./helpers";
import {
  PageNumberPaginationOptions,
  PaginatorResult,
  PrismaModel,
  PrismaQuery
} from "./types";

export const paginateWithPages = async (
  model: PrismaModel,
  query: PrismaQuery,
  { page, limit, includePageCount, callback }: Required<PageNumberPaginationOptions>,
): Promise<PaginatorResult<unknown, typeof includePageCount> | ReturnType<typeof callback>> => {
  const previousPage = page > 1 ? page - 1 : null;

  let results;
  let nextPage;
  let pageCount = null;
  let totalCount = null;

  if (includePageCount) {
    [results, totalCount] = await Promise.all([
      model.findMany({
        ...query,
        ...{
          skip: (page - 1) * limit,
          take: limit,
        },
      }),
      model.count({
        ...query,
        ...resetSelection,
        ...resetOrdering,
      }),
    ]);

    pageCount = Math.ceil(totalCount / limit);
    nextPage = page < pageCount ? page + 1 : null;
  } else {
    results = await model.findMany({
      ...query,
      ...{
        skip: (page - 1) * limit,
        take: limit + 1,
      },
    });

    nextPage = results.length > limit ? page + 1 : null;
    if (nextPage) {
      results.pop();
    }
  }

  const meta = {
    ...{
      isFirstPage: previousPage === null,
      isLastPage: nextPage === null,
      currentPage: page,
      previousPage,
      nextPage,
    },
    ...(includePageCount === true
      ? {
        pageCount,
        totalCount,
      }
      : {}),
  }

  if (callback) {
    return callback({ data: results, meta });
  }

  return {
    data: results,
    meta
  }
};
