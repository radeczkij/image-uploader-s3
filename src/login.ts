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

        const login = await identityServiceProvider.initiateAuth({
            AuthFlow: "USER_PASSWORD_AUTH",
            ClientId: process.env.APP_CLIENT_ID!,
            AuthParameters: {
                'USERNAME': body["email"],
                'PASSWORD': body["password"]
            }
        }
        ).promise();

        const tokens = {
            accessToken: login.AuthenticationResult!.IdToken,
            refreshToken: login.AuthenticationResult!.RefreshToken
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "success", info: tokens })
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