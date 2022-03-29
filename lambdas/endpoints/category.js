const { TableNames } = require('../../constants');
const API_RESPONSES = require('../common/API_RESPONSES');
const Dynamo = require('../common/Dynamo');
const aws = require('aws-sdk');
const uuid = require('uuid');

const dynamodb = new aws.DynamoDB.DocumentClient();

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
        Name: data.Name
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
    return API_RESPONSES.buildResponse(200, {
        res
    })
}

exports.updateCategory = (event, context, callback) => {
    console.log("updateCategory", event);
    const data = JSON.parse(event.body);
    console.log("data", data);
    // const id = uuid.v1();
    const CategoryName = data.CategoryName;
    const Parent = data.Parent;
    const Status = data.Status;
    const Language = data.Language;
    const Name = data.Name;
    submitCategory(categoryInfo(CategoryName, Parent, Status, Language, Name))
        .then(res => {
            callback(null, {
                statusCode: 200,
                body: JSON.stringify({
                    message: `Sucessfully submitted Category`,
                    categoryId: res.id
                })
            });
        })
        .catch(err => {
            console.log(err);
            callback(null, {
                statusCode: 500,
                body: JSON.stringify({
                    message: `Unable to submit Category`
                })
            })
        });
}


const submitCategory = category => {
    console.log('Submitting candidate');
    const categoryInfo = {
        TableName: TableNames.Category,
        Item: category,
    };
    return dynamodb.put(categoryInfo).promise()
        .then(res => category);
};


const categoryInfo = ( CategoryName, Parent, Status, Language, Name) => {
    const timestamp = new Date().getTime();
    return {
        id: uuid.v1(),
        CategoryName: CategoryName,
        Parent: Parent,
        Status: Status,
        Language: Language,
        Name: Name,
        submittedAt: timestamp,
        updatedAt: timestamp,
    };
};







