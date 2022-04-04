const { TableNames } = require('../../constants');
const aws = require('aws-sdk');
const uuid = require('uuid');

const dynamoDb = new aws.DynamoDB.DocumentClient();


exports.addTopic = (event, context, callback) => {
    const requestBody = JSON.parse(event.body);
    const topicName = requestBody.topicName;
    const category = requestBody.category;
    const status = requestBody.status;
    const language = requestBody.language;
    const subcategory = requestBody.subcategory;
    const value = requestBody.value;

    if (typeof topicName !== 'string' || typeof category !== 'string' || typeof status !== 'number'
        || typeof language !== 'string' || typeof subcategory !== 'string' || typeof value !== 'string') {
        console.error('Validation Failed');
        callback(new Error('Couldn\'t submit topic because of validation errors.'));
        return;
    }

    submitTopic(topicInfo(topicName, category, status, language, subcategory, value))
        .then(res => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Sucessfully submitted topic`,
                    auditId: res.id
                })
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Unable to submit topic`
                })
            })
        });
};


const submitTopic = topic => {
    console.log('Submitting topic');
    const topicInfo = {
        TableName: TableNames.TOPIC,
        Item: topic,
    };
    return dynamoDb.put(topicInfo).promise()
        .then(res => topic);
};

const topicInfo = (topicName, category, status, language, subcategory, value) => {
    return {
        id: uuid.v1(),
        topicName: topicName,
        category: category,
        status: status,
        language: language,
        subcategory: subcategory,
        value: value,
    };
};


exports.getAllTopic = (event, context, callback) => {
    var params = {
        TableName: TableNames.TOPIC,
        ProjectionExpression: "id, topicName, category"
    };

    console.log("Scanning Topic table.");
    const onScan = (err, data) => {

        if (err) {
            console.log('Scan failed to load data. Error JSON:', JSON.stringify(err, null, 2));
            callback(err);
        } else {
            console.log("Scan succeeded.");
            return callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    topics: data.Items
                })
            });
        }

    };

    dynamoDb.scan(params, onScan);

};



exports.getSingleTopic = (event, context, callback) => {
    const params = {
        TableName: TableNames.TOPIC,
        Key: {
            id: event.pathParameters.id,
        },
    };

    dynamoDb.get(params).promise()
        .then(result => {
            const response = {
                statusCode: 200,
                body: JSON.stringify(result.Item),
            };
            callback(null, response);
        })
        .catch(error => {
            console.error(error);
            callback(new Error('Couldn\'t fetch topic.'));
            return;
        });
};


exports.updateTopic = async (event, context, callback) => {
    const data = JSON.parse(event.body);
    const timestamp = new Date().getTime();
    const params = {
        TableName: TableNames.TOPIC,
        Item: {
            id: event.pathParameters.id,
            topicName: data.topicName,
            category: data.category,
            status: data.status,
            language: data.language,
            subcategory: data.subcategory,
            value: data.value,
            updatedOn: timestamp
        },
    };

    await dynamoDb.put(params).promise();
    return {
        statusCode: 200,
        body: JSON.stringify({
            message: "Topic Updated successfully"
        })
    }
}




