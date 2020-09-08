import React from 'react';
import './App.css';
import logo from './images/logo.svg';
import x from './images/cross.svg';

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
      uploadFromDevice: true,
      url: '',
      reload: false,
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
      this.setState({
        showDeleteConfirmation: !this.state.showDeleteConfirmation,
        reload: true,
        toDeleteId: null,
        toDeleteSrc: null
      });
      await fetch('api/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // make sure you have this
        },
        body: JSON.stringify({'id': id, 'path': src.split('/')[2]}) // make sure key is a string
      });
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

  componentDidUpdate() {
    if (this.state.reload) {
      this.fetchImages();
      this.setState({
        reload: false
      })
    }
  }

  async fetchImages() {
    let res = await fetch(`api/images`);
    let resJson = await res.json();
    this.setState({
      images: resJson
    });
  }

  async postImageDetails() {
    if (this.state.uploadFromDevice) {
      await fetch('api/postdetails', { // post image details in JSON
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // make sure you have this
        },
        body: JSON.stringify({ 'filename': this.state.selectedImg.name, 'name': this.state.imageName, 'tags': this.state.currentTags })
      });
    } else {
      await fetch('api/postdetails', { // post image details in JSON
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // make sure you have this
        },
        body: JSON.stringify({ 'url': this.state.url, 'filename': this.state.url.substr(this.state.url.lastIndexOf("/") + 1), 'name': this.state.imageName, 'tags': this.state.currentTags })
      });
    }
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

  renderPlants() {
    let filtered = this.state.images;
    if (this.state.filter.length) {
      filtered = this.state.images.filter(img => img.name.toLowerCase().includes(this.state.filter.toLowerCase()) || img.tags.toLowerCase().includes(this.state.filter.toLowerCase()));
    }
    if (!filtered.length) {
      return <h4 style={{textAlign: "center"}}>Sorry, we couldn't find the plant you're looking for.</h4>
    }
    return filtered.map((img, index) => {
      const { image_id, src, tags, name } = img;
      let parsedTags = tags.split('"');
      return (
        <div key={image_id} className="col-md-3 plant">
          <img 
              className="hover-point" 
              style={{position: "relative", left: "85%", top: "20px"}} 
              onClick={() => this.toggleDeleteConfirmation(image_id, src)}
              src={x} alt="X" width="20" height="20"/>
          <div className="nametag">{name}</div>
          <img src={src} style={{display: "block", margin: "auto"}} width="200" alt="Not Available" />
          {tags.length > 2 ? <div>{this.renderParsedTags(parsedTags)}</div> : null}
        </div>
      )
    });
  }

  renderTags() {
    return this.state.currentTags.map((tag, index) => {
      return (
        <div className="orange-btn" style={{display: "inline-block", margin: "10px", overflowWrap: "break-word"}} key={index + tag.substring(0, 5)}>
          {tag}
          <img 
            className="no-style-btn hover-point" 
            onClick={() => this.setState({currentTags: this.state.currentTags.splice(index, 1)})}
            src={x} alt="X" width="10" height="10" style={{marginLeft: "5px"}} />
        </div>
      )
    });
  }

  renderParsedTags(tags) {
    return tags.map(tag => {
      if (tag !== '[' && tag !== ',' && tag !== ']') {
        return (<div className="tag">{tag}</div>);
      } else {
        return null;
      }
    });
  }

  render() {
    return (
      <div className="container">
        <div className="App-header">
          <h1 style={{float: "left", textAlign: "center", fontFamily: "Berkshire", fontSize: "45px"}}>Leaflet</h1>
          <img src={logo} alt="logo" style={{display: "inline", float: "left", marginTop: "20", padding: "20"}} width="50" height="50"/>
          <p className="lead" style={{margin: "15px", textAlign: "center"}}>Welcome to Leaflet, a site where you can upload and delete pictures of your houseplants!</p>
        </div>
        <div style={{clear: "both"}}>
          {this.state.showDeleteConfirmation ?
          <div>
            <div className="popup">
              <div className="popup_inner">
                <div style={{margin: "20px auto", textAlign: "center"}}>
                  <p className="lead">Are you sure you want to delete?</p>
                  <button onClick={this.toggleDeleteConfirmation.bind(this)}>No, take me back!</button>
                  <button onClick={() => this.deleteImage(this.state.toDeleteId, this.state.toDeleteSrc)}>Yes, delete this plant!</button>
                </div>
              </div>
            </div>
          </div>
          : null}
          <nav>
            {this.state.popup ? 
            <div className="popup nav-element">
              <form className="popup_inner">
                <img 
                  className="hover-point" 
                  style={{position: "absolute", top: "25px", right: "25px"}} 
                  onClick={() => {this.setState({popup: false})}} 
                  src={x} alt="X" width="20" height="20"/>
                <div className="nav">
                  <div id="upload-from-device" className="hover-point selected" onClick={() => {
                    this.setState({uploadFromDevice: true});
                    document.getElementById("upload-from-device").classList.add("selected");
                    document.getElementById("upload-from-url").classList.remove("selected");
                  }}>
                    Upload from device
                  </div>
                  <div id="upload-from-url" className="hover-point" onClick={() => {
                    this.setState({uploadFromDevice: false});
                    document.getElementById("upload-from-url").classList.add("selected");
                    document.getElementById("upload-from-device").classList.remove("selected");
                  }}>
                    Upload from URL
                  </div>
                </div>
                {this.state.uploadFromDevice ?
                <label>
                  <p className="h4">Upload a photo of your plant!</p>
                  <input
                  type='file'
                  onChange={this.fileSelect}
                  />
                </label>
                : <label>
                    <p className="h4">Enter a valid URL</p>
                    <input type='text' style={{width: "200px"}} value={this.state.url} onChange={(e) => this.setState({url: e.target.value})} />
                </label> }
                {!this.state.uploadFromDevice && this.state.url.length && this.state.url.match(/\.(jpeg|jpg|gif|png)$/) == null ? 
                <div style={{color: "red", position: "absolute", width: "80%", margin: "0 70px", textAlign: "left"}}>Sorry, image needs to be JPEG, JPG, GIF, or PNG!</div>: null}
                <label>
                  <p className="h4">Name your plant!</p>
                  <input 
                  type='text' 
                  value={this.state.imageName} 
                  onChange={(e) => this.setState({imageName: e.target.value})}/>
                </label>
                <label style={{padding: "20px 20px 0px 20px"}}>
                  <p className="h4">Any tags you'd like to add?</p>
                  <p className="h5">(e.g. Latin name, defining characteristics)</p>
                  <input 
                  type='text' 
                  value={this.state.tag} 
                  onChange={(e) => this.setState({tag: e.target.value})} />
                  {this.state.tag && this.state.tag.length <= 30 ? <button className="orange-btn" onClick={this.addTag}>Add note</button> 
                  : <button disabled className="disabled-btn" onClick={this.addTag}>Add note</button>}
                  {this.state.tag.length > 30 ? <p style={{color: "red", position: "absolute"}}>Sorry, tags must be 30 characters or fewer!</p>: null}
                </label>
                <div style={{textAlign: "left", width: "80%", margin: "0 auto", overflowX: "break"}}>
                  {this.renderTags()}
                </div>
                <button onClick={this.fileUpload}>Add this plant to Leaflet!</button>
              </form>
            </div>
            : <button onClick={() => {this.setState({popup: true})}}>Add your plant to Leaflet!</button>}
            <input 
            className="nav-element search-bar" 
            value={this.state.filter}
            type='text' 
            placeholder='Search plants by name or tag'
            onChange={(e) => {this.setState({filter: e.target.value})}} />
            {this.state.filter.length ? 
            <img 
            className="hover-point" 
            style={{position: "relative", right: "3vw"}} 
            onClick={() => this.setState({filter: ''})}
            src={x} alt="X" width="10" height="10"/> 
            : null}
          </nav>
          {this.state.images ? 
          <div>{this.renderPlants()}</div> : null}
        </div>
      </div>
    );
  }
}

export default App;
