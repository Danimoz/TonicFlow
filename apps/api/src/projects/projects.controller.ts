import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Request,
  ValidationPipe,
  Query,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('projects')
@UseGuards(JwtAuthGuard)
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

  @Post()
  create(@Request() req, @Body(ValidationPipe) createProjectDto: CreateProjectDto) {
    return this.projectsService.create(req.user.id, createProjectDto);
  }

  @Get()
  findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('sortBy') sortBy?: 'title' | 'createdAt' | 'updatedAt',
    @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  ) {
    return this.projectsService.findAll(req.user.id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      sortBy,
      sortOrder,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.projectsService.findOne(id, req.user.id);
  }

  @Post(':id/update-current-version')
  updateCurrentVersion(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { notationContent: string },
  ){
    return this.projectsService.saveSolfaToCurrentVersion(id, body.notationContent, req.user.id);
  }


  @Patch(':id')
  update(
    @Param('id') id: string,
    @Request() req,
    @Body(ValidationPipe) updateProjectDto: UpdateProjectDto,
  ) {
    return this.projectsService.update(id, req.user.id, updateProjectDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.projectsService.remove(id, req.user.id);
  }

  @Post(':id/versions')
  createVersion(
    @Param('id') id: string,
    @Request() req,
    @Body() body: { notationContent: string; versionType?: string },
  ) {
    return this.projectsService.createVersion(
      id,
      req.user.id,
      body.notationContent,
      body.versionType,
    );
  }

  @Get(':id/versions')
  getVersions(@Param('id') id: string, @Request() req) {
    return this.projectsService.getVersions(id, req.user.id);
  }
}