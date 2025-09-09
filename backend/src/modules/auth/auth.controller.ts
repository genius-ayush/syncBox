import { Controller, Get } from "@nestjs/common";

@Controller('/auth')
export class authController{
    @Get()
    getUser(){
        return {
            name: 'ayush' , email : 'ayush@gamil.com' , provider : "google"
        }
    }
}