import { PartialType } from '@nestjs/mapped-types';
import { CreateMandaderoDto } from './create-mandadero.dto';

export class UpdateMandaderoDto extends PartialType(CreateMandaderoDto) {}
