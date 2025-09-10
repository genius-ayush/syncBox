import { Body, Controller, Delete, Get, Param, Post, Request, UseGuards } from "@nestjs/common";
import { ConnectionsService } from "./connections.service";
import { AuthGuard } from "@nestjs/passport";

@Controller('connections')
@UseGuards(AuthGuard('jwt'))
export class ConnectionsController{

    constructor(private readonly connectionsService:ConnectionsService){}

    @Post()
    async create(@Request() req , @Body()body){
        return this.connectionsService.create(req.user.userId , body) ; 
    }

    @Get()
    async findAll(@Request() req){
        return this.connectionsService.findAll(req.user.userId);
    }

    @Get(':id')
    async findOne(@Request()req , @Param('id') id:string){
        return this.connectionsService.findOne(req.user.userId ,id) ; 
    }

    @Delete(':id')
    async delete(@Request() req , @Param('id') id: string){
        return this.connectionsService.delete(req.user.userId , id);
    }
}