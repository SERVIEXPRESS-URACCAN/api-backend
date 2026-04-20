// dto/update-client.dto.ts
import { PartialType } from '@nestjs/mapped-types';
import { CreateClientDto } from './client.dto';

export class UpdateClientDto extends PartialType(CreateClientDto) {}
