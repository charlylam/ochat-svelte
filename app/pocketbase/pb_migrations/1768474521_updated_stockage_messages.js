/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2815745022")

  // add field
  collection.fields.addAt(4, new Field({
    "cascadeDelete": true,
    "collectionId": "pbc_728114816",
    "hidden": false,
    "id": "relation162268054",
    "maxSelect": 1,
    "minSelect": 0,
    "name": "conversation_id",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "relation"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "date1872009285",
    "max": "",
    "min": "",
    "name": "time",
    "presentable": false,
    "required": true,
    "system": false,
    "type": "date"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2815745022")

  // remove field
  collection.fields.removeById("relation162268054")

  // remove field
  collection.fields.removeById("date1872009285")

  return app.save(collection)
})
