import { IsNotEmpty, IsString } from 'class-validator';

export class CreatePermissionDto {
  @IsNotEmpty({ message: 'validation.Text_required' })
  @IsString()
  Text: string;
}
