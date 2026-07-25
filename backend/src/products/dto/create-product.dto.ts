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
    Max,
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

    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    discount?: number; // yüzde
}

export class CreateProductDto {
    @IsNotEmpty()
    @IsString()
    name!: string;

    @IsNotEmpty()
    @IsString()
    slug!: string;

    @IsNotEmpty()
    @IsString()
    description!: string;

    // Model bazlı fiyat (tüm renkler aynı)
    @IsNotEmpty()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'price pozitif bir ondalık sayı olmalı (en fazla 2 basamak), örn. "145000"',
    })
    price!: string;

    // Bir ürün birden fazla cinsiyete ait olabilir (ör. [ERKEK, KADIN])
    @IsArray()
    @ArrayMinSize(1)
    @IsEnum(Gender, { each: true })
    genders!: Gender[];

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
