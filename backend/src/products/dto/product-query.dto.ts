import { Type } from "class-transformer";
import { IsIn, IsInt, IsOptional, IsString, Min } from "class-validator";

export class ProductQueryDto {
  @IsOptional() @IsString()
  search?: string;

  @IsOptional() @Type(() => Number) @IsInt()
  categoryId?: number;

  @IsOptional() @Type(() => Number) @Min(0)
  minPrice?: number;

  @IsOptional() @Type(() => Number) @Min(0)
  maxPrice?: number;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  page?: number = 1;

  @IsOptional() @Type(() => Number) @IsInt() @Min(1)
  limit?: number = 10;

   @IsOptional() @IsIn(['price','name'])
   sortBy?: 'price' | 'name' = 'price';

}
