# Leaflet

Leaflet is an image gallery where you can upload pictures of house plants and name them. 

Visit it at:
[https://leaflet-gallery.herokuapp.com/](https://leaflet-gallery.herokuapp.com/)

The user can add images of plants, along with names and brief tags to describe them. The plants in the Leaflet can then be searched by name or tag.
![homepage screenshot](demo/homepage.png?raw=true "Homepage")
Images can be uploaded from device or from a URL.
![add-plant screenshot](demo/add-plant.png?raw=true "Add a Plant")
Plants can be deleted from the Leaflet.
![delete screenshot](demo/delete.png?raw=true "Delete a Plant")


## Description

Leaflet is a React App deployed using Heroku Git.

* React App code is in [client](client)
* Express server code is in [server.js](server.js)

## Dependencies
```
npm i mysql
npm i express
npm i multer
npm i body-parser
npm i path
npm i cors
```

## Project Status
### Known Bugs
* deleting plant sometimes needs refresh to reflect changes
* alignment of image gallery is not responsive, leaves gaps depending on image dimensions

### Future Features
* batch uploading and deleting of plants
* log of entries for each plant to keep track of growth
* care-related tags (hydration, sunlight)
* user management system to have user-specific Leaflets

## Author

[@k-chew](https://github.com/k-chew)
Project started: September 1, 2020

## Acknowledgments
This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
