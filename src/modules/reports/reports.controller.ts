import {
    Controller,
    Get,
    Query,
    Param,
    UseGuards,
    Res,
    HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { Response } from 'express';
import { ReportsService } from './reports.service';
import { ReportQueryDto } from './dtos/report-query.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { GetUser } from '../auth/decorators/get-user.decorator';
import { UserEntity } from '../auth/entities/user.entity';

@ApiTags('Reports')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('reports')
export class ReportsController {
    constructor(private readonly reportsService: ReportsService) { }

    @Get('user-summary')
    @ApiOperation({ summary: 'Get user expense summary' })
    @ApiResponse({ status: 200, description: 'User expense summary' })
    async getUserSummary(
        @GetUser() user: UserEntity,
        @Query() query: ReportQueryDto,
    ) {
        return this.reportsService.getUserSummary(user.id, query);
    }

    @Get('group-summary/:groupId')
    @ApiOperation({ summary: 'Get group expense summary' })
    @ApiResponse({ status: 200, description: 'Group expense summary' })
    async getGroupSummary(
        @Param('groupId') groupId: string,
        @Query() query: ReportQueryDto,
    ) {
        return this.reportsService.getGroupSummary(groupId, query);
    }

    @Get('export/user')
    @ApiOperation({ summary: 'Export user report as CSV' })
    @ApiResponse({ status: 200, description: 'CSV file' })
    async exportUserReport(
        @GetUser() user: UserEntity,
        @Query() query: ReportQueryDto,
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getUserSummary(user.id, query);
        const csv = this.reportsService.generateUserReportCSV(data);

        const filename = `user-report-${user.id}-${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(HttpStatus.OK).send('\uFEFF' + csv); // BOM for Excel UTF-8
    }

    @Get('export/group/:groupId')
    @ApiOperation({ summary: 'Export group report as CSV' })
    @ApiResponse({ status: 200, description: 'CSV file' })
    async exportGroupReport(
        @Param('groupId') groupId: string,
        @Query() query: ReportQueryDto,
        @Res() res: Response,
    ) {
        const data = await this.reportsService.getGroupSummary(groupId, query);
        const csv = this.reportsService.generateGroupReportCSV(data);

        const filename = `group-report-${groupId}-${Date.now()}.csv`;

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.status(HttpStatus.OK).send('\uFEFF' + csv); // BOM for Excel UTF-8
    }
}
