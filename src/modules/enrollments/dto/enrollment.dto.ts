import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EnrollmentStatus } from '@prisma/client';

import { CourseDto } from '@modules/courses/dto/course.dto';
import { UserBasicDto } from '@modules/users/dto/user.dto';

export class EnrollmentDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  userId: number;

  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional({ enum: EnrollmentStatus })
  status?: EnrollmentStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class EnrollmentDetailDto extends EnrollmentDto {
  @ApiProperty()
  user: UserBasicDto;

  @ApiProperty()
  course: CourseDto;
}
