import { IsArray, IsInt, IsNotEmpty, IsString, Matches, Min } from "class-validator";

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'price pozitif bir ondalık sayı olmalı (en fazla 2 basamak), örn. "99.90"',
    })
    price!: string;

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
