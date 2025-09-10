import { Injectable, UnauthorizedException } from "@nestjs/common";
import { User } from "./schemas/user.schema";
import { Model } from "mongoose";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from 'bcrypt';
import { InjectModel } from "@nestjs/mongoose";

@Injectable()
export class AuthService{
    constructor(
        @InjectModel(User.name) private userModel: Model<User>,
        private jwtService: JwtService,
    ){}


    async signup(email: string , password: string){

        const hashedPassword = await bcrypt.hash(password , 10) ; 
        const user = new this.userModel({email , passwordHash:hashedPassword}) ; 

        await user.save() ; 

        const payload = {sub : user._id , email: user.email}

        return {message: 'User registered successfully' , accessToken : this.jwtService.sign(payload) } ; 
    }

    async login(email: string , password : string){

        const user = await this.userModel.findOne({email}) ; 

        if(!user) throw new UnauthorizedException('Invalid credentials');

        const isMatch = await bcrypt.compare(password , user.passwordHash) ; 

        if(!isMatch) throw new UnauthorizedException('Invalid credentials') ; 
        
        const payload = {sub : user._id , email: user.email} ; 

        return{
            accessToken : this.jwtService.sign(payload), 
        };
    }

    async validateUser(userId:string){
        return this.userModel.findById(userId) ; 
    }
}