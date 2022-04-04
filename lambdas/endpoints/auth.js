const aws = require('aws-sdk');
const { TableNames } = require('../../constants');
const API_RESPONSES = require('../common/API_RESPONSES')
const bcryptjs = require('bcryptjs');
const Dynamo = require('../common/Dynamo');
const { keys} = require('lodash');
const uuid = require('uuid');


const dynamodb = new aws.DynamoDB.DocumentClient();

exports.Register = async event => {
    console.log("register event", event);
    const data = JSON.parse(event.body);
    console.log("data", data);
    const {firstName, lastName, email, password, role} = data;

    if (!firstName || !lastName || !email || !password || !role) {
        return API_RESPONSES.buildResponse(401, {
            message: 'All fields are required'
        })
    }
    

    const params = {
        TableName: TableNames.USER,
        Key: {
            "email": email
        }
    }

    const result = await dynamodb.get(params).promise();
    console.log("result", result);

    if (keys(result).length > 0) {
        return API_RESPONSES.buildResponse(402, {
            message: "Email already exist in our database"
        })
    }


    const hash_password = bcryptjs.hashSync(password, 10);
    const user = {
        id : uuid.v1(),
        firstName: firstName,
        lastName: lastName,
        email: email,
        password: hash_password,
        role: role
    }

    await Dynamo.createUser(user, TableNames.USER)
    return API_RESPONSES.buildResponse(200, {
        message: `${role} created successfully`
    })

}