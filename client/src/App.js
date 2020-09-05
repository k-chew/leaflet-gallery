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
      filter: ''
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
      let res = await fetch('api/post', {
        method: 'POST',
        body: data,
      });
      this.setState({
        postRes: res.data.imageUrl
      });
      this.fetchImages();
    };
  }
  
  componentDidMount() {
    //this.fetchImages();
  }

  async fetchImages() {
    let res = await fetch(`api/images`);
    let resJson = await res.json();
    this.setState({
      images: resJson
    });
  }

  renderImages() {
    return this.state.images.map(img => {
      const { src, caption, tags } = img;
      console.log(img);
      return (
        <div className="col-md-4">
          <div className="img-fluid img-thumbnail">
            <img src={src} width="200" alt="Not Available" />
            <div>{caption}</div>
            <div>{tags}</div>
          </div>
        </div>
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
          <p>Welcome to Leaflet, a site where you can upload and delete pictures of your houseplants!</p>
          {this.state.images ? <div>{this.renderImages()}</div> : null}
          <form>
            <label>
              Add an image!
              You can only add one.
              The file name can't have any spaces.
              <input
              type='file'
              onChange={this.fileSelect}
              />
              <button onClick={this.fileUpload}>Upload</button>
            </label>
          </form>
        </div>
      </div>
    );
  }
}

export default App;
