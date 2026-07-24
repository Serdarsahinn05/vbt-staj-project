import { IsInt, IsNotEmpty } from 'class-validator';

export class AddFavoriteDto {

    @IsNotEmpty()
    @IsInt()
    variantId!: number;
}
