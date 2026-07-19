import { IsInt, IsPositive, Min } from "class-validator";

export class AddItemDto {
    @IsInt()
    @IsPositive()
    productId!: number;

    @IsInt()
    @Min(1)
    quantity!: number;
}