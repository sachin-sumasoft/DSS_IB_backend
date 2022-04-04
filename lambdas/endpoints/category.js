const { TableNames } = require('../../constants');
const API_RESPONSES = require('../common/API_RESPONSES');
const Dynamo = require('../common/Dynamo');
const aws = require('aws-sdk');
const uuid = require('uuid');
const jwt = require("jsonwebtoken");
require('dotenv').config();

const dynamodb = new aws.DynamoDB.DocumentClient();
const timestamp = new Date().getTime();

exports.addCategory = async event => {
    console.log("createCategory", event);
    const data = JSON.parse(event.body);
    console.log("categorydata", data);

    const categoryObj = {
        id: uuid.v1(),
        CategoryName: data.CategoryName,
        Parent: data.Parent,
        Status: data.Status,
        Language: data.Language,
        Name: data.Name,
        createdon: timestamp
    }
    console.log("categoryObj", categoryObj);


    await Dynamo.addCategory(categoryObj, TableNames.Category)
    return API_RESPONSES.buildResponse(200, {
        message: 'Category created successfully'
    })
}



exports.getCategory = async event => {
    console.log('getCategory event', event);
    console.log("pathParameters", event.pathParameters)
    if (!event.pathParameters || !event.pathParameters.id) {
        return API_RESPONSES.buildResponse(401,
            {
                message: "missing id from the path"
            })
    }
    let ID = event.pathParameters.id;
    console.log("Player id", ID);
    console.log("typeof", typeof ID);



    const cat = await Dynamo.getSingleCategory(ID, TableNames.Category);

    if (cat) {
        return API_RESPONSES.buildResponse(200,
            {
                cat
            });
    } else {
        return API_RESPONSES.buildResponse(400,
            {
                message: 'failed to get by user id'
            })
    }
}

exports.getAllCategory = async event => {
    console.log("getAllCategory", event);
    const res = await Dynamo.getAllCategoryList(TableNames.Category);
    if (event.headers.Authorization) {
        const token = event.headers.Authorization;
        const user = jwt.verify(token, process.env.JWT_SECRET)
        event.user = user;
    } else {
        return API_RESPONSES.buildResponse(400, { message: 'Authorization required' })
    }
    return API_RESPONSES.buildResponse(200, {
        res
    })
}

exports.updateCategory = async (event, context, callback) => {
    const data = JSON.parse(event.body);

    const params = {
        TableName: TableNames.Category,
        Item: {
            id: event.pathParameters.id,
            CategoryName: data.CategoryName,
            Status: data.Status,
            Parent: data.Parent,
            Language: data.Language,
            Name: data.Name,
            company: data.company,
            updatedon: timestamp
        },
    };

    await dynamodb.put(params).promise();
    return API_RESPONSES.buildResponse(200, {
            message: "Category Updated successfully"
    })
}







