import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { SyncService } from './sync.service';
import { SyncController } from './sync.controller';
import { Connection, ConnectionSchema } from 'src/connections/schemas/connection.schema';
import { Email, EmailSchema } from 'src/emails/schemas/email.schema';
import { SyncJob, SyncJobSchema } from './schemas/sync-job.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Connection.name, schema: ConnectionSchema },
            { name: Email.name, schema: EmailSchema },
            { name: SyncJob.name, schema: SyncJobSchema },
        ]),
    ],
    providers: [SyncService],
    controllers: [SyncController],
})
export class SyncModule {}
