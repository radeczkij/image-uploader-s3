import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
})

const identityServiceProvider = new AWS.CognitoIdentityServiceProvider();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const refreshToken = event.headers["Bearer"]!;

    try {

        if(!refreshToken){
            throw Error('Need refresh token in header (Bearer <refreshToken>)')
        }

        const refreshTokens = await identityServiceProvider.initiateAuth({
            AuthFlow: 'REFRESH_TOKEN_AUTH',
            ClientId: process.env.APP_CLIENT_ID!,
            AuthParameters: {
                'REFRESH_TOKEN': refreshToken,
            }
        }
        ).promise();

        const tokens = {
            accessToken: refreshTokens.AuthenticationResult!.IdToken,
        }

        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "success", info: tokens })
        };

        return response;
    } catch (error) {
        const errorResponse = {
            statusCode: 400,
            body: JSON.stringify({ error })
        };

        return errorResponse;
    }
};