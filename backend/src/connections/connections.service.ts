import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Connection } from "./schemas/connection.schema";
import { Model } from "mongoose";


@Injectable()
export class ConnectionsService{

    constructor(
        @InjectModel(Connection.name) private connectionModel : Model<Connection>,
    ){}

    async create(userId:string , data:any):Promise<Connection>{

        const newConnection = new this.connectionModel({...data , userId}) ; 

        return newConnection.save() ;
    }

    async findAll(userId:string): Promise<Connection[]>{
        return this.connectionModel.find({userId}).exec() ; 
    }

    async findOne(userId:string , id:string):Promise<Connection>{

        const connection = await this.connectionModel.findOne({ _id: id , userId}).exec()  ;
        
        if(!connection) throw new NotFoundException('Connection not found') ; 
        return connection ; 
    }

    async delete(userId:string , id:string):Promise<void>{
        const result = await this.connectionModel.deleteOne({_id:id , userId}).exec() ; 

        if(result.deletedCount === 0){
            throw new NotFoundException('Connection not found')
        }
    }
}