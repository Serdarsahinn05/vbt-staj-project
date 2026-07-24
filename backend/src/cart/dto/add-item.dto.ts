import { IsInt, IsPositive, Min } from "class-validator";

export class AddItemDto {

    @IsInt()
    @IsPositive()
    variantId!: number;

    @IsInt()
    @Min(1)
    quantity!: number;
}