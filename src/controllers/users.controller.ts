import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  BadRequestException,
  NotFoundException,
  UsePipes,
  ValidationPipe,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';
import { User, UserRole } from '../entities/user.entity';
import { UserDetails } from "../entities/user-details.entity";
import { UseInterceptors, UploadedFile } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import {
  IsNotEmpty,
  IsString,
  Length,
  Matches,
  IsEmail,
  IsInt,
  Min,
  Max,
  IsOptional,
  IsEnum,
} from 'class-validator';

// DTO Classes
export class SendOtpDto {
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  phone: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(8, 12, { message: 'Phone must be 10 digits' })
  phone: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsInt()
  @Min(1)
  @Max(120)
  age: number;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}

export class VerifyOtpDto {
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsNotEmpty()
  @Matches(/^\d{10}$/, { message: 'Phone number must be exactly 10 digits' })
  phone: string;

  @IsNotEmpty()
  @Matches(/^\d{6}$/, { message: 'OTP must be exactly 6 digits' })
  otp: string;
}

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(120)
  age?: number;
}

const profileImageStorage = diskStorage({
  destination: '/tmp', // ✅ TEMP directory for Vercel or similar
  filename: (req, file, callback) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = extname(file.originalname);
    callback(null, `${uniqueSuffix}${ext}`);
  },
});

export class LoginDto {
  @IsNotEmpty()
  @IsString()
  identifier: string; // can be email or phone

  @IsNotEmpty()
  @IsString()
  password: string;
}

@Controller('users')
export class UsersController {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
        @InjectRepository(UserDetails)
    private readonly userDetailsRepository: Repository<UserDetails>,

  ) {}

  @Get('test')
  testRoute() {
    return { status: 'success', message: 'Test route working' };
  }

  @Get()
  async listAll() {
    try {
      const users = await this.userRepository.find({
        select: [
          'id',
          'countryCode',
          'phone',
          'name',
          'email',
          'age',
          'role',
          'createdAt',
          'phoneVerified',
        ],
      });
      return { status: 'success', data: users };
    } catch (error) {
      throw new InternalServerErrorException('Failed to fetch users');
    }
  }

  @Get(':id')
  async getOneById(@Param('id') id: number) {
    try {
      const user = await this.userRepository.findOneOrFail({
        where: { id },
        select: [
          'id',
          'countryCode',
          'phone',
          'name',
          'email',
          'age',
          'role',
          'createdAt',
          'phoneVerified',
        ],
      });
      return { status: 'success', data: user };
    } catch (error) {
      throw new NotFoundException('User not found');
    }
  }

 @Post()
@UseInterceptors(FileInterceptor('profileImage', {
  storage: profileImageStorage,
  fileFilter: (req, file, callback) => {
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
      return callback(new Error('Only image files are allowed!'), false);
    }
    callback(null, true);
  },
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
}))
async createUser(
  @UploadedFile() profileImage: Express.Multer.File,
  @Body() body: any,
) {
  // Convert age to number
  body.age = +body.age;

  // Transform plain object to DTO instance
  const dto = plainToInstance(CreateUserDto, body);

  // Validate DTO
  const errors = await validate(dto);
  if (errors.length > 0) {
    const messages = errors.flatMap(err => Object.values(err.constraints || {}));
    throw new BadRequestException(messages);
  }

  // Destructure and sanitize inputs
  const {
    countryCode,
    phone,
    name,
    email,
    age,
    password,
    role,
  } = dto;

  const trimmedPhone = String(phone).trim();

  // Find existing user by phone
  const existingUser = await this.userRepository.findOne({ where: { phone: trimmedPhone } });

  if (!existingUser) {
    throw new BadRequestException('User with this phone number does not exist');
  }

  // Update user fields
  existingUser.countryCode = countryCode;
  existingUser.name = name;
  existingUser.email = email;
  existingUser.age = age;
  existingUser.password = password; 
  existingUser.role = role || existingUser.role;

  if (profileImage?.filename) {
    existingUser.profileImage = profileImage.filename;
  }

  try {
    await this.userRepository.save(existingUser);

    return {
      status: 'success',
      message: 'User updated successfully',
      data: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        phone: existingUser.phone,
        role: existingUser.role,
        profileImage: existingUser.profileImage,
      },
    };
  } catch (error) {
    console.error('Update user error:', error);
    throw new InternalServerErrorException('Failed to update user');
  }
}


  @Patch(':id')
  @UsePipes(new ValidationPipe())
  async updateUser(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    try {
      const user = await this.userRepository.findOneOrFail({ where: { id } });

      // Update only provided fields
      if (updateUserDto.name) user.name = updateUserDto.name;
      if (updateUserDto.email) user.email = updateUserDto.email;
      if (updateUserDto.age) user.age = updateUserDto.age;

      await this.userRepository.save(user);

      return {
        status: 'success',
        message: 'User updated successfully',
        data: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      };
    } catch (error) {
      if (error.name === 'EntityNotFound') {
        throw new NotFoundException('User not found');
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    try {
      const result = await this.userRepository.softDelete(id);
      if (result.affected === 0) {
        throw new NotFoundException('User not found');
      }
      return { status: 'success', message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to delete user');
    }
  }

  // @Post('send-otp')
  // @UsePipes(new ValidationPipe())
  // async sendOtp(@Body() sendOtpDto: SendOtpDto) {
  //   const { countryCode, phone } = sendOtpDto;

  //   // Generate OTP (fixed for testing, in production use random)
  //   const otp = '111111'; // In production: Math.floor(100000 + Math.random() * 900000).toString()
  //   const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

    
  //   try {
  //     let user = await this.userRepository.findOne({
  //       where: { countryCode, phone },
  //     });

  //     if (!user) {
  //       // Create new user if not found
  //       user = this.userRepository.create({
  //         countryCode,
  //         phone,
  //         role: UserRole.PATIENT,
  //         otp,
  //         otpExpireAt,
  //         phoneVerified: false,
  //         password: '', // Temporary empty password
  //       });
  //     } else {
  //       // Update existing user's OTP
  //       user.otp = otp;
  //       user.otpExpireAt = otpExpireAt;
  //       user.phoneVerified = false;
  //     }

  //     await this.userRepository.save(user);

  //     return {
  //       status: 'success',
  //       message: 'OTP sent successfully',
  //       data: {
  //         userId: user.id,
  //         isNewUser: !user.createdAt, // Better way to check if user was just created
  //       },
  //     };
  //   } catch (error) {
  //     throw new InternalServerErrorException('Failed to send OTP');
  //   }
  // }
  @Post('send-otp')
@UsePipes(new ValidationPipe())
async sendOtp(@Body() sendOtpDto: SendOtpDto) {
  const { countryCode, phone } = sendOtpDto;

  // Generate OTP (fixed for testing, in production use random)
  const otp = '111111'; // In production: Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  try {
    let user = await this.userRepository.findOne({
      where: { countryCode, phone },
    });

     if (user) {
      // User exists, resend OTP and update expiry
      user.otp = otp;
      user.otpExpireAt = otpExpireAt;
      user.phoneVerified = false;

      await this.userRepository.save(user);

      return {
        status: 'success',
        message: 'OTP sent successfully',
        data: {
          userId: user.id,
          isNewUser: false,
        },
      };
    }

    // Create new user if not found
    user = this.userRepository.create({
      countryCode,
      phone,
      role: UserRole.PATIENT,
      otp,
      otpExpireAt,
      phoneVerified: false,
      password: '', // Temporary empty password
    });

    await this.userRepository.save(user);

    
    return {
      status: 'success',
      message: 'OTP sent successfully',
      data: {
        userId: user.id,
        isNewUser: true,
      },
    };
  } catch (error) {
    if (error instanceof BadRequestException) {
      throw error; // Re-throw the BadRequestExceptionprofil
    }
    throw new InternalServerErrorException('Failed to send OTP');
  }
}

  @Post('verify-otp')
  @UsePipes(new ValidationPipe())
  async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
    const { countryCode, phone, otp } = verifyOtpDto;

    try {
      const user = await this.userRepository.findOne({
        where: { phone },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (!user.otp || user.otp !== otp) {
        throw new BadRequestException('Invalid OTP');
      }

      if (!user.otpExpireAt || user.otpExpireAt < new Date()) {
        throw new BadRequestException('OTP has expired');
      }

      // Update user as verified
      user.phoneVerified = true;
      user.otp = null;
      user.otpExpireAt = null;
      await this.userRepository.save(user);

      return {
        status: 'success',
        message: 'Phone number verified successfully',
        data: {
          userId: user.id,
          phoneVerified: true,
        },
      };
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException('Failed to verify OTP');
    }
  }

 @Post('login')
@UsePipes(new ValidationPipe())
async loginUser(@Body() loginDto: LoginDto) {
  const { identifier, password } = loginDto;

  try {
    const user = await this.userRepository.findOne({
      where: [
        { phone: identifier },
        { email: identifier },
      ],
    });

    if (!user) {
      throw new NotFoundException('User not found with this phone or email');
    }

    
    // const isPhone = /^\d{10}$/.test(identifier);
    // if (isPhone && !user.phoneVerified) {
    //   throw new BadRequestException('Phone number is not verified');
    // }

    // For hashed password, use bcrypt.compare()
    const isMatch = user.password === password;
    if (!isMatch) {
      throw new BadRequestException('Invalid password');
    }

    const payload = { sub: user.id, role: user.role };
const token = jwt.sign(payload, 'mySuperSecret123!', {
        expiresIn: '1d', // 1 day
      });
    return {
      status: 'success',
      message: 'Login successful',
      data: {
        user,
        token,
      },
    };
  } catch (error) {
    console.error('Login error:', error); // add this for debugging

    if (
      error instanceof NotFoundException ||
      error instanceof BadRequestException
    ) {
      throw error;
    }

    throw new InternalServerErrorException('Login failed');
  }
}

 @Post('register-profile')
  async registerProfile(@Body() data: any) {
    const {
      countryCode,
      phone,
      title,
      gender,
      language,
      dob,
      servicePin,
      experience,
      serviceArea,
      aboutMe,
      experience_year,
    } = data;

    let user = await this.userRepository.findOne({ where: { phone } });

    if (!user) {
      user = await this.userRepository.save({
        countryCode,
        phone,
      });
    }

    let userDetails = await this.userDetailsRepository.findOne({
      where: { user_id: user.id },
    });

    if (!userDetails) {
      userDetails = this.userDetailsRepository.create({
        user_id: user.id,
        title,
        gender,
        language,
        dob,
        servicePin,
        experience,
        serviceArea,
        aboutMe,
        experience_year,
      });
    } else {
      userDetails.title = title;
      userDetails.gender = gender;
      userDetails.language = language;
      userDetails.dob = dob;
      userDetails.servicePin = servicePin;
      userDetails.experience = experience;
      userDetails.serviceArea = serviceArea;
      userDetails.aboutMe = aboutMe;
      userDetails.experience_year = experience_year;
    }

    await this.userDetailsRepository.save(userDetails);

    return {
      message: 'Profile saved successfully',
      user,
      userDetails,
    };
  }

}
