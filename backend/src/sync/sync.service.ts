import { Injectable, Logger } from '@nestjs/common';
import { Connection } from 'src/connections/schemas/connection.schema';
import { SyncJob } from './schemas/sync-job.schema';
import { ImapSimple, connect } from 'imap-simple';
import * as simpleParser from 'mailparser';
import { Email } from 'src/emails/schemas/email.schema';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

@Injectable()
export class SyncService {
    constructor(
        @InjectModel(Connection.name) private connectionModel: Model<Connection>,
        @InjectModel(Email.name) private emailModel: Model<Email>,
        @InjectModel(SyncJob.name) private syncJobModel: Model<SyncJob>,
    ) {}

    private readonly logger = new Logger(SyncService.name);

    async startSync(userId: string, connection: Connection): Promise<SyncJob> {
        const syncJob = new this.syncJobModel({
            userId,
            sourceConnection: connection._id,
            status: 'RUNNING',
            progress: 0,
        });

        await syncJob.save();
        this.syncEmails(userId, connection, syncJob);

        return syncJob;
    }

    private async syncEmails(userId: string, connection: Connection, syncJob: SyncJob) {
        try {
            const config = {
                imap: {
                    user: connection.username,
                    password: connection.password,
                    host: connection.host,
                    port: connection.port,
                    tls: true,
                    authTimeout: 3000,
                }
            };

            const imapConnection: ImapSimple = await connect(config);
            await imapConnection.openBox('INBOX');

            const searchCriteria = ['ALL'];
            const fetchOptions = { bodies: [''] };

            const messages = await imapConnection.search(searchCriteria, fetchOptions);

            let count = syncJob.progress || 0;

            for (let i = count; i < messages.length; i++) {
                const currentJob = await this.syncJobModel.findById(syncJob._id).exec();
                if (!currentJob) throw new Error('Sync Job not found');

                if (currentJob.status === 'PAUSED' || currentJob.status === 'STOPPED') {
                    this.logger.log(`Sync ${currentJob.status.toLowerCase()} by user`);
                    return;
                }

                const item = messages[i];
                const raw = item.parts[0].body;
                const parsed = await simpleParser.simpleParser(raw);

                const email = new this.emailModel({
                    userId,
                    connectionId: connection._id,
                    subject: parsed.subject,
                    from: parsed.from.text,
                    to: parsed.to.value.map(v => v.address),
                    date: parsed.date,
                    flags: item.attributes.flags,
                    headers: parsed.headers,
                    body: parsed.text,
                    domain: this.extractDomain(parsed.from.text),
                    esp: this.detectESP(parsed.from.text),
                    timeDeltaMs: parsed.date ? Date.now() - parsed.date.getTime() : null,
                    openRelay: false,
                });

                await email.save();

                currentJob.progress = i + 1;
                await currentJob.save();
            }

            imapConnection.end();
            syncJob.status = 'COMPLETED';
            await syncJob.save();
        } catch (err) {
            this.logger.error(`Sync failed: ${err.message}`);
            syncJob.status = 'STOPPED';
            await syncJob.save();
        }
    }

    private extractDomain(from: string): string {
        const match = from.match(/@([^\s>]+)/);
        return match ? match[1] : '';
    }

    private detectESP(from: string): string {
        const domain = this.extractDomain(from);
        if (domain.includes('gmail.com')) return 'Google';
        if (domain.includes('yahoo.com')) return 'Yahoo';
        return 'Other';
    }

    async pauseSync(syncJobId: string) {
        const job = await this.syncJobModel.findById(syncJobId).exec();
        if (!job) throw new Error('Sync Job not found');
        job.status = 'PAUSED';
        await job.save();
        return job;
    }

    async resumeSync(syncJobId: string) {
        const job = await this.syncJobModel.findById(syncJobId).exec();
        if (!job) throw new Error('Sync Job not found');
        job.status = 'RUNNING';
        await job.save();

        const connection = await this.connectionModel.findById(job.sourceConnection).exec();
        if (!connection) throw new Error('Connection not found');

        this.syncEmails(job.userId, connection, job);
        return job;
    }

    async stopSync(syncJobId: string) {
        const job = await this.syncJobModel.findById(syncJobId).exec();
        if (!job) throw new Error('Sync Job not found');
        job.status = 'STOPPED';
        await job.save();
        return job;
    }

    async getSyncStatus(syncJobId: string) {
        return this.syncJobModel.findById(syncJobId).exec();
    }
}
