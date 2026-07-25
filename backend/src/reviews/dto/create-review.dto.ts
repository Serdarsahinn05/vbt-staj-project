import { IsInt, IsNotEmpty, IsString, Max, Min } from 'class-validator';

export class CreateReviewDto {
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @IsNotEmpty()
    @IsString()
    comment!: string;
}
