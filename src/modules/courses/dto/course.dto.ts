import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseStatus } from "@prisma/client";

export class CourseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    imageFileUrl?: string;

    @ApiPropertyOptional()
    bannerFileUrl?: string;

    @ApiProperty()
    categoryId: number;

    @ApiPropertyOptional()
    status: CourseStatus;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}