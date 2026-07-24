import { IsInt, IsOptional, Matches, Max, Min } from 'class-validator';

// Admin panelinden bir renk varyantının stok / fiyat / indirim değerlerini günceller.
export class UpdateVariantDto {
    @IsOptional()
    @Matches(/^\d+(\.\d{1,2})?$/, {
        message: 'price pozitif bir ondalık sayı olmalı (en fazla 2 basamak), örn. "5000" veya "4200.50"',
    })
    price?: string;

    @IsOptional()
    @IsInt()
    @Min(0)
    stock?: number;

    // Yüzde indirim (0-100)
    @IsOptional()
    @IsInt()
    @Min(0)
    @Max(100)
    discount?: number;
}
