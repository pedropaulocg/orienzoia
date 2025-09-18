export type PageParams = { page?: number; pageSize?: number };
export type PageResult<T> = {
  data: T[];
  page: number;
  pageSize: number;
  total: number;
};

export const toPage = ({ page = 1, pageSize = 20 }: PageParams) => ({
  skip: (page - 1) * pageSize,
  take: pageSize,
  page,
  pageSize,
});
