import { Controller, Post, Body, Param, Get } from '@nestjs/common';
import { SyncService } from './sync.service';
import { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { Connection } from 'src/connections/schemas/connection.schema';

@Controller('sync')
export class SyncController {
    constructor(
        private readonly syncService: SyncService,
        @InjectModel(Connection.name) private connectionModel: Model<Connection>,
    ) {}

    @Post('start')
    async startSync(@Body() body: { userId: string; connectionId: string }) {
        const connection = await this.connectionModel.findById(body.connectionId).exec();
        if (!connection) throw new Error('Connection not found');
        return this.syncService.startSync(body.userId, connection);
    }

    @Post('pause')
    async pauseSync(@Body() body: { syncJobId: string }) {
        return this.syncService.pauseSync(body.syncJobId);
    }

    @Post('resume')
    async resumeSync(@Body() body: { syncJobId: string }) {
        return this.syncService.resumeSync(body.syncJobId);
    }

    @Post('stop')
    async stopSync(@Body() body: { syncJobId: string }) {
        return this.syncService.stopSync(body.syncJobId);
    }

    @Get('status/:id')
    async getStatus(@Param('id') id: string) {
        return this.syncService.getSyncStatus(id);
    }
}
