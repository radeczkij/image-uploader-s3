import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

AWS.config = new AWS.Config({
    credentials: { accessKeyId: process.env.ACCESSKEYID!, secretAccessKey: process.env.SECRETACCESSKEY! },
    region: process.env.REGION!,
});

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID!,
    secretAccessKey: process.env.SECRETACCESSKEY!,
    region: process.env.REGION!
});

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const body = JSON.parse(event.body!);
    const url = body.url;

    const path: string = `${url.split("/")[3]}/${url.split("/")[4].split("?")[0]}`;

    try{
    await s3.deleteObject({
        Bucket: process.env.BUCKET_NAME!,
        Key: path,
    }).promise();
    
    }catch(error){
        const response = {
            statusCode: 200,
            body: JSON.stringify({ error: error.message })
        };
                    
        return response;
    }

    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "success" })
    };
    return response;
};