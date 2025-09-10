import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";


@Schema({timestamps: true})
export class Connection extends Document{

    @Prop({type: Types.ObjectId , ref:'User' , required:true})
    userId : string ; 

    @Prop({required:true})
    host:string; 

    @Prop({required: true})
    port: number

    @Prop({required : true , enum:['OAUTH2' , 'PLAIN' , 'LOGIN']})
    authType: string ; 

    @Prop()
    username: string ; 

    @Prop()
    password: string ;

    @Prop()
    oauthToken:string ;
}

export const ConnectionSchema = SchemaFactory.createForClass(Connection);