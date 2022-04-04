const aws = require('aws-sdk');
const { TableNames } = require('../../constants');
const API_RESPONSES = require('../common/API_RESPONSES');
const Dynamo = require('../common/Dynamo');
const bcrypt = require('bcryptjs');
const jwt = require("jsonwebtoken");
const { isEmpty } = require('lodash');
require('dotenv').config()

const dynamodb = new aws.DynamoDB.DocumentClient();

exports.signin = async event => {
    console.log("signin", event);
    const data = JSON.parse(event.body)
    const { email, password } = data;
    console.log("signin data", data);
    
    console.log("pass", password);
    if (!email || !password) {
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
    if(isEmpty(result)){
        return API_RESPONSES.buildResponse(401, {
            message : "User does't exist"
        })
    }
    const { firstName,lastName,role } = result.Item;

    console.log("result", result);
    console.log("result.item", result.Item.password)
    const match = await bcrypt.compare(password, result.Item.password);
    if(match){
        const token = jwt.sign({result: result},process.env.JWT_SECRET,{expiresIn: '1h'})
        console.log("tokent",token);
        return API_RESPONSES.buildResponse(200,{
            token,
            user : {
                firstName,
                lastName,
                email,
                role
            }
        })
    } else {
        return API_RESPONSES.buildResponse(401, {
            message: "Invalid password"
        })
    }
}
