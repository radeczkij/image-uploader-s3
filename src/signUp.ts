import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
})

const identityServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const body = JSON.parse(event.body!);

    try {

        const signUp = await identityServiceProvider.signUp({
            ClientId: process.env.APP_CLIENT_ID!,
            Password: body["password"],
            Username: body["email"]
        }
        ).promise();

        const response = {
            statusCode: 201,
            body: JSON.stringify({ message: "successfully registered" })
        };

        return response;
    } catch (error) {
        const errorResponse = {
            statusCode: 400,
            body: JSON.stringify({ error: error.message })
        };

        return errorResponse;
    }
};
