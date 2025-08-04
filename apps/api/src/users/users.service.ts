import { BadRequestException, ConflictException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@repo/db';
import { hash } from 'bcrypt';
import { PrismaService } from 'prisma/prisma.service';
import { RegisterDto } from 'src/auth/auth.dto';

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService
  ) {}

  async registerUser(registerDto: RegisterDto) {
    const { email, password, fullName } = registerDto;
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingUser) throw new ConflictException('User already exists');

    let hashedPassword;
    if (password) hashedPassword = await hash(password, 10);

    try {
      const newUser = await this.prisma.user.create({
        data: { email, password: hashedPassword, fullName },
        select: { id: true, email: true, fullName: true },
      });
      return {
        user: newUser,
        success: true,
        message: 'User created successfully',
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        throw new BadRequestException('Invalid data provided');
      }
      throw new InternalServerErrorException('An error occurred while creating the user');
    }
  }

  async findUserByEmail(email: string) {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, fullName: true, password: true },
      });
      if (!user) return null;
      return user;
    } catch (error) {
      throw new InternalServerErrorException('An error occurred while fetching the user');
    }
  }
}
