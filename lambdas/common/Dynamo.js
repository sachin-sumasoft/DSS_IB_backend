const aws = require('aws-sdk');

const docClient = new aws.DynamoDB.DocumentClient();

const Dynamo = {
    async createUser(user, TableName) {
        console.log("user Dynamo", user)
        console.log("TableName", TableName)

        const params = {
            TableName,
            Item: user
        };
        console.log("params===", params)
        
        let err = await docClient
            .put(params)
            .promise();
        console.log('err====', err);
        return user;
    },
    async addCategory(categoryObj, TableName) {
        console.log("user Dynamo", categoryObj)
        console.log("TableName", TableName)

        const params = {
            TableName,
            Item: categoryObj
        };
        console.log("params===", params)
        
        let err = await docClient
            .put(params)
            .promise();
        console.log('err====', err);
        return categoryObj;
    },
    async getSingleCategory(ID, TableName) {
        console.log("typeof", typeof ID)
        console.log("ID, TableName in GET", ID, TableName)
        const params = {
            TableName,
            Key: {
                id : ID
            },
        };
        console.log('params===', params);
        const data = await docClient
            .get(params)
            .promise();
        console.log("docClient Response", data)
        return data;
    },
    async getAllCategoryList(TableName) {
        const params = {
            TableName
        }
        const data = await docClient
            .scan(params)
            .promise();
        return data;
    }
}

module.exports = Dynamo;