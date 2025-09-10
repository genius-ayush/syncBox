import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { ConnectionsModule } from './connections/connections.module';
import { SyncModule } from './sync/sync.module';


@Module({
  imports: [
    ConfigModule.forRoot({isGlobal:true}), 

    MongooseModule.forRootAsync({
      imports:[ConfigModule] , 
      inject : [ConfigService] , 
      useFactory: async(configService: ConfigService)=>({
        uri: configService.get<string>('MONGO_URI')
      })
    }) , 

    AuthModule,
    ConnectionsModule,
    SyncModule ,
    
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
