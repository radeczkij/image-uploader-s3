import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
})

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID,
    secretAccessKey: process.env.SECRETACCESSKEY,
    region: process.env.REGION
});

const dynamodb = new AWS.DynamoDB();

function getUrl(photoKey: string) {
    const url = s3.getSignedUrl('getObject', { Bucket: process.env.BUCKET_NAME!, Key: photoKey });
    return url;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const username: string = event["Records"][0]["s3"]["object"]["key"].split("/")[0];
    const photoKey: string = event["Records"][0]["s3"]["object"]["key"];

    const url = getUrl(photoKey);

    await dynamodb.putItem({
        "TableName": process.env.TABLE_NAME!,
        "Item": {
            "id": {
                S: `${photoKey}`
            },
            "user_name": {
                S: username
            },
            "photo_url": {
                S: url
            }
        },
    }).promise();

    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "success" })
    };
    return response;
};