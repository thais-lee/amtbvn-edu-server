import { Inject } from '@nestjs/common';

import { MINIO_TOKEN } from '@src/shared/constants/token.constant';

export function InjectMinio(): ParameterDecorator {
  return Inject(MINIO_TOKEN);
}
