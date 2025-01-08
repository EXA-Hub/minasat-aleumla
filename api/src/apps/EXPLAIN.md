```js
// my-api/src/apps/App.js
import mongoose from 'mongoose'; // import mongoose to create the schema
const AppID = ''; // choose uniqe app id for the database
const App = {
  id: AppID,
  name: '', // app name in arabic
  svg: '', // app icon in svg format
  redirectUrl: '', // page where user will be redirected to oauth or check account ownership
  bgColor: '', // the barnd color of the app in hex format
  // user is the user from database (check the user schema)
  // data is coming from the react page
  // my-react-app/src/pages/autoRouting/connect/:app.jsx
  connect: async (data, user) => {}, // if oauth method used then make this to oauth the account and to get tokens
  schema: new mongoose.Schema({
    // the schema for the accounts of this app
    /*
  always keep _id false
  always add id of the account
  always add name of the account
  
  optional
  save the hash or url of the images in this account (profilePicture and wallpaper)
  save the tokens if oauth method used

    you might only get the profilePicture or the wallpaper for some socialMedia apps

  */
    _id: false, // default required
    id: { type: String, required: true }, // default required
    name: { type: String, required: true }, // default required
  }),
  router: null, // if we gonna make ownership checks in other ways add custom router endpoints
  // user is a User from the database (check on the user schema)
  images: (user) => ({
    // function to return all images (profilePictures and wallpapers) as array of urls or hashes
    profilePictures: [],
    wallpapers: [],
  }),
  // if images saved as hashs then this function return the image url from these hashs
  // if images saved as urls then this function return the image url
  // imageType must be "profilePicture" or "wallpaper"
  // accountId is the (default required) value from the schema up there
  image: (user, accountId, imageType) => {
    const account = user.apps[AppID].find((acc) => acc.id === accountId);
    if (!account) return;
  },
};
export default App;
```
