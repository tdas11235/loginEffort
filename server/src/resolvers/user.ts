import { Arg, Authorized, Ctx, Mutation, Query, Resolver } from "type-graphql";
import User from "../entities/user";
import LoginOutput from "../utils/loginOutput";
import { NewUser, LoginInput, Change } from "../inputs/user";
import bcryptjs from "bcryptjs";
import Context from "../utils/context";
import jwt from "jsonwebtoken";

@Resolver()
class UserResolver {

    @Mutation(()=> User)
    async createUser(@Arg('new') userInfo: NewUser){
        try {
            let user= User.create({
                name: userInfo.name,
                email: userInfo.email,
                password: bcryptjs.hashSync(userInfo.password, Number(process.env.ITR))
            }).save();

            return user;
        }
        catch(error) {
            throw new Error(`error--->${error}`);
        }
    }

    @Mutation(()=>LoginOutput)
    async login(@Arg("loginInput") {email, password}: LoginInput) {
        try {
            let user= await User.findOne({where: {email: email}});
            console.log(user);

            if (!user){
                throw new Error("Invalid email");
            }

            let passwordValidator= bcryptjs.compareSync(password, user.password);

            if (!passwordValidator) {
                throw new Error("invalid password");
            }

            let token= jwt.sign(user.id, process.env.JWT_SECRET!);

            return {
                token: token,
                status: true
            };
        }
        catch(error) {
            throw new Error(`error---->${error}`);
        }
    }

    @Mutation(()=> User)
    @Authorized()
    async update(@Ctx() {user}: Context,  @Arg("Changes") updatedInfo: Change){
        try {
            if (updatedInfo.email) {
                user.email= updatedInfo.email;
            }
            if (updatedInfo.name) {
                user.name= updatedInfo.name;
            }
            if (updatedInfo.password) {
                user.password= updatedInfo.password;
            }
            
            let newUser= await user.save();
            return newUser; 
        }
        catch(error){
            throw new Error(`error---->${error}`);
        }
    }

    @Mutation(()=> User)
    async deleteUser(@Arg("Id") id: string) {
        try {
            const user= await User.findOne({where: {id: id}});
            if (!user){
                throw new Error("invalid id");
            }
            let deletedUser= await user.remove();
            return deletedUser;
        }
        catch(error) {
            throw new Error(`error---->${error}`);
        }
    }

    @Query(()=> User)
    async getUser(@Arg('Id') id: string){
        try {
            let user= await User.findOne({where: {id: id}});
            if (!user) {
                throw new Error("invalid id");
            }
            return user;
        }
        catch(error){
            throw new Error(`error---->${error}`);
        }
    }
}

export default [UserResolver] as const;