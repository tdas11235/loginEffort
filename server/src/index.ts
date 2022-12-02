import { createConnection } from "typeorm";
import * as dotenv from "dotenv";
import { ApolloServer } from "apollo-server";
import { buildSchema } from "type-graphql";
import resolvers from "./resolvers/user";
import authchecker from "./utils/authchecker";
import jwt from "jsonwebtoken";
import User from "./entities/user";
import entities from "./entities/index";

dotenv.config();

const main= async() => {
    const schema= await buildSchema({
        resolvers,
        authChecker: authchecker
    })

    const server= new ApolloServer({
        schema,
        cors: {
            credentials: true,
            origin:["https://studio.apollographql.com", "http://localhost:4000", "http://localhost:3000"]
        },
        context: async({req}: {req: any}) => {
            try {
                if (req.headers.authorization) {
                    let token= req.headers.authorization;
                    const decoded : any = jwt.verify(
                        token,
                        process.env.JWT_SECRET!
                      );

                    let user= await User.findOne({id: decoded});

                    return {user};
                }
            }
            catch(error){
                throw new Error(`error---->${error}`);
            }
        }
    });

    server.listen(4000, ()=> {
        console.log(`server listening to port 4000`);
    })
};

createConnection({
    type: "postgres",
    url: process.env.DATABASE_URL,
    synchronize: true,
    entities,
    logging: false,
})
.then(()=> {
    console.log("connected to the database");
    main();
})
.catch((error)=> {
    console.log(error);
});