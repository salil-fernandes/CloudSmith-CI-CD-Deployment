import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('Artifacts')

def delete_all_items():
    # Scan to get all items
    scan = table.scan()
    with table.batch_writer() as batch:
        for item in scan['Items']:
            batch.delete_item(
                Key={
                    'artifactId': item['artifactId']
                }
            )

    # Handle pagination (if > 1MB of data)
    while 'LastEvaluatedKey' in scan:
        scan = table.scan(ExclusiveStartKey=scan['LastEvaluatedKey'])
        with table.batch_writer() as batch:
            for item in scan['Items']:
                batch.delete_item(
                    Key={
                        'artifactId': item['artifactId']
                    }
                )

delete_all_items()
