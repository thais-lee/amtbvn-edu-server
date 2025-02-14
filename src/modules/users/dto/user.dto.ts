import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import { EGender, ERole } from '@prisma/client';

export class UserBasicDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  firstName: string;

  @ApiPropertyOptional()
  lastName?: string;

  @ApiProperty({
    enum: ERole,
    isArray: true,
  })
  roles: ERole[];

  @ApiPropertyOptional({
    enum: EGender,
  })
  gender?: EGender;

  @ApiPropertyOptional()
  dateOfBirth?: Date;

  @ApiPropertyOptional()
  phoneNumber?: string;

  @ApiPropertyOptional()
  avatarImageFileFileId?: string;

  @ApiPropertyOptional()
  avatarImageFileFileUrl?: string;

  @ApiProperty()
  userLogin: {
    username: string;
    email: string;
    isEmailVerified: boolean;
  };

  @ApiProperty()
  createdAt: Date;
}

export class UserDetailDto extends UserBasicDto {
//   externals: any;
  sessions: any;
}