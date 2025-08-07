import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  subTitle?: string;

  @IsString()
  @IsOptional()
  composer?: string;

  @IsString()
  @IsOptional()
  arranger?: string;

  @IsString()
  @IsOptional()
  keySignature?: string;

  @IsString()
  @IsOptional()
  timeSignature?: string;

  @IsString()
  @IsOptional()
  yearOfComposition?: string;

  @IsString()
  @IsOptional()
  tempo?: string;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  subTitle?: string;

  @IsString()
  @IsOptional()
  composer?: string;

  @IsString()
  @IsOptional()
  arranger?: string;

  @IsString()
  @IsOptional()
  keySignature?: string;

  @IsString()
  @IsOptional()
  timeSignature?: string;

  @IsString()
  @IsOptional()
  yearOfComposition?: string;

  @IsString()
  @IsOptional()
  tempo?: string;

  @IsString()
  @IsOptional()
  currentNotationContent?: string;
}