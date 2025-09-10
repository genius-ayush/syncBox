import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class SyncJob extends Document {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: string;

    @Prop({ type: Types.ObjectId, ref: 'Connection', required: true })
    sourceConnection: string;  // This stores the connection ID

    @Prop({ enum: ['PENDING', 'RUNNING', 'PAUSED', 'STOPPED', 'COMPLETED'], default: 'PENDING' })
    status: string;

    @Prop({ default: 0 })
    progress: number;
}

export const SyncJobSchema = SchemaFactory.createForClass(SyncJob);
