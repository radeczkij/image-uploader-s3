import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
})

const dynamodb = new AWS.DynamoDB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const token = event.headers["Bearer"]!;
    const username: string = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())["sub"];

    const items = await dynamodb.scan({
        'TableName': process.env.TABLE_NAME!,
        'FilterExpression': "#username = :username",
        'ExpressionAttributeNames': {
            '#username': 'user_name'
        },
        'ExpressionAttributeValues': {
            ":username": {S: username},
          },
    }).promise();

    if(!items){
        const response = {
            statusCode: 200,
            body: JSON.stringify({ message: "success", Urls: 'empty' })
        };

        return response
    }

    const urls: string[] = items.Items!.map(item => {
      return item.photo_url.S!;
    })

    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "success", Urls: urls })
    };
    return response;
};