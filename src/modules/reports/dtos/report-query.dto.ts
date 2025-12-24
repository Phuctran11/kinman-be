import { IsOptional, IsString, IsDateString, IsUUID } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportQueryDto {
    @ApiPropertyOptional({ description: 'Start date (ISO format)', example: '2025-01-01' })
    @IsOptional()
    @IsDateString()
    from?: string;

    @ApiPropertyOptional({ description: 'End date (ISO format)', example: '2025-12-31' })
    @IsOptional()
    @IsDateString()
    to?: string;

    @ApiPropertyOptional({ description: 'Group ID (for group reports)' })
    @IsOptional()
    @IsUUID()
    groupId?: string;
}
