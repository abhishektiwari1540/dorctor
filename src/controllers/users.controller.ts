import { Controller, Get, Post, Body, Param, Delete, Patch, BadRequestException, 
  NotFoundException,
  UsePipes,
  ValidationPipe } from '@nestjs/common';
import { getRepository } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { validate } from 'class-validator';
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
  IsPhoneNumber
} from 'class-validator';
import { Type } from 'class-transformer';
export class SendOtpDto {
  countryCode: string;
  
  @IsNotEmpty()
  @Length(10, 10)
  phone: string;
}

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  countryCode: string;

  @IsNotEmpty()
  @IsString()
  @Length(10, 10, { message: 'Phone must be 10 digits' })
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

  @IsEnum(UserRole)
  role: UserRole;
}


@Controller('users')
export class UsersController {
  @Get('test')
  testRoute() {
    return 'Test route working';
  }

  @Get()
  async listAll() {
    const userRepository = getRepository(User);
    return await userRepository.find({
      select: ['id', 'countryCode', 'phone', 'name', 'email', 'age', 'role', 'createdAt'],
    });
  }

  @Get(':id')
  async getOneById(@Param('id') id: number) {
    const userRepository = getRepository(User);
    try {
      return await userRepository.findOneOrFail({
        where: { id },
        select: ['id', 'countryCode', 'phone', 'name', 'email', 'age', 'role', 'createdAt'],
      });
    } catch (error) {
      throw new Error('User not found');
    }
  }
@Post()
@UsePipes(new ValidationPipe())
async newUser(@Body() createUserDto: CreateUserDto) {
  const userRepository = getRepository(User);
  const { countryCode, phone, name, email, age, password, role } = createUserDto;

  // First check if user exists by phone (only phone, not email)
  let user = await userRepository.findOne({ 
    where: { phone } 
  });

  if (user) {
    // UPDATE EXISTING USER
    user.countryCode = countryCode;
    user.name = name;
    user.email = email;
    user.age = age;
    user.password = password;
    user.role = role;
  } else {
    // CREATE NEW USER
    user = new User();
    user.countryCode = countryCode;
    user.phone = phone;
    user.name = name;
    user.email = email;
    user.age = age;
    user.password = password;
    user.role = role || UserRole.PATIENT;
  }

  // Validate before saving
  const errors = await validate(user);
  if (errors.length > 0) {
    throw new BadRequestException(errors);
  }

  await userRepository.save(user);
  
  return { 
    message: user.id ? 'User updated successfully' : 'User created successfully',
    userId: user.id
  };
}
  @Patch(':id')
  async editUser(@Param('id') id: number, @Body() body: any) {
    const { name, email, age } = body;
    const userRepository = getRepository(User);

    const user = await userRepository.findOneOrFail({ where: { id } });
    user.name = name;
    user.email = email;
    user.age = age;

    const errors = await validate(user);
    if (errors.length > 0) {
      throw new Error('Validation failed');
    }

    return await userRepository.save(user);
  }

  @Delete(':id')
  async deleteUser(@Param('id') id: number) {
    const userRepository = getRepository(User);
    await userRepository.findOneOrFail({ where: { id } });
    await userRepository.softDelete(id);
    return { message: 'User deleted' };
  }

  @Post('send-otp')
async sendOtp(@Body() sendOtpDto: SendOtpDto) {
    const { countryCode, phone } = sendOtpDto;
    if (!phone) {
    throw new BadRequestException('Phone number is required');
  }
  
  if (!/^\d{10}$/.test(phone)) {
    throw new BadRequestException('Phone number must be exactly 10 digits');
  }
    const userRepository = getRepository(User);
  
  // Check if user exists
  let user = await userRepository.findOne({ 
    where: { countryCode, phone } 
  });

  // Generate OTP (fixed for testing, use random in production)
  const otp = "111111"; // Replace with: Math.floor(100000 + Math.random() * 900000).toString()
  const otpExpireAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes expiry

  if (!user) {
    // Create new user if not found
    user = new User();
    user.countryCode = countryCode;
    user.phone = phone;
    user.role = UserRole.PATIENT; // Default role
    user.otp = otp;
    user.otpExpireAt = otpExpireAt;
    user.phoneVerified = false;
  } else {
    // Update existing user's OTP
    user.otp = otp;
    user.otpExpireAt = otpExpireAt;
    user.phoneVerified = false;
  }

  await userRepository.save(user); // Save new or updated user

  return { 
    message: 'OTP sent successfully',
    userId: user.id, // Return user ID (useful for verification)
    isNewUser: !user.id // Optional: Indicates if user was just created
  };
  }
}