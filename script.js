import {DrawCanvas, MyCanvas, Painter} from "js/Canvas.js";
import {Room} from "js/Room.js";
import {Member} from "js/Member"

var Room=null;
var localStream = null;
var stream;
const NO_STREAM = getEmptyStream();
authInfo = null;
window.onload = async()=>{
    localStream = await navigator.mediaDevices
        .getUserMedia({
            audio : true,
            video : true
        });
    const init_local_video = document.getElementById("init-local-video");
    init_local_video.muted = true;
    init_local_video.srcObject = localStream;
    init_local_video.playsInline = true;
    await init_local_video.play();
    stream = localStream;
    authInfo = Firebase.Auth.auth.currentUser;
    initAccountStatus("",true);
    document.getElementById("account").addEventListener("click",initAccountStatus);
}
function getEmptyStream(){
    let canvas = document.createElement("canvas");
    canvas.width = 1;
    canvas.height = 1;
    let ctx = canvas.getContext("2d");
    ctx.fillStyle = "green";
    ctx.fillRect(0,0,1,1);
    let vstream = canvas.captureStream(1);
    var AudioContext = window.AudioContext || window.webkitAudioContext;
    let audio = new AudioContext();
    let astream = audio.createMediaStreamDestination().stream;

    return new MediaStream([vstream.getTracks()[0],astream.getTracks()[0]]);
}
async function initAccountStatus(elem, onlyDisplay){
    if(Firebase.Auth.auth.currentUser==null){
        //サインイン
        if(!onlyDisplay)authInfo = await Firebase.Auth.signIn();
        //エラー発生時は何もしない
        if(authInfo ==null){return;}
        //ログイン情報を表示
        document.querySelector("#account div").style.backgroundImage = `url("${authInfo.photoURL}")`;
        document.querySelector("#account span").innerText = authInfo.name;

        document.getElementById("join").addEventListener("click",joinRoom);
        let digits = 36 ** 5;
        peerId = authInfo.uid + "-"+ (new Date().getTime()).toString(36)+ (Math.floor(Math.random())*digits).toString(36);
        console.log(peerId);
        window.peer = new Peer(peerId,{key: window.__SKYWAY_KEY__,debug:1});
        console.log(peer);
        let profile = await Firebase.RTDB.get("profile/"+authInfo.uid);
        console.log(!("name" in profile));
        if(!("name" in profile)){
            profile = authInfo;
        }
        console.log(authInfo);
        console.log(profile);
        document.getElementById("input-name").value = profile.name;
        console.log(`[type=radio][value=${authInfo.color}]`);
        document.querySelector(`[type=radio][value=${profile.color}]`).checked=true;

        console.log(profile);
    }else{
        await Firebase.Auth.signOut(Firebase.Auth.auth);
        document.querySelector("#account div").style.backgroundImage = `url("${NO_IMAGE}")`;
        document.querySelector("#account span").innerText = "ログイン";
        document.getElementById("join").removeEventListener("click",joinRoom);
        if(window.peer != undefined){
            peer.destroy();
            delete peer;
        }
        authInfo = null;
    }
}
async function joinRoom(){
    var RoomId = "test";
    if(authInfo==null){return false;}
    let profile = {
        name: document.getElementById("input-name").value,
        photoURL:authInfo.photoURL,
        color: document.querySelector("input[name=input-color]:checked").value
    }
    await Firebase.RTDB.set("profile/"+authInfo.uid,profile);
    window.Room = new ROOM(RoomId,localStream);
    document.getElementById("join").removeEventListener("click",joinRoom);

}
class ML{
    static list ={};
    static get memberList(){
        return Object.keys(this.list);
    }
    static get l(){ return this.list};
    static async addMember(uid){
        if(uid in this.list){
            return false;
        }
        this.list[uid] = new Member(uid);
        await this.list[uid].initName();
        for(let key of this.memberList){
            let mem = this.list[key];
            //mem.addCanvas()
            console.log()
            if(mem.uid!=uid){
                mem.canvas.set(uid,)
            }
            mem.addCanvas(uid);
            console.log(mem);
        }
        return true;
    }
    static removeMember(uid){
        //canvasのIDにdisabledを追加
        //elementを削除
        //memberをdelete
        //remove from member list
    }
}
const NO_IMAGE = "/img/noimage.png";
