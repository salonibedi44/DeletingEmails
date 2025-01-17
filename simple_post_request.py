import requests

url = 'https://gmail.googleapis.com/gmail/v1/users/salonibedi44@gmail.com/messages/batchDelete'

request_body = { "ids": ['20240812060825.36376334.2698703@sailthru.com']}

response = requests.post(url, json = request_body)

print(response.status_code)
