import { Module } from '@nestjs/common';
import { authController } from './modules/auth/auth.controller';


@Module({
  imports: [],
  controllers: [authController],
  providers: [],
})
export class AppModule {}
