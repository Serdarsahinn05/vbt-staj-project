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

// Bir ürünün tek bir renk seçeneği (varyant). Fiyat ve stok renk bazında tutulur.
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

    // Fiyat/stok şimdilik opsiyonel; verilmezse şemadaki default (0) kullanılır.
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

    @IsNotEmpty()
    @IsInt()
    categoryId!: number;

    // Ürünün renk seçenekleri — en az bir renk zorunlu.
    @IsArray()
    @ArrayMinSize(1)
    @ValidateNested({ each: true })
    @Type(() => ProductVariantDto)
    variants!: ProductVariantDto[];
}
