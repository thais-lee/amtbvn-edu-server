import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CategoryDto {
    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    parentId?: number;

    @ApiProperty()
    subCategories?: CategoryDto[];
}