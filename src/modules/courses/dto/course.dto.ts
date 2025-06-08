import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { CourseStatus } from "@prisma/client";

export class CourseDto {
    @ApiProperty()
    id: number;

    @ApiProperty()
    name: string;

    @ApiProperty()
    slug: string;

    @ApiPropertyOptional()
    description?: string;

    @ApiPropertyOptional()
    imageFileUrl?: string;

    @ApiPropertyOptional()
    bannerFileUrl?: string;

    @ApiProperty()
    categoryId: number;

    @ApiPropertyOptional()
    requireApproval?: boolean;

    @ApiPropertyOptional()
    status: CourseStatus;

    @ApiPropertyOptional()
    createdAt?: Date;

    @ApiPropertyOptional()
    updatedAt?: Date;
}