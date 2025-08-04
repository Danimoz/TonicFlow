import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async create(userId: string, createProjectDto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        ...createProjectDto,
        userId,
        currentNotationContent: createProjectDto.currentNotationContent || '',
      },
    });
  }

  async findAll(userId: string, options?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: 'title' | 'createdAt' | 'updatedAt';
    sortOrder?: 'asc' | 'desc';
  }) {
    const {
      page = 1,
      limit = 20,
      search = '',
      sortBy = 'updatedAt',
      sortOrder = 'desc'
    } = options || {};

    const skip = (page - 1) * limit;

    // Build where clause for search
    const where = {
      userId,
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' as const } },
          { subTitle: { contains: search, mode: 'insensitive' as const } },
          { composer: { contains: search, mode: 'insensitive' as const } },
          { arranger: { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Get projects with pagination
    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where,
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
      this.prisma.project.count({ where }),
    ]);

    return {
      projects,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page < Math.ceil(total / limit),
        hasPrev: page > 1,
      },
    };
  }

  async findOne(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        ProjectVersion: {
          orderBy: { createdAt: 'desc' },
          take: 10, // Get last 10 versions
        },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async update(id: string, userId: string, updateProjectDto: UpdateProjectDto) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.project.update({
      where: { id },
      data: updateProjectDto,
    });
  }

  async remove(id: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return this.prisma.project.delete({
      where: { id },
    });
  }

  async createVersion(projectId: string, userId: string, notationContent: string, versionType: string = 'manual') {
    // First verify the user owns the project
    const project = await this.findOne(projectId, userId);

    return this.prisma.projectVersion.create({
      data: {
        projectId,
        notationContent,
        versionType,
      },
    });
  }

  async getVersions(projectId: string, userId: string) {
    // First verify the user owns the project
    await this.findOne(projectId, userId);

    return this.prisma.projectVersion.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });
  }
}