import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { MongooseModule } from "@nestjs/mongoose";
import { PassportModule } from "@nestjs/passport";
import { User, UserSchema } from "./schemas/user.schema";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { JwtStrategy } from "./jwt.strategy";


@Module({
    imports: [PassportModule,
        JwtModule.register({
            secret: process.env.JWT_SECRET || 'secret123',
            signOptions: { expiresIn: '1d' },
        }),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    ],

    controllers: [AuthController],

    providers: [AuthService , JwtStrategy],

    exports: [AuthService],
})

export class AuthModule { }