import { IsArray, IsEnum, IsInt, IsNotEmpty, IsString, Matches, Min } from "class-validator";
import { Gender } from "generated/prisma/client";

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

    @IsNotEmpty()
    @IsEnum(Gender)
    gender!: Gender;

    @IsArray()
    @IsString({ each: true })
    images!: string[];
}
