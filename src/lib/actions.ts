import db from "@/lib/db";
import { executeAction } from "@/lib/executeAction"
import { schema } from "@/lib/schema";

const signUp = async (FormData:FormData) => {
    return executeAction({
        actionFn: async () => {
           const email = FormData.get("email");
           const password = FormData.get("password");
           const validatedData = schema.parse({ email, password });
           await db.user.create({
            data: {
                email: validatedData.password.toLowerCase(),
                password: validatedData.password,
            }
           })
        },
    });
};

export { signUp }