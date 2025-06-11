import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

import {
  ActivityStatus,
  LessonAttachmentType,
  LessonStatus,
} from '@prisma/client';

export class LessonDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiPropertyOptional()
  isImportant: boolean;

  @ApiProperty({ enum: LessonStatus })
  status: LessonStatus;

  @ApiProperty()
  courseId: number;

  @ApiPropertyOptional()
  previousId: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class LessonDetailDto extends LessonDto {
  @ApiProperty()
  previous: LessonDto;

  @ApiProperty()
  next: LessonDto;
}

export class LessonWithAttachments {
  id: number;
  title: string;
  content: string;
  courseId: number;
  previousId: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
  isImportant: boolean;
  previous: { id: number; title: string; isImportant: boolean } | null;
  next: { id: number; title: string; isImportant: boolean } | null;
  attachments: Array<{
    fileId: number;
    type: LessonAttachmentType;
    file: {
      id: number;
      fileName: string;
      mimeType: string;
      size: number;
      storagePath: string;
      uploadedBy: number;
      createdAt: Date;
      updatedAt: Date;
    };
  }>;
  activities: Array<{
    id: number;
    title: string;
    description: string | null;
    type: string;
    status: ActivityStatus;
    timeLimitMinutes: number | null;
    dueDate: Date | null;
    maxAttempts: number | null;
    passScore: number | null;
    shuffleQuestions: boolean;
    createdAt: Date;
    updatedAt: Date;
    materials: Array<{
      File: {
        id: number;
        fileName: string;
        mimeType: string;
        size: number;
        storagePath: string;
      };
    }>;
  }>;
}
