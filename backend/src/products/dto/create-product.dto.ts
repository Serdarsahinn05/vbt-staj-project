import { Type } from "class-transformer";
import {
    ArrayMinSize,
    IsArray,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    Matches,
    Min,
    ValidateNested,
} from "class-validator";
import { Gender } from "generated/prisma/client";


export class ProductVariantDto {
    @IsNotEmpty()
    @IsString()
    colorName!: string;

    @IsNotEmpty()
    @IsString()
    colorHex!: string;

    @IsArray()
    @IsString({ each: true })
    images!: string[];


    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'price pozitif bir ondalık sayı olmalı (en fazla 2 basamak), örn. "99.90"',
    })
    price?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;
}

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    @IsNotEmpty()
    @IsEnum(Gender)
    gender!: Gender;

    @IsOptional()
    @IsString()
    series?: string;


    @IsOptional()
    @IsArray()
    @IsString({ each: true })
    styleTags?: string[];


    @IsOptional() @IsString() caseSize?: string;        // Model Kasası
    @IsOptional() @IsString() material?: string;        // Malzeme
    @IsOptional() @IsString() bezel?: string;           // Çerçeve
    @IsOptional() @IsString() crown?: string;           // Kurma Kolu
    @IsOptional() @IsString() crystal?: string;         // Kristal
    @IsOptional() @IsString() waterResistance?: string; // Su Geçirmezlik
    @IsOptional() @IsString() movement?: string;        // Mekanizma
    @IsOptional() @IsString() strap?: string;           // Bilezik / Kayış
    @IsOptional() @IsString() dial?: string;            // Kadran

    @IsNotEmpty()
    @IsInt()
    categoryId!: number;


    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants!: ProductVariantDto[];
}
