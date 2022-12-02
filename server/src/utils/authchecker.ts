import { AuthChecker } from "type-graphql";
import Context from "./context";

const authChecker: AuthChecker<Context>= async ({context: {user}}) => {
    if (!user) {
        return false;
    }
    return true;
}

export default authChecker;