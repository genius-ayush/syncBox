import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({timestamps:true})
export class Email extends Document{
    
    @Prop({type: Types.ObjectId , ref: 'User' , required:true})
    userId: string ; 

    @Prop({type:Types.ObjectId , ref:'Connection' , required:true})
    connectionId: string

    @Prop()
    subject:string ; 

    @Prop()
    from: string ; 

    @Prop([String])
    to:string[] ;

    @Prop()
    date: Date ; 

    @Prop()
    flags: string[] ; 

    @Prop({type : Object})
    headers: any; 

    @Prop()
    body : string ; 

    @Prop()
    domain : string ;

    @Prop()
    esp:string ;

    @Prop()
    timeDeltaMs : number ; 

    @Prop()
    openRelay : boolean ; 
}

export const EmailSchema = SchemaFactory.createForClass(Email) ;