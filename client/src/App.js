import React from 'react';
import './App.css';
import logo from './logo.svg';

class App extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      images: [], // unparsed GET request
      galleryImages: [], // parsed GET request
      selectedImg: null,
      filter: '',
      popup: false,
      imageName: '',
      showDeleteConfirmation: false,
      toDeleteId: null,
      toDeleteSrc: null,
      tag: '',
      currentTags: [],
    };

    this.fileSelect = (event) => { // input submit handler
      if (event.target.files && event.target.files[0]) {
        let img = event.target.files[0];
        console.log(img);
        this.setState({
          selectedImg: img
        });
      }
    };

    this.fileUpload = async() => {
      const data = new FormData();
      data.append('image', this.state.selectedImg);
      this.postImageDetails();
      let res = await fetch('api/post', { // post data
        method: 'POST',
        body: data
      });
      this.setState({
        postRes: res.data.imageUrl
      });
      this.fetchImages();
    };

    this.deleteImage = async(id, src) => {
      await fetch(`api/delete`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // make sure you have this
        },
        body: JSON.stringify({'id': id, 'path': src.split('/')[2]}) // make sure key is a string
      });
      this.setState({
        showDeleteConfirmation: !this.state.showDeleteConfirmation,
        toDeleteId: null,
        toDeleteSrc: null
      });
      this.fetchImages();
    };

    this.addTag = () => {
      let tags = this.state.currentTags;
      tags.push(this.state.tag);
      console.log(tags);
      this.setState({
        currentTags: tags,
        tag: ''
      });
    };
  }
  
  componentDidMount() {
    this.fetchImages();
  }

  async fetchImages() {
    let res = await fetch(`api/images`);
    let resJson = await res.json();
    this.setState({
      images: resJson
    });
  }

  async postImageDetails() {
    await fetch('api/postdetails', { // post image details in JSON
      method: 'POST',
      headers: {
        'Content-Type': 'application/json', // make sure you have this
      },
      body: JSON.stringify({ 'filename': this.state.selectedImg.name, 'name': this.state.imageName, 'tags': this.state.currentTags })
    });
  }

  toggleDeleteConfirmation(image_id, src) {
    if (this.state.showDeleteConfirmation) { // if we are closing the dialog
      this.setState({
        toDeleteId: null,
        toDeleteSrc: null
      });
    } else { // if we are opening the dialog
      this.setState({
        toDeleteId: image_id,
        toDeleteSrc: src
      });
    }
    this.setState({
      showDeleteConfirmation: !this.state.showDeleteConfirmation
    });
  }

  renderImages() {
    return this.state.images.map(img => {
      const { image_id, src, caption, tags, name } = img;
      return (
        <div key={image_id} className="col-md-3">
          <img src={src} width="200" alt="Not Available" />
          <div className="img-toolbar">
            <div>{caption}</div>
            <div>{tags.startsWith("[") ? String(tags.split(",")).split("\"") : tags}</div>
            <div>{name}</div>
            <button className="img-delete" onClick={() => this.toggleDeleteConfirmation(image_id, src)}>X</button>
          </div>
        </div>
      )
    });
  }

  renderTags() {
    return this.state.currentTags.map((tag, index) => {
      return (
        <li key={index + tag.substring(0, 5)}>
          {tag}
          <button onClick={() => {
            let tags = this.state.currentTags.splice(index, 1); // remove tag from array at index
            console.log(tags);
            this.setState({
              currentTags: tags
            });
          }}>Delete note</button>
        </li>
      )
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App-header">
          <h1 style={{float: "left", textAlign: "center"}}>Leaflet</h1>
          <img src={logo} alt="logo" style={{display: "inline", float: "left", marginTop: "20", padding: "20"}} width="50" height="50"/>
        </div>
        <div style={{clear: "both"}}>
          {this.state.showDeleteConfirmation ?
          <div>
            <div className="popup">
              <div className="popup_inner">
                <p>Are you sure you want to delete?</p>
                <button onClick={this.toggleDeleteConfirmation.bind(this)}>No, take me back!</button>
                <button onClick={() => this.deleteImage(this.state.toDeleteId, this.state.toDeleteSrc)}>Yes, delete this plant!</button>
              </div>
            </div>
          </div>
          : null}
          <p className="lead" style={{textAlign: "center"}}>Welcome to Leaflet, a site where you can upload and delete pictures of your houseplants!</p>
          <nav>
            {this.state.popup ? 
            <div className="popup nav-element">
              <form className="popup_inner">
                <ul>
                  <li>Upload from device</li>
                  <li>Upload from URL</li>
                </ul>
                <button onClick={() => {this.setState({popup: false})}}>X</button>
                <label>
                  <input
                  type='file'
                  onChange={this.fileSelect}
                  />
                </label>
                <label>
                  Name your plant!
                  <input 
                  type='text' 
                  value={this.state.imageName} 
                  onChange={(e) => this.setState({imageName: e.target.value})}/>
                </label>
                <label>
                  Any notes? (plant type, characteristics)
                  <input 
                  type='text' 
                  value={this.state.tag} 
                  onChange={(e) => {
                    console.log(e.target.value);
                    this.setState({tag: e.target.value});}}/>
                  {this.state.tag ? <button onClick={this.addTag}>Add note</button> : <button disabled onClick={this.addTag}>Add note</button>}
                </label>
                <ul>
                  {this.renderTags()}
                </ul>
                <button onClick={this.fileUpload}>Add this plant to Leaflet!</button>
              </form>
            </div>
            : <button onClick={() => {this.setState({popup: true})}}>Add an image!</button>}
            <input 
            className="nav-element" 
            style={{width: "210px"}} 
            type='text' 
            placeholder='Search plants by name or type'
            onChange={(e) => {this.setState({filter: e.target.value})}} />
          </nav>
          {this.state.images ? 
          <div>{this.renderImages()}</div> : null}
        </div>
      </div>
    );
  }
}

export default App;
