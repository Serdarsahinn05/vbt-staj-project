import { IsArray, IsInt, IsNotEmpty, IsNumber, IsPositive, IsString, Min } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsNumber()
    @IsPositive()
    price!: number;

    @IsNotEmpty()
    @IsInt()
    @Min(0)
    stock!: number;

    @IsNotEmpty()
    @IsInt()
    categoryId!: number;

    @IsArray()
    @IsString({ each: true })
    images!: string[];
}
