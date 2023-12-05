import { APIGatewayProxyEvent, APIGatewayProxyHandler, APIGatewayProxyResult } from "aws-lambda";
import AWS from "aws-sdk";

const s3 = new AWS.S3({
    accessKeyId: process.env.ACCESSKEYID!,
    secretAccessKey: process.env.SECRETACCESSKEY!,
    region: process.env.REGION!
});

function createPhotoName(length: number): string {
    let result: string = '';
    const characters: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charactersLength: number = characters.length;
    for (var i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

export const handler: APIGatewayProxyHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {

    const token = event.headers["Bearer"]!;

    const username: string = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString())["sub"]

    const photoName: string = createPhotoName(50);

    const data = s3.createPresignedPost({
        Bucket: process.env.BUCKET_NAME!,
        Fields: {
            key: `${username}/${photoName}`,
            'Content-type': 'image/jpg',
        },
    });

    const response = {
        statusCode: 200,
        body: JSON.stringify({ message: "success", data })
    };
    return response;
};