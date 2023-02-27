export const handler = async(event) => {
    // TODO implement
    console.log(event);
    const msg = "ravi says " + event.queryStringParameters['keyword'];
    const response = {
        statusCode: 200,
        body: msg,
    };
    return response;
};
