import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
})

const dynamodb = new AWS.DynamoDB();

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const photoKey = event["Records"][0]["s3"]["object"]["key"].split("/")[1];
    const userName = event["Records"][0]["s3"]["object"]["key"].split("/")[0];

    console.log(`${userName}/${photoKey}`);
    console.log('a8eb0e01-bf4f-4392-9fab-2beacf6e644c/346fo9bfhhjhZ6adD1zmpR0pxqubUyfTmBYDI5xAB1uesrKMVy');
    await dynamodb.deleteItem({
        'TableName': process.env.TABLE_NAME!,
        'Key': {
            "id": {
                "S": `${userName}/${photoKey}`
            },
            "user_name": {
                "S": `${userName}`
            }
        },
    }).promise()
    
    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "success" })
    };
    return response;
};