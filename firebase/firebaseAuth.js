// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.6.6/firebase-analytics.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut} from "https://www.gstatic.com/firebasejs/9.6.6/firebase-auth.js";


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

const auth = getAuth();
const provider = new GoogleAuthProvider();
async function GoogleAuth(){
  if(auth.currentUser != null){
    let userInfo = auth.currentUser;
    return {
      name: userInfo.displayName,
      photoURL: userInfo.photoURL,
      uid : userInfo.uid
    }
  }else{
    try{
      let res = await signInWithPopup(auth,provider);
      console.log(res);
      let userInfo = res.user;
      return {
        name: userInfo.displayName,
        photoURL: userInfo.photoURL,
        uid : userInfo.uid
      }
    }catch(err){
      console.error(err);
      return {}
    }
  
  }
}
window.FirebaseAuth = auth;
window.FirebaseSignIn = GoogleAuth;
window.FirebaseSignOut = signOut;
