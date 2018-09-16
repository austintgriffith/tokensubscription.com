# Grants API Endpoints

GET /grants -> get all Grants
 - You can add limit=##&page=## for paging to the end of the url
 - You can add s=Searchterm and it will search the title and pitch fields

GET /grants/:id -> get a Grant by ID

POST: /grants/create -> create a new Grant or update and existing one
