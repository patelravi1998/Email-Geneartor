// import { FindManyOptions, Repository } from 'typeorm';

// interface PaginationResult<T> {
//   data: T[];
//   pagination: {
//     totalItems: number;
//     totalPages: number;
//     currentPage: number;
//     pageSize: number;
//   };
// }

// export async function paginate<T>(
//   repository: Repository<T>,
//   page: number,
//   limit: number,
//   options?: FindManyOptions<T>
// ): Promise<PaginationResult<T>> {
//   const [data, totalItems] = await repository.findAndCount({
//     skip: (page - 1) * limit,
//     take: limit,
//     ...options,
//   });

//   const totalPages = Math.ceil(totalItems / limit);

//   return {
//     data,
//     pagination: {
//       totalItems,
//       totalPages,
//       currentPage: page,
//       pageSize: limit,
//     },
//   };
// }